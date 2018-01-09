"use stict"

const Message = require('./models/Message')
const User = require('./models/User')

module.exports = io => {
  io.on('connection', function (socket) {

    const ip = socket.request.headers['x-real-ip']
    socket.ip = ip

    let defaultUsername = 'Someone'

    User.findOne({
      ip: ip
    }, {
      ip: true,
      username: true
    }).exec((err, user) => {
      if (err) throw err
      if (user) {
        defaultUsername = user.username
      } else {
        User.create({
          username: defaultUsername,
          ip: ip
        }, err => {
          if(err) return console.error("UserModel", err)
        })
      }

      socket.emit('changeMyUsername', defaultUsername)
      socket.broadcast.emit('addNewUser', defaultUsername)

      socket.username = defaultUsername
    })

    socket.on('newMessage', data => {
      if (socket.username !== data.username) {

        socket.broadcast.emit('changeUsername', {
          newUsername: data.username,
          oldUsername: socket.username
        })

        socket.emit('changeUsername', {
          newUsername: data.username,
          oldUsername: socket.username
        })

        User.findOneAndUpdate({
          ip: ip
        }, {
          username: data.username
        }, (err, doc) => {
          if (err) throw err
        })
      }

      const messageData = {
        date: new Date(),
        content: data.message,
        username: data.username
      }

      Message.create(messageData, err => {
        if(err) return console.error("MessageModel", err)

        socket.emit('newMessageFromUser', messageData)
        socket.broadcast.emit('newMessageFromUser', messageData)
      })
    })

    socket.on('getUsers', () => {
      let users = []

      for (let id in io.sockets.connected) {
        let s = io.sockets.connected[id]
        users.push(s.username)
      }

      socket.emit("users", users)
    })

    socket.on('getHistory', () => {
      Message.find({})
        .sort({date: -1})
        .limit(5)
        .lean()
        .exec( (err, messagesData) => {
          if(!err) {
            socket.emit("history", messagesData)
          }
        })
    })

    socket.on('disconnect', () => {
      socket.broadcast.emit("removeUser", socket.username)
    })
  })
}