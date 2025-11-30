document.addEventListener('DOMContentLoaded', () => {
    // Initialize Socket.IO with enhanced reconnection
    const socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        timeout: 20000
    });

    // State
    let currentContact = null;
    let allMessages = [];
    let allContacts = [];

    // Elements
    const qrSection = document.getElementById('qrSection');
    const messagesSection = document.getElementById('messagesSection');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const connectionStatus = document.getElementById('connectionStatus');
    const receivedCount = document.getElementById('receivedCount');
    const sentCount = document.getElementById('sentCount');
    const autoResponseToggle = document.getElementById('autoResponseToggle');
    const contactsList = document.getElementById('contactsList');
    const chatMessages = document.getElementById('chatMessages');
    const chatHeader = document.getElementById('chatHeader');
    const searchInput = document.getElementById('searchInput');

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const toast = document.getElementById('toast');



    // Connection Events
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        console.log('🔌 Transport:', socket.io.engine.transport.name);
        updateStatus('connecting', 'Connected to server');
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        updateStatus('connecting', 'Reconnecting...');
        showToast('⚠️ Connection lost, reconnecting...', 'warning');
    });

    socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error.message);
        updateStatus('disconnected', 'Connection Error');
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        showToast('✅ Reconnected to server');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt:', attemptNumber);
        updateStatus('connecting', `Reconnecting (${attemptNumber})...`);
    });

    socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed');
        updateStatus('disconnected', 'Connection Failed');
        showToast('❌ Cannot connect to server. Please refresh.', 'error');
    });

    // Socket Events
    socket.on('qr', (qrImage) => {
        console.log('QR Code received');
        if (qrCodeContainer) {
            qrCodeContainer.innerHTML = `<img src="${qrImage}" alt="QR Code">`;
        }
        updateStatus('connecting', 'Scan QR Code');
    });

    socket.on('ready', (data) => {
        console.log('WhatsApp ready:', data);
        updateStatus('connected', 'Connected');
        showToast('✅ WhatsApp connected successfully!');

        if (qrSection) qrSection.style.display = 'none';
        if (messagesSection) messagesSection.style.display = 'grid';
    });

    socket.on('authenticated', () => {
        console.log('Authenticated');
        updateStatus('connected', 'Authenticating...');
    });

    socket.on('auth_failure', (data) => {
        console.error('Auth failure:', data);
        updateStatus('disconnected', 'Authentication Failed');
        showToast('❌ Authentication failed. Please try again.', 'error');
    });

    socket.on('disconnected', (data) => {
        console.log('Disconnected:', data);
        updateStatus('disconnected', 'Disconnected');
        showToast('⚠️ WhatsApp disconnected', 'warning');
        if (qrSection) qrSection.style.display = 'flex';
        if (messagesSection) messagesSection.style.display = 'none';
    });

    socket.on('init', (data) => {
        console.log('Initial data:', data);
        allMessages = data.messages || [];
        allContacts = data.contacts || [];
        updateStats(data.stats);
        renderContacts();

        // Update auto-response toggle to match server state
        if (autoResponseToggle && data.stats) {
            autoResponseToggle.checked = data.stats.autoResponsesEnabled || false;
        }

        // Update settings modal with current config
        if (data.config) {
            updateSettingsUI(data.config);
        }
    });



    socket.on('message', (message) => {
        console.log('New message:', message);
        allMessages.unshift(message);

        const contactIndex = allContacts.findIndex(c => c.id === message.contactId);
        if (contactIndex !== -1) {
            allContacts[contactIndex].lastMessage = message.body;
            allContacts[contactIndex].lastMessageTime = message.timestamp;
        }
        renderContacts();

        if (currentContact && currentContact.id === message.contactId) {
            renderChat(message.contactId);
        }
    });

    socket.on('contact', (contact) => {
        const existingIndex = allContacts.findIndex(c => c.id === contact.id);
        if (existingIndex === -1) {
            allContacts.push(contact);
        } else {
            allContacts[existingIndex] = { ...allContacts[existingIndex], ...contact };
        }
        renderContacts();
    });

    socket.on('stats', (stats) => {
        updateStats(stats);
    });

    socket.on('error', (data) => {
        console.error('Error:', data);
        showToast(`❌ ${data.message}`, 'error');
    });

    // Other Event Listeners
    if (autoResponseToggle) {
        autoResponseToggle.addEventListener('change', (e) => {
            socket.emit('toggle_auto_response', e.target.checked);
            showToast(e.target.checked ? '✅ Auto-response enabled' : '⚠️ Auto-response disabled');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderContacts(e.target.value);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all conversation history?')) {
                socket.emit('clear_history');
            }
        });
    }

    // Helper Functions
    function updateStatus(status, text) {
        if (!connectionStatus) return;
        const statusDot = connectionStatus.querySelector('.status-dot');
        const statusText = connectionStatus.querySelector('span');
        if (statusDot) statusDot.className = `status-dot ${status}`;
        if (statusText) statusText.textContent = text;
    }

    function updateStats(stats) {
        if (receivedCount) receivedCount.textContent = stats.messagesReceived || 0;
        if (sentCount) sentCount.textContent = stats.messagesSent || 0;
        if (autoResponseToggle) autoResponseToggle.checked = stats.autoResponseEnabled;
    }

    function renderContacts(filter = '') {
        if (!contactsList) return;

        const filteredContacts = allContacts.filter(contact => {
            if (!filter) return true;
            return contact.name.toLowerCase().includes(filter.toLowerCase()) ||
                contact.number.includes(filter);
        });

        if (filteredContacts.length === 0) {
            contactsList.innerHTML = `
                <div class="no-contacts">
                    <p>No conversations yet</p>
                    <span>Messages will appear here</span>
                </div>
            `;
            return;
        }

        filteredContacts.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

        contactsList.innerHTML = filteredContacts.map(contact => {
            const messages = allMessages.filter(m => m.contactId === contact.id);
            const lastMessage = messages[0];
            const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return `
                <div class="contact-item ${currentContact && currentContact.id === contact.id ? 'active' : ''}" 
                     data-contact-id="${contact.id}">
                    <div class="contact-avatar">${initials}</div>
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-last-message">
                            ${lastMessage ? (lastMessage.fromMe ? '✓ ' : '') + lastMessage.body : 'No messages'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.dataset.contactId;
                const contact = allContacts.find(c => c.id === contactId);
                selectContact(contact);
            });
        });
    }

    function selectContact(contact) {
        currentContact = contact;
        renderContacts();
        renderChat(contact.id);

        if (chatHeader) {
            const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            chatHeader.innerHTML = `
                <div class="chat-contact-info">
                    <div class="chat-contact-avatar">${initials}</div>
                    <div>
                        <div style="font-weight: 600;">${contact.name}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">${contact.number}</div>
                    </div>
                </div>
            `;
        }
    }

    function renderChat(contactId) {
        if (!chatMessages) return;
        const messages = allMessages.filter(m => m.contactId === contactId);

        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 48px;">
                    No messages yet
                </div>
            `;
            return;
        }

        chatMessages.innerHTML = messages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const messageClass = msg.fromMe ? 'sent' : 'received';
            const aiClass = msg.isAI ? 'ai' : '';

            return `
                <div class="message ${messageClass} ${aiClass}">
                    <div class="message-header">
                        <span class="message-sender">
                            ${msg.fromMe ? 'You' : msg.from}
                            ${msg.isAI ? '<span class="ai-badge">AI</span>' : ''}
                        </span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-body">${escapeHtml(msg.body)}</div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message, type = 'success') {
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast show';
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    console.log('Dashboard initialized');
    updateStatus('connecting', 'Connecting...');
});


