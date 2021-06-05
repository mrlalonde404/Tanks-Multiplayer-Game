// get the canvas and context for drawing to the screen
let canvas, ctx;

// the player object for this client
let player;

// what number the player is
let playerNumber;

// if the game is being played or not
let gameActive = false;

// mouse object for world interaction
const mouse = {
    x: null, 
    y: null
};

// make the client connection
const socket = io.connect("http://localhost:3000");

// local address of server to connect to from client
//const socket = io.connect("http://192.168.1.164:3000");

// parts of the screen needed
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

//add the event listeners for initial screen's buttons
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

// send the server a message to make a new game room
function newGame() {
  socket.emit('newGame');
  init();
}

// send the server a message to join a game with the game code entered
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

// set values for the canvas and stop displaying the game code
function init() {
    // stop displaying the initial game code screen and display the game screen
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    // get the canvas and the context for the canvas
    canvas = document.getElementById("canvas1");
    ctx = canvas.getContext("2d");

    // the game is now being played
    gameActive = true;
}

// when the client gets the init message from the server, handle the lcient init process
socket.on('init', handleInit);

// when the server sends an updated game state, handle the new state
socket.on('gameState', handleGameState);

// when the server sends the game over state, tell the players who won
socket.on('gameOver', handleGameOver);

// handle the game code if it is valid, if it is unknown, or if there are too many players for that code
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

// handle the init message from the server
function handleInit(init) {
    // set the canvas size to the world size sent from the server
    canvas.width = init.worldSize.width;
    canvas.height = init.worldSize.height;

    // set the player equal to a tank object from the server
    player = init.player;

    // set the playerNumber to the socket id for the player
    playerNumber = init.playerNumber;
}

// when the server sends an updated game state, handle the updates on the client side
function handleGameState(gameState) {
    // if the game is not being played then don't handle the game state
    if (!gameActive) {
        return;
    }

    // parse the serialized game state object into a gameState object
    gameState = JSON.parse(gameState);

    // update the client's player object based on the player number
    if (playerNumber === 1) {
        player = gameState.player1;
    } else if (playerNumber === 2) {
        player = gameState.player2;
    }
    
    // every time the server sends the client a new gameState the client will get a new animation frame and will be able to draw it to the client's canvas
    requestAnimationFrame(() => drawGame(gameState));
}

// draw the state of the game on the clients screen
function drawGame(gameState) {
    // if you want to see the collision boxes on the shells and players, set this to true
    const drawCollisionBox = false;

    // clear the screen
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw all the shells
    drawShells(gameState.shells, drawCollisionBox);

    // update and draw the terrain
    drawTerrain(gameState.terrain, gameState.worldSize);

    // draw the players
    drawPlayer(gameState.player1, drawCollisionBox);
    drawPlayer(gameState.player2, drawCollisionBox);

    // draw the values for tank values
    drawPlayerValues(gameState);
}

// -- Event listeners
// if the window is resized change the width and height variables appropriately, will have to figure out scaling for objects if window size changes
//window.addEventListener('resize', function(){
//    canvas.width = window.innerWidth;
//    canvas.height = window.innerHeight;
//});

// can left click to change the angle of the tank barrel
window.addEventListener("click", function(event) {
    // update the mouse
    mouse.x = event.x;
    mouse.y = event.y;

    // send a message back to the server to update the appropriate clients barrel
    socket.emit('playerClick', {x: mouse.x, y: mouse.y});
});

// can press left or right arrows to change barrel angle, up or down arrows to increase/decrease power, and space or enter to fire shots
window.addEventListener('keydown', function(event) {
    // send a message back to the server with what key was pressed
    socket.emit('playerKeyDown', {key: event.key});
});
// -- End of event listeners

function drawPlayer(player, drawCollisionBox) {
    // draw the barrel for the tank that tilts according to the barrelAngle
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = "Gray";
    ctx.translate(player._position.x, player._position.y - player._size/2);
    ctx.rotate(player._tiltAngle + (player._barrelAngle/180 * Math.PI));
    ctx.fillRect(player._size/4, -player._size/4, player._size, player._size/3);
    ctx.fill();
    // draw an outline for the tank barrel
    ctx.strokeStyle = "black";
    ctx.strokeRect(player._size/4, -player._size/4, player._size, player._size/3);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    /*
    // draw the barrel on the tank
    const barrelAngle = player._barrelAngle/180 * Math.PI;
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = `DimGray`;
    ctx.translate(player._position.x, player._position.y);
    ctx.rotate(player._tiltAngle);

    // center of base of barrel
    ctx.moveTo(0, -player._size/2);
    ctx.lineTo(-0.5*player._size*Math.cos(barrelAngle), -0.5*player._size*Math.sin(barrelAngle));
    ctx.lineTo(1.5*player._size*Math.cos(barrelAngle), player._size*Math.sin(barrelAngle));
    ctx.lineTo(player._size*Math.cos(barrelAngle), player._size*Math.sin(barrelAngle));
    ctx.lineTo(0.5*player._size*Math.cos(barrelAngle), 0.5*player._size*Math.sin(barrelAngle));
    ctx.lineTo(player._size*Math.cos(barrelAngle), player._size*Math.sin(barrelAngle));
    
    // back to beginning
    ctx.lineTo(0, -player._size/2);
    ctx.fill();
    // draw an outline for the tank barrel
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    */
    
    // draw the top dome on the tank
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = `DimGray`;
    ctx.translate(player._position.x, player._position.y);
    ctx.rotate(player._tiltAngle);
    ctx.arc(0, -player._size/2, player._size/2, Math.PI, -Math.PI);
    ctx.fill();
    // draw an outline for the dome
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // draw the tank body such that the center is in the middle
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = "DimGray";
    ctx.translate(player._position.x, player._position.y);
    ctx.rotate(player._tiltAngle);
    // top left corner
    ctx.moveTo(-player._size, -player._size/3);
    // top right corner
    ctx.lineTo(player._size, -player._size/3);
    // bottom right corner
    ctx.lineTo(0.7*player._size, player._size/2);
    // bottom left corner
    ctx.lineTo(-0.7*player._size, player._size/2);
    // line back to the beginning
    ctx.lineTo(-player._size, -player._size/3);
    ctx.fill();
    // draw an outline for the tank body
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // draw the wheels for the tank
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,0.6)`;
    ctx.translate(player._position.x, player._position.y);
    ctx.rotate(player._tiltAngle);
    ctx.beginPath();
    ctx.arc(-0.7*player._size, -0.1*player._size, player._size/5, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(0.7*player._size, -0.1*player._size, player._size/5, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(-0.55*player._size, 0.25*player._size, player._size/6, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(-0.2*player._size, 0.3*player._size, player._size/6, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(0.2*player._size, 0.3*player._size, player._size/6, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(0.55*player._size, 0.25*player._size, player._size/6, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    if(drawCollisionBox) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,0,0,0.6)`;
        ctx.arc(player._position.x, player._position.y, player._size, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}

