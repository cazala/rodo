'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('method', () => {
  let mock;

  beforeEach(() => (mock = rodo()));

  afterEach(() => mock.close());

  describe('with a method', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.patch('/foo').reply();
    });

    it('should get the call', () =>
      request(mock)
        .patch('/foo')
        .expect(200)
        .expect(() => {
          myCall.calls.length.should.eql(1);
        }));
  });

  describe('filtering by method', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.patch('/foo').reply();
    });

    it('should not get the call', () =>
      request(mock)
        .post('/foo')
        .expect(404)
        .expect(() => {
          myCall.calls.length.should.eql(0);
        }));
  });
});

describe('method when server is instantiated with a default delay', () => {
  const testDelay = 1000;
  let mock;

  beforeEach(() => {
    mock = rodo(undefined, undefined, { defaultResponseDelay: testDelay });
  });

  afterEach(() => mock.clean());

  it('should have the expected delay value', () => {
    const myCall = mock.patch('/foo').reply();

    myCall.delay.should.equal(testDelay);
  });

  it('should overwrite default delay when withDelay is used', () => {
    const newDelay = 2000;
    const myCall = mock
      .patch('/foo')
      .reply()
      .withDelay(newDelay);

    myCall.delay.should.equal(newDelay);
  });
});
