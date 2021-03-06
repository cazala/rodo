# Rodo

![Rodo](http://i.ebayimg.com/images/g/PFEAAOSwmrlUsqos/s-l300.jpg)

> HTTP mocking service

**Rodo** can be used to create a real mocked API with an specific port and host.

The main difference with other HTTP mocking libraries like [`nock`](https://github.com/node-nock/nock) is that **Rodo** creates a real HTTP server instead of overriding the behavior of Node HTTP objects.

## Install

```
npm install rodo
```

## Sample usage

Writing a new mocked endpoint can be as easy as:

```js
// Mocking API
const assert = require('assert');
const rodo = require('rodo');
const mockServer = rodo(8000);
const myCall = mockServer
  .get('/foo')
  .reply({ bar: 'baz' })
  .withHeader('content-type', 'application/json');

// Action
const res = await fetch('http://localhost:8000/foo');
const json = await res.json();

// Assertions
assert.equal(json.bar, 'baz');
assert.equal(myCall.calls.length, 1);
```

## Getting started

### The request

To get started, you first need to instantiate the **Rodo** server doing the following:

```js
const rodo = require('rodo');
const mockServer = rodo(8000);
```

Lets start building the filtering process for a specific request:

```js
var myRequest = mockServer
  .request()
  .havingMethod('GET')
  .havingPath('/foo');
```

You can do the same by doing:

```js
var myRequest = mockServer.get('/foo');
```

Nice! Now **Rodo** will intercept every request to `GET http://localhost:8000/foo`.

### The response

Now you want **Rodo** to return a specific response to that request:

```js
var myResponse = myRequest
  .reply()
  .withHeader('content-type', 'application/json')
  .withStatus(200)
  .withBody({ bar: 'baz' });
```

You can do the same with:

```js
var myResponse = myRequest
  .reply({ bar: 'baz ' })
  .withHeader('content-type', 'application/json');
```

Good! you can now check for the requests that were resolved with that response:

```js
myResponse.calls; // [...calls]
```

You are all set, now **Rodo** will start intercepting all that requests and will return the response that you specify.

### If you now want to clear the results and start again

```js
mockServer.clean();
```

### Want to kill the server?

```js
mockServer.close();
```

## Extra server options

Aside from port and hostname, when instatiating the **Rodo** server you can optionally pass an object with any of these
extra options:

## Using multipart

Multipart will be handled using the [multiparty](https://www.npmjs.com/package/multiparty) library. An example for rodo handling multipart is:

```js
mock
  .post('/foo')
  .havingFields({ bar: 'baz' })
  .havingFiles({
    quux: (file) => file.originalFilename === 'my-file.txt'
  })
  .reply('quux');
```

#### defaultResponseDelay

Instead of using `.withDelay` explicitly on each of your response methods, you can use this option to set a default delay that
will be automatically applied to all of them. And if you have a case that needs a different value, you can still use `.withDelay`
to overwrite the default.

## API

### Constructor

#### `rodo(port?, hostname?, options?)`

- `port`: The port number of the server to be used by Rodo
- `hostname`: Hostname of the server, if needed
- `options`: Options for the server, options is an object with props, i.e.: `{ removeAfterUse: true }`
  - `removeAfterUse`: Remove call mocks after they are called

### Request methods

The filtering process for a specific request:

#### `.havingMethod(method)`

Specifies the HTTP method, should be one of GET, POST, PUT, DELETE, PATCH.

#### `.havingBody(body)`

Specifies the body, can be an object or a string.

#### `.havingFields(fields)`

Specifies the fields, should be a key-value object.

#### `.havingFiles(files)`

Specifies the files, should be a key-value object, where value should be a function that validates every file configured.

#### `.havingPath(path)`

Will intercept a specific path.

#### `.havingQuery(query)`

Will filter by query object params.

#### `.havingHeader(name, value)`

Will filter by header, only requests with the specified header and value will be intercepted.

### Response methods

The response for a specific request:

#### `.withHeader(name, value)`

Will return specific header with the response.

#### `.withBody(body)`

Will return the specified body with the response.

#### `.withFile(filePath)`

Will return the content of the given file.

#### `.withStatus(status)`

Will change the status code to the one specified.

#### `.withDelay(ms)`

Will delay the response.

### Other utilities

#### `.use((req, res) => { })`

Will add a middleware to the server.

Example:

```js
mockServer.use(morgan('dev'));
```

## License

MIT