function drawPlayerValues(gameState) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "Black";
    // tell the player what player they are
    ctx.fillText(`Player: ${playerNumber}`, 10, 25); 
    // draw value for players health
    ctx.fillText(`Health: ${player._health}`, 150, 25); 
    // draw value for the angle of the barrel
    ctx.fillText(`Angle: ${player._barrelAngle}`, 325, 25); 
    // draw the power level
    ctx.fillText(`Power: ${player._power}`, 495, 25); 
    // draw the amount of fuel
    ctx.fillText(`Fuel: ${player._fuel}`, 665, 25); 

    // draw the enemy's health
    if(playerNumber === 1) {
        ctx.fillText(`Enemy Health: ${gameState.player2._health}`, canvas.width - 275, 25);  
    } else if (playerNumber === 2) {
        ctx.fillText(`Enemy Health: ${gameState.player1._health}`, canvas.width - 275, 25); 
    }

}

// draw a shell
function drawShell(shell, drawCollisionBox) {
    // save the state before the translate and rotate so that the context can be restored to this point
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "black";

    // translate to the center of the shell and then rotate it by the shell's angle
    ctx.translate(shell._position.x, shell._position.y);
    ctx.rotate(shell._angle);

    // draw the back rectangle end of the shell
    ctx.fillRect(-shell._size*2, -shell._size, shell._size*2, shell._size*2);

    // draw the front of the shell that will rotate according to the angle of the shell
    ctx.arc(0, 0, shell._size, -Math.PI/2, Math.PI/2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    if(drawCollisionBox) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,0,0,0.6)`;
        ctx.arc(shell._position.x, shell._position.y, shell._size, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}

// draw all the shells
function drawShells(shells, drawShellsCollision) {
    for (let i = 0; i < shells.length; i++) {
        drawShell(shells[i], drawShellsCollision);
    }
}

// draw the terrain
function drawTerrain(terrain, worldSize) {
    ctx.beginPath()
    ctx.fillStyle = "green";

    // for all the terrain points starting from the second, move the canvas pen to the previous point location and draw to the current point location
    ctx.moveTo(terrain._terrainPoints[0].x, terrain._terrainPoints[0].y); 
    for (let i = 1; i < terrain._terrainPoints.length; i++) {
        ctx.lineTo(terrain._terrainPoints[i].x, terrain._terrainPoints[i].y);
    }

    // draw to the bottom right corner
    ctx.lineTo(worldSize.width, worldSize.height);

    // draw to the bottom left corner
    ctx.lineTo(0, worldSize.height);

    // draw back to the first point
    ctx.lineTo(terrain._terrainPoints[0].x, terrain._terrainPoints[0].y);

    // close the path and fill in the terrain
    ctx.closePath();
    ctx.fill();
}

// draw who won to the screen
function handleGameOver(data) {
    // if the game is not being played then return, but if it is and the gameOver message was sent from the server then set gameActive to false and show who won
    if (!gameActive) {
        return;
    }
    gameActive = false;

    ctx.font = "30px Arial";
    ctx.fillStyle = "Black";

    // if the player number matches the server winner, tell the player they won, otherwise, tell them they lost
    if (playerNumber === data.playerWinner) {
        ctx.fillText(`You Win!`, canvas.width/2 - 50, canvas.height/2 - 50); 
    } else {
        ctx.fillText(`You Lose!`, canvas.width/2 - 50, canvas.height/2 - 50); 
    }
}

// display the game code on the screen so that the second player could then get the code
function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
    console.log("The game code for the other player is: ", gameCode);
}

// if the server couldn't find a room with that game code
function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
}
  
// if the server deemed there to be too many players in a game
function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
}
  
// reset all the values and take away the game screen and display the initial game code screen
function reset() {
    player = null;
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}