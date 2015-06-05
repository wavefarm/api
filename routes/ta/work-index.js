var es = require('../../es')
var url = require('url')

module.exports = function (req, res, next) {
	
  var queryQuery = false;
  var letterQuery = false;

  var params = url.parse(req.url, true).query		
  if (params.q) {
  	queryQuery = {
			match: {
        'main' : {
          'query' : params.q,
          'operator' : 'and'
        }
			}
  	}  	
  }
    
  if (req.params.length>0 && req.params[0]) {
	  var letter = req.params[0]    
	  if (letter == '0') {
	  	letterQuery = {range: {'sort.folded': {from: '0', to: '9', include_upper: true}}};
	  } else {
	  	letterQuery = {prefix: {'sort.folded': letter.toLowerCase()}};
	  }  
  }  
    
  var queryBody = {
    size: (queryQuery||letterQuery)?1000:10,
    filter: {
      and: [
        {
          or: [
            {term: {active: true}},
            {term: {public: true}}
          ]
        }
      ]
    },
    _source: ['id','type','main','description','sort','date','yearOnly','credit'],    
    sort: [{main: 'asc'}]
  }
  
	if (letterQuery)
		queryBody.filter.and.push(letterQuery);
  if (queryQuery)
  	queryBody.query = queryQuery;
    
  es.search({_type: 'work'}, queryBody, function (err, data) {
    if (err) return next(err)
    res.send(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
        return hit._source
      })
    }))
  })
};


