'use strict';

const url = require('url');
const querystring = require('querystring');
const Response = require('./response');

function Builder(path, method, options) {
  this.path = path;
  this.method = method || 'GET';
  this.headers = {};
  this.fields = {};
  this.files = () => true;
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
  this.method = method.toUpperCase();

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

Builder.prototype.havingFields = function havingFields(fields) {
  this.fields = Object.keys(fields).reduce((acum, current) => {
    // eslint-disable-next-line no-param-reassign
    acum[current] = Array.isArray(fields[current])
      ? fields[current]
      : [fields[current]];

    return acum;
  }, {});

  return this;
};

Builder.prototype.havingFiles = function havingFiles(files) {
  this.files = files;

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
    compareBody(this.body, req.body),
    compareFields(this.fields, req.fields),
    compareFiles(this.files, req.files),
    compareHeaders(this.headers, req.headers),
    Object.keys(this.query).every(
      (key) => getKey(query[key]) === getKey(this.query[key])
    )
  ].every((rule) => rule);

  return isMatch;
};

module.exports = Builder;

function getKey(key) {
  if (key === undefined || key === null) {
    return key;
  }

  return key.toString();
}

function compareFields(builderFields, requestFields) {
  return Object.keys(builderFields).every((field) =>
    builderFields[field].every(
      (fieldValue) =>
        requestFields &&
        requestFields[field].some(
          (reqFieldValue) => reqFieldValue === fieldValue
        )
    )
  );
}

function compareFiles(builderFiles, requestFiles) {
  return Object.keys(builderFiles).every((file) => {
    if (
      requestFiles &&
      requestFiles[file] &&
      requestFiles[file][0] &&
      builderFiles[file]
    ) {
      if (typeof builderFiles[file] === 'function') {
        return builderFiles[file](requestFiles[file][0]);
      }

      return requestFiles[file][0].originalFilename === builderFiles[file];
    }

    return false;
  });
}

function compareBody(builderBody, requestBody) {
  if (!builderBody) {
    return true;
  }

  if (typeof builderBody === 'function') {
    return builderBody(requestBody);
  }

  return builderBody === requestBody;
}

function compareHeaders(builderHeaders, requestHeaders) {
  return Object.keys(builderHeaders).every(
    (key) => requestHeaders[key] === builderHeaders[key]
  );
}
