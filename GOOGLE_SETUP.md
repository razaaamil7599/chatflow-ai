# Google Cloud Setup Guide - WhatsApp AI Dashboard

Complete step-by-step guide to enable Google Drive and Google Sheets backup for your WhatsApp messages.

## 📋 Overview

This guide will help you:
1. Create a Google Cloud Project (FREE)
2. Enable required APIs
3. Create Service Account credentials
4. Set up Google Sheet and Drive folder
5. Configure the dashboard

**Time Required:** 10-15 minutes  
**Cost:** FREE (within Google's generous quotas)

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the project selector dropdown (top of page)
   - Click "NEW PROJECT"
   - Project name: `WhatsApp AI Dashboard`
   - Click "CREATE"
   - Wait for project creation (takes a few seconds)

3. **Select Your Project**
   - Click the project selector again
   - Select "WhatsApp AI Dashboard"

### Step 2: Enable Required APIs

1. **Go to APIs & Services**
   - Click ☰ menu → "APIs & Services" → "Library"

2. **Enable Google Sheets API**
   - Search for: `Google Sheets API`
   - Click on it
   - Click "ENABLE"
   - Wait for confirmation

3. **Enable Google Drive API**
   - Click "← " to go back to Library
   - Search for: `Google Drive API`
   - Click on it
   - Click "ENABLE"
   - Wait for confirmation

### Step 3: Create Service Account

1. **Go to Credentials**
   - Click ☰ menu → "APIs & Services" → "Credentials"

2. **Create Service Account**
   - Click "+ CREATE CREDENTIALS" → "Service account"
   - Service account name: `whatsapp-dashboard-backup`
   - Service account ID: (auto-generated)
   - Click "CREATE AND CONTINUE"

3. **Grant Permissions** (Step 2 of 3)
   - Role: Select "Editor"
   - Click "CONTINUE"

4. **Skip Optional Step**
   - Click "DONE" (Step 3 is optional)

### Step 4: Create and Download Credentials

1. **Find Your Service Account**
   - You should see "whatsapp-dashboard-backup" in the list
   - Click on it

2. **Create JSON Key**
   - Go to "KEYS" tab
   - Click "ADD KEY" → "Create new key"
   - Select "JSON"
   - Click "CREATE"

3. **Download JSON File**
   - File will download automatically
   - **IMPORTANT:** Save this file!
   - Rename it to: `google-credentials.json`
   - Move it to your WhatsApp AI Dashboard folder

**File Location:**
```
c:\Users\Admin\Documents\WhatsApp AI Dashboard\google-credentials.json
```

### Step 5: Create Google Sheet

1. **Go to Google Sheets**
   - Visit: https://sheets.google.com/
   - Click "+ Blank" to create new spreadsheet

2. **Name Your Sheet**
   - Click "Untitled spreadsheet"
   - Name it: `WhatsApp Messages Backup`

3. **Share with Service Account**
   - Click "Share" button (top right)
   - Open your `google-credentials.json` file
   - Find the "client_email" (looks like: `whatsapp-dashboard-backup@project-id.iam.gserviceaccount.com`)
   - Copy that email
   - Paste it in the "Add people" field
   - Select "Editor" permission
   - **UNCHECK** "Notify people"
   - Click "Share"

4. **Get Sheet ID**
   - Look at the URL in your browser
   - Format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the SHEET_ID (long string between `/d/` and `/edit`)
   - Save this ID for later

### Step 6: Create Google Drive Folder

1. **Go to Google Drive**
   - Visit: https://drive.google.com/
   - Click "+ New" → "Folder"
   - Name it: `WhatsApp Media Backup`

2. **Share with Service Account**
   - Right-click the folder → "Share"
   - Paste the same service account email from Step 5
   - Select "Editor" permission
   - **UNCHECK** "Notify people"
   - Click "Share"

3. **Get Folder ID**
   - Open the folder
   - Look at the URL
   - Format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the FOLDER_ID (string after `/folders/`)
   - Save this ID for later

### Step 7: Configure Dashboard

1. **Update .env File**

Open your `.env` file and add:admin

```env
# Google Cloud Backup (Optional)
ENABLE_GOOGLE_BACKUP=true
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SHEET_ID=YOUR_SHEET_ID_FROM_STEP_5
GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID_FROM_STEP_6
```

**Example:**
```env
ENABLE_GOOGLE_BACKUP=true
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_DRIVE_FOLDER_ID=1dyC0n7MQXjJI2hT-zJjT6jY2wNk4sH5e
```

2. **Verify Files**

Make sure you have:
- ✅ `google-credentials.json` in project folder
- ✅ `.env` file with all Google settings
- ✅ Service account has access to Sheet and Drive folder

## ✅ Verification

### Test the Setup

1. **Restart Server**
   ```bash
   npm start
   ```

2. **Check Logs**
   Look for these lines:
   ```
   ✅ Google Backup: Initialized successfully
   📊 Google Backup: Ready
      Sheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
      Drive: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
   ```

3. **Send Test Message**
   - Send a WhatsApp message to your connected account
   - Check the Google Sheet - message should appear!
   - Send an image - check Google Drive folder!

## 📊 What Gets Backed Up

### Google Sheet Columns

| Column | Data | Example |
|--------|------|---------|
| A | Timestamp | 2025-11-28 10:15:32 |
| B | Contact Name | John Doe |
| C | Contact Number | +911234567890 |
| D | Message Type | Incoming / AI Response |
| E | Message Body | Hello, how are you? |
| F | Message ID | msg_abc123 |
| G | Has Media | TRUE / FALSE |
| H | Media Type | image/jpeg |
| I | Media Link | https://drive.google.com/... |
| J | AI Model | gpt-3.5-turbo |

### Google Drive Files

Media files are organized in the folder:
- Images: `.jpg`, `.png`, `.gif`
- Videos: `.mp4`, `.mov`
- Documents: `.pdf`, `.docx`
- Audio: `.mp3`, `.ogg`

Filenames include timestamp: `2025-11-28_101532_image.jpg`

## 🎛️ Dashboard Features

After setup, you'll see in the dashboard:

**Backup Section** (Sidebar)
- ✅ Backup Status: Enabled/Disabled
- 📊 Messages Backed Up: Count
- 📁 Media Files: Count
- 📊 View Google Sheet (button)
- 📁 View Google Drive (button)

## 🔧 Troubleshooting

### "Credentials file not found"

**Problem:** `google-credentials.json` not in the right location

**Solution:**
1. Check file is exactly named: `google-credentials.json`
2. Place it in: `c:\Users\Admin\Documents\WhatsApp AI Dashboard\`
3. Verify path in `.env`: `GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json`

### "Spreadsheet not found"

**Problem:** Sheet ID is wrong or service account doesn't have access

**Solution:**
1. Double-check GOOGLE_SHEET_ID in `.env`
2. Verify you shared the sheet with service account email
3. Service account email format: `name@project-id.iam.gserviceaccount.com`

### "Permission denied" errors

**Problem:** Service account doesn't have edit permissions

**Solution:**
1. Open Google Sheet
2. Click "Share" → Check if service account email is listed
3. Ensure permission is "Editor" not "Viewer"
4. Repeat for Google Drive folder

### Backups not appearing

**Check:**
1. Is `ENABLE_GOOGLE_BACKUP=true` in `.env`?
2. Did server start without errors?
3. Check terminal for "✅ Google Backup: Initialized successfully"
4. Send a test message and check server logs

## 💰 Cost & Quotas

### Free Tier Limits

**Google Sheets API:**
- 500 requests per 100 seconds
- 100 requests per 100 seconds per user
- **More than enough for personal use!**

**Google Drive API:**
- 1,000 queries per 100 seconds per user
- **Plenty for message backups!**

**Storage:**
- 15 GB FREE with every Google account
- Messages use minimal space (few KB each)
- Media files use more (1-10 MB per image/video)

**Example Usage:**
- 10,000 messages ≈ 50 MB
- 1,000 images ≈ 3-5 GB
- **Well within free tier!**

## 🔒 Security Best Practices

1. **Keep Credentials Secret**
   - Never share `google-credentials.json`
   - It's in `.gitignore` (won't be committed to git)
   - Don't email or upload it anywhere

2. **Service Account Permissions**
   - Only share with specific Sheet and Folder
   - Don't give it access to your entire Drive

3. **Regular Monitoring**
   - Check https://console.cloud.google.com/ periodically
   - Monitor API usage
   - Review backup stats in dashboard

## 📚 Additional Resources

**Google Cloud Console:**
https://console.cloud.google.com/

**API Documentation:**
- Sheets API: https://developers.google.com/sheets/api
- Drive API: https://developers.google.com/drive/api

**Support:**
- Check server logs for detailed errors
- Review troubleshooting section above

## 🎉 You're Done!

Once configured, every WhatsApp message will automatically:
1. ✅ Be saved to Google Sheet with full details
2. ✅ Have media files uploaded to Google Drive
3. ✅ Include links in the sheet for easy access
4. ✅ Update backup stats in real-time on dashboard

**You now have a complete cloud backup of all your WhatsApp communications!** 🚀

---

**Need help?** Check the troubleshooting section or review server logs for specific error messages.
