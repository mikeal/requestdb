var levelup = require('levelup')
  , request = require('request')
  , _ = require('lodash')
  , safeStringify = require('json-stringify-safe')
  ;

function parseargs (args) {
  var opts = {}
  if (typeof args[0] === 'string') opts.url = args[0]
  else if (typeof args[0] === 'object') _.extend(opts, args[0])
  else throw new Error("Don't understand argument type at arguments 0 "+args[0])

  if (typeof args[1] === 'object') _.extend(opts, args[1])
  else if (typeof args[1] === 'function') opts.callback = args[1]
  else if (typeof args[1] !== 'undefined') throw new Error("Don't understand argument type at arguments 1 "+args[1])

  if (typeof args[2] === 'function') opts.callback = args[2]
  else if (typeof args[2] !== 'undefined') throw new Error("Don't understand argument type at arguments 2 "+args[2])

  if (opts.url) opts.uri = opts.url
  if (opts.uri) opts.url = opts.uri

  return opts
}

function ProxyRequest () {} // TODO.

function RequestDatabase (filename, opts) {
  if (!opts) opts = {}
  opts.valueEncoding = 'json'
  this.store = levelup(filename, opts)
}
var methods = ['delete', 'put', 'get', 'head', 'post']
_.each(methods,
  function (method) {
    RequestDatabase.prototype[method] = function () {
      var opts = parseargs(Array.prototype.slice.call(arguments))
      opts.method = method.toUpperCase()
      return this._request(opts)
    }
  }
)
RequestDatabase.prototype.del = RequestDatabase.prototype.delete
RequestDatabase.prototype.request = RequestDatabase.prototype.get

var props =
  [ 'httpVersion'
  , 'headers'
  , 'trailers'
  , 'method'
  , 'statusCode'
  , 'httpVersionMajor'
  , 'httpVersionMinor'
  ]

function serializeResponse (resp) {
  return _.pick.apply(_, [resp].concat(props))
}

RequestDatabase.prototype._request = function (opts) {
  var self = this
  if (opts.method !== 'GET') return request(opts)
  if (opts.url) {
    self.store.get(opts.url, function (e, data) {
      if (e || data.e) {
        request.get(opts, function (e, resp, body) {
          data = { body: body, resp: serializeResponse(resp), e:e }
          data.resp.fromCache = false
          if (e || resp.statusCode === 403) {
            opts.callback(data.e, data.resp, data.body)
          } else {
            self.store.put(opts.url, data, function (e) {
              opts.callback(data.e, data.resp, data.body)
            })
          }
        })
      } else {
        data.resp.fromCache = true
        opts.callback(data.e, data.resp, data.body)
      }
    })
  }
}

module.exports = function (dbopt) {
  var db = new RequestDatabase(dbopt)
    , ret = function () { return db.request.apply(db, arguments) }
    ;
  _.each(_.keys(RequestDatabase.prototype), function (key) {
    ret[key] = function () { return db[key].apply(db, arguments) }
  })
  ret.db = db
  return ret
}


