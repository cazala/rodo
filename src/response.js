'use strict';

function Response(body) {
  this.body = body;
  this.headers = {};

  if (typeof this.body !== 'string') {
    this.body = JSON.stringify(this.body);
  }
}

Response.prototype.withHeader = function withHeader(name, value) {
  this.headers[name] = value;
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
