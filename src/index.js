'use strict';

const Builder = require('./builder');
const http = require('http');

const instances = {};

function rodo(port, hostname, options) {
  if (port && instances[port]) {
    return instances[port];
  }

  if (typeof options === 'undefined' && typeof hostname === 'object') {
    // eslint-disable-next-line no-param-reassign
    options = hostname;
  }

  const middlewares = [];
  const extraOptions = typeof options !== 'undefined' ? options : {};
  const builderOptions = {
    defaultResponseDelay: extraOptions.defaultResponseDelay,
    removeAfterUse: extraOptions.removeAfterUse
  };

  const server = http.createServer((req, res) => {
    const body = [];

    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        req.body = Buffer.concat(body).toString();
        const rule = server.rules.find((a) => a.match(req));

        middlewares.forEach((m) => m(req, res, () => {}));

        if (rule) {
          server.calls.push(rule);
          rule.resolve(req, res);
          rule.calls.push(req);
          rule.timesCount -= 1;

          if (builderOptions.removeAfterUse && rule.timesCount === 0) {
            server.rules.splice(server.rules.indexOf(rule), 1);
          }

          if (rule.response) {
            rule.response.calls = rule.calls;
            setInvocationsCount(rule.response);
            setInvocationsCount(rule);
            return;
          }
        } else {
          server.calls.push({
            noRule: true,
            method: req.method,
            path: req.url
          });
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

  server.clean = ({ validatePending = false } = {}) => {
    let error;

    if (validatePending) {
      const pendingRules = server.rules.filter(
        (rule) => !server.calls.some((call) => call === rule)
      );

      if (pendingRules.length) {
        error = new Error(
          pendingRules
            .map((rule) => `mock not executed: ${rule.method} ${rule.path}`)
            .join('\n')
        );
      }

      const noRuleCalls = server.calls.filter((call) => call.noRule);

      if (noRuleCalls.length && !error) {
        error = new Error(
          noRuleCalls
            .map((call) => `no mock for call: ${call.method} ${call.path}`)
            .join('\n')
        );
      }
    }

    server.calls = [];
    server.rules = [];

    if (error) {
      throw error;
    }
  };

  server.on('close', () => {
    delete instances[port];
  });

  server.clean();

  if (port) {
    server.listen(port, hostname);
    instances[port] = server;
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
