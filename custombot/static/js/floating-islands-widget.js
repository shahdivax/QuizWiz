(function() {
    window.FloatingIslandsChat = {
        init: function(config) {
            if (!config.botId) {
                throw new Error("Bot ID is required");
            }
            this.elementId = config.elementId || 'floatingislands-container';
            this.serverUrl = config.serverUrl || 'http://127.0.0.1:10000';
            this.botName = config.botName || 'Island Bot';
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
                <div class="floating-islands-chat">
                    <div class="chat-icon">
                        <img src="${this.botImageUrl}" alt="Bot">
                    </div>
                    <div class="chat-ui" style="display: none;">
                        <div class="chat-header">
                            <span>${this.botName}</span>
                            <button class="close-btn">×</button>
                        </div>
                        <div class="chat-messages"></div>
                        <div class="chat-input">
                            <input type="text" placeholder="Type your message...">
                            <button class="send-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
                .floating-islands-chat {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-family: Arial, sans-serif;
                    z-index: 1000;
                }
                .chat-icon {
                    width: 64px;
                    height: 64px;
                    background-color: #e0f2fe;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s;
                    overflow: hidden;
                    border: 4px solid #bae6fd;
                }
                .chat-icon:hover {
                    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
                }
                .chat-icon img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .chat-ui {
                    width: 320px;
                    height: 400px;
                    background: linear-gradient(to bottom, #e0f2fe, #bae6fd);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                }
                .chat-header {
                    background-color: #bae6fd;
                    color: #0c4a6e;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top-left-radius: 24px;
                    border-top-right-radius: 24px;
                }
                .chat-header span {
                    font-size: 18px;
                    font-weight: 600;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: #0c4a6e;
                    font-size: 24px;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .close-btn:hover {
                    color: #0369a1;
                }
                .chat-messages {
                    height: 175px;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                }
                .chat-bubble {
                    max-width: 70%;
                    padding: 12px;
                    border-radius: 16px;
                    margin-bottom: 12px;
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .chat-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    width: 16px;
                    height: 16px;
                    background-color: #02caf7;
                    border-radius: 50%;
                }
                .user {
                    background-color: #ffffff;
                    color: #0c4a6e;
                    align-self: flex-end;
                }
                .user::after {
                    left: -8px;
                }
                .bot {
                    background-color: #0c4a6e;
                    color: #ffffff;
                    align-self: flex-start;
                }
                .bot::after {
                    right: -8px;
                }
                .chat-input {
                    padding: 16px;
                    background-color: #bae6fd;
                    display: flex;
                    align-items: center;
                    border-bottom-left-radius: 24px;
                    border-bottom-right-radius: 24px;
                }
                .chat-input input {
                    flex-grow: 1;
                    background-color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    padding: 8px 16px;
                    font-size: 14px;
                    color: #0c4a6e;
                    outline: none;
                    transition: box-shadow 0.2s;
                }
                .chat-input input:focus {
                    box-shadow: 0 0 0 2px #0284c7;
                }
                .send-btn {
                    background-color: #0284c7;
                    color: #ffffff;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-left: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .send-btn:hover {
                    background-color: #0369a1;
                }
            `;
            document.head.appendChild(style);
        },

        setupEventListeners: function() {
            const chatIcon = document.querySelector('.chat-icon');
            const chatUI = document.querySelector('.chat-ui');
            const closeBtn = document.querySelector('.close-btn');
            const chatInput = document.querySelector('.chat-input input');
            const sendButton = document.querySelector('.send-btn');

            chatIcon.addEventListener('click', () => {
                chatUI.style.display = 'block';
                chatIcon.style.display = 'none';
            });

            closeBtn.addEventListener('click', () => {
                chatUI.style.display = 'none';
                chatIcon.style.display = 'block';
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
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('chat-bubble', sender);
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
                console.error('Error:', error);
                this.addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
            });
        }
    };
})();
