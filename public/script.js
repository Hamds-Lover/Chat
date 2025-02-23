const socket = io();
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// Generate random user ID
const userId = "User-" + Math.floor(Math.random() * 10000);

sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chat message", { user: userId, message });
        messageInput.value = "";
    }
});

socket.on("chat message", (data) => {
    const msgElement = document.createElement("div");
    msgElement.textContent = `${data.user}: ${data.message}`;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
