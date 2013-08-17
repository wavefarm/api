var es = require('../es')
var scalpel = require('scalpel')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var item = req.parsedBody
    if (!item.type) {
      res.statusCode = 400
      return res.end('{"message": "Item must have a type"}')
    }
    var id = req.params[0]
    es.index({_type: item.type, _id: id}, req.body, function (err, data) {
      if (err) return next(err)
      res.end('{"ok": true}')
    })
  }
)
