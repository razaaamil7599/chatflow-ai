# Keep Keep-Alive Implementation Guide

## Problem
Render.com free tier में server 15 minutes inactive रहने पर sleep हो जाता है।

## Solution
Server को हर 5 minutes में ping करके active रखना।

---

## Method 1: Internal Keep-Alive (मैंने बना दिया है)

### Step 1: `keep-alive.js` file use करें

File already बनी हुई है: `keep-alive.js`

### Step 2: `server.js` में यह 3 lines add करें

File के top पर (line 11 के बाद):
```javascript
const keepAlive = require('./keep-alive');
```

Server start होने के बाद (line 460 के आसपास, जहां `client.initialize()` है):
```javascript
// Start keep-alive service
keepAlive.startKeepAlive();
```

### Step 3: Health endpoint add करें

`server.js` में REST API endpoints section में add करें:
```javascript
// Health check endpoint (for keep-alive)
app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
```

---

## Method 2: External Cron (Better!)

External service use करके ping करें (server restart पर भी काम करेगा)।

### Option A: UptimeRobot (Free)

1. **uptimerobot.com** पर account बनाएं
2. **Add New Monitor** दबाएं
3. Settings:
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `WhatsApp AI Dashboard`
   - URL: `https://your-app.onrender.com/ping`
   - Monitoring Interval: **5 minutes**
4. **Create Monitor**

**Done!** अब server हर 5 minutes automatically ping होगा। ✅

### Option B: Cron-Job.org (Free)

1. **cron-job.org** पर account बनाएं
2. **Create Cronjob** दबाएं
3. Settings:
   - Title: `Keep WhatsApp Bot Alive`
   - URL: `https://your-app.onrender.com/ping`
   - Execution: Every **5 minutes**
   - Enabled: ✅
4. **Create**

---

## Method 3: Simple Node Script (For Testing)

Local testing के लिए:

```javascript
// test-keep-alive.js
const http = require('http');

const URL = 'http://localhost:3000/ping';
const INTERVAL = 5 * 60 * 1000;

setInterval(() => {
  http.get(URL, (res) => {
    console.log(`✅ Pinged: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`❌ Error: ${err.message}`);
  });
}, INTERVAL);

console.log('Keep-alive started...');
```

Run: `node test-keep-alive.js`

---

## Deployment पर Environment Variable

Render.com पर deploy करते समय:

**Environment Variables** section में add करें:
```
RENDER_EXTERNAL_URL = https://your-app-name.onrender.com
```

या

```
APP_URL = https://your-app-name.onrender.com
```

---

## जो मैंने पहले से कर दिया है ✅

1. ✅ `keep-alive.js` file बना दी
2. ✅ Logic complete है
3. ❌ `server.js` में integrate करना बाकी है (3 lines)

---

## **Recommended Approach**

**Use External Cron (UptimeRobot)** ⭐

**Why?**
- सबसे reliable
- Server crash होने पर भी काम करेगा
- Free
- Setup 2 minutes में

**Steps**:
1. Deploy करें Render पर
2. URL मिलेगा: `https://yourapp.onrender.com`
3. UptimeRobot पर monitor create करें
4. Done!

---

## Testing

Local पर test करने के लिए:
```bash
# Terminal 1
npm start

# Terminal 2 (दूसरे terminal में)
curl http://localhost:3000/ping
# Response: pong
```

---

## Questions?

- External cron service recommend करता हूँ (easiest)
- या मैं `server.js` में 3 lines add कर दूं?

आप क्या preferकरते हैं? 🤔
