require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const googleBackup = require('./google-backup');
const keepAlive = require('./keep-alive');

// Keep-Alive Configuration
const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo';
const AI_SYSTEM_PROMPT = process.env.AI_SYSTEM_PROMPT || 'You are a helpful AI assistant responding to WhatsApp messages. Be friendly, concise, and helpful.';
const MIN_DELAY = parseInt(process.env.MIN_RESPONSE_DELAY) || 1000;
const MAX_DELAY = parseInt(process.env.MAX_RESPONSE_DELAY) || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store messages and state
const DATA_FILE = path.join(__dirname, 'chats.json');
let messages = [];
let contacts = new Map();
let conversationHistory = new Map(); // Store conversation context per contact

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      messages = data.messages || [];

      // Reconstruct Map from array
      if (data.contacts) {
        contacts = new Map(data.contacts);
      }

      if (data.conversationHistory) {
        conversationHistory = new Map(data.conversationHistory);
      }

      console.log(`✅ Loaded ${messages.length} messages and ${contacts.size} contacts from storage`);
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// Save data to file
function saveData() {
  try {
    const data = {
      messages: messages.slice(0, 1000), // Keep last 1000 messages
      contacts: Array.from(contacts.entries()),
      conversationHistory: Array.from(conversationHistory.entries())
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Load initial data
loadData();

let stats = {
  messagesReceived: 0,
  messagesSent: 0,
  autoResponsesEnabled: process.env.AUTO_RESPONSE_ENABLED === 'true',
  backupEnabled: false,
  messagesBackedUp: 0,
  mediaBackedUp: 0
};

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// WhatsApp Events
// Store last QR code
let lastQR = null;

client.on('qr', async (qr) => {
  console.log('QR Code received, generating image...');
  try {
    const qrImage = await QRCode.toDataURL(qr);
    lastQR = qrImage; // Save for new connections
    io.emit('qr', qrImage);
    console.log('QR Code sent to dashboard');
  } catch (err) {
    console.error('Error generating QR code:', err);
  }
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
  io.emit('ready', { message: 'WhatsApp connected successfully!' });

  // Mark that WhatsApp is ready for reconnecting dashboards
  global.whatsappReady = true;
  lastQR = null; // Clear QR code
});

client.on('authenticated', () => {
  console.log('WhatsApp authenticated');
  io.emit('authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
  io.emit('auth_failure', { error: msg });
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp disconnected:', reason);
  io.emit('disconnected', { reason });
});

client.on('message', async (message) => {
  try {
    console.log('Message received:', message.body);

    // Skip messages from groups and status updates
    const chat = await message.getChat();
    if (chat.isGroup) {
      console.log('Skipping group message');
      return;
    }

    // Get contact info with fallbacks
    let contactInfo;
    try {
      const contact = await message.getContact();
      contactInfo = {
        id: contact.id._serialized,
        name: contact.pushname || contact.name || contact.number || 'Unknown',
        number: contact.number || contact.id.user,
        profilePicUrl: null
      };

      // Try to get profile picture (may fail, so we catch it)
      try {
        contactInfo.profilePicUrl = await contact.getProfilePicUrl();
      } catch (err) {
        // Profile pic not available, use null
        contactInfo.profilePicUrl = null;
      }
    } catch (err) {
      console.error('Error getting contact info:', err);
      // Fallback contact info
      contactInfo = {
        id: message.from || message.id._serialized,
        name: message.from || 'Unknown Contact',
        number: message.from || 'Unknown',
        profilePicUrl: null
      };
    }

    // Store contact
    contacts.set(contactInfo.id, contactInfo);
    saveData(); // Save new contact

    // Create message object
    const messageData = {
      id: message.id._serialized,
      from: contactInfo.name,
      fromNumber: contactInfo.number,
      contactId: contactInfo.id,
      body: message.body,
      timestamp: message.timestamp * 1000,
      fromMe: message.fromMe,
      hasMedia: message.hasMedia
    };

    // Store message
    messages.unshift(messageData);
    saveData(); // Save new message

    // Only increment if message is not from me
    if (!message.fromMe) {
      stats.messagesReceived++;
    }

    // Emit to dashboard
    io.emit('message', messageData);
    io.emit('stats', stats);
    io.emit('contact', contactInfo);

    console.log(`Message from ${contactInfo.name}: ${message.body}`);

    // Backup to Google Sheets
    if (googleBackup.enabled) {
      const backed = await googleBackup.backupMessage(messageData, contactInfo);
      if (backed) {
        stats.messagesBackedUp++;
        io.emit('backup_stats', googleBackup.getStats());
      }
    }

    // Handle media if present
    if (message.hasMedia && googleBackup.enabled) {
      try {
        const media = await message.downloadMedia();
        const buffer = Buffer.from(media.data, 'base64');
        const filename = media.filename || `media_${Date.now()}.${media.mimetype.split('/')[1]}`;
        const mediaLink = await googleBackup.uploadMedia(buffer, filename, media.mimetype);

        if (mediaLink) {
          stats.mediaBackedUp++;
          // Update message in sheet with media link
          messageData.mediaLink = mediaLink;
          messageData.mediaType = media.mimetype;
          await googleBackup.backupMessage({ ...messageData, mediaLink, mediaType: media.mimetype }, contactInfo);
          io.emit('backup_stats', googleBackup.getStats());
        }
      } catch (err) {
        console.error('Error downloading/uploading media:', err.message);
      }
    }

    // Auto-respond if enabled and message is not from me
    if (stats.autoResponsesEnabled && !message.fromMe) {
      await handleAutoResponse(message, contactInfo);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    io.emit('error', { message: 'Error processing message', error: error.message });
  }
});

// Extract Contact Info using AI
async function extractContactInfo(messageBody, currentInfo) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data extraction assistant. Extract the user's Name and Category from the message. Category options: 'Job Seeker', 'Hiring', 'Inquiry', 'Other'. Return JSON only: {\"name\": \"...\", \"category\": \"...\"}. If not found, return null for that field."
        },
        {
          role: "user",
          content: messageBody
        }
      ],
      temperature: 0,
      max_tokens: 100
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Only update if new info found
    const updates = {};
    if (result.name && (!currentInfo.name || currentInfo.name === 'Unknown' || currentInfo.name === currentInfo.number)) {
      updates.name = result.name;
    }
    if (result.category) {
      updates.category = result.category;
    }

    return updates;

  } catch (error) {
    console.error('Error extracting info:', error);
    return {};
  }
}

// AI Response Handler
async function handleAutoResponse(message, contactInfo) {
  try {
    console.log(`Generating AI response for: ${contactInfo.name}`);

    // Get or initialize conversation history
    if (!conversationHistory.has(contactInfo.id)) {
      conversationHistory.set(contactInfo.id, []);
    }
    const history = conversationHistory.get(contactInfo.id);

    // Add user message to history
    history.push({
      role: 'user',
      content: message.body
    });

    // Keep only last 10 messages for context
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    saveData(); // Save history update

    // Extract info in parallel
    extractContactInfo(message.body, contactInfo).then(updates => {
      if (Object.keys(updates).length > 0) {
        Object.assign(contactInfo, updates);
        contacts.set(contactInfo.id, contactInfo);
        io.emit('contact', contactInfo);
        console.log('Updated contact info:', updates);
      }
    });

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        ...history
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to history
    history.push({
      role: 'assistant',
      content: aiResponse
    });

    // Simulate typing delay
    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Send response
    await message.reply(aiResponse);

    console.log(`AI Response sent to ${contactInfo.name}: ${aiResponse}`);

    // Store sent message
    const sentMessage = {
      id: Date.now().toString(),
      from: 'AI Assistant',
      fromNumber: 'me',
      contactId: contactInfo.id,
      body: aiResponse,
      timestamp: Date.now(),
      fromMe: true,
      isAI: true
    };

    messages.unshift(sentMessage);
    stats.messagesSent++;
    saveData(); // Save sent message

    // Emit to dashboard
    io.emit('message', sentMessage);
    io.emit('stats', stats);

    // Backup AI response to Google Sheets
    if (googleBackup.enabled) {
      await googleBackup.backupMessage(sentMessage, contactInfo);
      stats.messagesBackedUp++;
      io.emit('backup_stats', googleBackup.getStats());
    }

  } catch (error) {
    console.error('Error generating AI response:', error);
    io.emit('error', { message: 'Failed to generate AI response', error: error.message });
  }
}

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('📱 Dashboard connected:', socket.id, 'Transport:', socket.conn.transport.name);

  // Log transport upgrades
  socket.conn.on('upgrade', (transport) => {
    console.log('⬆️ Transport upgraded to:', transport.name);
  });

  // Send current state
  socket.emit('init', {
    messages: messages.slice(0, 50),
    contacts: Array.from(contacts.values()),
    stats
  });

  // Send last QR if available and not ready
  if (!global.whatsappReady && lastQR) {
    socket.emit('qr', lastQR);
  }

  // Send WhatsApp ready status if already connected
  if (global.whatsappReady) {
    console.log('📤 Sending ready status to reconnected dashboard');
    setTimeout(() => {
      socket.emit('ready', { message: 'WhatsApp connected successfully!' });
    }, 100);
  }

  // Toggle auto-response
  socket.on('toggle_auto_response', (enabled) => {
    stats.autoResponsesEnabled = enabled;
    io.emit('stats', stats);
    console.log('Auto-response:', enabled ? 'enabled' : 'disabled');
  });

  // Clear history
  socket.on('clear_history', () => {
    messages = [];
    conversationHistory.clear();
    saveData(); // Save cleared state
    io.emit('init', {
      messages: [],
      contacts: Array.from(contacts.values()),
      stats
    });
    io.emit('history_cleared');
    console.log('History cleared');
  });

  // Hard Reset
  socket.on('hard_reset', async () => {
    console.log('Hard reset requested from dashboard');
    try {
      await client.destroy();

      // Delete session directories
      const authPath = path.join(__dirname, '.wwebjs_auth');
      const cachePath = path.join(__dirname, '.wwebjs_cache');

      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log('Deleted .wwebjs_auth');
      }
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log('Deleted .wwebjs_cache');
      }

      console.log('Session files cleared. Re-initializing...');
      io.emit('init', {
        messages: [],
        contacts: [],
        stats
      });

      // Re-initialize
      client.initialize();

    } catch (err) {
      console.error('Error during hard reset:', err);
      io.emit('error', { message: 'Hard reset failed', error: err.message });
      // Try to re-init anyway
      client.initialize();
    }
  });

  socket.on('disconnect', () => {
    console.log('Dashboard disconnected');
  });
});

