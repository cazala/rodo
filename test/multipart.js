'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('multipart', () => {
  let mock;
  let myCall;

  beforeEach(() => (mock = rodo()));

  afterEach(() => mock.close());

  beforeEach(() => {
    myCall = mock
      .post('/foo')
      .havingFields({ bar: 'baz' })
      .havingFiles({
        quux: (file) => file.originalFilename === 'sample.txt'
      })
      .reply({
        baz: 'quux'
      })
      .withHeader('content-type', 'application/json');
  });

  it('should receive the call', () =>
    request(mock)
      .post('/foo')
      .field('bar', 'baz')
      .attach('quux', 'test/resources/sample.txt')
      .expect(200)
      .expect((res) => {
        res.body.baz.should.eql('quux');
        myCall.calls.length.should.eql(1);
      }));

  it('should not receive the call', () =>
    request(mock)
      .post('/foo')
      .expect(404)
      .expect(() => {
        myCall.calls.length.should.eql(0);
      }));
});
