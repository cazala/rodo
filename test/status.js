'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('status', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with a statusCode', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .get('/foo')
        .reply()
        .withStatus(401);
    });

    it('should reply a json', () => (
      request(mock)
        .get('/foo')
        .expect(401)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('with no statusCode', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .get('/bar')
        .reply();
    });

    it('should reply a string', () => (
      request(mock)
        .get('/bar')
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));
  });
});
