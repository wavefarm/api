var assert = require('assert');
var http = require('http');

http.request({
  host: 'api.free103point9.org',
  path: '/search?q=bob'
}, function(res) {
  var data = '';
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    data += chunk;
  });
  res.on('end', function() {
    var parsed = JSON.parse(data);
    assert(!parsed.timed_out);
  });
}).end();

