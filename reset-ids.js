const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Clear IDs
envContent = envContent.replace(/GOOGLE_SHEET_ID=.*/g, 'GOOGLE_SHEET_ID=');
envContent = envContent.replace(/GOOGLE_DRIVE_FOLDER_ID=.*/g, 'GOOGLE_DRIVE_FOLDER_ID=');

fs.writeFileSync(envPath, envContent);
console.log('✅ Cleared Google IDs from .env');
