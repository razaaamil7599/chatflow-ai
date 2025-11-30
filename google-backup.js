const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class GoogleBackupService {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.drive = null;
        this.enabled = false;
        this.currentSheetId = null;
        this.stats = {
            messagesBackedUp: 0,
            mediaFilesBackedUp: 0,
            lastBackupTime: null,
            errors: 0
        };
    }

    async initialize() {
        try {
            if (process.env.ENABLE_GOOGLE_BACKUP !== 'true') {
                console.log('📊 Google Backup: Disabled in configuration');
                return false;
            }

            let credentials;

            // Check if we have credentials in environment variable (Best for Render/Railway)
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
                console.log('📊 Loading credentials from environment variable');
                credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            } else {
                // Fallback to file system (Local development)
                const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';
                const absolutePath = path.resolve(process.cwd(), credentialsPath);
                console.log(`📊 Loading credentials from file: ${absolutePath}`);

                if (!fs.existsSync(absolutePath)) {
                    console.log('⚠️  Google Backup: Credentials file not found');
                    return false;
                }
                credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            }

            this.auth = new google.auth.GoogleAuth({
                credentials,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.file'
                ]
            });

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            this.drive = google.drive({ version: 'v3', auth: this.auth });

            this.enabled = true;
            console.log('✅ Google Backup: Initialized successfully');

            await this.initializeSpreadsheet();
            return true;
        } catch (error) {
            console.error('❌ Google Backup initialization failed:', error.message);
            this.enabled = false;
            return false;
        }
    }

    async initializeSpreadsheet() {
        try {
            const sheetId = process.env.GOOGLE_SHEET_ID;
            if (!sheetId) {
                console.log('⚠️  GOOGLE_SHEET_ID not set');
                return;
            }

            this.currentSheetId = sheetId;

            // Ensure Messages sheet exists with correct columns
            await this.ensureSheet('Messages', [
                'Timestamp', 'Phone', 'Message', 'Direction', 'Name', 'Category'
            ]);

            console.log('📊 Google Backup: Ready');
            console.log(`   Sheet: https://docs.google.com/spreadsheets/d/${sheetId}`);
            const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
            if (folderId) {
                console.log(`   Drive: https://drive.google.com/drive/folders/${folderId}`);
            } else {
                console.log('   Drive: Not configured');
            }

        } catch (error) {
            console.error('Error initializing spreadsheet:', error.message);
        }
    }

    async ensureSheet(sheetName, headers) {
        try {
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId: this.currentSheetId
            });

            const sheetExists = spreadsheet.data.sheets.some(
                sheet => sheet.properties.title === sheetName
            );

            if (!sheetExists) {
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.currentSheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                    gridProperties: { frozenRowCount: 1 }
                                }
                            }
                        }]
                    }
                });
                console.log(`📋 Created "${sheetName}" sheet`);
            }

            // Check and add headers
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.currentSheetId,
                range: `${sheetName}!A1:F1`
            });

            if (!response.data.values || response.data.values.length === 0) {
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.currentSheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    resource: { values: [headers] }
                });

                // Format headers - nice green color
                const sheetId = await this.getSheetId(sheetName);
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.currentSheetId,
                    resource: {
                        requests: [{
                            repeatCell: {
                                range: {
                                    sheetId: sheetId,
                                    startRowIndex: 0,
                                    endRowIndex: 1
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.2, green: 0.66, blue: 0.33 },
                                        textFormat: {
                                            foregroundColor: { red: 1, green: 1, blue: 1 },
                                            bold: true
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat(backgroundColor,textFormat)'
                            }
                        }]
                    }
                });
                console.log(`📊 Added headers to ${sheetName} sheet`);
            }
        } catch (error) {
            console.error(`Error ensuring sheet ${sheetName}:`, error.message);
        }
    }

    async getSheetId(sheetName) {
        const spreadsheet = await this.sheets.spreadsheets.get({
            spreadsheetId: this.currentSheetId
        });
        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
        return sheet ? sheet.properties.sheetId : 0;
    }

    async backupMessage(messageData, contactInfo = {}) {
        if (!this.enabled || !this.currentSheetId) return false;

        try {
            const timestamp = moment(messageData.timestamp).format('YYYY-MM-DD HH:mm:ss');
            const direction = messageData.fromMe ? 'OUTBOUND' : 'INBOUND';

            // Use provided contact info or fallback to message data
            const name = contactInfo.name || messageData.from || '';
            const category = contactInfo.category || '';

            const row = [
                timestamp,
                messageData.fromNumber || messageData.from, // Phone
                messageData.body,                           // Message
                direction,                                  // Direction
                name,                                       // Name
                category                                    // Category
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.currentSheetId,
                range: 'Messages!A:F',
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });

            this.stats.messagesBackedUp++;
            this.stats.lastBackupTime = new Date();

            console.log(`✅ Backed up message from ${messageData.from}`);
            return true;
        } catch (error) {
            console.error('❌ Error backing up message:', error.message);
            this.stats.errors++;
            return false;
        }
    }

    extractClientInfo(message) {
        if (!message) return {};

        const info = {};
        const lowerMessage = message.toLowerCase();

        // Extract name
        const namePatterns = [
            /(?:mera\s+naam|my\s+name\s+is|naam\s+hai|i\s+am|main)\s+([a-z]+(?:\s+[a-z]+)?)/i,
            /^([A-Z][a-z]+)(?:\s|$)/m
        ];
        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match) {
                info.name = match[1].trim();
                break;
            }
        }

        // Extract destination country
        const countries = {
            'saudi': 'Saudi Arabia',
            'saudi arabia': 'Saudi Arabia',
            'canada': 'Canada',
            'australia': 'Australia',
            'uk': 'UK',
            'usa': 'USA',
            'america': 'USA',
            'germany': 'Germany',
            'dubai': 'Dubai',
            'uae': 'UAE',
            'qatar': 'Qatar',
            'kuwait': 'Kuwait'
        };

        for (const [key, value] of Object.entries(countries)) {
            if (lowerMessage.includes(key)) {
                info.destination = value;
                break;
            }
        }

        // Extract experience
        const expPattern = /(\d+)\s*(?:year|years|saal|sal)/i;
        const expMatch = message.match(expPattern);
        if (expMatch) {
            info.experience = expMatch[1] + ' years';
        }

        // Detect if return applicant
        if (lowerMessage.includes('return') || lowerMessage.includes('wapas')) {
            info.returnApplicant = 'Yes';
        } else if (lowerMessage.includes('fresh') || lowerMessage.includes('pehli baar')) {
            info.returnApplicant = 'No';
        }

        return info;
    }

    async uploadMedia(buffer, filename, mimeType) {
        if (!this.enabled) return null;

        try {
            this.stats.mediaFilesBackedUp++;
            console.log(`📎 Media detected: ${filename} (${mimeType})`);
            return `Media: ${filename}`;
        } catch (error) {
            console.error('❌ Error processing media:', error.message);
            this.stats.errors++;
            return null;
        }
    }

    getStats() {
        return this.stats;
    }

    getSheetUrl() {
        return this.currentSheetId ?
            `https://docs.google.com/spreadsheets/d/${this.currentSheetId}` : null;
    }

    getDriveFolderUrl() {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        return folderId ? `https://drive.google.com/drive/folders/${folderId}` : null;
    }
}

module.exports = new GoogleBackupService();
