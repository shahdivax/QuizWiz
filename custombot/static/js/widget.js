(function() {
    window.CustomBot = {
        init: function(config) {
            if (!config.botId) {
                throw new Error("Bot ID is required");
            }
            this.elementId = config.elementId || 'custombot-container';
            this.serverUrl = config.serverUrl || 'http://127.0.0.1:10000';
            this.botName = config.botName || 'Helper Bot';
            this.botImageUrl = config.botImageUrl || '/static/images/chat-icon.png';
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
                <div class="chat-widget">
                    <div class="chat-icon">
                        <img src="${this.botImageUrl}" alt="Chat Icon">
                    </div>
                    <div class="chat-ui" style="display: none;">
                        <div class="chat-header">${this.botName}</div>
                        <div class="chat-messages"></div>
                        <div class="chat-input">
                            <input type="text" placeholder="Type your message...">
                            <button>Send</button>
                        </div>
                    </div>
                </div>
            `;

            this.injectStyles();
        },

        injectStyles: function() {
            const style = document.createElement('style');
            style.textContent = `
                .chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    font-family: Arial, sans-serif;
                }
                .chat-icon {
                    width: 60px;
                    height: 60px;
                    background-color: #007bff;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                }
                .chat-icon img {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                }
                .chat-ui {
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 300px;
                    margin-bottom: 80px;
                }
                .chat-header {
                    background-color: #007bff;
                    color: #fff;
                    padding: 10px;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                .chat-messages {
                    height: 300px;
                    overflow-y: scroll;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                }
                .chat-bubble {
                    max-width: 70%;
                    padding: 10px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                }
                .user {
                    background-color: #dcf8c6;
                    align-self: flex-end;
                }
                .bot {
                    background-color: #e2e2e2;
                    align-self: flex-start;
                }
                .chat-input {
                    display: flex;
                    padding: 10px;
                    border-top: 1px solid #ccc;
                }
                .chat-input input {
                    flex-grow: 1;
                    padding: 5px;
                }
                .chat-input button {
                    margin-left: 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        },

        setupEventListeners: function() {
            const chatIcon = document.querySelector('.chat-icon');
            const chatUI = document.querySelector('.chat-ui');
            const chatInput = document.querySelector('.chat-input input');
            const sendButton = document.querySelector('.chat-input button');

            chatIcon.addEventListener('click', () => {
                chatUI.style.display = chatUI.style.display === 'none' ? 'block' : 'none';
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
//            console.log('Sending request with botId:', this.botId); // Debug log
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
//                console.log('Received response:', data); // Debug log
                const botMessages = Array.isArray(data.output) ? data.output : [data.output];
                botMessages.forEach(botMessage => {
                    this.addMessageToChat(botMessage, 'bot');
                });
            })
            .catch(error => {
//                console.error('Error:', error);
                this.addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
            });
        }
    };
})();