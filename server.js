// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const USERS_FILE = "users.txt";
let users = {}; // Track online users
let messages = {}; // Store messages per user pair

// Load stored users
const loadUsers = () => {
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf8");
        return JSON.parse(data);
    }
    return {};
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

let registeredUsers = loadUsers();

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (registeredUsers[username]) {
        return res.status(400).json({ error: "Username already exists" });
    }
    registeredUsers[username] = password;
    saveUsers(registeredUsers);
    res.json({ success: true });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (registeredUsers[username] && registeredUsers[username] === password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("set username", (username) => {
        users[socket.id] = { username, status: "online", socketId: socket.id };
        io.emit("user list", users);
    });

    socket.on("private message", ({ sender, receiver, message }) => {
        const chatKey = [sender, receiver].sort().join("-");
        if (!messages[chatKey]) messages[chatKey] = [];
        messages[chatKey].push({ sender, message });
        io.to(users[sender]?.socketId).emit("private message", { sender, message });
        io.to(users[receiver]?.socketId).emit("private message", { sender, message });
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user list", users);
        console.log("A user disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
