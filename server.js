// class imports for the tank
let Tank = require("./Tank.js");

// constants import for values needed by the server
const { WORLD_SIZE, FRAME_RATE, NUM_TERRAIN_POINTS } = require("./constants.js");

// game functions for the server that have to deal with the state of the game
const { updateGame, initGame } = require("./game.js");

// functions for when the client clicks or presses a key
const { handleClick, handleKeyInput } = require("./input.js");

// utility function to make a game code
const { makeCode } = require('./utils');

// import the express web framework 
let express = require('express');  

// make an express instance named app
let app = express(); 

// the port for the server to listen on
const port = 3000;

// make the server by listening on the app's port
let server = app.listen(port);

// make the server look into the client folder for the index.html and other js files the client needs
app.use(express.static('client'));

// log on the server waht port it is running on
console.log(`Server is running on port: ${port}`);

// import the socket.io library
let socket = require('socket.io');

// make a socket for the server
let io = socket(server);

// the last time stamp, used for getting the delta time between frames for updating objects
let lastTime = Date.now();

// when the io socket gets a new connection from the client, trigger the newConnection function
io.on('connection', handleConnection);

// the state for all games being ran on the server
const state = {};

// all the rooms that hold what socket connections are in what rooms with that game code
const clientRooms = {};

// need to find out how to show game state to player1 before player2 connects
// when a new client connection is made, this function also handles all things sent back from the client
function handleConnection(client) {
    // log that a client connection was made and send a message to the client ackowledging that they connected
    console.log(`Client connected: ${client.id}`);

    // when a person starts a new game on the server
    client.on('newGame', handleNewGame);

    // when a person joins a game on the server
    client.on('joinGame', handleJoinGame);

    // Whenever someone disconnects this piece of code executed
    client.on('disconnect', function () {
        console.log(`Client disconnected: ${client.id}`);
    });

    // when a player clicks on the screen
    client.on('playerClick', function(data) {
        // get what room the client is in
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        // if the player is in the room and it is their turn, then let them move around, change angle and power, and shoot
        // make sure the other players shell lands before the new player can move
        if (client.id === state[roomName].turn && state[roomName].shells.length === 0) {
            // get the player depending on the client number
            let player;
            if (client.number === 1) {
                player = state[roomName].player1;
            } else if (client.number === 2) {
                player = state[roomName].player2;
            }

            // log the client details and handle the click for the player based on the mouse data
            console.log(`client ${client.id}: clicked at (${data.x},${data.y})`);
            handleClick(player, data.x, data.y);
        }
    });

    // when a player presses down on a key
    client.on('playerKeyDown', function(data) {
        // get what room the client is in
        const roomName = clientRooms[client.id];
        if (!roomName) {
            return;
        }

        // get the player depending on the client number
        let player;
        if (client.number === 1) {
            player = state[roomName].player1;
        } else if (client.number === 2) {
            player = state[roomName].player2;
        }
        // if the player is in the room and it is their turn, then let them move around, change angle and power, and shoot
        // make sure the other players shell lands before the new player can move
        if (client.id === state[roomName].turn && state[roomName].shells.length === 0) {
            // log the client details and handle the key for the player based on the key data
            console.log(`client ${client.id}: pressed key(${data.key})`);
            handleKeyInput(player, data.key, state[roomName].shells);
        }
    });

    // definition for newGame function
    function handleNewGame() {
        // make a game code for the second player to connect with 
        let roomName = makeCode(5);

        // make a client room with the property of the first player's id and give it the value of the room game code
        clientRooms[client.id] = roomName;

        // send the game code to the client
        client.emit('gameCode', roomName);
        
        // make a new game in the state with the game code value as the roomName
        state[roomName] = initGame();
    
        // make the client join the room with the room name
        client.join(roomName);

        // get the terrain so that the tank can be placed
        const terrain = state[roomName].terrain;

        // send the client the first player's tank
        client.number = 1;
        let startPoint = Math.floor(Math.random() * NUM_TERRAIN_POINTS/5) + 1;
        const player1 = new Tank(terrain.terrainPoints[startPoint].x, terrain.terrainPoints[startPoint].y, -45, client.id);
        client.emit('init', 
                    {
                        worldSize: WORLD_SIZE, 
                        player: player1,
                        playerNumber: 1
                    });
        
        // add the first player to the state for this room
        state[roomName].player1 = player1;
    }
    
    // definition for joinGame function
    function handleJoinGame(roomName) {
        // get all the game codes in the client rooms object
        const gameCodes = Object.values(clientRooms);

        // count how many clients have used the specific game code the player entered(the roomName) to see how many people are in the game we are trying to join
        let numClients = 0;
        for (let val of gameCodes) {
            // if there is a game code that matches the room name, then increment the number of clients in the room
            if (val === roomName) {
               numClients++;
            }
        }

        // if there are no clients and the client tried to join, then this game code isb't valid
        if (numClients === 0) {
          client.emit('unknownCode');
          return;
        } else if (numClients > 1) {  // if there is more than 1 player in the game room then this player shouldn't be allowed to join
          client.emit('tooManyPlayers');
          return;
        }
        
        // add this users id to the room since they were able to join
        clientRooms[client.id] = roomName;

        // get the terrain so that the tank can be placed
        const terrain = state[roomName].terrain;
    
        // make the second player join the room and make the second tank
        client.join(roomName);
        client.number = 2;
        let startPoint = Math.floor(NUM_TERRAIN_POINTS * 4/5);
        let player2 = new Tank(terrain.terrainPoints[startPoint].x, terrain.terrainPoints[startPoint].y, 180, client.id);
        client.emit('init', 
                    {
                        worldSize: WORLD_SIZE, 
                        player: player2,
                        playerNumber: 2
                    });

        // add the second player to the state for this room
        state[roomName].player2 = player2;

        // when the second player joins the game, set the this game's turn to the first player's id
        state[roomName].turn = state[roomName].player1.playerId;

        console.log(state[roomName]);

        // start the game for this room
        startGameInterval(roomName);
    }
}

// make a heartbeat update for the server room so that it updates FRAME_RATE amount of times per second
function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        // get the delta time from the last time and the current time stamp
        let timeStamp = Date.now();
        let delta = timeStamp - lastTime;
        lastTime = timeStamp;

        // run the game loop as long as it returns 0, no winner
        const winner = updateGame(state[roomName], delta);
        if (!winner) {
            emitGameState(roomName, state[roomName])
        } else {
            // there is a winner, winner either equals 1 or 2 depending on which player won the game
            // send the game over message to the client, and  clear the state for the room and clear the current intervalId
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
  }

function emitGameState(room, gameState) {
    // Send this event to everyone in the room.
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
}
  
function emitGameOver(room, winner) {
    // Send this event to everyone in the room.
    io.sockets.in(room).emit('gameOver', {playerWinner: winner});
}