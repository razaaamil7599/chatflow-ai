const fs = require('fs');
const path = require('path');

const oldFile = 'google-credentials.json';
const newFiles = fs.readdirSync('.').filter(f => f.startsWith('speedy-cedar') && f.endsWith('.json'));

if (newFiles.length === 0) {
    console.error('❌ New credentials file not found!');
    process.exit(1);
}

const newFile = newFiles[0];
console.log(`Found new file: ${newFile}`);

try {
    // Read new content
    const newContent = fs.readFileSync(newFile, 'utf8');

    // Write to target
    fs.writeFileSync(oldFile, newContent);
    console.log('✅ Successfully overwrote google-credentials.json');

    // Verify
    const verify = JSON.parse(fs.readFileSync(oldFile, 'utf8'));
    console.log('New Project ID:', verify.project_id);

    // Delete source file to avoid confusion
    fs.unlinkSync(newFile);
    console.log('✅ Deleted source file');

} catch (e) {
    console.error('❌ Error swapping files:', e.message);
}
