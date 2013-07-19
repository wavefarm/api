var es = require('../es')
var url = require('url')

module.exports = function(req, res, next) {
  var query = url.parse(req.url, true).query.q
  if (!query) {
    res.writeHead(400)
    res.end('{"message": "Please supply a q parameter"}\n')
  }
  es.search({
    _types: ['artist', 'work', 'event', 'audio', 'video', 'image', 'text']
  }, {
    filter: {and: [
      {term: {active: true}},
      {term: {sites: 'transmissionarts.org'}}
    ]},
    query: {query_string: {
      'default_operator': 'AND',
      query: (function(q) {
        // if no colon in q (no fields specified) duplicate query
        // in ORed "main" field for better relevancy
        if (q.indexOf(':') == -1) {
          return q+' OR main:('+q+')';
        }
        return q;
      })(query)
    }},
    size: 300
  }, function(err, data) {
    if (err) {
      next(err)
    }
    res.end(JSON.stringify(data))
  })
}
