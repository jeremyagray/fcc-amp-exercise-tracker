'use strict';

const mongoose = require('mongoose');

// Create a user schema and model function.
const userSchema = new mongoose.Schema(
  {
    username: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now}
  });

function userModel() {
  return mongoose.model('User', userSchema);
}

module.exports = userModel;
