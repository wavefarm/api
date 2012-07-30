var es = require('es')
var rut = require('rut')
var stack = require('stack')

module.exports = stack(
  rut('/', function(req, res) {
    res.end('{"ok":true}')
    //es.request({
    //  path: '/free103/_status',
    //  res: res,
    //  respond: true
    //})
  }),
  rut('/search', function(req, res) {
    res.end('{"ok":true}')
    //es.request({
    //  path: '/free103/_search' + url.parse(req.url).search,
    //  res: res,
    //  respond: true
    //})
  })
)
