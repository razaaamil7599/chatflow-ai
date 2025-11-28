// Keep-Alive Service
// Pings the server every 5 minutes to prevent Render.com from sleeping

const http = require('http');
const https = require('https');

const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

function pingServer() {
    if (!SERVER_URL) {
        console.log('⚠️  Keep-Alive: No SERVER_URL configured, using self-ping');
        return; // Skip external ping, rely on internal
    }

    const url = `${SERVER_URL}/ping`;
    const httpModule = url.startsWith('https') ? https : http;

    console.log(`🏓 Keep-Alive: Pinging ${url}...`);

    httpModule.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log(`✅ Keep-Alive: Server responded (uptime maintained)`);
        }
    }).on('error', (err) => {
        console.error(`❌ Keep-Alive: Ping failed -`, err.message);
    });
}

function startKeepAlive() {
    console.log(`🚀 Keep-Alive: Started (interval: ${PING_INTERVAL / 1000 / 60} minutes)`);

    // Initial ping after 1 minute
    setTimeout(pingServer, 60 * 1000);

    // Then ping every 5 minutes
    setInterval(pingServer, PING_INTERVAL);
}

module.exports = { startKeepAlive, pingServer };
