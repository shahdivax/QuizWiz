(function() {
    window.NeuralNexusWidget = {
        init: function(config) {
            if (!config.botId) {
                throw new Error("Bot ID is required");
            }
            this.elementId = config.elementId || 'neural-nexus-container';
            this.serverUrl = config.serverUrl || 'http://127.0.0.1:10000';
            this.botName = config.botName || 'Neural Nexus';
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
                <div class="neural-nexus-widget">
                    <div class="chat-toggle">
                        <img src="${this.botImageUrl}" alt="Bot">
                    </div>
                    <div class="chat-ui" style="display: none;">
                        <div class="chat-header">
                            <span>${this.botName}</span>
                            <button class="close-chat">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="chat-messages"></div>
                        <div class="chat-input">
                            <input type="text" placeholder="Connect your thoughts...">
                            <button class="send-message">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="send-icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
                .neural-nexus-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-family: Arial, sans-serif;
                }
                .chat-toggle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(to right, #4f46e5, #7e22ce, #ec4899);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .chat-toggle img {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                }

                .chat-toggle:hover {
                    background: linear-gradient(to right, #4338ca, #6b21a8, #db2777);
                }
                .brain-icon {
                    width: 40px;
                    height: 40px;
                    color: white;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .chat-ui {
                    width: 320px;
                    height: 400px;
                    background: linear-gradient(to bottom right, #312e81, #4c1d95, #701a75);
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #818cf8;
                    position: absolute;
                    bottom: 100px;
                    right: 0;
                }
                .chat-header {
                    height: 48px;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    color: #93c5fd;
                    font-weight: bold;
                }
                .close-chat {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #93c5fd;
                }
                .chat-messages {
                    height: 255px;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                }
                .message {
                    max-width: 75%;
                    padding: 8px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                .user-message {
                    background: rgba(79, 70, 229, 0.7);
                    color: white;
                    align-self: flex-end;
                }
                .bot-message {
                    background: rgba(236, 72, 153, 0.7);
                    color: white;
                    align-self: flex-start;
                }
                .chat-input {
                    height: 64px;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                }
                .chat-input input {
                    flex-grow: 1;
                    background: rgba(79, 70, 229, 0.5);
                    border: 1px solid #818cf8;
                    border-radius: 9999px;
                    color: white;
                    padding: 8px 16px;
                    outline: none;
                }
                .chat-input input::placeholder {
                    color: #93c5fd;
                }
                .send-message {
                    background: linear-gradient(to right, #4f46e5, #ec4899);
                    border: none;
                    border-radius: 9999px;
                    padding: 8px;
                    margin-left: 8px;
                    cursor: pointer;
                }
                .send-icon {
                    width: 20px;
                    height: 20px;
                    color: white;
                }
            `;
            document.head.appendChild(style);
        },

        setupEventListeners: function() {
            const chatToggle = document.querySelector('.chat-toggle');
            const chatUI = document.querySelector('.chat-ui');
            const closeChat = document.querySelector('.close-chat');
            const chatInput = document.querySelector('.chat-input input');
            const sendButton = document.querySelector('.send-message');

            chatToggle.addEventListener('click', () => {
                chatUI.style.display = chatUI.style.display === 'none' ? 'block' : 'none';
            });

            closeChat.addEventListener('click', () => {
                chatUI.style.display = 'none';
            });

            sendButton.addEventListener('click', () => this.sendMessage());
            chatInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.sendMessage();
                }
            });
        },

        sendMessage: function() {
            const chatInput = document.querySelector('.chat-input input');
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                this.addMessageToChat(userMessage, 'user');
                chatInput.value = '';
                this.fetchResponse(userMessage);
            }
        },

        addMessageToChat: function(message, sender) {
            const chatMessages = document.querySelector('.chat-messages');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
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
                console.error('Error:', error);
                this.addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
            });
        }
    };
})();
