# Render Deployment Guide - WhatsApp AI Dashboard

## ✅ Pre-Deployment Checklist

### 1. Required Files Ready
- ✅ `package.json` - All dependencies listed
- ✅ `.gitignore` - Sensitive files excluded
- ✅ `server.js` - PORT environment variable configured
- ✅ Keep-alive system implemented

### 2. Potential Issues Fixed
- ✅ Session files (`.wwebjs_auth`, `.wwebjs_cache`) gitignored
- ✅ Auto-response defaults to ON
- ✅ Multi-language AI support added
- ✅ Chat history storage implemented
- ✅ `chats.json` gitignored to prevent commit

---

## 🚀 Deployment Steps

### Step 1: Prepare GitHub Repository

```bash
# Add all changes
git add .

# Commit with message
git commit -m "Production ready: Multi-language AI, T&C flow, session fixes"

# Push to GitHub
git push origin main
```

### Step 2: Create Render Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `razaaamil7599/chatflow-ai`
4. Configure:
   - **Name:** `chatflow-ai` (or your choice)
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 3: Environment Variables

Add these in Render Dashboard → Environment tab:

```
OPENAI_API_KEY=<your-openai-key>
AI_MODEL=gpt-4
GOOGLE_SHEET_ID=1ssW6mSM0RrSAmYVf1YnEuO17wN_lfbsheJ-7ZgjIsgQ
GOOGLE_DRIVE_FOLDER_ID=1oTwEmoumZdsFDkcY-sGbeuUvdusf14ab
AUTO_RESPONSE_ENABLED=true
RENDER_EXTERNAL_URL=https://chatflow-ai.onrender.com
AI_SYSTEM_PROMPT=<copy from .env file - the long AI prompt>
```

**CRITICAL:** For `GOOGLE_CREDENTIALS_JSON`:
```
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```
(Copy entire JSON from `google-credentials.json` file as ONE LINE)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Render will automatically:
   - Install dependencies
   - Start server
   - Assign URL: `https://chatflow-ai.onrender.com`

---

## 🔧 Post-Deployment Configuration

### Enable Keep-Alive (Prevent Sleep)

**Option 1: UptimeRobot (Recommended)**
1. Sign up: https://uptimerobot.com
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://chatflow-ai.onrender.com/ping`
   - Interval: 5 minutes
3. Save

**Option 2: Cron-Job.org**
1. Sign up: https://cron-job.org
2. Create job:
   - URL: `https://chatflow-ai.onrender.com/ping`
   - Schedule: `*/5 * * * *` (every 5 min)

---

## ⚠️ Known Issues & Solutions

### Issue 1: WhatsApp Session Crashes
**Symptom:** "EBUSY: resource busy or locked"  
**Solution:** Render will auto-restart. Session files are in .gitignore so each deploy = fresh session

### Issue 2: QR Code Not Showing
**Symptom:** Stuck on "Generating..."  
**Solution:** Wait 30s, refresh page. QR cache implemented.

### Issue 3: Auto-Response OFF
**Symptom:** Toggle shows OFF after deployment  
**Solution:** Verify `AUTO_RESPONSE_ENABLED=true` in Render env vars

### Issue 4: Google Backup Failing
**Symptom:** "Invalid credentials"  
**Solution:** Ensure `GOOGLE_CREDENTIALS_JSON` is correct JSON (no line breaks in Render)

---

## 🧪 Testing After Deployment

1. **Visit Dashboard:** `https://chatflow-ai.onrender.com`
2. **Check Auto-Response:** Should show ON
3. **Scan QR Code:** Should connect within 30s
4. **Test Message:** Send WhatsApp message
5. **Verify AI Response:** Should ask "कौन सा विज्ञापन देखा?"
6. **Check Keep-Alive:** Logs should show ping every 5 min

---

## 📊 Monitoring

### Render Dashboard
- View logs: Dashboard → Logs tab
- Check uptime: Dashboard → Metrics

### Expected Logs
```
✅ WhatsApp client is ready!
🏓 Keep-Alive: Pinging...
✅ Keep-Alive: Server alive (Status 200)
```

---

## 🔄 Updating Deployment

When you make changes locally:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render auto-deploys on git push!

---

## 🆘 Troubleshooting

### Server Won't Start
1. Check Render logs
2. Verify all env vars set
3. Ensure `GOOGLE_CREDENTIALS_JSON` is valid JSON

### WhatsApp Won't Connect
1. Remove old linked devices from phone
2. Scan fresh QR code
3. Check if WhatsApp Web is down: https://downdetector.com

### Messages Not Being Answered
1. Check `AUTO_RESPONSE_ENABLED=true`
2. Verify OpenAI API key has credits
3. Check Render logs for errors

---

## ✅ Production Ready Checklist

- [x] Dependencies installed (`whatsapp-web.js: latest`)
- [x] Environment variables configured
- [x] Auto-response enabled by default
- [x] Multi-language AI support
- [x] Terms & Conditions integrated
- [x] Keep-alive system active
- [x] Session error handling
- [x] Chat history persistence
- [x] Google Sheets backup configured

**Status: READY FOR DEPLOYMENT** 🚀
