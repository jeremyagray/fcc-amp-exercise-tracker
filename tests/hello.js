'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server.js');
// const server = 'http://localhost:3000';

describe('GET /api/hello', async function() {
  it('says hello', async function() {
    try {
      // Hello?
      const response = await chai.request(server)
        .get('/api/hello');

      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('greeting');
      expect(response.body).to.have.property('greeting')
        .eql('Hello from the FCC AMP Exercise Tracker API.');
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
});
