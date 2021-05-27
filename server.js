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

// when the io socket gets a new connection from the client, trigger the newConnection function
io.on('connection', newConnection);

// when a new client connection is made
function newConnection(client) {
    // log that a client connection was made and send a message to the client ackowledging that they connected
    console.log(`Client connected: ${client.id}`);
    io.emit('connection', "Hello world from server");

    // log data sent from the client when they join onto the server
    client.on('join', function(data) {
        console.log(`Client message from ${client.id}: ${data}`);
    });

    // Whenever someone disconnects this piece of code executed
    client.on('disconnect', function () {
        console.log(`Client disconnected: ${client.id}`);
    });
}