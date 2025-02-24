const socket = io("https://sidrayan.onrender.com/");

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
        socket.emit("set username", username);
    } else {
        alert("Invalid username or password.");
    }
}

socket.on("user list", (users) => {
    const userListDiv = document.getElementById("userList");
    userListDiv.innerHTML = "";
    for (const id in users) {
        const userDiv = document.createElement("div");
        userDiv.textContent = users[id].username;
        userDiv.onclick = () => startChat(users[id].username);
        userListDiv.appendChild(userDiv);
    }
});

function startChat(username) {
    document.getElementById("messages").innerHTML = "Chat with " + username;
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    socket.emit("private message", { sender: socket.id, message });
    messageInput.value = "";
}

socket.on("private message", ({ sender, message }) => {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("p");
    messageElement.textContent = `${sender}: ${message}`;
    messagesDiv.appendChild(messageElement);
});
