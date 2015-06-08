var bcrypt = require('bcryptjs')
var es = require('../es')
var genid = require('../lib/genid')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

function getRelIdObj (arr) {
  var o = {}
  var rel;
  if (!arr || !arr.length) return o
  for (var i = 0; i < arr.length; i++) {
    rel = arr[i]
    o[rel.id] = 1
  }
  return o
}

function itemBefore (req, res, next) {
  var id = req.params[0]
  if (!id) return next()

  es.get({_type: '_all', _id: id}, function (err, data) {
    if (err) {
      console.error('Error retrieving before item for ' + id)
      return next() // just skip on any error
    }
    req.before = data._source
    next()
  })
}

module.exports = stack(
  scalpel,
  itemBefore,
  function (req, res, next) {
    var item = req.parsedBody
    var before = req.before || {}
    var now = (new Date()).toISOString()

    function save () {
      var options = {_type: item.type}
      if (req.params.length) {
        item.id = req.params[0]
      } else {
        item.id = genid()
        options.create = true
      }
      options._id = item.id
      item.timestamp = now
      var itemStr = JSON.stringify(item)
      es.index(options, itemStr, function (err) {
        if (err) return next(err)
        res.send(itemStr)
      })
    }

    if (!item.type) return next({status: 422, message: 'Item must have a type.'});

    var schema = schemas[item.type];
    if (!schema) return next({status: 422, message: 'No schema found for that type.'});

    item.main = item[schema.main]
    item.sort = item.sort || item.main

    var pending = schema.fields.length
    schema.fields.forEach(function (field) {
      var value = item[field.name]
      var valueBefore = before[field.name]

      if (field.type && field.type.indexOf('rel') === 0) {
        var relType = field.type.substr(4)
        var schemaOther = schemas[relType]

        var fieldOther
        var fieldsOther = schemaOther.fields
        var relFieldName
        for (var i = 0; i < fieldsOther.length; i++) {
          fieldOther = fieldsOther[i]
          if (fieldOther.type === 'rel:' + item.type) {
            relFieldName = fieldOther.name
            break
          }
        }

        // Convert arrays to objects for comparison
        var relIds = getRelIdObj(value)
        var relIdsBefore = getRelIdObj(valueBefore)

        // For each missing, drop relation on the other side
        Object.keys(relIdsBefore).forEach(function (id) {
          if (relIds[id]) return

          es.get({_type: '_all', _id: id}, function (err, data) {
            if (err) return console.error('Error retrieving related item for ' + id)
            var itemOther = data._source
            var relsOther = itemOther[relFieldName]
            if (!relsOther) return console.error('No reference back to ' + item.type + ' in ' + id)

            itemOther[relFieldName] = relsOther.filter(function (relOther) {
              return relOther.id !== item.id
            })
            var itemStr = JSON.stringify(itemOther)
            es.index({_id: data._id, _type: data._type}, itemStr, function (err) {
              // Might be hard to tie errors back to request since we aren't
              // waiting but still better than hiding it completely
              if (err) console.error(err)
            })
          })
        })

        // For each new relation, add to other side
        Object.keys(relIds).forEach(function (id) {
          if (relIdsBefore[id]) return

          es.get({_type: '_all', _id: id}, function (err, data) {
            if (err) return console.error('Error retrieving related item for ' + id)
            var itemOther = data._source
            var relsOther = itemOther[relFieldName]

            if (relsOther) {
              // Guard against adding the same relation multiple times
              relsOther = relsOther.filter(function (relOther) {
                return relOther.id !== item.id
              })
            } else relsOther = []

            relsOther.push({id: item.id, main: item.main})
            itemOther[relFieldName] = relsOther

            var itemStr = JSON.stringify(itemOther)
            es.index({_id: data._id, _type: data._type}, itemStr, function (err) {
              // Might be hard to tie errors back to request since we aren't
              // waiting but still better than hiding it completely
              if (err) console.error(err)
            })
          })
        })

        // Don't bother waiting to hear back from related before saving
        --pending || save()
      } else if (field.type === 'password' && value.indexOf('$2a$08$') !== 0) {
        return bcrypt.hash(value, 8, function (err, hash) {
          if (err) return next(err)
          item[field.name] = hash
          --pending || save()
        })
      } else if (field.name === 'token') {
        item.token = genid(14)
      }
      --pending || save()
    })
  }
)
