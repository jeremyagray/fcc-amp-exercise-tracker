'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/users.js');
const recordController = require('../controllers/records.js');

router
  .post('/new-user', userController.newUser);

router
  .get('/users', userController.getUsers);

router
  .post('/add', recordController.addRecord);

router
  .get('/log', recordController.getLog);

module.exports = router;
