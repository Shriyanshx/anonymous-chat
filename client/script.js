// public/script.js
const socket = io('http://localhost:3000');

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const nextButton = document.getElementById('next-button');

socket.on('matched', (data) => {
  chatBox.innerHTML = `<p>You are now connected with a random user: ${data.partner}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
});

socket.on('message', (message) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'received');
  messageElement.textContent = message.content;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
});

socket.on('partnerDisconnected', () => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'received');
  messageElement.textContent = 'Your chat partner has disconnected.';
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
});

const sendMessage = () => {
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('message', { sender: socket.id, content: message });

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'sent');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);

    messageInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
  }
};

const nextChat = () => {
  socket.emit('next');
  chatBox.innerHTML = '<p>Searching for a new chat partner...</p>';
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
};

sendButton.addEventListener('click', sendMessage);
nextButton.addEventListener('click', nextChat);

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
    event.preventDefault(); // Prevents the default behavior of Enter key in a textarea
  }
  if (event.key === 'Escape') {
    nextChat();
  }
});
