var es = require('../es')
var schemas = require('../schemas')
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
  var params = url.parse(req.url, true).query
  var search = {
    query: {filtered: {}},
    sort: [
      {timestamp: 'desc'}
    ]
  }
  if (params.q) {
    search.query.filtered.query = {
      query_string: {
        'default_operator': 'AND',
        query: enhanceQuery(params.q)
      }
    }
    // When there's a q we sort by relevance
    delete search.sort
  }
  if (params.date) {
    search.query.filtered.filter = {
      or: [
        {
          range: {
            'date.sort': {
              gte: params.date,
              lte: params.date
            }
          }
        },
        {
          and: [
            {
              range: {
                start: {
                  lte: params.date
                }
              }
            },
            {
              range: {
                end: {
                  gte: params.date
                }
              }
            }
          ]
        }
      ]
    }
  }
  if (params.date2) {
    search.query.filtered.filter.or[0].range['date.sort'].lte = params.date2
    search.query.filtered.filter.or[1].and[0].range.start.lte = params.date2
  }
  if (params.from) search.from = params.from
  if (params.size) search.size = params.size
  es.search({_types: Object.keys(schemas)}, search, function (err, data) {
    if (err) return next(err)
    res.send(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
        return hit._source
      })
    }))
  })
}
