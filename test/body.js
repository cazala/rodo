'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('body', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('filtering by body', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .post('/foo')
        .havingBody({ foo: 'bar' })
        .reply({
          baz: 'quux',
        });
    });

    it('should receive the call', () => (
      request(mock)
        .post('/foo')
        .send({ foo: 'bar' })
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));

    it('should not receive the call', () => (
      request(mock)
        .post('/foo')
        .send({ duck: 'pet' })
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        })
    ));
  });

  describe('using a func', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .post('/foo')
        .havingBody(body => JSON.parse(body).foo === 'bar')
        .reply({
          baz: 'quux',
        });
    });

    it('should receive the call', () => (
      request(mock)
        .post('/foo')
        .send({ foo: 'bar' })
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));

    it('should not receive the call', () => (
      request(mock)
        .post('/foo')
        .send({ duck: 'pet' })
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        })
    ));
  });
});
