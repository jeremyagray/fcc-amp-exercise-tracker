'use strict';

const mongoose = require('mongoose');

// Create a record schema and model.
const recordSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.ObjectId, required: true},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true, default: Date.now}
  });

function recordModel() {
  return mongoose.model('Exercise', recordSchema);
}

module.exports = recordModel;
