var bcrypt = require('bcryptjs')
var es = require('../es')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    function save () {
      item.id = req.params[0]
      es.index({_type: item.type, _id: item.id}, JSON.stringify(item), function (err, data) {
        if (err) return next(err)
        res.send('{"ok": true}')
      })
    }

    var item = req.parsedBody;
    if (!item.type) return next({status: 422, message: 'Item must have a type.'});
    var schema = schemas[item.type];
    if (!schema) return next({status: 422, message: 'No schema found for that type.'});
    var fields = Object.keys(schema.fields)
    var pending = fields.length
    fields.forEach(function (fieldname) {
      var field = schema.fields[fieldname]
      if (field.type && field.type.indexOf('rel') === 0) {
        // TODO retrieve mains for related items
      } else if (field.type === "password") {
        return bcrypt.hash(item[fieldname], 8, function (err, hash) {
          if (err) return next(err)
          item[fieldname] = hash
          --pending || save()
        })
      }
      --pending || save()
    })
  }
)
