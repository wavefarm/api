var es = require('../../es')
var schemas = require('../../schemas')
var url = require('url')


module.exports = function (req, res, next) {
  var date = req.params[0]
  var queryBody = {
    query: {
      // TODO We should be able to do this with a filter
      field: {categories: 'WGXC: Hands-on Radio (90.7-FM) Event'}
    },
    filter: {
      and: [
        {term: {active: true}},
        {term: {startDate: date}},
      ]
    },
    sort: [{start: 'asc'}]
  }
  es.search({_types: 'event'}, queryBody, function (err, data) {
    if (err) return next(err)
    res.send(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
        return hit._source
      })
    }))
  })
};
