'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('request', () => {
  let mock;

  beforeEach(() => (mock = rodo()));

  afterEach(() => mock.close());

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

    it('should reply a json', () =>
      request(mock)
        .get('/foo')
        .expect(200)
        .expect((res) => {
          res.body.bar.should.eql('baz');
          jsonCall.calls.length.should.eql(1);
        }));
  });

  describe('when no reply is configured ', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .request()
        .havingMethod('GET')
        .havingPath('/foo');
    });

    it('should reply a json', () =>
      request(mock)
        .get('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        }));
  });

  describe('promises', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock
        .request()
        .havingMethod('GET')
        .havingPath('/foo')
        .reply()
        .withBody({ bar: 'baz' })
        .withHeader('content-type', 'application/json');
    });

    it('should resolve the promise once', (done) => {
      myCall.then(() => {
        done();
      });

      request(mock)
        .get('/foo')
        .expect(200)
        .then(() => {}); // required for supertest

      request(mock)
        .get('/foo')
        .expect(200)
        .then(() => {}); // required for supertest
    });
  });
});

describe('request when server is instantiated with a default delay', () => {
  const testDelay = 1000;
  let mock;

  beforeEach(() => {
    mock = rodo(undefined, undefined, { defaultResponseDelay: testDelay });
  });

  afterEach(() => mock.clean());

  it('should have the expected delay value', () => {
    const jsonCall = mock
      .request()
      .havingMethod('GET')
      .havingPath('/foo')
      .reply();

    jsonCall.delay.should.equal(testDelay);
  });

  it('should overwrite default delay when withDelay is used', () => {
    const newDelay = 2000;
    const jsonCall = mock
      .request()
      .havingMethod('GET')
      .havingPath('/foo')
      .reply()
      .withDelay(newDelay);

    jsonCall.delay.should.equal(newDelay);
  });
});
