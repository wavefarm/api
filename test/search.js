var assert = require('assert')
var request = require('./tools/request')

request('/search?q=bob', function (body) {
  assert(body.ok)
});
