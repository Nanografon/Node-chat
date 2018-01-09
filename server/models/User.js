"use strict"

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {type: String},
  ip: {type: String}
}, {
  versionKey: false,
  collection: "UserCollection"
});

module.exports = mongoose.model('User', UserSchema)