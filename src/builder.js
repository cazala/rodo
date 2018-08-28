'use strict';

const url = require('url');
const querystring = require('querystring');
const Response = require('./response');

function Builder(path, method, options) {
  this.path = path;
  this.method = method || 'GET';
  this.headers = {};
  this.query = {};
  this.calls = [];
  this.options = typeof options !== 'undefined' ? options : {};
  this.responseOptions = {
    defaultDelay: this.options.defaultResponseDelay
  };
  this.invoked = false;
  this.invokedOnce = false;
  this.invokedTwice = false;
  this.invokedThrice = false;
  this.invokedCount = 0;
  this.timesCount = 1;
}

Builder.prototype.returns = function returns(response) {
  this.response = response;

  return response;
};

Builder.prototype.times = function times(timesCount) {
  this.timesCount = timesCount;

  return this;
};

Builder.prototype.then = function then(callback) {
  this.callback = callback;

  return new Promise((promiseResolveFn) => {
    this.promiseResolveFn = promiseResolveFn;
  });
};

Builder.prototype.reply = function reply(body) {
  const response = new Response(this, body, this.responseOptions);
  this.response = response;

  return response;
};

Builder.prototype.returns = function returns(response) {
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

Builder.prototype.havingBody = function havingBody(body) {
  this.body =
    typeof body === 'string' || typeof body === 'function'
      ? body
      : JSON.stringify(body);

  return this;
};

Builder.prototype.havingQuery = function havingQuery(query) {
  this.query = query;

  return this;
};

Builder.prototype.resolve = function resolve(req, res) {
  if (this.response) {
    this.response.send(req, res);
  }
};

Builder.prototype.match = function match(req) {
  const urlObject = url.parse(req.url);
  const query = querystring.parse(urlObject.query);

  const isMatch = [
    this.path === urlObject.pathname,
    this.method === req.method,
    typeof this.body === 'function'
      ? this.body(req.body)
      : !this.body || this.body === req.body,
    Object.keys(this.headers).every(
      (key) => req.headers[key] === this.headers[key]
    ),
    Object.keys(this.query).every(
      (key) => getKey(query[key]) === getKey(this.query[key])
    )
  ].every((rule) => rule);

  return isMatch;

  function getKey(key) {
    if (key === undefined || key === null) {
      return key;
    }

    return key.toString();
  }
};

module.exports = Builder;
