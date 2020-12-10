'use strict';

const express = require('express');
const router = express.Router();

// Hello API endpoint. 
router.get('', (request, response) => {
  response.json({greeting: 'Hello from the FCC AMP Exercise Tracker API.'});
  return;
});

module.exports = router;
