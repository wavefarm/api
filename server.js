var http = require('http')
var router = require('./router')
var util = require('util')

var port = process.env.PORT || 1039

http.createServer(router).listen(port, function() {
  util.log('Listening on port '+port)
  // for tests
  if (process.send) process.send('listening')
})
