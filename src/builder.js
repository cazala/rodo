'use strict';

const url = require('url');
const Response = require('./response');

function Builder(path, method) {
  this.path = path;
  this.method = method || 'GET';
  this.headers = {};
  this.calls = [];
}

Builder.prototype.reply = function reply(body) {
  const response = new Response(this, body);
  this.response = response;

  return response;
};

Builder.prototype.havingMethod = function havingMethod(method) {
  this.method = method;

  return this;
};

Builder.prototype.havingPath = function havingPath(path) {
  this.path = path;

  return this;
};

Builder.prototype.havingHeader = function havingHeader(name, value) {
  this.headers[name.toLowerCase()] = value;

  return this;
};

Builder.prototype.resolve = function resolve(res) {
  if (this.response) {
    this.response.send(res);
  }
};

Builder.prototype.match = function match(req) {
  const urlObject = url.parse(req.url);
  const isMatch = [
    this.path === urlObject.pathname,
    Object.keys(this.headers).every(key => req.headers[key] === this.headers[key]),
  ].every(rule => rule);

  return isMatch;
};

module.exports = Builder;
