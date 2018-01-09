"use strict"

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const bluebird = require('bluebird')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.Promise = bluebird
mongoose.connect('mongodb://localhost:27017/nodechat', {useMongoClient: true})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/getActiveUsers', function (req, res) {
  let users = []

  for (let id in io.sockets.connected) {
    let s = io.sockets.connected[id]
    users.push({
      username: s.username,
      ip: s.ip
    })
  }

  return res.json(users)
})

require('./sockets')(io)

const listener = http.listen(9002, () => {
  console.log(`Server listenen on port ${listener.address().port}`)
});