// Setup basic express server
// var express = require('express');
// var app = express();
const server = require('http').createServer();
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;
const mIpsum = require('./mipsum.js');

const countdownTime = 2000
const rankIntervalTime = 1000
const rooms = {
  // "room_1": {
  //   'text': mIpsum.generate({pNum: 2, resultType: 'text'}),
  //   'roundIsPlaying': 'true|false',
  //   'roundStart': new Date(),
  //   'active_since': new Date(),
  //   'rankInterval: setInterval(),
  //   'users': {
  //     'sockerId_1': {
  //       username: 'user 1',
  //       score: 0,
  //       roundIsPlaying: true|false
  //     },
  //     'sockerId_2': {
  //       username: 'user 2',
  //       score: 0,
  //       roundIsPlaying: true|false
  //     },
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
    // Remove rank update interval
    clearInterval(rooms[roomName]['rankInterval'])
    // Remove the room
    delete rooms[roomName]
    // Send new list of rooms for everyone
    io.local.emit('list rooms', listRoomNames())
  }
}

// Remove user from room and delete room if is empty
const removeUserFromRoom = (socketId, roomName) => {
  if(rooms[roomName]['users'].hasOwnProperty(socketId)){
    // Remove the user
    delete rooms[roomName]['users'][socketId]
    // Send the updated rank for everyone
    io.to(roomName).emit('rank update', getRoomRanking(roomName))
    removeRoomIfEmpty(roomName)
    return true
  }
  return false
}

const getRoomRanking = roomName => {
  let scores = Object.values(rooms[roomName]['users']).map(user => {
    return [user.username, user.score || 0]
  })

  return scores.sort((a, b) => {
    if(a > b){
      return a
    }else{
      return b
    }
  })
}

const roomStatus = roomName => {
  let status = {}
  let roomsRanking = getRoomRanking(roomName)
  let maxScore = Math.max(roomsRanking.map(userScore => { userScore.score}))

  status['active_users'] = Object.keys(rooms[roomName]['users']).length
  status['keystrokes'] = Object.values(rooms[roomName]['users']).reduce((acc, user) => {
    acc + Object.values(user)[0].score
  }, 0)
  status['active_since'] = rooms[roomName].active_sice
  status['counter'] = rooms[roomName].roundStart
  status['below_mean'] = roomsRanking.filter(score => { score < maxScore }).length
  status['ranking'] = roomsRanking
  status['last_minute_lead'] = roomsRanking[0][0]
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
  // Sends the list of rooms when user request it
  socket.on('get rooms', () => {
    socket.emit('list rooms', listRoomNames())
  })

  // When user connect in a room
  socket.on('enter room', (data) => {
    let roomText = undefined;
    let roomRoundIsPlaying = undefined;
    let roomName = normalizeString(data.roomName)
    let username = normalizeString(data.username)

    // If room exist get the infos from the room
    if (rooms.hasOwnProperty(roomName)){
      roomText = rooms[roomName]['text']
      roomRoundIsPlaying = rooms[roomName]['roundIsPlaying']
    }else{ // If room not exist, create it and take the infos
      roomText = mIpsum.generate({pNum: 2, resultType: 'text'})
      roomRoundIsPlaying = false
      rooms[roomName] = {
        text: roomText,
        roundIsPlaying: roomRoundIsPlaying,
        active_sice: new Date(),
        users: {}
      }
      // Send the new list of rooms for all users connectd
      socket.broadcast.emit('list rooms', listRoomNames())

      // Send round start signal to users of the room after x seconds
      setTimeout(() => {
        if(rooms[roomName]){
          io.to(roomName).emit('round start')
          rooms[roomName]['roundIsPlaying'] = true
          rooms[roomName]['roundStart'] = new Date()
        }
      }, countdownTime)

      // Send the user rank of the room to everyone at every x time
      rooms[roomName]['rankInterval'] = setInterval(() => {
        io.to(roomName).emit('rank update', getRoomRanking(roomName))
      }, rankIntervalTime)
    }

    // If the username already exists in the room, emit an error to the user
    if(checkIfUsernameExists(username, roomName)){
      socket.emit('duplicated username')
    }else if(roomRoundIsPlaying){ // if the round has already begun, kick the user
      socket.emit('room is locked')
    }else{
      // Adds the user to the room
      rooms[roomName]['users'][socket.id] = {username: username}
      // Adds the user's socket to the room channel
      socket.join(roomName)
      // Sends the text of the room to the user
      socket.emit('round configs', roomText)
      // Send new rank for everyone
      io.to(roomName).emit('rank update', getRoomRanking(roomName))
    }
  })

  // Update user's score
  socket.on('round update', data => {
    let roomName = normalizeString(data.roomName)
    rooms[roomName]['users'][socket.id]['score'] = data.score
    rooms[roomName]['users'][socket.id]['roundIsPlaying'] = data.roundIsPlaying
  })

  // When user leave a room
  socket.on('living room', data => {
    let roomName = normalizeString(data.roomName)
    // Remove user from de room and delete room if empty
    removeUserFromRoom(socket.id, roomName)
    // Remove user's socket from room channel
    socket.leave(roomName)
  })

  // When user reaload or close the page
  socket.on('disconnecting', data => {
    // If the user is logging into a room, then remove it.
    for(var room in rooms){
      if(removeUserFromRoom(socket.id, room)){
        // Remove user's socket from room channel
        socket.leave(room)
        break
      }
    }
  })
});
