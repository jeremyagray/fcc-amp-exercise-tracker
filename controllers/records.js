'use strict';

// const {body, param, query, validationResult} = require('express-validator');
const {body, query, validationResult} = require('express-validator');

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

exports.addRecord = [

  // Sanitize and validate.
  body('userId')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isMongoId()
    .withMessage('The userId should be a valid MongoDB objectId.'),

  body('description')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .withMessage('The description should be a non-empty string.'),

  body('duration')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isNumeric()
    .toInt()
    .withMessage('The duration should be a numeric time in minutes.'),

  body('date')
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isDate('YYYY-MM-DD')
    .toDate()
    .withMessage('Optional date in YYYY-MM-DD format.'),

  async function(request, response) {
    // Grab errors and bail, if any.
    const errors = validationResult(request);
    if (! errors.isEmpty()) {
      console.error(errors);
      return response.status(500)
        .json({'error': 'invalid input'});
    }

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
    const users = await userModel.find({_id: request.query.userId}).exec();
    if (users.length !== 1) {
    // if (! await userModel.exists({_id: request.body.userId})) {
      return response.status(500)
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
  }
];

// Exercise Tracker API log endpoint.
// Parameters:  userId (_id), from? and to? (yyyy-mm-dd), limit? (int).
// Respond with a user's complete exercise log:
// {username: string, _id: number, log: [], count: number}

exports.getLog = [

  // Sanitize and validate.
  query('userId')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isMongoId()
    .withMessage('The userId should be a valid MongoDB objectId.'),

  query('limit')
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isNumeric()
    .toInt()
    .withMessage('The number (limit) of exercise records to return.'),

  query('from')
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isDate('YYYY-MM-DD')
    .toDate()
    .withMessage('Optional date in YYYY-MM-DD format.'),

  query('to')
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isDate('YYYY-MM-DD')
    .toDate()
    .withMessage('Optional date in YYYY-MM-DD format.'),

  async function(request, response) {
    // Create a record and a user model.
    let recordModel = Records();
    let userModel = Users();

    // Verify user exists.
    const user = await userModel.findById(request.query.userId).exec();
    if (! user) {
      return response.status(500)
        .json({'error': 'could not find userId ' + request.query.userId});
    }

    // Get the records.
    let records;

    if (request.query.from && request.query.to) {
      // Both dates:  return records between dates.
      records = await recordModel
        .find(
          {
            userId: request.query.userId,
            date: {$gte: request.query.from, $lte: request.query.to}
          },
          null, {sort: 'date'}).exec();
    } else if (request.query.from && ! request.query.to) {
      // From only:  return records after date.
      records = await recordModel
        .find(
          {
            userId: request.query.userId,
            date: {$gte: request.query.from}
          },
          null, {sort: 'date'}).exec();
    } else if (! request.query.from && request.query.to) {
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
        entries = records.length;
      }
    } else {
      entries = records.length;
      start = 0;
    }

    exerciseLog.count = entries;
    exerciseLog.log = records.slice(start, entries);

    return response
      .status(200)
      .json(exerciseLog);
  }
];
