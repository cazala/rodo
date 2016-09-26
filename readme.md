# rodo

![Rodo](http://i.ebayimg.com/images/g/PFEAAOSwmrlUsqos/s-l300.jpg)

> Http mocking service

**Rodo** can be used to create a real mocked API with an specific port and host.

The main difference with other Http mocking libraries like [`nock`](https://github.com/node-nock/nock) is that **Rodo** creates a real Http server instead of overriding the behavior of Node Http objects.

## Install

```
npm install rodo
```

## Usage

Writing a new mocked endpoint can be as easy as:

```js
// Mocking API
const assert = require('assert');
const rodo = require('rodo');
const mockApi = rodo(8000);
const myCall = mockApi
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

## License

MIT
