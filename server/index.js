const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const sockio = require('socket.io')(http);
const port = 3000;
const resource = 'videocall';

let io = sockio.of(`/${resource}`);

let users = {};

io.on('connection', socket => {
    users[socket.id] = { status: 'AVAILABLE' };

    console.log(`User connected: ${socket.id}`);

    socket.emit('registered', socket.id);

    socket.on('get-users', () => {
        socket.emit('got-users', users);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
    })

    socket.on('call', destination => {
        console.log(`User ${socket.id} is calling to ${destination}`);
        users[socket.id] = { status: 'INCALL', to: destination };
        users[destination] = { status: 'INCALL', to: socket.id };
        socket.to(destination).emit('calling', socket.id);
    });

    socket.on('offer', event => {
        socket.to(event.to).emit('offer', event.sdp);
    })

    socket.on('answer', event => {
        socket.to(event.to).emit('answer', event.sdp);
    })

    socket.on('candidate', event => {
        socket.to(event.to).emit('candidate', event);
    })

})

app.get(`/${resource}`, (req, res) => {
    res.sendFile(path.resolve(`${__dirname }/../client/index.html`));
})

http.listen(port, () => {
    console.log(`Website serving at http://localhost:${port}/${resource}`);
})
