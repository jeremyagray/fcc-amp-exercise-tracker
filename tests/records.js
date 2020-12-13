'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Models.
const Records = require('../models/records.js');
const Users = require('../models/users.js');

const server = require('../server.js');
// const server = 'http://localhost:3000';

// route body parameters:  userId, description, duration, date?
// returns:  username, _id, description, duration, date
describe('POST /api/exercise/add', async function() {
  let now = new Date();
  let user = {};

  before('create a user', async function() {
    try {
      let response;
      response = await chai.request(server)
        .post('/api/exercise/new-user')
        .send({
          'username': 'user_' + now.getTime().toString()
        });
      user = response['body'];
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  after('clear test database', async function() {
    const records = Records();
    await records.deleteMany({});
    const users = Users();
    await users.deleteMany({});
  });

  describe('good requests', async function() {
    it('should add without date', async function() {
      let response;
      const description = 'swimming';
      const duration = 20;

      try {
        response = await chai.request(server)
          .post('/api/exercise/add')
          .send({
            'userId': user['_id'],
            'description': description,
            'duration': duration
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('description').eql(description);
        expect(response.body).to.have.property('duration');
        expect(response.body).to.have.property('duration').eql(parseInt(duration));
        expect(response.body).to.have.property('date');
        // date is returned like "Sat Dec 12 2020", so reformat now to test.
        expect(response.body).to.have.property('date').eql(now.toDateString());
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should add with date', async function() {
      let response;
      const description = 'swimming';
      const duration = 20;

      try {
        response = await chai.request(server)
          .post('/api/exercise/add')
          .send({
            'userId': user['_id'],
            'description': description,
            'duration': duration,
            'date': now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString() + '-' + now.getDate().toString()
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('description').eql(description);
        expect(response.body).to.have.property('duration');
        expect(response.body).to.have.property('duration').eql(parseInt(duration));
        expect(response.body).to.have.property('date');
        // date is sent as 2020-12-12 and is offset to UTC on the server.
        // date is returned like "Sat Dec 12 2020", so reformat now and
        // undo the server offset to test.
        let adjNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        adjNow = new Date(adjNow.setMinutes(
          adjNow.getMinutes() - adjNow.getTimezoneOffset()));
        expect(response.body).to.have.property('date').eql(adjNow.toDateString());
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  });

  describe('userId tests, without date', async function() {
    describe('non-existent userIds', async function() {
      it('should fail', async function() {
        let response;
        let nonexistentUserIds = [
          '111111111111111111111111'
        ];
        const description = 'swimming';
        const duration = 20;

        for (let i = 0; i < nonexistentUserIds.length; i++) {
          try {
            response = await chai.request(server)
              .post('/api/exercise/add')
              .send({
                'userId': nonexistentUserIds[i],
                'description': description,
                'duration': duration
              });

            expect(response).to.have.status(400);
            expect(response).to.be.json;
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('error')
              .eql('could not find userId ' + nonexistentUserIds[i]);
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      });
    });

    describe('invalid userIds', async function() {
      it('should fail', async function() {
        let response;
        let invalidUserIds = [
          'zzzzzzzzzzzzzzzzzzzzzzzz',
          '',
          null,
          undefined,
          314,
          3.14,
          {},
          {'foo': 'bar'},
          []
        ];
        const description = 'swimming';
        const duration = 20;

        for (let i = 0; i < invalidUserIds.length; i++) {
          try {
            response = await chai.request(server)
              .post('/api/exercise/add')
              .send({
                'userId': invalidUserIds[i],
                'description': description,
                'duration': duration
              });

            expect(response).to.have.status(400);
            expect(response).to.be.json;
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('error')
              .eql('invalid request');
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      });
    });

  });

  describe('description tests, without date', async function() {
    describe('invalid descriptions, without date', async function() {
      it('should fail', async function() {
        let response;
        const descriptions = [
          '',
          null,
          undefined,
          []
        ];
        const duration = 20;

        for (let i = 0; i < descriptions.length; i++) {
          try {
            response = await chai.request(server)
              .post('/api/exercise/add')
              .send({
                'userId': user['_id'],
                'description': descriptions[i],
                'duration': duration
              });

            // console.log(`description:  ##${descriptions[i]}##`);
            // console.log(response.body);

            expect(response).to.have.status(400);
            expect(response).to.be.json;
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('error').eql('invalid request');
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      });
    });
  });

  describe('duration tests, without date', async function() {
    describe('good durations', async function() {
      it('should add', async function() {
        let response;
        const description = 'swimming';
        const duration = '20';

        try {
          response = await chai.request(server)
            .post('/api/exercise/add')
            .send({
              'userId': user['_id'],
              'description': description,
              'duration': duration
            });

          expect(response).to.have.status(200);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('username');
          expect(response.body).to.have.property('username').eql(user['username']);
          expect(response.body).to.have.property('_id');
          expect(response.body).to.have.property('_id').eql(user['_id']);
          expect(response.body).to.have.property('description');
          expect(response.body).to.have.property('description').eql(description);
          expect(response.body).to.have.property('duration');
          expect(response.body).to.have.property('duration').eql(parseInt(duration));
          expect(response.body).to.have.property('date');
          // date is returned like "Sat Dec 12 2020", so reformat now to test.
          expect(response.body).to.have.property('date').eql(now.toDateString());
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    });

    describe('invalid durations', async function() {
      it('should fail', async function() {
        let response;
        const description = 'swimming';
        const durations = [
          'twenty',
          '',
          null,
          undefined,
          3.14,
          {},
          {'foo': 'bar'},
          [],
          ['foo', 'bar']
        ];

        for(let i = 0; i < durations.length; i++) {
          try {
            response = await chai.request(server)
              .post('/api/exercise/add')
              .send({
                'userId': user['_id'],
                'description': description,
                'duration': durations[i]
              });

            expect(response).to.have.status(400);
            expect(response).to.be.json;
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('error').eql('invalid request');
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      });
    });
  });

  describe('date tests', async function() {
    describe('invalid dates', async function() {
      it('should fail', async function() {
        let response;
        const description = 'swimming';
        const duration = 20;
        const invalidDates = [
          '12-12-2020',
          '31-12-2020',
          '12/31/2020',
          '31/12/2020',
          'bob-is-your-uncle',
          new Date(),
          314,
          3.14,
          {'foo': 'bar'}
        ];

        for (let i = 0; i < invalidDates.length; i++) {
          try {
            response = await chai.request(server)
              .post('/api/exercise/add')
              .send({
                'userId': user['_id'],
                'description': description,
                'duration': duration,
                'date': invalidDates[i]
              });

            expect(response).to.have.status(400);
            expect(response).to.be.json;
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error');
            expect(response.body).to.have.property('error').eql('invalid request');
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      });

    });
  });
});

// route query parameters:  userId, from?, to?, limit?
describe('GET /api/exercise/log', async function() {
  let now = new Date();
  let user = {};
  let exerciseRecords = [
    ['swimming', 20, '2020-12-01'],
    ['fencing', 45, '2020-12-02'],
    ['cycling', 180, '2020-12-03'],
    ['tennis', 120, '2020-12-04'],
    ['running', 75, '2020-12-05']
  ];

  before('populate database', async function() {
    // Clear database.
    const records = Records();
    await records.deleteMany({});
    const users = Users();
    await users.deleteMany({});

    // Create user.
    let request = await chai.request(server)
      .post('/api/exercise/new-user')
      .send({
        'username': 'user_' + now.getTime().toString()
      });
    user = request['body'];

    // Add the exercise records.
    for (let i = 0; i < exerciseRecords.length; i++) {
      await chai.request(server)
        .post('/api/exercise/add')
        .send({
          'userId': user['_id'],
          'description': exerciseRecords[i][0],
          'duration': exerciseRecords[i][1],
          'date': exerciseRecords[i][2]
        });
    }
  });

  after('clear test database', async function() {
    const records = Records();
    await records.deleteMany({});
    const users = Users();
    await users.deleteMany({});
  });

  describe('user with records', async function() {
    it('should have all logs', async function() {
      let response; 

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(exerciseRecords.length);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(exerciseRecords.length);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have too many logs', async function() {
      let response; 

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'limit': 10
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(exerciseRecords.length);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(exerciseRecords.length);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have some logs', async function() {
      let response; 
      let limit = 3;

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'limit': limit
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(limit);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(limit);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have logs after', async function() {
      let response; 
      let from = '2020-12-03';
      let limit = 3;

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'from': from
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(limit);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(limit);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have logs before', async function() {
      let response; 
      let to = '2020-12-03';
      let limit = 3;

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'to': to
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(limit);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(limit);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have logs between', async function() {
      let response; 
      let from = '2020-12-01';
      let to = '2020-12-03';
      let limit = 3;

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'from': from,
            'to': to
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(limit);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(limit);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should have logs between limited', async function() {
      let response; 
      let from = '2020-12-02';
      let to = '2020-12-05';
      let limit = 3;

      try {
        response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'from': from,
            'to': to,
            'limit': limit
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(user['username']);
        expect(response.body).to.have.property('_id');
        expect(response.body).to.have.property('_id').eql(user['_id']);
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('count').eql(limit);
        expect(response.body).to.have.property('log');
        expect(response.body.log).to.have.lengthOf(limit);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  });

  describe('non-existent userIds', async function() {
    it('should fail', async function() {
      let nonexistentUserIds = [
        '111111111111111111111111'
      ];
      
      for (let i = 0; i < nonexistentUserIds.length; i++) {
        // Get the hopefully empty user log.
        const response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': nonexistentUserIds[i]
          });

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error');
        expect(response.body).to.have.property('error').eql('could not find userId ' + nonexistentUserIds[i]);
      }
    });
  });

  describe('invalid userIds', async function() {
    it('should fail', async function() {
      let invalidUserIds = [
        'zzzzzzzzzzzzzzzzzzzzzzzz',
        '',
        null,
        undefined,
        314,
        3.14,
        {},
        {'foo': 'bar'},
        []
      ];
      
      for (let i = 0; i < invalidUserIds.length; i++) {
        // Get the hopefully empty user log.
        const response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': invalidUserIds
          });

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error');
        expect(response.body).to.have.property('error').eql('invalid request');
      }
    });
  });

  describe('invalid limits', async function() {
    it('should fail', async function() {
      let invalidLimits = [
        'zzzzzzzzzzzzzzzzzzzzzzzz',
        3.14,
        {'foo': 'bar'}
      ];
      
      for (let i = 0; i < invalidLimits.length; i++) {
        // Get the hopefully empty user log.
        const response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'limit': invalidLimits[i]
          });

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error');
        expect(response.body).to.have.property('error').eql('invalid request');
      }
    });
  });

  describe('invalid from', async function() {
    it('should fail', async function() {
      let invalidFroms = [
        'zzzzzzzzzzzzzzzzzzzzzzzz',
        314,
        3.14,
        {'foo': 'bar'},
        '12-31-2020',
        '31-12-2020',
        '12/31/2020',
        '31/12/2020',
        new Date()
      ];
      
      for (let i = 0; i < invalidFroms.length; i++) {
        // Get the hopefully empty user log.
        const response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'from': invalidFroms[i]
          });

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error');
        expect(response.body).to.have.property('error').eql('invalid request');
      }
    });
  });

  describe('invalid to', async function() {
    it('should fail', async function() {
      let invalidTos = [
        'zzzzzzzzzzzzzzzzzzzzzzzz',
        314,
        3.14,
        {'foo': 'bar'},
        '12-31-2020',
        '31-12-2020',
        '12/31/2020',
        '31/12/2020',
        new Date()
      ];
      
      for (let i = 0; i < invalidTos.length; i++) {
        // Get the hopefully empty user log.
        const response = await chai.request(server)
          .get('/api/exercise/log')
          .query({
            'userId': user['_id'],
            'from': invalidTos[i]
          });

        expect(response).to.have.status(400);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error');
        expect(response.body).to.have.property('error').eql('invalid request');
      }
    });
  });
});
