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
        err.message.should.eql(
          'The following errors have been found:\n  mock not executed: GET /foo'
        );
        mock.rules.length.should.eql(0);
      }
    });

    it('fails when no rule exists', () =>
      request(mock)
        .get('/foo')
        .expect(() => {
          try {
            mock.clean({ validatePending: true });
          } catch (err) {
            err.message.should.eql(
              'The following errors have been found:\n  no mock for call: GET /foo'
            );
          }
        }));
  });

  describe('clean after use', () => {
    let mock;

    beforeEach(() => (mock = rodo(1234, { removeAfterUse: true })));

    afterEach(() => mock.close());

    it('remove rule after use', () => {
      mock.get('/foo').reply({ bar: 'baz' });

      return request(mock)
        .get('/foo')
        .expect(200)
        .expect(() => {
          mock.rules.length.should.eql(0);

          return request(mock)
            .get('/foo')
            .expect(404);
        });
    });

    it('remove rule after use 2 times', () => {
      const rule = mock
        .get('/foo')
        .times(2)
        .reply({ bar: 'baz' });

      rule.builder.timesCount.should.eql(2);

      return request(mock)
        .get('/foo')
        .expect(200)
        .expect(() => {
          mock.rules.length.should.eql(1);
          rule.builder.timesCount.should.eql(1);

          return request(mock)
            .get('/foo')
            .expect(200)
            .expect(() => {
              mock.rules.length.should.eql(0);

              return request(mock)
                .get('/foo')
                .expect(404);
            });
        });
    });
  });
});
