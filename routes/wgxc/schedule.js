var es = require('../../es')

module.exports = function (req, res, next) {
  var date = req.params[0]
  var queryBody = {
    filter: {
      and: [
        {
          or: [
            {term: {active: true}},
            {term: {public: true}}
          ]
        },
        {
          range: {
            start: {
              from: date + 'T00:00:00',
              to: date + 'T23:59:59'
            }
          }
        },
        {
          term: {sites: 'wgxc'},
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
