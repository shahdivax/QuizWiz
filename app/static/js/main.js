const chatIcon = document.querySelector('.chat-icon');
const chatUI = document.querySelector('.chat-ui');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');

chatIcon.addEventListener('click', toggleChatUI);
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function toggleChatUI() {
    chatUI.style.display = chatUI.style.display === 'none' ? 'block' : 'none';
}

function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        addMessageToChat(userMessage, 'user');
        chatInput.value = '';
        fetchResponse(userMessage);
    }
}

function addMessageToChat(message, sender) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('chat-bubble', sender);
    messageBubble.textContent = message;
    chatMessages.appendChild(messageBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function fetchResponse(message) {
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: message })
    })
    .then(response => response.json())
    .then(data => {
        const botMessages = data.output;
        botMessages.forEach(botMessage => {
            addMessageToChat(botMessage, 'bot');
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}