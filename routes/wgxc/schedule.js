var es = require('../../es')
var schemas = require('../../schemas')
var url = require('url')


module.exports = function (req, res, next) {
  var date = req.params[0]
  var queryBody = {
    filter: {
      and: [
        {term: {active: true}},
        {
          range: {
            start: {
              from: date + 'T00:00:00',
              to: date + 'T23:59:59'
            }
          }
        }
      ]
    },
    sort: [{start: 'asc'}]
  }
  es.search({_type: 'broadcast'}, queryBody, function (err, data) {
    if (err) return next(err)
    res.send(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
        return hit._source
      })
    }))
  })
};
