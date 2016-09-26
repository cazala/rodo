# Rodo

![Rodo](http://i.ebayimg.com/images/g/PFEAAOSwmrlUsqos/s-l300.jpg)

> Http mocking service

**Rodo** can be used to create a real mocked API with an specific port and host.

The main difference with other Http mocking libraries like [`nock`](https://github.com/node-nock/nock) is that **Rodo** creates a real Http server instead of overriding the behavior of Node Http objects.

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

// Assertions  
fetch('http://localhost:8000/foo')
  .then((res) => res.json())
  .then((res) => {
    assert.equal(res.bar, 'baz');
    assert.equal(myCall.calls.length, 1);
  })
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
var myRequest = mockServer.request()
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
var myResponse = myRequest.reply()
  .withHeader('content-type', 'application/json')
  .withStatus(200)
  .withBody({ bar: 'baz' });
```

You can do the same with:

```js
var myResponse = myRequest.reply({ bar: 'baz '})
  .withHeader('content-type', 'application/json');
```

Good! you can now check for the requests that were resolved with that response:

```js
myResponse.calls; // [...calls]
```

You are all set, now **Rodo** will start intercepting all that requests and will return the response that you specify.

## API

### Request methods

The filtering process for a specific request:

#### `.havingMethod(method)`

Specifies the Http method, should be one of GET, POST, PUT, DELETE, PATCH.

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

#### `.withStatus(status)`

Will change the status code to the one specified.

## License

MIT
