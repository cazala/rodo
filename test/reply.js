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
    beforeEach(() => {
      mock
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
        })
    ));
  });

  describe('with a string', () => {
    beforeEach(() => {
      mock
        .get('/foo')
        .reply('bar');
    });

    it('should reply a string', () => (
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.text.should.eql('bar');
        })
    ));
  });
});
