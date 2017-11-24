// Setup basic express server
// var express = require('express');
// var app = express();
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;
const mIpsum = require('./mipsum.js');

const rooms = {
  "room 1": {
    'text': mIpsum.generate({pNum: 2, resultType: 'text'}),
    'users': [
      {'user 1': 'socket 1'},
      {'user 2': 'socket 2'},
    ]
  }
}
const listRooms = () => {
  return Object.keys(rooms).map((room) => {
    return {name: room}
  })
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
  socket.emit('list rooms', listRooms());

  socket.on('enter room', (data) => {
    let text = undefined;
    if (rooms.hasOwnProperty(data.roomName)){
      text = rooms[data.roomName]['text']
      rooms[data.roomName]['users'].push({[data.username]: socket});
    }else{
      text = mIpsum.generate({pNum: 2, resultType: 'text'})
      rooms[data.roomName] = {
        text: text,
        users: [{[data.username]: socket}]
      }
    }
    console.log('========================================')
    console.log(rooms)
    console.log('========================================')
    socket.emit('room connected', text)
    socket.emit('list rooms', listRooms())
  })
  console.log(listRooms())

});

