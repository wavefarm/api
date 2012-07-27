var assert = require('assert')
var fork = require('child_process').fork
var request = require('request')

var child = fork('server.js', {env: {PORT: '1040'}})

child.on('message', function(m) {
  if (m == 'listening') {
    request('http://127.0.0.1:1040', function(err, res, body) {
      var parsed
      console.log(body)
      try {
        parsed = JSON.parse(body)
      } catch (e) {
        assert(false, 'should be able to parse body')
        return child.kill()
      }
      assert(parsed.ok)
      child.kill()
    })
  }
})
