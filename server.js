const express = require('express');
const http = require("http");
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// Initiate socket.io and attach to HTTP server
const io = socketIo(server);
app.use(express.static('public'));

const users = new Set();

io.on("connection", (socket) => {
    console.log('A user is now connected');

    // Handle user when they join the chat
    socket.on('join', (userName) => {
        users.add(userName);
        socket.userName = userName; // Store the userName in the socket object
        io.emit('userJoined', userName);

        // Send the updated user list to all
        io.emit('userList', Array.from(users));
    });

    // Handle incoming message
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log("A user is disconnected");
        if (socket.userName && users.has(socket.userName)) {
            users.delete(socket.userName); // Remove from set
            io.emit("userLeft", socket.userName); // Notify others
            io.emit('userList', Array.from(users)); // Update list
        }
    });

}); // ← this was missing in your original code!

const PORT = 3000;
server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
