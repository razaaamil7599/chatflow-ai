# Render Deployment - Keep-Alive Setup

## Problem
Render free tier servers sleep after 15 minutes of inactivity, causing:
- WhatsApp disconnection
- Missed messages
- Need to rescan QR code

## Solution: Automatic Keep-Alive System ✅

### Built-in Keep-Alive (Already Done)

Your app already has automatic keep-alive:
- ✅ Pings itself every 5 minutes
- ✅ Prevents server from sleeping
- ✅ No manual work needed

### Render Environment Variable Setup

**IMPORTANT:** Add this to Render Dashboard:

1. Go to https://dashboard.render.com
2. Select your service
3. Go to **Environment** tab
4. Add new variable:
   - **Key:** `RENDER_EXTERNAL_URL`
   - **Value:** `https://chatflow-ai.ukbi.onrender.com`
5. Click **Save Changes**

This makes keep-alive work automatically!

### Optional: External Monitoring (Even Better)

For 100% uptime, use free external service:

#### Option 1: UptimeRobot (Recommended)

1. **Sign up:** https://uptimerobot.com (Free account)
2. **Add Monitor:**
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `WhatsApp AI Dashboard`
   - URL: `https://chatflow-ai.ukbi.onrender.com/ping`
   - Monitoring Interval: **5 minutes**
3. **Save**

✅ UptimeRobot will ping every 5 minutes - server never sleeps!

#### Option 2: Cron-Job.org

1. **Sign up:** https://cron-job.org (Free)
2. **Create Cronjob:**
   - Title: `Keep WhatsApp Alive`
   - URL: `https://chatflow-ai.ukbi.onrender.com/ping`
   - Schedule: `*/5 * * * *` (every 5 minutes)
3. **Enable**

### Verification

After deployment, check Render logs for:
```
🚀 Keep-Alive: Started (interval: 5 minutes)
🔗 Keep-Alive: Will ping https://chatflow-ai.ukbi.onrender.com/ping
🏓 Keep-Alive: Pinging https://chatflow-ai.ukbi.onrender.com/ping...
✅ Keep-Alive: Server alive (Status 200)
```

## Summary

**Automatic (No work needed after deployment):**
- ✅ Built-in self-ping every 5 minutes
- ✅ Just set `RENDER_EXTERNAL_URL` environment variable
- ✅ Deploy and forget!

**Optional (Best uptime, 2 minutes setup):**
- ✅ Add UptimeRobot monitor
- ✅ Never worry about server sleep again!

## Next Step

1. **Set Environment Variable** on Render (1 minute)
2. **Deploy** via Git push
3. **(Optional)** Setup UptimeRobot (2 minutes)
4. **Done!** Server stays alive automatically 🎉
