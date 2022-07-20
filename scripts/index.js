const express = require('express');
const cors = require('cors');
const app = express();
const http = require("http");
const { Server } = require("socket.io")

const server = http.createServer(app);
app.use(cors());

// Wheel Logic
// let timer;
// let duration = 0;
// let maxTime = 0;
// let actualRotation = 0;
// let finalRotation = 0;


// function Rotate(){
//     let sec = 0;
//     randomNumber('duration');
//     randomNumber('maxTime');
    
//     timer = setInterval(() => {
//         actualRotation += (duration - sec) / maxTime;
//         actualRotation = Math.round(actualRotation % 360);
//         sec++;
//         //console.log(360 - actualRotation);
//         finalRotation = 360 - actualRotation;
//         if(sec >= duration){

//             stop();
//         }
        
//     }, maxTime)

// }

// function chooseOption(){
//     if(actualRotation >= 0 && actualRotation < 61 ){
//         console.log("RED");
//     }else if(actualRotation >= 61 && actualRotation < 121){
//         console.log("BLUE");
//     }else if(actualRotation >= 121 && actualRotation < 181){
//         console.log("PINK");
//     }else if(actualRotation >= 181 && actualRotation < 241){
//         console.log("GREEN");
//     }else if(actualRotation >= 241 && actualRotation < 301){
//         console.log("YELLOW");
//     }else{
//         console.log("CYAN");
//     }
   
// }

// function randomNumber(target){
//     if(target === 'duration'){
//         duration = Math.floor(Math.random() * 300) + 200;
//     }else{
//         maxTime = Math.floor(Math.random() * 20) + 10;
//     }
// }

// function stop(){
//     clearInterval(timer);
//     chooseOption();
// }


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"],
    },
})

let players = [];

let playersCount = 0;
let roomsAvailable = [];

io.on("connection", (socket) => {
    
    // socket.on('newPlayer', data =>{
    //     console.log("New client connected, with id: " + socket.id);
    //     players[socket.id] = data;
    // })

    io.sockets.emit('rooms', (roomsAvailable));

    socket.on("join_room", (data) => {
        let player = {};
        socket.join(data);
        //playersCount++;
        player['id'] = socket.id;
        player['room'] = data;
        players.push(player);
        addRoom(data);
        io.to(data).emit('users', (getPlayersinTheRoom(data, players)));
        io.sockets.emit('rooms', (roomsAvailable));
    });

    socket.on('disconnect', () => {
        console.log( "User Disconnected" + socket.id);
        delete socket;
    })

    socket.on("userNum", () => {
        io.emit('users', (playersCount));
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    });



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


    function getPlayersinTheRoom(data, players){
        
        let playerNum = players.filter(p => p.room === data);
        return playerNum.length;

    }

})

server.listen(5001, () => console.log("Server is running"))

