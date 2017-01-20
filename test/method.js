'use strict';

const rodo = require('../src');
const request = require('supertest-as-promised');

describe('method', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with a method', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .patch('/foo')
        .reply();
    });

    it('should contain the header', () => (
      request(mock)
        .patch('/foo')
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('filtering by method', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .patch('/foo')
        .reply();
    });

    it('should not get the call', () => (
      request(mock)
        .post('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        })
    ));
  });
});
