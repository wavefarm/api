var assert = require('assert')
var request = require('request')

request('http://127.0.0.1:1040/search?q=bob', function(err, res, body) {
  var parsed
  //console.log(body)
  try {
    parsed = JSON.parse(body)
  } catch (e) {
    assert(false, 'should be able to parse body')
  }
  assert(parsed.ok)
})
