// get the canvas and context for drawing to the screen
const canvas = document.getElementById("canvas1");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// make the client connection
const socket = io.connect("http://localhost:3000");

// the player object
let player = null;

// when the client gets the init message from the server, handle the lcient init process
socket.on('init', handleInit);

// when the server sends an updated game state, handle the new state
socket.on('gameState', handleGameState);

// handle the init message from the server
function handleInit(init) {
    // log the client's socket id
    console.log(socket.id);

    // log the data's message sent from the server
    console.log(init.msg);

    // set the canvas size to the world size sent from the server
    canvas.width = init.worldSize.width;
    canvas.height = init.worldSize.height;

    // set the player equal to a tank object from the server
    player = init.player;

    // send a message to the client acknowledging that they connected
    socket.emit('join', 'Hello world from client');         
    console.log("sent join message to server");  
}

// when the server sends an updated game state, handle the updates on the client side
function handleGameState(gameState) {
    // parse the serialized game state object into a gameState object
    gameState = JSON.parse(gameState);
    
    // every time the server sends the client a new gameState the client will get a new animation frame and will be able to draw it to the client's canvas
    requestAnimationFrame(() => drawGame(gameState));
}

// mouse object for world interaction
const mouse = {
    x: null, 
    y: null
};

// draw the state of the game on the clients screen
function drawGame(gameState) {
    // clear the screen
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw all the shells
    drawShells(gameState.shells);

    // update and draw the terrain
    drawTerrain(gameState.terrain, gameState.worldSize);

    // draw the players
    drawPlayer(gameState.player1);
    drawPlayer(gameState.player2);
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

function drawPlayer(player) {
    // draw the barrel for the tank that tilts according to the barrelAngle
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = "Gray";
    ctx.translate(player._position.x, player._position.y - player._size/2);
    ctx.rotate(player._barrelAngle/180 * Math.PI);
    ctx.fillRect(-player._size/4, -player._size/4, 2 * player._size, player._size/2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    // draw the rectangles for the tanks such that the center is in the middle
    ctx.save();
    ctx.beginPath()
    ctx.fillStyle = "DimGray";
    ctx.translate(player._position.x, player._position.y);
    ctx.rotate(player._tiltAngle);
    ctx.fillRect(-player._size, -player._size/2, 2*player._size, player._size);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

// draw a shell
function drawShell(shell) {
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
}

// draw all the shells
function drawShells(shells) {
    for (let i = 0; i < shells.length; i++) {
        drawShell(shells[i]);
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