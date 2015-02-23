var http = require('http')
var rut = require('rut')
var stack = require('stack')


var port = process.env.PORT || process.argv[2] || 1039

stack.handler = function (req, res, err) {
  if (err) {
    if (err.status) {
      res.statusCode = err.status
      return res.send('{"message": "' + err.message + '"}')
    }
    console.error(err.stack)
    res.statusCode = 500
    return res.send('{"message": "Internal Server Error"}')
  }
  console.warn('Warning: Not Found')
  res.statusCode = 404
  res.send('{"message": "Not Found"}')
}

var cors = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}

var jsonContent = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')

  // Provide a method that sets content length to avoid 
  // transer-encoding: chunked in old nginx
  res.send = function (content) {
    res.setHeader('Content-Length', Buffer.byteLength(content))
    res.end(content + '\n')
  }

  next()
}

var reqLog = function (req, res, next) {
  console.log(req.method, req.url)
  next()
}

http.createServer(stack(
  cors,
  jsonContent,
  reqLog,
  rut('/', require('./routes')),
  rut('/search', require('./routes/search')),
  rut('/schemas', require('./routes/schemas')),
  rut('/wgxc/schedule/*', require('./routes/wgxc/schedule')),
  rut.post('/login', require('./routes/login')),
  rut.get(/^\/(\w{6})$/, require('./routes/item-get')),
  rut.put(/^\/(\w{6})$/, require('./routes/item-put')),
  rut.post('/bulk', require('./routes/bulk'))
)).listen(port, function () {
  console.log('Listening on port', port)
  if (process.send) process.send('online')
})
