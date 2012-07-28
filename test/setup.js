var fork = require('child_process').fork
var fs = require('fs')

// start server
var child = fork('server.js', {env: {PORT: '1040'}, silent: true})
// write server pid to file for takedown
fs.writeFile('/tmp/free103apitest.pid', child.pid, function(err) {
  if (err) throw err
  // exit this process to end setup
  process.exit()
})

