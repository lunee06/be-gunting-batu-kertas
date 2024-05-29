const socket = io();

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomIdInput = document.getElementById('room-id');
const playersDiv = document.getElementById('players');
const choicesDiv = document.getElementById('choices');
const resultDiv = document.getElementById('result');

let username;
let roomId;

createRoomButton.addEventListener('click', () => {
    username = usernameInput.value;
    if (username) {
        socket.emit('createRoom', username);
    } else {
        alert('Please enter a username');
    }
});

joinRoomButton.addEventListener('click', () => {
    username = usernameInput.value;
    roomId = roomIdInput.value;
    if (username && roomId) {
        socket.emit('joinRoom', { roomId, username });
    } else {
        alert('Please enter a username and room ID');
    }
});

socket.on('roomCreated', (id) => {
    roomId = id;
    alert(`Room created! Room ID: ${roomId}`);
    startGame();
});

socket.on('roomJoined', (id) => {
    roomId = id;
    startGame();
});


socket.on('roomJoined', (id) => {
    roomId = id;
    startGame();
});

socket.on('startGame', (players) => {
    playersDiv.innerHTML = `Players: ${players.join(' vs ')}`;
});

choicesDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('choice')) {
        const choice = e.target.getAttribute('data-choice');
        socket.emit('playerChoice', { roomId, username, choice });
    }
});

socket.on('gameResult', (result) => {
    resultDiv.textContent = result;
});

socket.on('error', (message) => {
    alert(message);
});

function startGame() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}

const restartButton = document.getElementById('restart');

restartButton.addEventListener('click', () => {
    socket.emit('restartGame', roomId);
});

socket.on('gameRestarted', () => {
    resultDiv.textContent = '';
    restartButton.style.display = 'none';
});
