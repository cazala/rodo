'use strict';

const Builder = require('./builder');
const http = require('http');

function rodo(port) {
  const server = http.createServer((req, res) => {
    const rule = server.rules.find(a => a.match(req));

    server.calls.push(req);
    rule.resolve(res);
  });

  server.get = (path) => {
    const builder = new Builder(path, 'GET');
    server.rules.push(builder);

    return builder;
  };

  server.calls = [];
  server.rules = [];
  server.clean = () => server.close();

  if (port) {
    server.listen(port);
  }

  return server;
}

module.exports = rodo;
