'use strict';

const Builder = require('./builder');
const http = require('http');

function rodo(port, hostname, options) {
  const middlewares = [];
  const extraOptions = (typeof options !== 'undefined') ? options : {};
  const builderOptions = {
    defaultResponseDelay: extraOptions.defaultResponseDelay,
  };

  const server = http.createServer((req, res) => {
    const body = [];

    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        req.body = Buffer.concat(body).toString();
        const rule = server.rules.find(a => a.match(req));

        middlewares.forEach(m => m(req, res, () => {}));

        if (rule) {
          server.calls.push(rule);
          rule.resolve(req, res);
          rule.calls.push(req);

          if (rule.response) {
            rule.response.calls = rule.calls;
            setInvocationsCount(rule.response);
            setInvocationsCount(rule);
            return;
          }
        }

        // eslint-disable-next-line no-param-reassign
        res.statusCode = 404;
        res.end();
      });
  });

  server.use = function use(middleware) {
    middlewares.push(middleware);
  };

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    server[method] = (path) => {
      const builder = new Builder(path, method.toUpperCase(), builderOptions);
      server.rules.push(builder);

      return builder;
    };
  });

  server.request = function request() {
    const builder = new Builder(undefined, undefined, builderOptions);
    server.rules.push(builder);

    return builder;
  };

  server.clean = () => {
    server.calls = [];
    server.rules = [];
  };

  server.clean();

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
