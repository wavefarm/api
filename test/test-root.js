var assert = require('assert');
var http = require('http');

http.request({
  host: 'api.free103point9.org',
  path: '/'
}, function(res) {
  var data = '';
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    data += chunk;
  });
  res.on('end', function() {
    //console.log(data);
    var parsed = JSON.parse(data);
    assert(parsed.ok);
  });
}).end();
