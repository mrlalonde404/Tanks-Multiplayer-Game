const io = require('socket.io')();

console.log("server started on port 5500");

io.on('connection', client =>{
        console.log("connection made to client");
        client.emit('init', {data: "hello world"});
});

io.listen(5500);