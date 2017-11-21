// Setup basic express server
// var express = require('express');
// var app = express();
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;
const mIpsum = require('./mipsum.js');

const rooms = {
  "room 1": {
    'text': 'sadad',
    'users': [
      {'user 1': 'socket 1'},
      {'user 2': 'socket 2'},
    ]
  }
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
  socket.emit('new room', Object.keys(rooms).map((room) => {
    return {name: room}
  }));

  socket.on('enter room', (data) => {
    if (rooms.hasOwnProperty(data.roomName)){
      const text = rooms[data.roomName]['text']
      rooms[data.roomName]['users'].push({[data.userName]: socket});
    }else{
      const text = mIpsum({pNum: 2, resultType: 'text'})
      rooms[data.roomName] = {
        text: text,
        users: [{[data.userName]: socket}]
      }
    }

    socket.emit('room connected', text)
  })
});

