var bcrypt = require('bcryptjs')
var es = require('../es')
var genid = require('../lib/genid')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var item = req.parsedBody;

    function save () {
      var options = {_type: item.type}
      if (req.params.length) {
        item.id = req.params[0]
      } else {
        item.id = genid()
        options.create = true
      }
      options._id = item.id
      es.index(options, JSON.stringify(item), function (err) {
        if (err) return next(err)
        res.send(JSON.stringify(item))
      })
    }

    if (!item.type) return next({status: 422, message: 'Item must have a type.'});
    var schema = schemas[item.type];
    if (!schema) return next({status: 422, message: 'No schema found for that type.'});
    var fields = Object.keys(schema.fields)
    var pending = fields.length
    fields.forEach(function (fieldname) {
      var field = schema.fields[fieldname]
      if (field.type && field.type.indexOf('rel') === 0) {
      } else if (field.type === "password" && item[fieldname].indexOf('$2a$08$') !== 0) {
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
