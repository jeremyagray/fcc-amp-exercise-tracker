'use strict';

// Load the environment variables.
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Express.
const app = express();

// Use cors for FCC testing.
app.use(cors({optionSuccessStatus: 200}));

// Configure mongoose.
const MONGOOSE_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
mongoose.connect(process.env.MONGO_URI, MONGOOSE_OPTIONS)
  .catch((error) => {
    console.log('Initial connection error:  ' + error);
  });
mongoose.connection.on('error', (error) => {
  console.log('Mongoose connection error:  ' + error);
});

// Use body parser for post data.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Serve static pages.
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Hello API endpoint. 
app.get('/api/hello', (req, res) => {
  res.json({greeting: 'Hello from the FCC AMP Exercise Tracker API.'});
});

// Create a user and exercise record model.
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now}
  });
let User = mongoose.model('User', userSchema);

const recordSchema = new Schema(
  {
    userId: {type: mongoose.ObjectId, required: true},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true, default: Date.now}
  });
let Record = mongoose.model('Exercise', recordSchema);

// Exercise Tracker API new-user endpoint.
// POST data and respond.
app.post('/api/exercise/new-user', (req, res, next) => {
  // Get the posted new username.
  let username = req.body.username;
  let user = new User({'username': username});

  // Should check for existing users, but the specs only want a unique _id...
  user.save((error, data) => {
    if (error) {
      console.log('Error creating user "' + username + '":  ' + error);
      return next(error);
    } else {
      console.log('New user "' + data.username + '" created with _id "' + data._id + '".');
      res.json({'username': data.username, '_id': data._id});
    }
  });
});

// Exercise Tracker API users endpoint.
// Respond with user array as in new-user.
app.get('/api/exercise/users', (req, res) => {
  User.find({}, (error, docs, next) => {
    if (error) {
      console.log('Error displaying all users:  ' + error);
      return next(error);
    } else {
      let usersArray = [];
      for (let i = 0; i < docs.length; i++) {
        usersArray.push({username: docs[i].username, _id: docs[i]._id});
      }
      res.json(usersArray);
    }
  });
});

// Exercise Tracker API adhttps://fcc-amp-exercisetracker.jeremyagray.repl.cod endpoint.
// POST data and respond.
app.post('/api/exercise/add', (req, res, next) => {
  // Check if user exists.
  if (User.exists({_id: req.body.userId})) {
    let date;
    // console.log('##' + req.body.date + '##');
    if (! req.body.date) {
      date = new Date();
    } else {
      date = new Date(req.body.date);
    }

    // Build the record from the posted data.
    let record = new Record({
      userId: req.body.userId,
      description: req.body.description,
      duration: req.body.duration,
      date: date
    });

    record.save((error, data) => {
      if (error) {
        console.log('Error adding exercise record:  ' + error);
        return next(error);
      } else {
        User.findById(data.userId, (error, doc) => {
          if (error) {
            console.log('Error finding data for userId "' + data.userId + '":  ' + error);
          } else {
            // let shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            // let shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            // let strDate = shortDays[data.date.getDay()] + ' ' + shortMonths[data.date.getMonth()] + ' ' + data.date.getDate() + ' ' + data.date.getFullYear();
            console.log('Exercise record added.');
            console.log({
              'username': doc.username, 
              '_id': doc._id,
              description: data.description,
              duration: data.duration,
              date: data.date.toDateString()
            });
            res.json({
              'username': doc.username, 
              '_id': doc._id,
              description: data.description,
              duration: data.duration,
              date: data.date.toDateString()
            });
          }
        });
      }
    });
  } else {
    console.log('Exercise record for non-existent user "' + req.body.username + '".');
    res.json({'error': 'invalid userId'});
  }
});

// Exercise Tracker API log endpoint.
// Respond with a user's complete exercise log.
// {username: '', _id: number, log: [], count: number}
// Parameters:  userId (_id), from and to (yyyy-mm-dd), limit (int).
app.get('/api/exercise/log', (req, res) => {
  console.log('in api/exercise/log');
  console.log('#' + req.query.userId + '#');
  console.log('#' + req.query.limit + '#');
  console.log('#' + req.query.from + '#');
  console.log('#' + req.query.to + '#');
  // userId, from, to, limit
  // Check if user exists.
  if (req.query.userId !== undefined && User.exists({_id: req.query.userId})) {
    console.log('in api/exercise/log, got user');
    Record.find({userId: req.query.userId}, null, {sort: 'date'}, (error, docs) => {
      console.log('in api/exercise/log attempting to find records');
      if (error) {
        console.log('Error finding data for userId "' + req.query.userId + '":  ' + error);
      } else {
        console.log('in api/exercise/log attempting to get the username');
        User.findById(req.query.userId, (error, data) => {
          console.log(data);
          if (error) {
            console.log('Error finding username for userId "' + req.query.userId + '":  ' + error);
          } else {
            console.log('in api/exercise/log constructing the response');
            let response = {
              username: data.username,
              _id: req.query.userId,
              count: 0,
              log: []
            };

            let items = 0;
            let begin = 0;
            if (req.query.limit != undefined) {
              items = parseInt(req.query.limit);

              if (docs.length <= items) {
                items = docs.length;
              } else {
                begin = docs.length - items;
                items = docs.length;
              }
            } else {
              items = docs.length;
              begin = 0;
            }

            for (let i = begin; i < items; i++) {
              const isoDateRegex = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/;
              // console.log('##' + req.query.from + '##');
              // console.log('##' + req.query.to + '##');
              if (isoDateRegex.test(req.query.from) && isoDateRegex.test(req.query.to)) {
                // console.log('matched the dates');
                const dateFrom = new Date(req.query.from);
                const dateTo = new Date(req.query.to);
                if (docs[i].date >= dateFrom && docs[i].date <= dateTo) {
                  // console.log('comparing dates');
                  // console.log(docs[i]);
                  response.count++;
                  response.log.push(docs[i]);
                }
              } else {
                // console.log(docs[i]);
                response.count++;
                response.log.push(docs[i]);
              }
            }
            res.json(response);
          }
        });
      }
    });
  } else {
    console.log('Exercise log request for non-existent user "' + req.query.username + '".');
    res.json({'error': 'invalid userId'});
  }
});

// File not found middleware.
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error handling middleware.
app.use((err, req, res) => {
  let errCode, errMessage;

  if (err.errors) {
    // Mongoose validation error.
    errCode = 400;
    const keys = Object.keys(err.errors);
    // Report the first validation error.
    errMessage = err.errors[keys[0]].message;
  } else {
    // Generic error.
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }

  res.status(errCode).type('txt').send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Exercise Tracker is listening on port ' + listener.address().port + '...');
});
