var requestdb = require('./')
  , request = requestdb('./testdb')
  , nock = require('nock')
  , rimraf = require('rimraf')
  , t = require('assert')
  , ok = require('okdone')
  ;

// nock mocks http endpoints and throws an error on second request
nock('http://www.mycoolwebsite.io')
  .get('/')
  .reply(200, 'Under Construction')

rimraf('./testdb', function () {
  request('http://www.mycoolwebsite.io/', function (e, resp, body) {
    t.ifError(e)
    t.equal(resp.statusCode, 200)
    t.equal(body, 'Under Construction')
    ok('first request')
    request('http://www.mycoolwebsite.io/', function (e, resp, body) {
      t.ifError(e)
      t.equal(resp.statusCode, 200)
      t.equal(body, 'Under Construction')
      ok('second request cached')
      ok.done()
    })
  })
})

