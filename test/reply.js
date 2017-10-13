'use strict';

const rodo = require('../src');
const Response = require('../src/response');
const request = require('supertest');

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

  describe('with a function', () => {
    let functionCall;
    let getBody;

    beforeEach(() => {
      getBody = () => 'bar';
      functionCall = mock
        .get('/foo')
        .reply(getBody);
    });

    it('should reply with function response', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.text.should.eql('bar');
          functionCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('with a custom response', () => {
    let functionCall;

    beforeEach(() => {
      functionCall = mock
        .get('/foo')
        .then(new Response(null, 'bar'));
    });

    it('should reply with body', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.text.should.eql('bar');
          functionCall.calls.length.should.eql(1);
        })
    ));
  });

  describe('with a custom response with status', () => {
    let functionCall;

    beforeEach(() => {
      functionCall = mock
        .get('/foo')
        .then(new Response(null, 'bar').withStatus(228));
    });

    it('should reply with body and right status', () => (
      request(mock)
        .get('/foo')
        .expect(228)
        .expect((res) => {
          res.text.should.eql('bar');
          functionCall.calls.length.should.eql(1);
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
