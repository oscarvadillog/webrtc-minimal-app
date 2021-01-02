const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const resource = 'room';

let ns = io.of(`/${resource}`);

let users = 0;
let mediaFlag = 0;

ns.on('connection', conn => {
    users++;
    console.log(`User connected | Total: ${users}`);

    ns.emit('caller-num', users);

    conn.on('got-media', () => {
        mediaFlag++;
        if (users === 2 && mediaFlag === 2) {
            console.log('Emitting ');
            ns.emit('connected');
        }
        console.log(`Got media ${mediaFlag}`);
    });

    conn.on('candidate', event => {
        conn.broadcast.emit('candidate', event);
    })

    conn.on('offer', event => {
        conn.broadcast.emit('offer', event.sdp);
    })

    conn.on('answer', event => {
        conn.broadcast.emit('answer', event.sdp);
    })

    conn.on('disconnect', () => {
        console.log('User disconnected');
        users--;
        console.log(users);
    })

})

app.get(`/${resource}`, (req, res) => {
    res.sendFile(path.resolve(`${__dirname }/../client/index.html`));
})

http.listen(port, () => {
    console.log(`Website serving at http://localhost:${port}/${resource}`);
})
