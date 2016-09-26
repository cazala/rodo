'use strict';

const url = require('url');
const Response = require('./response');

function Builder(path, method) {
  this.path = path;
  this.method = method || 'GET';
}

Builder.prototype.reply = function reply(body) {
  const response = new Response(this, body);
  this.response = response;

  return response;
};

Builder.prototype.resolve = function resolve(res) {
  if (this.response) {
    this.response.send(res);
  }
};

Builder.prototype.match = function match(req) {
  const urlObject = url.parse(req.url);
  let isMatch = true;

  isMatch = isMatch && this.path === urlObject.pathname;

  return isMatch;
};

module.exports = Builder;
