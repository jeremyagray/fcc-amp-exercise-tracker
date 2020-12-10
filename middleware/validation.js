'use strict';

const {body, validationResult} = require('express-validator');

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

exports.validateUsername = [
  body('username')
    .escape()
    .stripLow(true)
    .trim()
    .isLength({min: 1})
    .isAlpha('en-US', {'ignore': '0123456789 -_'})
    .withMessage('Username should be a non-empty, alphanumeric (including spaces, dashes, and underscores) string.')
];
