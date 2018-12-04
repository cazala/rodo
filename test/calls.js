'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('calls', () => {
  let mock;

  beforeEach(() => (mock = rodo()));

  afterEach(() => mock.close());

  describe('not called', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.get('/foo').reply();
    });

    it('should not be called', () => {
      myCall.invoked.should.eql(false);
      myCall.invokedOnce.should.eql(false);
      myCall.invokedTwice.should.eql(false);
      myCall.invokedThrice.should.eql(false);
      myCall.invokedCount.should.eql(0);
    });
  });

  describe('called once', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.get('/foo').reply();
    });

    beforeEach(() => request(mock).get('/foo'));

    it('should be called once', () => {
      myCall.invoked.should.eql(true);
      myCall.invokedOnce.should.eql(true);
      myCall.invokedTwice.should.eql(false);
      myCall.invokedThrice.should.eql(false);
      myCall.invokedCount.should.eql(1);
    });
  });

  describe('called twice', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.get('/foo').reply();
    });

    beforeEach(() =>
      Promise.all([request(mock).get('/foo'), request(mock).get('/foo')])
    );

    it('should be called twice', () => {
      myCall.invoked.should.eql(true);
      myCall.invokedOnce.should.eql(false);
      myCall.invokedTwice.should.eql(true);
      myCall.invokedThrice.should.eql(false);
      myCall.invokedCount.should.eql(2);
    });
  });

  describe('called thrice', () => {
    let myCall;

    beforeEach(() => {
      myCall = mock.get('/foo').reply();
    });

    beforeEach(() =>
      Promise.all([
        request(mock).get('/foo'),
        request(mock).get('/foo'),
        request(mock).get('/foo')
      ])
    );

    it('should be called twice', () => {
      myCall.invoked.should.eql(true);
      myCall.invokedOnce.should.eql(false);
      myCall.invokedTwice.should.eql(false);
      myCall.invokedThrice.should.eql(true);
      myCall.invokedCount.should.eql(3);
    });
  });
});
