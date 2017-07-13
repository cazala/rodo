'use strict';

const url = require('url');
const querystring = require('querystring');
const Response = require('./response');

function Builder(path, method) {
  this.path = path;
  this.method = method || 'GET';
  this.headers = {};
  this.query = {};
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

Builder.prototype.havingQuery = function havingQuery(query) {
  this.query = query;

  return this;
};

Builder.prototype.resolve = function resolve(res) {
  if (this.response) {
    this.response.send(res);
  }
};

Builder.prototype.match = function match(req) {
  const urlObject = url.parse(req.url);
  const query = querystring.parse(urlObject.query);

  const isMatch = [
    this.path === urlObject.pathname,
    this.method === req.method,
    Object.keys(this.headers).every(key => req.headers[key] === this.headers[key]),
    Object.keys(this.query).every(key => getKey(query[key]) === getKey(this.query[key])),
  ].every(rule => rule);

  return isMatch;

  function getKey(key) {
    if (key === undefined || key === null) {
      return key;
    }

    return key.toString();
  }
};

module.exports = Builder;
