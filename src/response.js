'use strict';

function Response(builder, body) {
  this.builder = builder;
  this.body = body;
  this.headers = {};
  this.calls = [];

  if (typeof this.body !== 'string') {
    this.body = JSON.stringify(this.body);
  }
}

Response.prototype.withHeader = function withHeader(name, value) {
  this.headers[name] = value;

  return this;
};

Response.prototype.send = function send(res) {
  return new Promise((resolve, reject) => {
    Object.keys(this.headers)
      .forEach(key => res.setHeader(key, this.headers[key]));

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
