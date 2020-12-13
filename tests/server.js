'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server.js');
// const server = 'http://localhost:3000';

describe('GET pages', async function() {
  it('returns the index', async function() {
    try {
      // Get the index page.
      const response = await chai.request(server)
        .get('/');

      expect(response).to.have.status(200);
      expect(response).to.be.html;
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  it('returns 404', async function() {
    try {
      // Get the index page.
      const response = await chai.request(server)
        .get('/unknown.html');

      expect(response).to.have.status(404);
      expect(response).to.be.html;
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
});
