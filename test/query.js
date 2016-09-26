'use strict';

const rodo = require('../src');
const request = require('supertest-as-promised');

describe('query', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with a query filter', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .get('/foo')
          .havingQuery({ bar: 'baz' })
        .reply();
    });

    it('should recieve the call', () => (
      request(mock)
        .get('/foo')
        .query({ bar: 'baz' })
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));

    it('should recieve the call if more params present', () => (
      request(mock)
        .get('/foo')
        .query({ bar: 'baz', 'quux': 'qux' })
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));

    it('should not recieve the call', () => (
      request(mock)
        .get('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        })
    ));
  });
});
