'use strict';

const Users = require('../models/users.js');

exports.newUser = async function(request, response) {
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
};

// No input to sanitize and validate.
exports.getUsers = async function(request, response) {

  let user = Users();
  let users = await user.find({}).exec();
  let usersArray = [];
  for (let i = 0; i < users.length; i++) {
    usersArray.push({username: users[i].username, _id: users[i]._id});
  }

  return response
    .status(200)
    .json(usersArray);
};
