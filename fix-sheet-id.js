const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Fix the Sheet ID
content = content.replace(
    /GOOGLE_SHEET_ID=.*/,
    'GOOGLE_SHEET_ID=1ssW6mSM0RrSAmYVf1YnEuO17wN_lfbsheJ-7ZgjIsgQ'
);

fs.writeFileSync(envPath, content);
console.log('✅ Fixed Sheet ID in .env file');
