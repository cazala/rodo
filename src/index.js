const request = require('./request');

function rodo(port, hostname) {
  const express = require('express');

  const app = express();
  const server = app.listen(port, hostname);

  return {
    get: (path) => {
      const mock = request();

      app.get(path, (req, res) => {
        mock.run(req, res);
      });

      return mock.builder;
    },
    clean: () => { server.close(); },
  };
}

module.exports = rodo;
