# WhatsApp AI Dashboard

A powerful WhatsApp AI Agent with Google Sheets backup integration for immigration consultancies and businesses.

## Features

✅ AI-powered WhatsApp responses (GPT-4)  
✅ Google Sheets automatic backup  
✅ Real-time dashboard  
✅ Multi-language support (Hindi/English)  
✅ Message analytics  
✅ Auto-response with custom delays  

## Tech Stack

- Node.js + Express
- WhatsApp Web.js
- OpenAI API (GPT-4)
- Google Sheets API
- Socket.IO

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` file (see `.env.example`)
4. Add Google credentials
5. Run: `npm start`

## Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key
- `AI_MODEL` - AI model (default: gpt-4)
- `PORT` - Server port (default: 3000)

Optional (Google Backup):
- `ENABLE_GOOGLE_BACKUP=true`
- `GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json`
- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_DRIVE_FOLDER_ID` - Your Google Drive folder ID

## Deployment

Deploy easily on Render.com, Railway.app, or any Node.js hosting.

## License

MIT
