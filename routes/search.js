var es = require('../es')
var url = require('url')

function enhanceQuery (q) {
  // if no colon in q (no fields specified) duplicate query
  // in ORed "main" field for better relevancy
  if (q.indexOf(':') == -1) {
    q = q+' OR main:('+q+')'
  }
  return q
}

module.exports = function (req, res, next) {
  var queryString = url.parse(req.url, true).query.q
  var queryBody = {
    filter: {and: [
      {term: {active: true}},
      {term: {sites: 'transmissionarts.org'}}
    ]}
  }
  if (queryString) {
    queryBody.query = {
      query_string: {
        'default_operator': 'AND',
        query: enhanceQuery(queryString)
      }
    }
  } else {
    queryBody.query = {
      match_all: {}
    }
    queryBody.sort = [
      {timestamp: 'desc'}
    ]
  }
  es.search({
    _types: ['artist', 'work', 'event', 'audio', 'video', 'image', 'text']
  }, queryBody, function (err, data) {
    if (err) return next(err)
    res.end(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
        return hit._source
      })
    }))
  })
}
