'use strict';

const Builder = require('./builder');
const http = require('http');

function rodo(port) {
  const server = http.createServer((req, res) => {
    const rule = server.rules.find(a => a.match(req));

    if (rule) {
      server.calls.push(rule);
      rule.resolve(res);

      if (rule.response) {
        rule.response.calls.push(req);
      }
    } else {
      // eslint-disable-next-line no-param-reassign
      res.statusCode = 404;
      res.end();
    }
  });

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    server[method] = (path) => {
      const builder = new Builder(path, method.toUpperCase());
      server.rules.push(builder);

      return builder;
    };
  });

  server.calls = [];
  server.rules = [];
  server.clean = () => server.close();

  if (port) {
    server.listen(port);
  }

  return server;
}

module.exports = rodo;
