var http = require('http')
var rut = require('rut')
var stack = require('stack')

// Timestamp all output
require('log-timestamp')

var port = process.env.PORT || process.argv[2] || 1039

stack.errorHandler = function (req, res, err) {
  console.error(err)
  res.writeHead(500)
  res.end('{"message": "Internal server error"}\n')
}

stack.notFoundHandler = function (req, res) {
  console.warn('Warning: Not Found')
  res.writeHead(404)
  res.end('{"message": "not found"}\n')
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
  rut.get(/^\/(\w{6})$/, require('./routes/itemGet')),
  rut.post('/bulk', require('./routes/bulk'))
)).listen(port, function () {
  console.log('Listening on port', port)
  if (process.send) process.send('listening') // for tests
})
