'use strict';

function Response(builder, body) {
  this.builder = builder;
  this.body = body;
  this.headers = {};
  this.calls = [];
  this.invoked = this.invokedOnce = this.invokedTwice = this.invokedThrice = false;
  this.invokedCount = 0;
  this.status = 200;

  if (body) {
    this.withBody(body);
  }
}

Response.prototype.withHeader = function withHeader(name, value) {
  this.headers[name] = value;

  return this;
};

Response.prototype.withBody = function withBody(body) {
  if (typeof body !== 'string') {
    this.body = JSON.stringify(body);
  }

  return this;
};

Response.prototype.withStatus = function withStatus(status) {
  this.status = status;

  return this;
};

Response.prototype.send = function send(res) {
  return new Promise((resolve, reject) => {
    Object.keys(this.headers)
      .forEach(key => res.setHeader(key, this.headers[key]));

    // eslint-disable-next-line no-param-reassign
    res.statusCode = this.status;
    res.end(this.body, (err) => {
      if (err) {
        reject();
        return;
      }

      resolve();
    });
  });
};

module.exports = Response;
