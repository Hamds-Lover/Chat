// public/script.js
const socket = io("https://sidrayan.onrender.com/");
const loginForm = document.getElementById("loginForm");
const chatContainer = document.getElementById("chatContainer");
const userListDiv = document.getElementById("userList");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
let currentUser = null;
let currentChatUser = null;

// Handle login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        currentUser = username;
        socket.emit("set username", username);
        document.getElementById("loginScreen").style.display = "none";
        chatContainer.style.display = "block";
    } else {
        alert("Invalid credentials");
    }
});

// Update user list
socket.on("user list", (users) => {
    userListDiv.innerHTML = "";
    Object.values(users).forEach((user) => {
        if (user.username !== currentUser) {
            const userElement = document.createElement("div");
            userElement.textContent = `${user.username} (${user.status})`;
            userElement.onclick = () => startChat(user.username);
            userListDiv.appendChild(userElement);
        }
    });
});

// Start a private chat
function startChat(username) {
    currentChatUser = username;
    messagesDiv.innerHTML = "";
}

// Send a private message
sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message && currentChatUser) {
        socket.emit("private message", { sender: currentUser, receiver: currentChatUser, message });
        addMessageToChat({ sender: currentUser, message });
        messageInput.value = "";
    }
});

// Receive private messages
socket.on("private message", (data) => {
    if (data.sender === currentChatUser || data.sender === currentUser) {
        addMessageToChat(data);
    }
});

// Function to display messages
function addMessageToChat(data) {
    const msgElement = document.createElement("div");
    msgElement.textContent = `${data.sender}: ${data.message}`;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
