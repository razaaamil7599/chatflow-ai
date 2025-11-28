# Render.com Deployment Guide

## Step-by-Step Instructions

### 1. GitHub Repository बनाएं

1. **GitHub.com पर जाएं** और login करें
2. **New Repository** button दबाएं
3. Repository name: `whatsapp-ai-dashboard`
4. **Public** या **Private** select करें
5. **Create Repository** दबाएं

### 2. Code को GitHub पर Push करें

```bash
# Git initialize करें (if not already)
git init

# All files add करें
git add .

# Commit करें
git commit -m "Initial commit - WhatsApp AI Dashboard"

# GitHub repository से connect करें
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-ai-dashboard.git

# Push करें
git branch -M main
git push -u origin main
```

**Note**: `YOUR_USERNAME` को अपने GitHub username से replace करें।

### 3. Render.com पर Deploy करें

#### 3.1 Account बनाएं
1. **render.com** पर जाएं
2. **Sign Up** करें (GitHub से login कर सकते हैं)
3. Free plan select करें

#### 3.2 New Web Service बनाएं
1. Dashboard में **New +** दबाएं
2. **Web Service** select करें
3. **Connect GitHub** repository
4. अपनी `whatsapp-ai-dashboard` repository select करें

#### 3.3 Configure करें

**Build & Deploy Settings:**
- **Name**: `whatsapp-ai-dashboard` (या कोई unique name)
- **Region**: Singapore (closest to India)
- **Branch**: `main`
- **Root Directory**: (खाली छोड़ें)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

#### 3.4 Environment Variables Add करें

**Environment** tab में जाकर ये variables add करें:

```
OPENAI_API_KEY = your_actual_openai_key_here
AI_MODEL = gpt-4
PORT = 10000
AUTO_RESPONSE_ENABLED = true
MIN_RESPONSE_DELAY = 2000
MAX_RESPONSE_DELAY = 5000
ENABLE_GOOGLE_BACKUP = true
GOOGLE_SHEET_ID = your_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID = your_folder_id_here
```

**Important**: Google credentials के लिए:
1. `google-credentials.json` की content copy करें
2. Environment variable बनाएं: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
3. पूरी JSON content paste करें

#### 3.5 Deploy करें

1. **Create Web Service** button दबाएं
2. Deployment शुरू हो जाएगी (5-10 minutes)
3. Logs check करें कि सब सही चल रहा है

### 4. Google Credentials Fix (Important!)

Render.com पर file system read-only है, इसलिए एक छोटा change करना होगा:

**File**: `google-backup.js` (line 32-38)

```javascript
// Old code:
const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

// New code (for Render):
let credentials;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} else {
    credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}
```

यह change करके फिर से push करें।

### 5. Access Your App

Deployment complete होने के बाद:
- URL मिलेगा: `https://whatsapp-ai-dashboard-xxxx.onrender.com`
- Dashboard खोलें
- QR code scan करें
- Ready! 🎉

---

## Important Notes

### 1. WhatsApp Session Persistence

**Problem**: Render.com free tier पर file system reset होता है।

**Solution**: 
- Premium plan लें ($7/month)
- या Railway.app use करें (better for persistent storage)

### 2. Auto-Sleep

Free tier apps:
- 15 minutes inactive रहने पर sleep होते हैं
- Next request पर wake up होते हैं (30 seconds delay)

**Solution**:
- Paid plan लें
- या cron job set up करें जो हर 10 minutes ping करे

### 3. Monthly Limits

Free tier:
- 750 hours/month
- Enough for 24/7 running

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
**Fix**: Check `package.json` में सभी dependencies listed हैं

### App Crashes

**Error**: `Port already in use`
**Fix**: Render automatically PORT set करता है. Code में:
```javascript
const PORT = process.env.PORT || 3000;
```

### WhatsApp Not Connecting

**Error**: QR code scan होने के बाद भी disconnect
**Fix**: Session persistence issue. Paid plan लें या Railway use करें.

---

## Alternative: Railway.app (Recommended for MVP)

Railway.app बेहतर है क्योंकि:
- File system persistent रहता है
- WhatsApp session save रहता है
- 500 hours free/month

**Deploy on Railway**:
1. railway.app पर account बनाएं
2. New Project → Deploy from GitHub
3. Repository select करें
4. Environment variables add करें
5. Deploy!

---

## Cost Comparison

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750 hrs/month | $7/month | Simple apps |
| **Railway** | 500 hrs/month | $5/month | WhatsApp bots ✅ |
| **Fly.io** | Limited | $1.94/month | Budget-friendly |

**Recommendation**: **Railway.app** for MVP

---

## Next Steps

1. ✅ GitHub repository बनाएं
2. ✅ Code push करें
3. ✅ Render/Railway पर deploy करें
4. ✅ Environment variables configure करें
5. ✅ Test करें
6. ✅ Share URL with beta users

---

## Questions?

Stuck कहीं? मुझे बताएं:
- GitHub repository link share करें
- Deployment logs share करें
- मैं help करूंगा! 🚀
