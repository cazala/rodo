'use strict';

function Response(body) {
  const self = this;

  self.body = body;
  self.headers = {};

  if (typeof self.body !== 'string') {
    self.body = JSON.stringify(self.body);
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
