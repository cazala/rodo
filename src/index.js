'use strict';

const Builder = require('./builder');
const http = require('http');

function rodo(port) {
  const server = http.createServer((req, res) => {
    const rule = rules.find(a => a.match(req));

    rule.resolve(res);
  });

  server.listen(port);

  const rules = [];

  server.get = (path) => {
    const builder = new Builder(path, 'GET');
    rules.push(builder);

    return builder;
  };

  server.clean = () => server.close();

  return server;
}

module.exports = rodo;
