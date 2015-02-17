var es = require('../es')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var field, schema, item = req.parsedBody;
    res.invalid = function (errMessage) {
      res.statusCode = 422;
      return res.send('{"message":"'+errMessage+'"}');
    };
    if (!item.type) return res.invalid('Item must have a type.');
    schema = schemas[item.type];
    if (!schema) return res.invalid('No schema found for that type.');
    schema.item.forEach(function (fieldName) {
      field = schema.fields[fieldName];
      if (field.type && field.type.indexOf('rel') === 0) {
        // TODO retrieve mains for related items
      }
    });
    var id = req.params[0]
    es.index({_type: item.type, _id: id}, req.body, function (err, data) {
      if (err) return next(err)
      res.send('{"ok": true}')
    })
  }
)
