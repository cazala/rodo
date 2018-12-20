'use strict';

const debug = require('debug');
const http = require('http');
const typeis = require('type-is');
const Builder = require('./builder');
const { parseBody, parseMultipart } = require('./utils');

const instances = {};

function rodo(port, hostname, options) {
  const log = debug(`rodo${port ? `:${port}` : ''}`);
  const logError = debug(`rodo${port ? `:${port}` : ''}:error`);

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

  const server = http.createServer(async (req, res) => {
    log(`received ${req.method} ${req.url}`);
    log('  headers', req.headers);

    if (typeis(req, ['multipart'])) {
      log('parsing multipart');
      const { files, fields } = await parseMultipart(req, port);

      log('  fields', fields);
      log('  files', files);

      req.files = files;
      req.fields = fields;
    } else {
      log('parsing plain body');
      req.body = await parseBody(req, port);
    }

    const rule = server.rules.find((a) => a.match(req));

    middlewares.forEach((m) => m(req, res, () => {}));

    if (rule) {
      log(`resolving ${req.method} ${req.url} with rule:`);
      log(`  ${rule.method} ${rule.path}`);
      log(`  query`, rule.query);
      log(`  headers`, rule.headers);

      if (rule.response && rule.response.body && rule.response.body.length) {
        log(`  content`, rule.response.body.length);
      }

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
      const possibleRules = server.rules.filter(
        (serverRule) =>
          serverRule.path === req.url &&
          serverRule.method === req.method &&
          serverRule.timesCount > 0
      );

      logError(`could not find match for ${req.method} ${req.url} in rules`);

      possibleRules.forEach(({ headers, fields, files, query }) => {
        let alreadyLogged = false;

        if (Object.keys(headers).length > 0) {
          logError('  possible rule:');
          logError('    headers', headers);
          alreadyLogged = true;
        }

        if (Object.keys(fields).length > 0) {
          if (!alreadyLogged) {
            logError('  possible rule:');
            alreadyLogged = true;
          }

          logError('    fields', fields);
        }

        if (Object.keys(files).length > 0) {
          if (!alreadyLogged) {
            logError('  possible rule:');
            alreadyLogged = true;
          }

          logError('    files', files);
        }

        if (Object.keys(query).length > 0) {
          if (!alreadyLogged) {
            logError('  possible rule:');
            alreadyLogged = true;
          }

          logError('    query', query);
        }
      });

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

  server.use = function use(middleware) {
    middlewares.push(middleware);
  };

  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    server[method] = (path) => {
      log(`registering ${method} ${path}`);

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
    log(`cleaning rules`);

    let errors = [];

    if (validatePending) {
      const pendingRules = server.rules.filter(
        (rule) => !server.calls.some((call) => call === rule)
      );

      if (pendingRules.length) {
        errors = errors.concat(
          pendingRules.map(
            (rule) => `mock not executed: ${rule.method} ${rule.path}`
          )
        );
      }

      const noRuleCalls = server.calls.filter((call) => call.noRule);

      if (noRuleCalls.length) {
        errors = errors.concat(
          noRuleCalls.map(
            (call) => `no mock for call: ${call.method} ${call.path}`
          )
        );
      }
    }

    server.calls = [];
    server.rules = [];

    if (errors.length) {
      logError(errors);

      throw new Error(
        `The following errors have been found:\n${errors
          .map((error) => `  ${error}`)
          .join('\n')}`
      );
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
