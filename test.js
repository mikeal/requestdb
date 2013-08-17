var requestdb = require('./')
  , request = requestdb('./testdb')
  ;

request('http://www.google.com', function (e, resp, body) {
  console.log(e, resp.statusCode, body.length)
})