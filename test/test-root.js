var assert = require('assert')
var request = require('request')

request('http://127.0.0.1:1040', function(err, res, body) {
  var parsed = JSON.parse(body)
  assert(parsed.ok)
})
