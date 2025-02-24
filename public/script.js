const socket = io("https://sidrayan.onrender.com/");
let currentUsername = "";
let activeChatUser = "";

function showSignup() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("signupScreen").style.display = "block";
}

function showLogin() {
    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
}

async function signup() {
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
    
    const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        alert("Signup successful! Please log in.");
        showLogin();
    } else {
        alert("Error: " + data.error);
    }
}

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    
    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        document.getElementById("authContainer").style.display = "none";
        document.getElementById("chatContainer").style.display = "flex";
        currentUsername = username;
        socket.emit("set username", username);
        socket.emit("request user list"); // Ensure user list is requested after login
    } else {
        alert("Invalid username or password.");
    }
}

socket.on("user list", (users) => {
    const userListDiv = document.getElementById("userList");
    userListDiv.innerHTML = "";
    users.forEach(user => {
        if (user.username !== currentUsername) {
            const userDiv = document.createElement("div");
            userDiv.textContent = `${user.username} (${user.status})`;
            userDiv.onclick = () => startChat(user.username);
            userListDiv.appendChild(userDiv);
        }
    });
});

socket.on("new user", (user) => {
    if (user.username !== currentUsername) {
        socket.emit("request user list"); // Refresh user list when a new user joins
    }
});

function startChat(username) {
    activeChatUser = username;
    document.getElementById("chatHeader").textContent = username + " (Online)";
    document.getElementById("messages").innerHTML = "";
    socket.emit("get messages", { sender: currentUsername, receiver: username });
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    if (message.trim() === "") return;
    
    socket.emit("private message", { sender: currentUsername, receiver: activeChatUser, message });
    messageInput.value = "";
    showTyping(false);
}

socket.on("private message", ({ sender, message }) => {
    if (sender === activeChatUser || sender === currentUsername) {
        const messagesDiv = document.getElementById("messages");
        const messageElement = document.createElement("p");
        messageElement.textContent = `${sender}: ${message}`;
        messagesDiv.appendChild(messageElement);
    }
});

// Typing Indicator
function showTyping(isTyping) {
    socket.emit("typing", { sender: currentUsername, receiver: activeChatUser, isTyping });
}

document.getElementById("messageInput").addEventListener("input", () => {
    showTyping(true);
    setTimeout(() => showTyping(false), 2000);
});

socket.on("typing", ({ sender, isTyping }) => {
    const typingIndicator = document.getElementById("typingIndicator");
    if (isTyping && sender === activeChatUser) {
        typingIndicator.textContent = sender + " is typing...";
    } else {
        typingIndicator.textContent = "";
    }
});

// Message Read Indicator
socket.on("message read", ({ sender }) => {
    if (sender === activeChatUser) {
        document.getElementById("messageStatus").textContent = "Seen";
    }
});

function markMessageAsRead() {
    socket.emit("message read", { sender: currentUsername, receiver: activeChatUser });
}

document.getElementById("messages").addEventListener("DOMNodeInserted", () => {
    markMessageAsRead();
});
