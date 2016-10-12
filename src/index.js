'use strict';

const Builder = require('./builder');
const http = require('http');

function rodo(port, hostname) {
  const server = http.createServer((req, res) => {
    const rule = server.rules.find(a => a.match(req));

    if (rule) {
      server.calls.push(rule);
      rule.resolve(res);
      rule.calls.push(req);

      if (rule.response) {
        rule.response.calls = rule.calls;
        setInvocationsCount(rule.response);
        return;
      }
    }
    // eslint-disable-next-line no-param-reassign
    res.statusCode = 404;
    res.end();
  });

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    server[method] = (path) => {
      const builder = new Builder(path, method.toUpperCase());
      server.rules.push(builder);

      return builder;
    };
  });

  server.request = function request() {
    const builder = new Builder();
    server.rules.push(builder);

    return builder;
  };

  server.calls = [];
  server.rules = [];
  server.clean = () => server.close();

  if (port) {
    server.listen(port, hostname);
  }

  return server;
}

function setInvocationsCount(obj) {
  const callsLength = obj.calls.length;

  /* eslint-disable no-param-reassign */
  obj.invokedCount = callsLength;
  obj.invoked = callsLength > 0;
  obj.invokedOnce = callsLength === 1;
  obj.invokedTwice = callsLength === 2;
  obj.invokedThrice = callsLength === 3;
  /* eslint-enable no-param-reassign */
}

module.exports = rodo;
