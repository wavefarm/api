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
  var dateFilter
  var sortArray
  var search = {
    // Must have something in the "and" array
    query: {filtered: {filter: {and: [{match_all: {}}]}}},
    sort: [
      {timestamp: 'desc'}
    ]
  }
  if (req.user) {
    // TODO set more filters based on req.user.permissions
  } else {
    search.query.filtered.filter.and.push({or: [
      {term: {active: true}},
      {term: {public: true}}
    ]})
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
    dateFilter = {
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
    if (params.date2) {
      dateFilter.or[0].range['date.sort'].lte = params.date2
      dateFilter.or[1].and[0].range.start.lte = params.date2
    }
    search.query.filtered.filter.and.push(dateFilter)
  }
  if (params.from) search.from = params.from
  if (params.size) search.size = params.size
  if (params.sort) {
    // Parse sort param like "-date.sort,name"
    search.sort = params.sort.split(',').map(function (s) {
      var so = {}
      if (s.charAt(0) === '-') {
        so[s.substr(1)] = 'desc'
      } else {
        so[s] = 'asc'
      }
      return so
    })
  }
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
