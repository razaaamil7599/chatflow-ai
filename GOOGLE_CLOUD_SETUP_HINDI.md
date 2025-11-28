# Google Cloud Backup Setup - आसान तरीका 🚀

आपके WhatsApp AI Dashboard में Google Drive और Google Sheets backup enable करने के **2 आसान तरीके** हैं:

---

## 🌐 विकल्प 1: Interactive Web Guide (Recommended)

**सबसे आसान तरीका!** Step-by-step visual guide के साथ।

### Steps:
1. Browser में खोलें: `setup-google.html`
2. हर step को follow करें
3. जब पूरा हो जाए, तो JSON, Sheet ID, और Folder ID मुझे provide करें
4. मैं automatically सब merge कर दूंगा

[🔗 Interactive Guide खोलें](file:///c:/Users/Admin/Documents/WhatsApp%20AI%20Dashboard/setup-google.html)

---

## 💻 विकल्प 2: Command Line Setup

Terminal में directly credentials provide करें।

### Steps:
```bash
node quick-setup.js
```

फिर prompts follow करें:
1. Service Account JSON paste करें
2. Google Sheet ID paste करें
3. Google Drive Folder ID paste करें

Automatically configured हो जाएगा! ✅

---

## 📋 आपको क्या चाहिए:

### 1. Google Cloud Service Account JSON
**कहाँ से मिलेगा:**
- Google Cloud Console → Create Service Account → Download JSON Key

**क्या होना चाहिए:**
```json
{
  "type": "service_account",
  "project_id": "...",
  "client_email": "...",
  ...
}
```

---

### 2. Google Sheet ID
**कहाँ से मिलेगा:**
- Google Sheets में नया sheet बनाएं
- URL से ID copy करें:
  ```
  https://docs.google.com/spreadsheets/d/THIS_IS_THE_SHEET_ID/edit
  ```

**Important:** Service account को sheet में **Editor** access दें!

---

### 3. Google Drive Folder ID
**कहाँ से मिलेगा:**
- Google Drive में नया folder बनाएं
- Folder खोलें और URL से ID copy करें:
  ```
  https://drive.google.com/drive/folders/THIS_IS_THE_FOLDER_ID
  ```

**Important:** Service account को folder में **Editor** access दें!

---

## 🎯 Setup के बाद क्या होगा?

### Automatic Features:
✅ सभी WhatsApp messages → Google Sheet में save  
✅ सभी media files → Google Drive में upload  
✅ Real-time backup statistics dashboard पर  
✅ Direct links Sheet और Drive को access करने के लिए  

### Dashboard में दिखेगा:
```
📊 Backup Status
┌─────────────────────────┐
│ ✅ Enabled              │
│ 📝 Messages: 150        │
│ 📁 Media Files: 23      │
│                         │
│ [📊 View Sheet]         │
│ [📁 View Drive]         │
└─────────────────────────┘
```

---

## 🔧 Manual Setup (Advanced)

अगर आप manually configure करना चाहें:

### 1. Save Credentials
```bash
# google-credentials.json file को project folder में रखें
c:\Users\Admin\Documents\WhatsApp AI Dashboard\google-credentials.json
```

### 2. Update .env File
`.env` file में add करें:
```env
ENABLE_GOOGLE_BACKUP=true
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 3. Restart Server
```bash
npm start
```

---

## ✅ Verification

Setup complete होने के बाद, terminal में दिखेगा:

```
✅ Google Backup: Initialized successfully
📊 Google Backup: Ready
   Sheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
   Drive: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

---

## 🆘 Troubleshooting

### "Credentials file not found"
**Solution:** 
- File name exactly `google-credentials.json` होना चाहिए
- Project folder में होना चाहिए

### "Spreadsheet not found"
**Solution:**
- Sheet ID सही है verify करें
- Service account email को share किया है check करें
- Permission "Editor" है confirm करें

### "Permission denied"
**Solution:**
- Sheet और Folder दोनों में service account को Editor access दें
- Service account email: JSON file में `client_email` field में है

---

## 💰 Cost

**बिल्कुल FREE!** 🎉

Google के free tier में:
- Google Sheets API: 500 requests/100 seconds
- Google Drive API: 1000 queries/100 seconds
- Storage: 15 GB FREE

Personal use के लिए बिल्कुल काफी है!

---

## 🎉 Ready to Start?

### मुझे बस यह 3 चीजें provide करें:

1. **Service Account JSON** (पूरी file content)
2. **Google Sheet ID**
3. **Google Drive Folder ID**

**मैं automatically:**
- ✅ `google-credentials.json` file create करूंगा
- ✅ `.env` file update करूंगा
- ✅ Configuration verify करूंगा
- ✅ Server restart करूंगा
- ✅ Backup feature ready कर दूंगा!

---

## 📚 Detailed Documentation

पूरी जानकारी के लिए देखें: [GOOGLE_SETUP.md](GOOGLE_SETUP.md)

---

**बनाया गया ❤️ के साथ आपके WhatsApp AI Dashboard के लिए**
