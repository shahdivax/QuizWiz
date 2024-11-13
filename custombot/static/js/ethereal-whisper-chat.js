(function() {
    window.EtherealWhisperChat = {
        init: function(config) {
            if (!config.botId) {
                throw new Error("Bot ID is required");
            }
            this.elementId = config.elementId || 'ethereal-whisper-chat-container';
            this.serverUrl = config.serverUrl || 'http://127.0.0.1:10000';
            this.botName = config.botName || 'Ethereal Whisper';
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
                <div class="ethereal-chat-widget">
                    <div class="ethereal-chat-icon">
                        <img src="${this.botImageUrl}" alt="Bot">
                    </div>
                    <div class="ethereal-chat-ui" style="display: none;">
                        <div class="ethereal-chat-header">
                            <span>${this.botName}</span>
                            <button class="ethereal-close-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="ethereal-chat-messages"></div>
                        <div class="ethereal-chat-input">
                            <input type="text" placeholder="Whisper your message...">
                            <button class="ethereal-send-btn">
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
                .ethereal-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-family: 'Arial', sans-serif;
                }
                .ethereal-chat-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #68f0c9 0%, #5c86ff 100%);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                .ethereal-chat-icon:hover {
                    transform: scale(1.1);
                }
                .ethereal-chat-icon svg {
                    color: white;
                }
                .ethereal-chat-ui {
                    width: 320px;
                    height: 400px;
                    background: linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 100%);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                }
                .ethereal-chat-header {
                    background: linear-gradient(135deg, #68f0c9 0%, #5c86ff 100%);
                    color: white;
                    padding: 15px;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ethereal-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                .ethereal-chat-messages {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 15px;
                }
                .ethereal-chat-bubble {
                    max-width: 50%;
                    padding: 10px 15px;
                    border-radius: 18px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .ethereal-chat-bubble.user {
                    background-color: #5c86ff;
                    color: white;
                    align-self: flex-end;
                    margin-left: auto;
                }
                .ethereal-chat-bubble.bot {
                    background-color: #31d3f7;
                    color: #333;
                    align-self: flex-start;
                }
                .ethereal-chat-input {
                    display: flex;
                    padding: 10px;
                    background-color: white;
                }
                .ethereal-chat-input input {
                    flex-grow: 1;
                    border: none;
                    outline: none;
                    padding: 10px;
                    font-size: 14px;
                }
                .ethereal-send-btn {
                    background: linear-gradient(135deg, #68f0c9 0%, #5c86ff 100%);
                    border: none;
                    color: white;
                    padding: 10px;
                    cursor: pointer;
                    border-radius: 50%;
                }
            `;
            document.head.appendChild(style);
        },

        setupEventListeners: function() {
            const chatIcon = document.querySelector('.ethereal-chat-icon');
            const chatUI = document.querySelector('.ethereal-chat-ui');
            const closeBtn = document.querySelector('.ethereal-close-btn');
            const chatInput = document.querySelector('.ethereal-chat-input input');
            const sendButton = document.querySelector('.ethereal-send-btn');

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
            const chatInput = document.querySelector('.ethereal-chat-input input');
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                this.addMessageToChat(userMessage, 'user');
                chatInput.value = '';
                this.fetchResponse(userMessage);
            }
        },

        addMessageToChat: function(message, sender) {
            const chatMessages = document.querySelector('.ethereal-chat-messages');
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('ethereal-chat-bubble', sender);
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