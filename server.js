var http = require('http')
var rut = require('rut')
var stack = require('stack')
var util = require('util')

var port = process.env.PORT || process.argv[2] || 1039

http.createServer(stack(
  rut('/', require('./routes')),
  rut('/search', require('./routes/search')),
  rut.post('/bulk', require('./routes/bulk'))
)).listen(port, function () {
  util.log('Listening on port '+port)
  if (process.send) process.send('listening') // for tests
})
