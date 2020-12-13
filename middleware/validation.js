'use strict';

const {check, validationResult} = require('express-validator');

// Validation functions; reuse for differently named fields of same type.
function checkDates(field) {
  return check(field)
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isDate('YYYY-MM-DD')
    .toDate()
    .withMessage('Optional date in YYYY-MM-DD format.');
}

// Validation error handler.  Reuse everywhere.
exports.validationErrorHandler = function(request, response, next) {
  // Grab errors.
  const errors = validationResult(request);

  // Bail on errors.
  if (! errors.isEmpty()) {
    return response.status(400)
      .json({'error': 'invalid request'});
  }

  // Continue if no errors.
  next();
};

// Validate rules.
exports.validateUsername = [
  check('username')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isAlpha('en-US', {'ignore': '0123456789 -_'})
    .withMessage('Username should be a non-empty, alphanumeric (including spaces, dashes, and underscores) string.')
];

exports.validateUserId = [
  check('userId')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isMongoId()
    .withMessage('The userId should be a valid MongoDB objectId.')
];

exports.validateDescription = [
  check('description')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .withMessage('The description should be a non-empty string.')
];

exports.validateDuration = [
  check('duration')
    .notEmpty()
    .escape()
    .stripLow(true)
    .trim()
    .isNumeric()
    .isInt()
    .toInt()
    .withMessage('The duration should be a numeric time in minutes.')
];

exports.validateDate = [
  checkDates('date')
];

exports.validateFrom = [
  checkDates('from')
];

exports.validateTo = [
  checkDates('to')
];

exports.validateLimit = [
  check('limit')
    .optional({'nullable': true, 'checkFalsy': true})
    .escape()
    .stripLow(true)
    .trim()
    .isNumeric()
    .isInt()
    .toInt()
    .withMessage('The number (limit) of exercise records to return.')
];
