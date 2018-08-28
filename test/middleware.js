'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('middleware', () => {
  let mock;

  beforeEach(() => (mock = rodo()));

  afterEach(() => mock.close());

  describe('adding a middleware', () => {
    let myReq;

    beforeEach(() => {
      mock.use((req) => {
        myReq = req;
      });
    });

    it('should call the middleware a json', () =>
      request(mock)
        .get('/foo')
        .expect(() => {
          myReq.url.should.eql('/foo');
        }));
  });
});
