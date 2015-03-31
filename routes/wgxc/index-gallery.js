var es = require('../../es')

module.exports = function (req, res, next) {
	var d = new Date();
  var date = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  
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
        	or: [
		        {
		            range: {
		              start: {
		                from: date + 'T00:00:00'
		              }
		            }
		        },
		        {
		          range: {
		            startDate: {
		              from: date + 'T00:00:00'
		            }
		          }
		        }
	        ]
        },                
        {
          term: {sites: 'wgxc'},
        },
        {
          term: {featured: true},
        },
        {
          exists : { field : 'featuredImage' }
        }        
      ]
    },
    _source: ['id','main','type','featuredImage','featuredImageCredit',
              'startDate','startTime','endData','endTime','start','end',
              'shows.main','locations.main'],
    sort: [{start: 'asc'}]
  }
  es.search({_type: 'broadcast,event'}, queryBody, function (err, data) {
    if (err) return next(err)
        
    res.send(JSON.stringify({
      total: data.hits.total,
      hits: data.hits.hits.map(function (hit) {
          return hit._source
        })
    }))
  })
};
