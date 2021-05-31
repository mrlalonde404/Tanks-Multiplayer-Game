// class imports for the tank and terrain
let Tank = require("./Tank.js");
let Terrain = require("./Terrain.js");

// constants import for values needed by the server
const { WORLD_SIZE, FRAME_RATE } = require("./constants.js");

// game functions for the server that have to deal with the state of the game
const { createGameState, updateGame } = require("./game.js");

const { handleClick, handleKeyInput } = require("./input.js");

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

// make the terrain, with some starting fragments
let terrain = new Terrain(10);
//console.log(terrain.terrainPoints);

// array to hold all of the worlds shells
const shells = [];

// make the player tank start randomly on the left most fifth of the world, and the right most fifth of the world
let startPoint1 = Math.floor(Math.random() * terrain.terrainPoints.length/5) + 1;
let startPoint2 = Math.floor(terrain.terrainPoints.length * 4/5);

// create the first and second player tanks
let player1 = new Tank(terrain.terrainPoints[startPoint1].x, terrain.terrainPoints[startPoint1].y, -45.0);
let player2 = new Tank(terrain.terrainPoints[startPoint2].x, terrain.terrainPoints[startPoint2].y, 180.0);

// keep track of the number of players
let numPlayers = 0;

// keep track of what player is assigned to which id
let players = {};

// the last time stamp, used for getting the delta time between frames for updating objects
let lastTime = Date.now();

// when the io socket gets a new connection from the client, trigger the newConnection function
io.on('connection', newConnection);

// need to find out how to show game state to player1 before player2 connects
// when a new client connection is made, this function also handles all things sent back from the client
function newConnection(client) {
    // log that a client connection was made and send a message to the client ackowledging that they connected
    console.log(`Client connected: ${client.id}`);

    // assign the client id to the player and add the player to the players object with their socket id as the key
    numPlayers += 1;
    if (numPlayers === 1) {
        player1.playerId = client.id;
        players[client.id] = player1;
    } else if (numPlayers === 2) {
        player2.playerId = client.id;
        players[client.id] = player2;
    }
    console.log(players);
    io.emit('init', {msg:`From server: You are player: ${client.id}`, worldSize: WORLD_SIZE, player: players[client.id]});

    // when a player clicks on the screen
    client.on('playerClick', function(data) {
        console.log(`client ${client.id}: clicked at (${data.x},${data.y})`);
        handleClick(players[client.id], data.x, data.y);
    });

    // when a player presses down on a key
    client.on('playerKeyDown', function(data) {
        console.log(`client ${client.id}: pressed key(${data.key})`);
        handleKeyInput(players[client.id], data.key, shells);
    });

    // Whenever someone disconnects this piece of code executed
    client.on('disconnect', function () {
        console.log(`Client disconnected: ${client.id}`);
    });

    // make the game state with the players, the terrain, and the shells
    const state = createGameState(player1, player2, terrain, shells);

    // use the game interval to update the client with the state of the game
    gameInterval(client, state);

}

// make a heartbeat update for the server so that it updates FRAME_RATE amount of times per second
function gameInterval(client, state) {
    const intervalId = setInterval(() => {
        // get the delta time from the last time and the current time stamp
        let timeStamp = Date.now();
        let delta = timeStamp - lastTime;
        lastTime = timeStamp;

        // run the game loop as long as it returns 0, no winner
        const winner = updateGame(state, delta);

        // if there is no winner than send the game state to the client
        if (!winner) {
            client.emit('gameState', JSON.stringify(state));
        } else {
            // there is a winner, winner either equals 1 or 2 depending on which player won the game
            // send the game over message to the client and clear the current intervalId
            client.emit('gameOver');
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
    //console.log(intervalId);
}