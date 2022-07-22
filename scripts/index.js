const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5001;

const http = require("http");
const { Server } = require("socket.io")

const server = http.createServer(app);
app.use(cors());

server.listen(PORT, () => console.log("Server is running"))

const io = new Server(server, {
    cors: {
        origin: "https://question-roulette.netlify.app",
        methods: ["GET", "POST"],
    },
})

let players = [];
let playersCount = 0;
let roomsAvailable = [];

io.on("connection", (socket) => {
    
    io.sockets.emit('rooms', (roomsAvailable));

    socket.on("join_room", (data) => {
        console.log(socket.id + " Joined");
        let player = {};
        socket.join(data);
        player['id'] = socket.id;
        player['room'] = data;
        players.push(player);
        addRoom(data);
        io.to(data).emit('users', (getPlayersinTheRoom(data, players)));
        io.sockets.emit('rooms', (roomsAvailable));
        io.sockets.emit("players", (players));  
    });


    socket.on("quiz_page", (data) => {
        io.sockets.emit("quiz_page_direction", (data));
    })

    socket.on("set_username", (data) => {    
        updateUsername(data, socket.id);
        socket.id = data;
        console.log(players);
    })

    socket.on('disconnect', () => {
        console.log( "User Disconnected " + socket.id);
        players = deletePlayer(socket.id, players);
        io.sockets.emit("players", (players));
        delete socket;
    })

    socket.on("userNum", () => {
        io.emit('users', (playersCount));
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    });

    io.sockets.emit("players", (players));

    function addRoom(data){
        try{
            if(roomsAvailable.includes(data))
            {
                return;
            }
            roomsAvailable.push(data);
        }catch(err){
            console.log(err);
        } 
    }

    function getPlayersinTheRoom(data, allplayers){     
        let playerNum = allplayers.filter(p => p.room === data);
        return playerNum.length;
    }

    function updateUsername(data, oldname){
        for (const key of players) {
            if(key.id === oldname){
                key.id = data;

            }
        }
    }

    function getRoomNumberFromPlayer(id){
        for (const key of players) {
            if(key.id === id){
                return key.room;
            }
        }

        return 0;
    }

    function deletePlayer(data, allplayers){
        let newPlayers = allplayers.filter(p => p.id !== data);
        return newPlayers;
    }

})