// REST API Endpoints
app.get('/api/messages', (req, res) => {
  res.json({ messages: messages.slice(0, 100) });
});

app.get('/api/contacts', (req, res) => {
  res.json({ contacts: Array.from(contacts.values()) });
});

app.get('/api/stats', (req, res) => {
  res.json({ stats });
});

app.get('/api/backup/stats', (req, res) => {
  res.json(googleBackup.getStats());
});

// Keep-Alive endpoints
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


// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 WhatsApp AI Dashboard Server Started`);
  console.log(`📱 Dashboard: http://localhost:${PORT}`);
  console.log(`🤖 AI Model: ${AI_MODEL}`);
  console.log(`\nInitializing WhatsApp client...`);
  console.log(`Please wait for QR code to appear in the dashboard.\n`);
});

// Initialize Google Backup
googleBackup.initialize().then(enabled => {
  stats.backupEnabled = enabled;
  if (enabled) {
    console.log('📊 Google Backup: Ready');
    console.log(`   Sheet: ${googleBackup.getSheetUrl() || 'Not configured'}`);
    console.log(`   Drive: ${googleBackup.getDriveFolderUrl() || 'Not configured'}`);
  }
}).catch(err => {
  console.error('⚠️ Google Backup Initialization Error:', err.message);
});

// Initialize WhatsApp Client
client.initialize();

// Start Keep-Alive Service
keepAlive.startKeepAlive();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await client.destroy();
  process.exit(0);
});
