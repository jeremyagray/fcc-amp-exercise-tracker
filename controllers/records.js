'use strict';

const Records = require('../models/records.js');
const Users = require('../models/users.js');

// Exercise Tracker API add endpoint.
// Parameters: userId (_id), description (string), duration (int),
// date (yyyy-mm-dd).
// Response:
// {
//   'username': users[0].username, 
//   '_id': users[0]._id,
//   'description': records[0].description,
//   'duration': records[0].duration,
//   'date': date.toDateString()
// }

exports.addRecord = async function(request, response) {
  // Default to current date if no date provided.
  let date;
  if (! request.body.date) {
    date = new Date();
  } else {
    date = new Date(request.body.date);
  }

  // Create a record and a user model.
  let recordModel = Records();
  let userModel = Users();

  // Verify user exists.
  const users = await userModel.find({_id: request.body.userId}).exec();
  if (users.length !== 1) {
    // if (! await userModel.exists({_id: request.body.userId})) {
    return response.status(400)
      .json({'error': 'could not find userId ' + request.body.userId});
  }

  // Get user and save record.
  let records = await recordModel.create([{
    userId: request.body.userId,
    description: request.body.description,
    duration: request.body.duration,
    date: date
  }]);

  // Return.
  if (records) {
    return response
      .status(200)
      .json({
        'username': users[0].username,
        '_id': users[0]._id,
        'description': records[0].description,
        'duration': records[0].duration,
        date: date.toDateString()
      });
  } else {
    return response
      .status(500)
      .json({'error': 'server error'});
  }
};

// Exercise Tracker API log endpoint.
// Parameters:  userId (_id), from? and to? (yyyy-mm-dd), limit? (int).
// Respond with a user's complete exercise log:
// {username: string, _id: number, log: [], count: number}

exports.getLog = async function(request, response) {
  // Create a record and a user model.
  let recordModel = Records();
  let userModel = Users();

  // Verify user exists.
  const user = await userModel.findById(request.query.userId).exec();
  if (! user) {
    return response.status(400)
      .json({'error': 'could not find userId ' + request.query.userId});
  }

  // Get the records.
  let records;

  if ((request.query.from !== undefined)
      && (request.query.to !== undefined)) {
    // Both dates:  return records between dates.
    records = await recordModel
      .find(
        {
          userId: request.query.userId,
          date: {$gte: request.query.from, $lte: request.query.to}
        },
        null, {sort: 'date'}).exec();
  } else if ((request.query.from !== undefined)
      && (request.query.to === undefined)) {
    // From only:  return records after date.
    records = await recordModel
      .find(
        {
          userId: request.query.userId,
          date: {$gte: request.query.from}
        },
        null, {sort: 'date'}).exec();
  } else if ((request.query.from === undefined)
      && (request.query.to !== undefined)) {
    // To only:  return records before date.
    records = await recordModel
      .find(
        {
          userId: request.query.userId,
          date: {$lte: request.query.to}
        },
        null, {sort: 'date'}).exec();
  } else {
    // No dates:  all records.
    records = await recordModel
      .find({userId: request.query.userId}, null, {sort: 'date'}).exec();
  }


  // Construct the exercise log.
  let exerciseLog = {
    username: user.username,
    _id: user._id,
    count: 0,
    log: []
  };

  // Set start and entries according to the number of records and if
  // limit was provided.
  let entries = 0;
  let start = 0;

  if (typeof request.query.limit === 'number') {
    entries = parseInt(request.query.limit);

    if (records.length <= entries) {
      entries = records.length;
    } else {
      start = records.length - entries;
    }
  } else {
    entries = records.length;
    start = 0;
  }

  exerciseLog.count = entries;
  exerciseLog.log = records.slice(start, start + entries);

  return response
    .status(200)
    .json(exerciseLog);
};
