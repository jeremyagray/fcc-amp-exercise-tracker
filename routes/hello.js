'use strict';

const express = require('express');
const router = express.Router();

// Hello API endpoint. 
router.get('', (request, response) => {
  return response
    .status(200)
    .json({
      'greeting': 'Hello from the FCC AMP Exercise Tracker API.'
    });
});

module.exports = router;
