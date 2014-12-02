# requestdb

A wrapper for the [request](https://www.npmjs.org/package/request) module that
stores and retrieves responses from a leveldb cache.

## usage

```js
var requestdb = require('requestdb')
var request = requestdb('./yourdb')
```

You can now use `request` like you would expect from the module, e.g.
```js
request('https://github.com/request/request', function (e, resp, body) {
  console.log(body)
})
```