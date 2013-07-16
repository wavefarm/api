var fs = require('fs')

// get server pid
fs.readFile('/tmp/free103apitest.pid', 'utf8', function(err, data) {
  if (err) throw err
  // exit server
  process.kill(data)
})
