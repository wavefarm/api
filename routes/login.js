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
      if (!data.hits.hits.length) {
        res.statusCode = 401
        return res.send('{"message": "Unauthorized"}')
      }
      var user = data.hits.hits[0]._source
      res.send(JSON.stringify(user))
    })
  }
)
