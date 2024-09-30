(function() {
    window.QuantumRealmCommunicator = {
        init: function(config) {
            if (!config.botId) {
                throw new Error("Bot ID is required");
            }
            this.elementId = config.elementId || 'quantum-realm-communicator-container';
            this.serverUrl = config.serverUrl || 'http://127.0.0.1:10000';
            this.botName = config.botName || 'Quantum Realm Communicator';
            this.botImageUrl = config.botImageUrl || '/static/images/island-bot.png';
            this.botId = config.botId;
            this.createWidget();
            this.setupEventListeners();
        },

        createWidget: function() {
            const container = document.getElementById(this.elementId);
            if (!container) {
                console.error(`Element with id "${this.elementId}" not found.`);
                return;
            }

            container.innerHTML = `
                <div class="quantum-chat-widget">
                    <div class="quantum-chat-icon">
                        <img src="${this.botImageUrl}" alt="Bot">
                    </div>
                    <div class="quantum-chat-ui" style="display: none;">
                        <div class="quantum-chat-header">
                            <span>${this.botName}</span>
                            <button class="quantum-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="quantum-chat-messages"></div>
                        <div class="quantum-chat-input">
                            <input type="text" placeholder="Transmit through quantum foam...">
                            <button class="quantum-send-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.injectStyles();
        },

        injectStyles: function() {
            const style = document.createElement('style');
            style.textContent = `
                .quantum-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-family: 'Arial', sans-serif;
                }
                .quantum-chat-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    animation: quantum-pulse 2s infinite;
                }
                @keyframes quantum-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(79, 172, 254, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(79, 172, 254, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(79, 172, 254, 0); }
                }
                .quantum-chat-icon:hover {
                    transform: scale(1.1);
                }
                .quantum-chat-icon svg {
                    color: white;
                    animation: quantum-spin 10s linear infinite;
                }
                @keyframes quantum-spin {
                    100% { transform: rotate(360deg); }
                }
                .quantum-chat-ui {
                    width: 320px;
                    height: 400px;
                    background: linear-gradient(135deg, #0c0c1e 0%, #1f1f3a 100%);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .quantum-chat-icon img {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                }

                .quantum-chat-ui::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image:
                        radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                    animation: quantum-shift 20s linear infinite;
                    opacity: 0.3;
                }
                @keyframes quantum-shift {
                    0% { background-position: 0 0, 10px 10px; }
                    100% { background-position: 20px 20px, 30px 30px; }
                }
                .quantum-chat-header {
                    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                    color: white;
                    padding: 15px;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1;
                }
                .quantum-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                .quantum-chat-messages {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 15px;
                    z-index: 1;
                }
                .quantum-chat-bubble {
                    max-width: 80%;
                    padding: 10px 15px;
                    border-radius: 18px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    line-height: 1.4;
                    animation: quantum-fluctuate 2s infinite;
                }
                @keyframes quantum-fluctuate {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .quantum-chat-bubble.user {
                    background-color: #4facfe;
                    color: white;
                    align-self: flex-end;
                    margin-left: auto;
                }
                .quantum-chat-bubble.bot {
                    background-color: #2a2a4a;
                    color: #e0e0e0;
                    align-self: flex-start;
                }
                .quantum-chat-input {
                    display: flex;
                    padding: 10px;
                    background-color: #1a1a2e;
                    z-index: 1;
                }
                .quantum-chat-input input {
                    flex-grow: 1;
                    border: none;
                    outline: none;
                    padding: 10px;
                    font-size: 14px;
                    background-color: #2a2a4a;
                    color: #e0e0e0;
                    border-radius: 20px;
                }
                .quantum-send-btn {
                    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                    border: none;
                    color: white;
                    padding: 10px;
                    cursor: pointer;
                    border-radius: 50%;
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(style);
        },

        setupEventListeners: function() {
            const chatIcon = document.querySelector('.quantum-chat-icon');
            const chatUI = document.querySelector('.quantum-chat-ui');
            const closeBtn = document.querySelector('.quantum-close-btn');
            const chatInput = document.querySelector('.quantum-chat-input input');
            const sendButton = document.querySelector('.quantum-send-btn');

            chatIcon.addEventListener('click', () => {
                chatUI.style.display = 'flex';
                chatIcon.style.display = 'none';
            });

            closeBtn.addEventListener('click', () => {
                chatUI.style.display = 'none';
                chatIcon.style.display = 'flex';
            });

            sendButton.addEventListener('click', () => this.sendMessage());
            chatInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.sendMessage();
                }
            });
        },

        sendMessage: function() {
            const chatInput = document.querySelector('.quantum-chat-input input');
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                this.addMessageToChat(userMessage, 'user');
                chatInput.value = '';
                this.fetchResponse(userMessage);
            }
        },

        addMessageToChat: function(message, sender) {
            const chatMessages = document.querySelector('.quantum-chat-messages');
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('quantum-chat-bubble', sender);
            messageBubble.textContent = message;
            chatMessages.appendChild(messageBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        },

        fetchResponse: function(message) {
            fetch(`${this.serverUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: message,
                    botId: this.botId
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const botMessages = Array.isArray(data.output) ? data.output : [data.output];
                botMessages.forEach(botMessage => {
                    this.addMessageToChat(botMessage, 'bot');
                });
            })
            .catch(error => {
                this.addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
            });
        }
    };
})();