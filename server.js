var es = require('es')
var http = require('http')
var stack = require('stack')
var url = require('url')
var util = require('util')

var port = process.env.PORT || 1039

http.createServer(stack(
  function(req, res, next) {
    res.end('{"ok":true}')
    //es.request({
    //  path: '/free103/_status',
    //  res: res,
    //  respond: true
    //})
  }
)).listen(port, function() {
  util.log('Listening on port '+port)
  // for tests
  if (process.send) process.send('listening')
})

//app.get('/search', function(req, res) {
//  es.request({
//    path: '/free103/_search' + url.parse(req.url).search,
//    res: res,
//    respond: true
//  })
//})
