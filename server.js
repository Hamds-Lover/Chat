// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let messages = []; // Store chat history in memory
let users = {}; // Track users and statuses

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Send chat history to the new user
    socket.emit("chat history", messages);

    // Handle user joining with a username
    socket.on("set username", (username) => {
        users[socket.id] = { username, status: "online" };
        io.emit("user list", users);
    });

    // Handle chat messages
    socket.on("chat message", (data) => {
        messages.push(data);
        if (messages.length > 50) messages.shift(); // Keep only the last 50 messages
        io.emit("chat message", data);
    });

    // Handle user disconnect
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
