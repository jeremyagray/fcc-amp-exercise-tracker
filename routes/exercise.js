'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/users.js');
const recordController = require('../controllers/records.js');

const {
  validateUsername,
  validateUserId,
  validateDescription,
  validateDuration,
  validateDate,
  validateLimit,
  validateFrom,
  validateTo,
  validationErrorHandler
} = require('../middleware/validation.js');

router
  .post('/new-user',
    validateUsername,
    validationErrorHandler,
    userController.newUser);

// No input to sanitize and validate.
router
  .get('/users', userController.getUsers);

router
  .post('/add',
    validateUserId,
    validateDescription,
    validateDuration,
    validateDate,
    validationErrorHandler,
    recordController.addRecord);

router
  .get('/log',
    validateUserId,
    validateLimit,
    validateFrom,
    validateTo,
    validationErrorHandler,
    recordController.getLog);

module.exports = router;
