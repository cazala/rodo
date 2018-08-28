'use strict';

const rodo = require('../src');
const request = require('supertest');

describe('server', () => {
  describe('server cache', () => {
    let mock;

    beforeEach(() => (mock = rodo(1234)));

    afterEach(() => mock.close());

    let myMock;
    let anotherMock;

    beforeEach(() => {
      myMock = rodo(1234);
      anotherMock = rodo(5678);
    });

    afterEach(() => {
      myMock.close();
      anotherMock.close();
    });

    it('should be eql', () => {
      myMock.should.be.eql(mock);
    });

    it('should not be eql', () => {
      anotherMock.should.not.be.eql(mock);
    });
  });

  describe('closing server', () => {
    let myMock;
    let mock;

    beforeEach(() => (mock = rodo(1234)));

    beforeEach((done) => {
      mock.close(() => {
        myMock = rodo(1234);

        done();
      });
    });

    afterEach(() => myMock.close());

    it('should not be eql', () => {
      myMock.should.not.be.eql(mock);
    });
  });

  describe('clean server with validations', () => {
    let mock;

    beforeEach(() => (mock = rodo(1234)));

    afterEach(() => mock.close());

    it('fails when rule not executed', () => {
      mock.get('/foo').reply({ bar: 'baz' });

      try {
        mock.clean({ validatePending: true });
      } catch (err) {
        err.message.should.eql('mock not executed: GET /foo');
      }
    });

    it('fails when no rule exists', () =>
      request(mock)
        .get('/foo')
        .expect(() => {
          try {
            mock.clean({ validatePending: true });
          } catch (err) {
            err.message.should.eql('no mock for call: GET /foo');
          }
        }));
  });
});
