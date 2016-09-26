'use strict';

const rodo = require('../src');
const request = require('supertest-as-promised');

describe('request', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with havingMethod and havingPath ', () => {
    let jsonCall;

    beforeEach(() => {
      jsonCall = mock
        .request()
          .havingMethod('GET')
          .havingPath('/foo')
        .reply()
          .withBody({ bar: 'baz' })
          .withHeader('content-type', 'application/json');
    });

    it('should reply a json', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.body.bar.should.eql('baz');
          jsonCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('when no reply is configured ', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .request()
          .havingMethod('GET')
          .havingPath('/foo');
    });

    it('should reply a json', () => (
      request(mock)
        .get('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        })
    ));
  });
});
