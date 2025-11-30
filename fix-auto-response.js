// Fix Auto-Response to be ON by default
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if AUTO_RESPONSE_ENABLED exists
    if (envContent.includes('AUTO_RESPONSE_ENABLED')) {
        // Update existing
        envContent = envContent.replace(/AUTO_RESPONSE_ENABLED=.*/g, 'AUTO_RESPONSE_ENABLED=true');
        console.log('✅ Updated AUTO_RESPONSE_ENABLED to true');
    } else {
        // Add new
        envContent += '\n\n# Auto-Response Settings\nAUTO_RESPONSE_ENABLED=true\n';
        console.log('✅ Added AUTO_RESPONSE_ENABLED=true');
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ SUCCESS! Auto-Response will now be ON by default');
    console.log('⚠️  Restart server to apply changes\n');

} catch (error) {
    console.error('❌ Error:', error.message);
}
