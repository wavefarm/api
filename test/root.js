var assert = require('assert')
var request = require('./tools/request')

request('/', function(body) {
  assert(body.ok)
})
