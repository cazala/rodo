'use strict';

const rodo = require('../src');
const request = require('supertest-as-promised');

describe('headers', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with a header', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .get('/foo')
        .reply()
        .withHeader('Content-Type', 'application/json');
    });

    it('should contain the header', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect('content-type', 'application/json')
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('filtering by header', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .get('/foo')
        .havingHeader('Accept', 'text/html')
        .reply()
        .withHeader('Content-Type', 'text/html');
    });

    it('should get the call', () => (
      request(mock)
        .get('/foo')
        .set('accept', 'text/html')
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));

    it('should not get the call', () => (
      request(mock)
        .get('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        })
    ));
  });
});
