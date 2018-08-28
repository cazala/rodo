'use strict';

function Response(builder, body, options) {
  this.builder = builder;
  this.body = body;
  this.headers = {};
  this.calls = [];
  this.invoked = false;
  this.invokedOnce = false;
  this.invokedTwice = false;
  this.invokedThrice = false;
  this.invokedCount = 0;
  this.status = 200;
  this.options = typeof options !== 'undefined' ? options : {};
  this.delay = this.options.defaultDelay || 0;

  if (body) {
    this.withBody(body);
  }
}

Response.prototype.then = function then(callback) {
  return this.builder.then(callback);
};

Response.prototype.withHeader = function withHeader(name, value) {
  this.headers[name] = value;

  return this;
};

Response.prototype.withBody = function withBody(body) {
  if (typeof body !== 'string' && typeof body !== 'function') {
    this.body = JSON.stringify(body);
  }

  return this;
};

Response.prototype.withStatus = function withStatus(status) {
  this.status = status;

  return this;
};

Response.prototype.withDelay = function withDelay(delay) {
  this.delay = delay;

  return this;
};

function answer(body, req) {
  if (typeof body === 'function') {
    return body(req);
  }

  return body;
}

Response.prototype.send = function send(req, res) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Object.keys(this.headers).forEach((key) =>
        res.setHeader(key, this.headers[key])
      );

      // eslint-disable-next-line no-param-reassign
      res.statusCode = this.status;

      const body = answer(this.body, req);
      res.end(body, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(body);
      });

      if (
        this.builder &&
        this.builder.callback &&
        !this.builder.callbackCalled
      ) {
        this.builder.callbackCalled = true;
        this.builder.callback(req);
        this.builder.promiseResolveFn(req);
      }
    }, this.delay);
  });
};

module.exports = Response;
