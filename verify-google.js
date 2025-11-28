const { google } = require('googleapis');
const fs = require('fs');

async function verify() {
    try {
        console.log('Reading credentials...');
        const content = fs.readFileSync('./google-credentials.json', 'utf8');
        const credentials = JSON.parse(content);

        console.log('Client Email:', credentials.client_email);
        console.log('Private Key Length:', credentials.private_key ? credentials.private_key.length : 0);
        console.log('Private Key Start:', credentials.private_key ? credentials.private_key.substring(0, 30) : 'N/A');

        // Check for double escaping
        if (credentials.private_key.includes('\\n')) {
            console.log('⚠️ Warning: Private key contains literal \\n characters. Attempting to fix...');
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        console.log('Authenticating...');
        const client = await auth.getClient();
        console.log('✅ Authentication successful!');

        const sheets = google.sheets({ version: 'v4', auth: client });
        const sheetId = process.env.GOOGLE_SHEET_ID || '1sUsSx5t5I0lY14wyb7QwimAwH0AO8qXZyVTylB8uo2g'; // Use the one from user

        console.log('Accessing Sheet:', sheetId);
        const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        console.log('✅ Sheet access successful! Title:', res.data.properties.title);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verify();
