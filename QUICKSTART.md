# WhatsApp AI Dashboard - Quick Start Guide

## ⚡ Quick Setup (3 Steps)

### Step 1: Add Your OpenAI API Key

Create a file named `.env` in the project root with the following content:

```env
OPENAI_API_KEY=your_actual_api_key_here
PORT=3000
AI_MODEL=gpt-3.5-turbo
AI_SYSTEM_PROMPT=You are a helpful AI assistant responding to WhatsApp messages. Be friendly, concise, and helpful.
AUTO_RESPONSE_ENABLED=true
MIN_RESPONSE_DELAY=1000
MAX_RESPONSE_DELAY=3000
```

**⚠️ IMPORTANT**: Replace `your_actual_api_key_here` with your real OpenAI API key!

Get your API key here: https://platform.openai.com/api-keys

### Step 2: Start the Server

Run this command in the terminal:

```bash
npm start
```

You should see:
```
🚀 WhatsApp AI Dashboard Server Started
📱 Dashboard: http://localhost:3000
🤖 AI Model: gpt-3.5-turbo

Initializing WhatsApp client...
Please wait for QR code to appear in the dashboard.
```

### Step 3: Connect WhatsApp

1. Open your browser and go to: **http://localhost:3000**
2. You'll see a QR code
3. Open WhatsApp on your phone
4. Go to **Settings → Linked Devices → Link a Device**
5. Scan the QR code
6. Wait for "Connected" status ✅

**That's it!** Your AI Dashboard is now ready!

## 🎯 What Happens Next?

1. **Receive Messages**: Any WhatsApp message you receive will appear in the dashboard
2. **AI Auto-Response**: The AI will automatically reply to incoming messages
3. **Real-Time Updates**: Everything updates live without refreshing
4. **View Conversations**: Click on any contact to see the full chat history

## 🎛️ Dashboard Controls

- **Auto-Response Toggle**: Turn AI responses on/off
- **Settings Button**: Customize AI personality
- **Clear History**: Reset AI conversation memory
- **Statistics**: See message counts

## 🔧 Customizing the AI

Click the **⚙️ Settings** button to change how the AI responds:

**Example Prompts:**

**Professional Customer Service:**
```
You are a professional customer service representative. Be polite, helpful, and respond to inquiries about our products and services. Ask clarifying questions when needed.
```

**Friendly Sales Assistant:**
```
You are a friendly and enthusiastic sales assistant. Help customers discover products, answer questions, and provide recommendations. Be conversational and engaging.
```

**Personal Assistant:**
```
You are a helpful personal assistant. Help with scheduling, reminders, information lookup, and general tasks. Be concise and efficient.
```

**Fun Chatbot:**
```
You are a fun and witty chatbot. Use emojis, be playful, and keep conversations light and entertaining while still being helpful.
```

## 🎨 Features at a Glance

✅ **Real-time messaging** - See messages as they arrive  
✅ **AI-powered responses** - Automatic intelligent replies  
✅ **Conversation context** - AI remembers previous messages  
✅ **Beautiful UI** - Modern dark mode design  
✅ **Contact management** - All conversations in one place  
✅ **Search** - Find contacts quickly  
✅ **Statistics** - Track your activity  
✅ **Fully customizable** - Change AI behavior anytime  

## ⚠️ Troubleshooting

### "Error: OPENAI_API_KEY not found"
- Make sure you created the `.env` file
- Check that you added your real API key
- Restart the server after creating `.env`

### QR Code Not Showing
- Make sure server is running (check terminal)
- Open http://localhost:3000 in your browser
- Clear browser cache if needed

### AI Not Responding
- Check that auto-response toggle is ON
- Verify your OpenAI API key is valid
- Check OpenAI account has credits
- Look at the terminal for error messages

### Connection Lost
- Your phone needs internet connection
- Don't log out from other WhatsApp Web sessions
- Re-scan QR code if disconnected

## 🚀 You're All Set!

Your WhatsApp AI Dashboard is ready to handle messages automatically. The AI will learn from conversations and provide context-aware responses.

**Enjoy your automated WhatsApp assistant! 🤖✨**

---

Need more help? Check the full README.md for detailed documentation.
