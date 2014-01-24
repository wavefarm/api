var http = require('http')
var rut = require('rut')
var stack = require('stack')

// Timestamp logs
require('logstamp')(console)

var port = process.env.PORT || process.argv[2] || 1039

stack.handler = function (req, res, err) {
  if (err) {
    console.error(err.stack)
    res.statusCode = 500
    res.end('{"message": "Internal server error"}\n')
  } else {
    console.warn('Warning: Not Found')
    res.statusCode = 404
    res.end('Not Found\n')
    res.end('{"message": "not found"}\n')
  }
}

var jsonContent = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  next()
}

var reqLog = function (req, res, next) {
  console.log(req.method, req.url)
  next()
}

http.createServer(stack(
  jsonContent,
  reqLog,
  rut('/', require('./routes')),
  rut('/search', require('./routes/search')),
  rut('/schemas', require('./routes/schemas')),
  rut('/wgxc/schedule/*', require('./routes/wgxc/schedule')),
  rut.get(/^\/(\w{6})$/, require('./routes/itemGet')),
  rut.put(/^\/(\w{6})$/, require('./routes/itemPut')),
  rut.post('/bulk', require('./routes/bulk'))
)).listen(port, function () {
  console.log('Listening on port', port)
  if (process.send) process.send('listening') // for tests
})
