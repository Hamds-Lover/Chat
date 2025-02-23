const socket = io("https://sidrayan.onrender.com/");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// Prompt for a username
const username = prompt("Enter your username:") || "User-" + Math.floor(Math.random() * 10000);
socket.emit("set username", username);

// Send a message
sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chat message", { user: username, message });
        messageInput.value = "";
    }
});

// Load chat history on connection
socket.on("chat history", (messages) => {
    messagesDiv.innerHTML = ""; // Clear existing messages
    messages.forEach(addMessageToChat);
});

// Receive new chat messages
socket.on("chat message", addMessageToChat);

// Update user list (for activity tracking)
socket.on("user list", (users) => {
    console.log("Active users:", users); // Can be updated to show online users in UI
});

// Function to add messages to chat
function addMessageToChat(data) {
    const msgElement = document.createElement("div");
    msgElement.textContent = `${data.user}: ${data.message}`;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
