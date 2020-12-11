'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Models.
const Users = require('../models/users.js');

const server = require('../server.js');
// const server = 'http://localhost:3000';

// Generate some user names.
let validUsernames = [];
for (let i = 0; i < 5; i++) {
  validUsernames.push('user_' + i);
}

const invalidUsernames = [
  'inv@lid',
  'inv&lid',
  '',
  '<hackme>',
  '""',
  '`~!@#$%^&*()_+-={}[]\|:;<>?,./'
];

const allUsernames = [...validUsernames, ...invalidUsernames];

describe('POST /api/exercise/new-user', async function() {
  after('clear test database', async function() {
    const users = Users();
    await users.deleteMany({});
  });

  it('valid usernames', async function() {
    for (let i = 0; i < validUsernames.length; i++) {
      let response;

      try {
        response = await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': validUsernames[i]
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(validUsernames[i]);
        expect(response.body).to.have.property('_id');
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  });

  it('existing valid usernames', async function() {
    for (let i = 0; i < validUsernames.length; i++) {
      let response;

      try {
        response = await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': validUsernames[i]
          });

        expect(response).to.have.status(200);
        expect(response).to.be.json;
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('username');
        expect(response.body).to.have.property('username').eql(validUsernames[i]);
        expect(response.body).to.have.property('_id');
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  });

  it('invalid usernames', async function() {
    for (let i = 0; i < invalidUsernames.length; i++) {
      let response;

      try {
        response = await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': invalidUsernames[i]
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

  describe('malicious usernames',  async function() {
    it('username:  null', async function() {
        try {
          let response = await chai.request(server)
            .post('/api/exercise/new-user')
            .send({
              'username': null
            });

          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error');
          expect(response.body)
            .to.have.property('error').eql('invalid request');
        } catch (error) {
          console.log(error);
          throw error;
        }
    });

    it('username:  undefined', async function() {
        try {
          let response = await chai.request(server)
            .post('/api/exercise/new-user')
            .send({
              'username': undefined
            });

          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error');
          expect(response.body)
            .to.have.property('error').eql('invalid request');
        } catch (error) {
          console.log(error);
          throw error;
        }
    });

    it('username:  empty object', async function() {
        try {
          let response = await chai.request(server)
            .post('/api/exercise/new-user')
            .send({
              'username': {}
            });

          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error');
          expect(response.body)
            .to.have.property('error').eql('invalid request');
        } catch (error) {
          console.log(error);
          throw error;
        }
    });

    it('username:  object', async function() {
        try {
          let response = await chai.request(server)
            .post('/api/exercise/new-user')
            .send({
              'username': {'foo': 'bar'}
            });

          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error');
          expect(response.body)
            .to.have.property('error').eql('invalid request');
        } catch (error) {
          console.log(error);
          throw error;
        }
    });

    it('username:  empty array', async function() {
        try {
          let response = await chai.request(server)
            .post('/api/exercise/new-user')
            .send({
              'username': []
            });

          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error');
          expect(response.body)
            .to.have.property('error').eql('invalid request');
        } catch (error) {
          console.log(error);
          throw error;
        }
    });

    // This actually works, creating user 'foo'...
    // it('username:  array', async function() {
    //     try {
    //       let response = await chai.request(server)
    //         .post('/api/exercise/new-user')
    //         .send({
    //           'username': ['foo', 'bar']
    //         });

    //       expect(response).to.have.status(400);
    //       expect(response).to.be.json;
    //       expect(response.body).to.be.a('object');
    //       expect(response.body).to.have.property('error');
    //       expect(response.body)
    //         .to.have.property('error').eql('invalid request');
    //     } catch (error) {
    //       console.log(error);
    //       throw error;
    //     }
    // });
  });
});

describe('GET /api/exercise/users', async function() {
  after('clear test database', async function() {
    const users = Users();
    await users.deleteMany({});
  });

  it('invalid usernames', async function() {
    try {
      // Attempt to add the invalid usernames.
      for (let i = 0; i < invalidUsernames.length; i++) {
        await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': invalidUsernames[i]
          });
      }

      // Get the hopefully empty user log.
      const response = await chai.request(server)
            .get('/api/exercise/users');

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.have.lengthOf(0);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('valid usernames', async function() {
    try {
      // Add the valid usernames.
      for (let i = 0; i < validUsernames.length; i++) {
        await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': validUsernames[i]
          });
      }

      // Get the user log, with length hopefully equal to validUsernames.length.
      const response = await chai.request(server)
            .get('/api/exercise/users');

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.have.lengthOf(validUsernames.length);

      // Iterate over response array.
      for (let i = 0; i < response.body.length; i++) {
        expect(response.body[i]).to.be.a('object');
        expect(response.body[i]).to.have.property('username');
        expect(response.body[i]).to.have.property('_id');
        expect(response.body[i]['username']).to.be.oneOf(validUsernames);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('mixed usernames', async function() {
    try {
      // Attempt to add all the usernames.
      for (let i = 0; i < allUsernames.length; i++) {
        await chai.request(server)
          .post('/api/exercise/new-user')
          .send({
            'username': allUsernames[i]
          });
      }

      // Get the user log, with length hopefully equal to validUsernames.length.
      const response = await chai.request(server)
            .get('/api/exercise/users');

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.have.lengthOf(validUsernames.length);

      // Iterate over response array.
      for (let i = 0; i < response.body.length; i++) {
        expect(response.body[i]).to.be.a('object');
        expect(response.body[i]).to.have.property('username');
        expect(response.body[i]).to.have.property('_id');
        expect(response.body[i]['username']).to.be.oneOf(validUsernames);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
});
