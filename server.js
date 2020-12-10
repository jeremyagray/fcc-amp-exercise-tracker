'use strict';

// Load the environment variables.
require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Routing.
const helloRoute = require('./routes/hello.js');
const exerciseRoutes = require('./routes/exercise.js');

// Express.
const app = express();

async function start() {
  // Configure mongoose.
  const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };

  try {
    await mongoose.connect(process.env.MONGO_URI, MONGOOSE_OPTIONS);

    // Helmet middleware.
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          scriptSrc: ['\'self\'', 'localhost', '\'unsafe-inline\''],
          scriptSrcElem: ['\'self\'', 'localhost', '\'unsafe-inline\''],
          styleSrc: ['\'self\'', 'localhost', '\'unsafe-inline\'']
        }},
      referrerPolicy: {
        policy: 'same-origin'
      },
      frameguard: {
        action: 'sameorigin'
      }}));
    
    // Use cors for FCC testing.
    app.use(cors({
      origin: '*',
      optionSuccessStatus: 200
    }));

    // Use body parser for post data.
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.set('trust proxy', true);

    // Set static directory.
    app.use('/public', express.static(process.cwd() + '/public'));

    // Set view directory and view engine.
    app.set('views', process.cwd() + '/views');
    app.set('view engine', 'pug');

    // Serve static index.
    app.route('/')
      .get(function(request, response) {
        return response.sendFile(process.cwd() + '/views/index.html');
      });

    // Application routes.
    app.use('/api/hello', helloRoute);
    app.use('/api/exercise', exerciseRoutes);
    
    // 404 middleware.
    app.use((request, response) => {
      return response
        .status(404)
        .render('404');
    });

    // Run server and/or tests.
    const port = process.env.PORT || 3000;
    const name = 'fcc-amp-exercise-tracker';
    const version = '0.0.1';

    app.listen(port, function () {
      console.log(`${name}@${version} listening on port ${port}...`);
      if (process.env.NODE_ENV ==='test') {
        console.log(`${name}@${version} running tests...`);
        // setTimeout(function () {
        //   try {
        //     runner.run();
        //   } catch (error) {
        //     console.log(`${name}@${version}:  some tests failed:`);
        //     console.error(error);
        //   }
        // }, 1500);
      }
    });

    // Export `app` for testing.
    module.exports = app;
  } catch (error) {
    console.error(error);
  }
}

start();
