// Setup basic express server
// var express = require('express');
// var app = express();
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;
const mIpsum = require('./mipsum.js');

const countdownTime = 2000
const rooms = {
  // "room_1": {
  //   'text': mIpsum.generate({pNum: 2, resultType: 'text'}),
  //   'status': 'onHold|playing'
  //   'users': {
  // 'sockerId_1': {
  //   username: 'user 1',
  // },
  // 'sockerId_2': {
  //   username: 'user 2',
  // },
  //   }
  // }
}

const listRoomNames = () => {
  return Object.keys(rooms)
}

const normalizeString = s => {
  return s.trim().toLowerCase().replace(/ /, '_')
}

const checkIfUsernameExists = (username, roomName) => {
  return Object.values(rooms[roomName]['users'])
    .map(user => user.username)
    .indexOf(username) !== -1
}

// Removes a room if has no user connected
const removeRoomIfEmpty = roomName => {
  if(Object.keys(rooms[roomName]['users']).length == 0){
    delete rooms[roomName]
    io.local.emit('list rooms', listRoomNames())
  }
}

const removeUserFromRoom = (socketId, roomName) => {
  if(rooms[roomName]['users'].hasOwnProperty(socketId)){
    delete rooms[roomName]['users'][socketId]
    removeRoomIfEmpty(roomName)
    return true
  }
  return false
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
  // Sends the list of rooms to the user
  socket.on('get rooms', () => {
    socket.emit('list rooms', listRoomNames())
  })

  // When user connect in a room
  socket.on('enter room', (data) => {
    let roomText = undefined;
    let roomStatus = undefined;
    let roomName = normalizeString(data.roomName)
    let username = normalizeString(data.username)

    // If room exist get the text for the room
    if (rooms.hasOwnProperty(roomName)){
      roomText = rooms[roomName]['text']
      roomStatus = rooms[roomName]['status']
    }else{ // If room not exist, create it and take the text
      roomText = mIpsum.generate({pNum: 2, resultType: 'text'})
      roomStatus = 'onHold'
      rooms[roomName] = {
        text: roomText,
        status: roomStatus,
        users: {}
      }
      // Send the new list of rooms for all users connectd
      socket.broadcast.emit('list rooms', listRoomNames())

      // Send start signal to user of the room after 10 seconds
      setTimeout(() => {
        io.to(roomName).emit('round start')
      }, countdownTime)
    }

    // If the username already exists in the room, returns an error to the user
    if(checkIfUsernameExists(username, roomName)){
      socket.emit('duplicated username')
    }else if(roomStatus === 'playing'){
      socket.emit('room entry locked')
    }else{
      // Adds the user to the room
      rooms[roomName]['users'][socket.id] = {username: username}
      // Adds the user's socket to the room channel
      socket.join(roomName, () => {
        // Send rank
      })
      // Sends the text of the room to the user
      socket.emit('round configs', roomText)
    }

  })

  // When user leave a room
  socket.on('living room', data => {
    let roomName = normalizeString(data.roomName)
    removeUserFromRoom(socket.id, roomName)
    socket.leave(roomName)
  })

  // When user reaload or close the page
  socket.on('disconnecting', (data, bla) => {
    for(var room in rooms){
      if(removeUserFromRoom(socket.id, room)){
        socket.leave(room)
        break
      }
    }
  })
});
