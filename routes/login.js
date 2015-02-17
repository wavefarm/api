var es = require('../es')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var username  = req.parsedBody.username
    var password = req.parsedBody.password
    if (!(username && password)) {
      res.statusCode = 400
      return res.send('{"message": "Bad Request"}\n')
    }
    es.search({_types: ['user']}, {query: {
        filtered: {
          filter: {
            and: [
              {term: {name: username}},
              {term: {password: password}}
            ]
          }
        }
      }
    }, function (err, data) {
      if (err) return next(err)
      if (!data.hits.hits.length) return next()
      var user = data.hits.hits[0]._source
      res.send('{"ok":true,"user":' + JSON.stringify(user) + '}')
    })
  }
)
