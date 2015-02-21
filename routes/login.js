var bcrypt = require('bcryptjs')
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
      return next({status: 400, message: 'Bad Request'})
    }
    var filter = {term: (token ? {token: token} : {name: username})}
    es.search({_type: 'user'}, {query: {
        filtered: {filter: filter}
      }
    }, function (err, data) {
      if (err) return next(err)
      if (!data.hits.hits.length) return next({status: 401, message: 'Unauthorized'})
      var user = data.hits.hits[0]._source
      if (token) return res.send(JSON.stringify(user))
      bcrypt.compare(password, user.password, function (err, auth) {
        if (err) return next(err)
        if (!auth) return next({status: 401, message: 'Unauthorized'})
        res.send(JSON.stringify(user))
      })
    })
  }
)
