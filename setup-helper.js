#!/usr/bin/env node

/**
 * Google Cloud Setup Helper
 * Automatically configures Google Cloud backup for WhatsApp AI Dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Google Cloud Setup Helper\n');
console.log('This script will help you configure Google Cloud backup.\n');

// Function to read JSON credentials
function saveCredentials(jsonContent) {
    try {
        const credentials = JSON.parse(jsonContent);

        if (!credentials.type || credentials.type !== 'service_account') {
            throw new Error('Invalid service account JSON');
        }

        if (!credentials.client_email) {
            throw new Error('Missing client_email in credentials');
        }

        const credPath = path.join(__dirname, 'google-credentials.json');
        fs.writeFileSync(credPath, JSON.stringify(credentials, null, 2));

        console.log('✅ Credentials saved to google-credentials.json');
        console.log(`   Service Account: ${credentials.client_email}`);

        return credentials.client_email;
    } catch (error) {
        console.error('❌ Error saving credentials:', error.message);
        return null;
    }
}

// Function to update .env file
function updateEnvFile(sheetId, folderId) {
    try {
        const envPath = path.join(__dirname, '.env');
        let envContent = '';

        // Read existing .env
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Check if Google backup config already exists
        const hasGoogleConfig = envContent.includes('ENABLE_GOOGLE_BACKUP');

        if (hasGoogleConfig) {
            // Update existing values
            envContent = envContent.replace(/ENABLE_GOOGLE_BACKUP=.*/g, 'ENABLE_GOOGLE_BACKUP=true');
            envContent = envContent.replace(/GOOGLE_APPLICATION_CREDENTIALS=.*/g, 'GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json');
            envContent = envContent.replace(/GOOGLE_SHEET_ID=.*/g, `GOOGLE_SHEET_ID=${sheetId}`);
            envContent = envContent.replace(/GOOGLE_DRIVE_FOLDER_ID=.*/g, `GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
        } else {
            // Add new configuration
            const googleConfig = `\n# Google Cloud Backup\nENABLE_GOOGLE_BACKUP=true\nGOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json\nGOOGLE_SHEET_ID=${sheetId}\nGOOGLE_DRIVE_FOLDER_ID=${folderId}\n`;
            envContent += googleConfig;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated with Google Cloud configuration');

        return true;
    } catch (error) {
        console.error('❌ Error updating .env file:', error.message);
        return false;
    }
}

// Function to verify Google Sheet URL
function verifySheetId(sheetId) {
    if (!sheetId || sheetId.length < 20) {
        console.error('❌ Invalid Sheet ID');
        return false;
    }
    console.log(`✅ Sheet ID: ${sheetId}`);
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${sheetId}`);
    return true;
}

// Function to verify Google Drive Folder URL
function verifyFolderId(folderId) {
    if (!folderId || folderId.length < 10) {
        console.error('❌ Invalid Folder ID');
        return false;
    }
    console.log(`✅ Folder ID: ${folderId}`);
    console.log(`   URL: https://drive.google.com/drive/folders/${folderId}`);
    return true;
}

// Main setup function
function setupGoogleCloud(config) {
    console.log('\n📋 Starting Google Cloud Setup...\n');

    // Validate config
    if (!config.credentials || !config.sheetId || !config.folderId) {
        console.error('❌ Missing required configuration');
        console.log('\nRequired fields:');
        console.log('  - credentials: Service account JSON');
        console.log('  - sheetId: Google Sheet ID');
        console.log('  - folderId: Google Drive Folder ID');
        return false;
    }

    // Save credentials
    console.log('\n1️⃣ Saving credentials...');
    const serviceEmail = saveCredentials(JSON.stringify(config.credentials));
    if (!serviceEmail) return false;

    // Verify Sheet ID
    console.log('\n2️⃣ Verifying Google Sheet...');
    if (!verifySheetId(config.sheetId)) return false;

    // Verify Folder ID
    console.log('\n3️⃣ Verifying Google Drive Folder...');
    if (!verifyFolderId(config.folderId)) return false;

    // Update .env
    console.log('\n4️⃣ Updating .env configuration...');
    if (!updateEnvFile(config.sheetId, config.folderId)) return false;

    // Success!
    console.log('\n✅ Google Cloud Setup Complete!\n');
    console.log('📊 Configuration Summary:');
    console.log(`   Service Account: ${serviceEmail}`);
    console.log(`   Sheet ID: ${config.sheetId}`);
    console.log(`   Folder ID: ${config.folderId}`);
    console.log('\n🎉 Restart your server to enable Google backup!');
    console.log('   Command: npm start\n');

    return true;
}

// Export for use in other scripts
module.exports = {
    setupGoogleCloud,
    saveCredentials,
    updateEnvFile,
    verifySheetId,
    verifyFolderId
};

// If called directly from command line
if (require.main === module) {
    console.log('📝 Interactive Setup Mode\n');
    console.log('Please use the web interface (setup-google.html) for easier setup.');
    console.log('Or call this script programmatically with configuration object.\n');
}
