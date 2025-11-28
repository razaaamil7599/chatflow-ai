#!/usr/bin/env node

/**
 * Quick Google Cloud Configuration Script
 * Just paste your credentials and IDs, and everything will be set up automatically!
 */

const readline = require('readline');
const { setupGoogleCloud } = require('./setup-helper');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🚀 WhatsApp AI Dashboard - Quick Google Cloud Setup\n');
console.log('This script will configure Google Cloud backup in 3 simple steps.\n');

let config = {
    credentials: null,
    sheetId: null,
    folderId: null
};

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    try {
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Step 1: Get JSON credentials
        console.log('📝 Step 1: Service Account JSON\n');
        console.log('Paste your google-credentials.json content below.');
        console.log('(Paste everything from { to } and press Enter)\n');

        const jsonInput = await askQuestion('JSON Content: ');

        try {
            config.credentials = JSON.parse(jsonInput);
            console.log(`✅ Valid JSON! Service Account: ${config.credentials.client_email}\n`);
        } catch (error) {
            console.error('❌ Invalid JSON format. Please try again.\n');
            rl.close();
            return;
        }

        console.log('═══════════════════════════════════════════════════════════════\n');

        // Step 2: Get Sheet ID
        console.log('📊 Step 2: Google Sheet ID\n');
        console.log('Example: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms\n');

        config.sheetId = await askQuestion('Sheet ID: ');
        console.log(`✅ Sheet URL: https://docs.google.com/spreadsheets/d/${config.sheetId}\n`);

        console.log('═══════════════════════════════════════════════════════════════\n');

        // Step 3: Get Folder ID
        console.log('📁 Step 3: Google Drive Folder ID\n');
        console.log('Example: 1dyC0n7MQXjJI2hT-zJjT6jY2wNk4sH5e\n');

        config.folderId = await askQuestion('Folder ID: ');
        console.log(`✅ Folder URL: https://drive.google.com/drive/folders/${config.folderId}\n`);

        console.log('═══════════════════════════════════════════════════════════════\n');

        // Setup
        console.log('🔧 Configuring...\n');
        const success = setupGoogleCloud(config);

        if (success) {
            console.log('═══════════════════════════════════════════════════════════════\n');
            console.log('🎉 Setup Complete! Google Cloud backup is now configured.\n');
            console.log('Next step: Restart your server');
            console.log('Command: npm start\n');
            console.log('═══════════════════════════════════════════════════════════════\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

main();
