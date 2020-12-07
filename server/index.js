const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;

let ns = io.of('/room');

ns.on('connection', r => {
    console.log('User connected', r);
})

app.get('/room', (req, res) => {
    res.sendFile(path.resolve(`${__dirname }/../client/index.html`));
})

http.listen(port, () => {
    console.log("Server serving...");
})
