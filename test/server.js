'use strict';

const rodo = require('../src');

describe('server', () => {
  let mock;

  beforeEach(() => (
    mock = rodo(1234)
  ));

  afterEach(() => (
    mock.clean()
  ));

  describe('server cache', () => {
    let myMock;
    let anotherMock;

    beforeEach(() => {
      myMock = rodo(1234);
      anotherMock = rodo(5678);
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

    beforeEach((done) => {
      mock.close(() => {
        myMock = rodo(1234);

        done();
      });
    });

    it('should not be eql', () => {
      myMock.should.not.be.eql(mock);
    });
  });

  describe('clean server with validations', () => {
    it('fails', () => {
      mock
        .get('/foo')
        .reply({ bar: 'baz' });

      try {
        mock.clean({ validatePending: true });
      } catch (err) {
        err.message.should.eql('mock not executed: GET /foo');
      }
    });
  });
});
