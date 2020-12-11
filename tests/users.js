'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Models.
// const Users = require('../models/users.js');

// Controllers.
// const userController = require('../controllers/users.js');

const server = require('../server.js');
// const server = 'http://localhost:3000';

describe('POST /api/exercise/new-user', async function() {
  const date = new Date();
  const validUsername = 'user_' + date.getTime().toString();
  const invalidUsername = 'inv@lid';

  it('new valid username', async function() {
    let response;

    try {
      response = await chai.request(server)
        .post('/api/exercise/new-user')
        .send({
          'username': validUsername
        });

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('username');
      expect(response.body).to.have.property('username').eql(validUsername);
      expect(response.body).to.have.property('_id');
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('already existing valid username', async function() {
    let response;

    try {
      response = await chai.request(server)
        .post('/api/exercise/new-user')
        .send({
          'username': validUsername
        });

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('username');
      expect(response.body).to.have.property('username').eql(validUsername);
      expect(response.body).to.have.property('_id');
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('invalid username', async function() {
    let response;

    try {
      response = await chai.request(server)
        .post('/api/exercise/new-user')
        .send({
          'username': invalidUsername
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
  });
});
