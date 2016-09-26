'use strict';

const rodo = require('../src');
const request = require('supertest-as-promised');

describe('reply', () => {
  let mock;

  beforeEach(() => (
    mock = rodo()
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('with a json', () => {
    let jsonCall;

    beforeEach(() => {
      jsonCall = mock
        .get('/foo')
        .reply({ bar: 'baz' })
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

  describe('using withBody', () => {
    let jsonCall;

    beforeEach(() => {
      jsonCall = mock
        .get('/foo')
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

  describe('with a string', () => {
    let stringCall;

    beforeEach(() => {
      stringCall = mock
        .get('/foo')
        .reply('bar');
    });

    it('should reply a string', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.text.should.eql('bar');
          stringCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('when no rule assigned', () => {
    it('should reply with a 404', () => (
      request(mock)
        .get('/foo')
        .expect(404)
    ));
  });
});
