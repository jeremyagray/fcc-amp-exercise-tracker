'use strict';

const {body, validationResult} = require('express-validator');

const Users = require('../models/users.js');

exports.newUser = [

  // Sanitize and validate.
  body('username')
    .escape()
    .stripLow(true)
    .trim()
    .isLength({min: 1})
    .isAlphanumeric()
    .withMessage('Username should be a non-empty, alphanumeric string.'),

  async function(request, response) {
    // Grab errors and bail, if any.
    const errors = validationResult(request);
    if (! errors.isEmpty()) {
      return response.status(400)
        .json({'error': 'invalid request'});
    }

    // Create a user model.
    let userModel = Users();

    // Return the username and _id if it exist, otherwise create it
    // and return.
    let user;
    user = await userModel
      .findOneAndUpdate(
        {'username': request.body.username},
        {'username': request.body.username},
        {'new': true, 'upsert': true}).exec();

    if (user) {
      return response
        .status(200)
        .json({
          'username': user.username,
          '_id': user._id
        });
    }
    
    return response.status(500)
      .json({'error': 'server error'});
  }
];

exports.getUsers = [

  async function(request, response) {
    // No input to sanitize and validate.

    let user = Users();
    let users = await user.find({}).exec();
    let usersArray = [];
    for (let i = 0; i < users.length; i++) {
      usersArray.push({username: users[i].username, _id: users[i]._id});
    }

    return response
      .status(200)
      .json(usersArray);
  }];
