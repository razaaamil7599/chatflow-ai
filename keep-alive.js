// Keep-Alive Service
// Pings the server every 5 minutes to prevent Render.com from sleeping
// Also uses external service (cron-job.org or UptimeRobot) for better reliability

const http = require('http');
const https = require('https');

const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SERVER_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

function pingServer() {
    if (!SERVER_URL) {
        console.log('⚠️  Keep-Alive: No SERVER_URL configured, skipping external ping');
        return;
    }

    const url = `${SERVER_URL}/ping`;
    const httpModule = url.startsWith('https') ? https : http;

    console.log(`🏓 Keep-Alive: Pinging ${url}...`);

    const req = httpModule.get(url, { timeout: 10000 }, (res) => {
        if (res.statusCode === 200) {
            console.log(`✅ Keep-Alive: Server alive (Status ${res.statusCode})`);
        } else {
            console.log(`⚠️  Keep-Alive: Server responded with ${res.statusCode}`);
        }
    });

    req.on('error', (err) => {
        console.error(`❌ Keep-Alive: Ping failed -`, err.message);
    });

    req.on('timeout', () => {
        console.error(`⏱️  Keep-Alive: Ping timeout`);
        req.destroy();
    });
}

function startKeepAlive() {
    console.log(`🚀 Keep-Alive: Started (interval: ${PING_INTERVAL / 1000 / 60} minutes)`);

    if (SERVER_URL) {
        console.log(`🔗 Keep-Alive: Will ping ${SERVER_URL}/ping`);
        console.log(`💡 TIP: For better uptime, add this URL to cron-job.org or UptimeRobot`);
    } else {
        console.log(`⚠️  Keep-Alive: RENDER_EXTERNAL_URL not set - external pings disabled`);
        console.log(`💡 Set RENDER_EXTERNAL_URL in Render dashboard for keep-alive to work`);
    }

    // Initial ping after 30 seconds (faster startup)
    setTimeout(pingServer, 30 * 1000);

    // Then ping every 5 minutes
    setInterval(pingServer, PING_INTERVAL);
}

module.exports = { startKeepAlive, pingServer };
