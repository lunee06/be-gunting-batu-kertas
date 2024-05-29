const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', (username) => {
        let roomId = generateRoomId();
        rooms[roomId] = {
            players: [username],
            choices: {},
        };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Room created with ID: ${roomId} by ${username}`);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
        console.log(`User ${username} is trying to join room: ${roomId}`);
        if (rooms[roomId]) {
            if (rooms[roomId].players.length < 2) {
                rooms[roomId].players.push(username);
                socket.join(roomId);
                socket.emit('roomJoined', roomId);
                io.in(roomId).emit('startGame', rooms[roomId].players);
                console.log(`User ${username} joined room: ${roomId}`);
            } else {
                socket.emit('error', 'Room is full');
                console.log(`Room ${roomId} is full`);
            }
        } else {
            socket.emit('error', 'Room does not exist');
            console.log(`Room ${roomId} does not exist`);
        }
    });

    socket.on('playerChoice', ({ roomId, username, choice }) => {
        if (rooms[roomId]) {
            rooms[roomId].choices[username] = choice;
            console.log(`User ${username} in room ${roomId} chose ${choice}`);
            if (Object.keys(rooms[roomId].choices).length === 2) {
                let result = determineWinner(rooms[roomId].choices);
                io.in(roomId).emit('gameResult', result);
                delete rooms[roomId];
                console.log(`Game result for room ${roomId}: ${result}`);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('gameResult', (result) => {
        resultDiv.textContent = result;
        restartButton.style.display = 'block'; // Menampilkan tombol restart
    });
    
});

const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 7);
};

const determineWinner = (choices) => {
    const [player1, player2] = Object.keys(choices);
    const choice1 = choices[player1];
    const choice2 = choices[player2];
    if (choice1 === choice2) {
        return 'Draw';
    }
    if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'scissors' && choice2 === 'paper') ||
        (choice1 === 'paper' && choice2 === 'rock')
    ) {
        return `${player1} wins`;
    } else {
        return `${player2} wins`;
    }
};

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


