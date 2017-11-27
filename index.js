const server = require('http').createServer()
const io = require('socket.io')(server)
const port = process.env.PORT || 3001
const mIpsum = require('./mipsum.js')

const countdownTime = 10000 // 10sec
const rankIntervalTime = 1000 // 1sec
const roundTime = 300000 // 5min
const textSize = 5 // Size in amount of paragraphs
const roundAnalyzerTime = 60000 // 1min (interval to calculate user speed)
const rooms = {
  // "room_1": {
  //   'roundIsPlaying': 'true|false',
  //   'roundStart': new Date(),
  //   'active_since': new Date(),
  //   'rankInterval: setInterval(),
  //   'rankTimeout: setTimeout(),
  //   'countDown: setTimeout(),
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

const normalizeString = s => {
  return s.trim().toLowerCase().replace(/ /, '_')
}

const listRoomNames = () => {
  return Object.keys(rooms)
}

const checkIfUsernameExists = (username, roomName) => {
  if (!rooms.hasOwnProperty(roomName)) return true

  return Object.values(rooms[roomName]['users'])
  .map(user => user.username)
  .indexOf(username) !== -1
}

// Removes a room if has no user connected
const removeRoomIfEmpty = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false
  if(Object.keys(rooms[roomName]['users']).length != 0) return false

  // Cancel intervals and timeouts
  clearInterval(rooms[roomName]['rankInterval'])
  clearTimeout(rooms[roomName]['roundTimeout'])
  clearTimeout(rooms[roomName]['countDown'])

  // Remove the room
  delete rooms[roomName]
  // Send new list of rooms for everyone
  io.local.emit('list rooms', listRoomNames())
}

// Remove user from room and delete room if is empty
const removeUserFromRoom = (socketId, roomName) => {
  if (!rooms.hasOwnProperty(roomName)) return false
  if(!rooms[roomName]['users'].hasOwnProperty(socketId)) return false

  // Remove the user
  delete rooms[roomName]['users'][socketId]
  removeRoomIfEmpty(roomName)
  return true
}

const getRoomRanking = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return []

  let scores = Object.values(rooms[roomName]['users']).map(user => {
    return [user.username, user.score || 0]
  })
  return scores.sort((a, b) => b[1] - a[1])
}

const usersIsPlaying = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false

  return Object.values(rooms[roomName]['users']).reduce((acc, user) => {
    return acc || user.roundIsPlaying
  }, false)
}

const roomIsPlaying = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false
  return Boolean(usersIsPlaying(roomName) && rooms[roomName]['roundIsPlaying'])
}

const roomStatus = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return {}

  let roomsRanking = getRoomRanking(roomName)
  let maxScore = Math.max(roomsRanking.map(userScore => { userScore.score}))
  let status = {
    active_users: Object.keys(rooms[roomName]['users']).length,
    active_since: rooms[roomName].active_sice,
    counter: rooms[roomName].roundStart,
    below_mean: roomsRanking.filter(score => { score < maxScore }).length,
    ranking: roomsRanking,
    last_minute_lead: roomsRanking[0][0],
    keystrokes: Object.values(rooms[roomName]['users']).reduce((acc, user) => {
      return acc + (user.score || 0)
    }, 0)
  }

  return status
}

const roundFinish = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false

  io.to(roomName).emit('round finished')
  if(rooms[roomName]['roundIsPlaying']) roundStartCountdown(roomName)
  rooms[roomName]['roundIsPlaying'] = false
  clearTimeout(rooms[roomName]['roundTimeout'])
}

const roundStart = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false

  rooms[roomName]['roundIsPlaying'] = true
  rooms[roomName]['roundStart'] = new Date()
  io.to(roomName).emit('round start', {
    text: mIpsum.generate({pNum: textSize, resultType: 'text'}),
    roundAnalyzerTime: roundAnalyzerTime
  })
  rooms[roomName]['roundTimeout'] = setTimeout(() => roundFinish(roomName), roundTime)
}

const roundStartCountdown = roomName =>{
  if (!rooms.hasOwnProperty(roomName)) return false

  rooms[roomName]['countDown'] = setTimeout(() => roundStart(roomName), countdownTime)
  io.to(roomName).emit('countdown started', countdownTime)
}

const startRankLiveUpdate = roomName => {
  if (!rooms.hasOwnProperty(roomName)) return false

  io.to(roomName).emit('rank update', getRoomRanking(roomName))
  // Send the user rank of the room to everyone at every x time
  rooms[roomName]['rankInterval'] = setInterval(() => {
    io.to(roomName).emit('rank update', getRoomRanking(roomName))
  }, rankIntervalTime)
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
    let roundIsPlaying = undefined;
    let roomName = normalizeString(data.roomName)
    let username = normalizeString(data.username)

    // If room exist get the status of the round
    if (rooms.hasOwnProperty(roomName)){
      roundIsPlaying = rooms[roomName]['roundIsPlaying']
    }else{ // If room not exist, create it
      roundIsPlaying = false
      rooms[roomName] = {
        roundIsPlaying: roundIsPlaying,
        active_sice: new Date(),
        users: {}
      }
      // Send the new list of rooms for all users connectd
      socket.broadcast.emit('list rooms', listRoomNames())
      startRankLiveUpdate(roomName)
      roundStartCountdown(roomName)
    }

    // If the username already exists in the room, emit an error to the user
    if(checkIfUsernameExists(username, roomName)){
      socket.emit('duplicated username')
    }else if(roundIsPlaying){ // if the round has already begun, kick the user
      socket.emit('room is locked')
    }else{
      // Adds the user to the room
      rooms[roomName]['users'][socket.id] = {
        username: username,
        score: 0,
        roundIsPlaying: false
      }
      // Adds the user's socket to the room channel
      socket.join(roomName)
    }
  })

  // Update user's infos
  socket.on('round update', data => {
    let roomName = normalizeString(data.roomName)
    if(!rooms.hasOwnProperty(roomName)) return false
    if(!rooms[roomName]['users'].hasOwnProperty(socket.id)) return false

    rooms[roomName]['users'][socket.id]['score'] = data.score
    rooms[roomName]['users'][socket.id]['roundIsPlaying'] = data.roundIsPlaying
    if(roomIsPlaying(roomName) == false) roundFinish(roomName)
  })

  // When user leave a room
  socket.on('living room', data => {
    let roomName = normalizeString(data.roomName)
    if(!rooms.hasOwnProperty(roomName)) return false

    // Remove user from de room and delete room if empty
    removeUserFromRoom(socket.id, roomName)
    // Remove user's socket from room channel
    socket.leave(roomName)
  })

  socket.on('get status', data => {
    let roomName = normalizeString(data.roomName)
    if(!rooms.hasOwnProperty(roomName)) return false
    socket.emit('status', roomStatus(roomName))
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
