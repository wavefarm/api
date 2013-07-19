var fork = require('child_process').fork
var fs = require('fs')

console.log(process.env)
// start server
var child = fork('server.js', {env: process.env})

child.on('message', function(m) {
  if (m == 'listening') {
    // write server pid to file for takedown
    fs.writeFile('/tmp/free103apitest.pid', child.pid, function(err) {
      if (err) throw err
      // exit this process to end setup
      process.exit()
    })
  }
})
