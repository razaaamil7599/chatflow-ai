const fs = require('fs');

try {
    const content = fs.readFileSync('google-credentials.json', 'utf8');
    const creds = JSON.parse(content);

    if (creds.private_key.includes('\\n')) {
        console.log('Found literal \\n characters. Fixing...');
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
        fs.writeFileSync('google-credentials.json', JSON.stringify(creds, null, 2));
        console.log('Fixed google-credentials.json');
    } else {
        console.log('No literal \\n characters found.');
    }
} catch (e) {
    console.error(e);
}
