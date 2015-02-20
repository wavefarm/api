var es = require('../es')
var scalpel = require('scalpel')
var schemas = require('../schemas')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var username  = req.parsedBody.username
    var password = req.parsedBody.password
    var token = req.parsedBody.token
    if (!(username && password) && !token) {
      return next({status: 400, message: "Bad Request"})
    }
    var filter = token ? {term: {token: token}} : {
      and: [
        {term: {name: username}},
        {term: {password: password}}
      ]
    }
    es.search({_type: 'user'}, {query: {
        filtered: {filter: filter}
      }
    }, function (err, data) {
      if (err) return next(err)
      if (!data.hits.hits.length) return next({status: 401, message: "Unauthorized"})
      var user = data.hits.hits[0]._source
      res.send(JSON.stringify(user))
    })
  }
)
