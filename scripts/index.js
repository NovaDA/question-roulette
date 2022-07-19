const express = require('express');
const cors = require('cors');
const app = express();
const http = require("http");
const { Server } = require("socket.io")

const server = http.createServer(app);
app.use(cors());
let clientsCount = 0;

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    clientsCount++;

    console.log(`User Connected : ${socket.id}` )


    socket.on("join_room", (data) => {
        socket.join(data);
    });


    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    });

    
})

server.listen(5001, () => console.log("Server is running"))

