var es = require('../es')
var genid = require('../lib/genid')
var genb = require('../lib/genb')
var scalpel = require('scalpel')
var stack = require('stack')

//module.exports = function (req, res, next, id, startDate, params.genbEnd) {
module.exports = stack(
  scalpel,
  function (req, res, next) {
			
		if (!req.user) return next({status: 401, message: 'Unauthorized'});
		 
	  var params = req.parsedBody
		  
	  if (!params || !params.id || !params.startDate || !params.endDate) {
	  	 return next({status: 400, message: 'id, genb start and genb end required'})
	  }
	  
	  var today = new Date()
	  var validateDate = new Date(params.startDate)	  
	  var validYearLimit = 3
	  var maxBroadcasts = 500
	  
	  if (!validateDate 
	  		|| validateDate.getFullYear() > today.getFullYear()+validYearLimit 
	  		|| validateDate.getFullYear() < today.getFullYear()-validYearLimit) {
	  	 return next({status: 400, message: 'Year of start date must be within '+validYearLimit+' years'})
	  }
	  var validateDate = new Date(params.endDate)	  
	  if (!validateDate 
	  		|| validateDate.getFullYear() > today.getFullYear()+validYearLimit 
	  		|| validateDate.getFullYear() < today.getFullYear()-validYearLimit) {
	  	 return next({status: 400, message: 'Year of end date must be within '+validYearLimit+' years'})
	  }
	  	  	
	  es.get({_type: '_all', _id: params.id}, function (err, data) {
	  		  	
	    if (err) return next() // 404 on any error	
	    if (data['_type']!='show') return next() // 404 on any error
	        
	    show = data._source;

	    if (!show.genbAirtime && !show.airtime) {
		  	 return next({status: 400, message: "airtime or genb airtime required"})
	    }
	    
	    
	    broadcasts = genb(show,params.startDate,params.endDate);
	    
	    if (broadcasts instanceof Error || broadcasts instanceof String) {
		  	 return next({status: 400, message: broadcasts})
	    }
	    
		  if (broadcasts.length > maxBroadcasts) {
		  	 return next({status: 400, message: 'Too many broadcasts (max ='+maxBroadcasts+')'})
		  }
	    	    
	    if (!params.test) {
		    if (!show.broadcasts)
		    	show.broadcasts = [];
		    
		    processedCount = 0;
		    
		    function save (broadcast) {
		    	
		      var broadcastStr = JSON.stringify(broadcast)
		      es.index({_id: broadcast.id, _type:'broadcast'}, broadcastStr, function (err) {
		      	processedCount++;
		        if (err) 
		        	console.error(err)
		        else
		        	// push the new broadcast id onto the show if no error for saving below
		        	show.broadcasts.push({id: broadcast.id, main: broadcast.main})
		
		        // save the show if all broadcasts have processed
		        if (processedCount==broadcasts.length) {
		          var showStr = JSON.stringify(show)
		          es.index({_id: show.id, _type: 'show'}, showStr, function (err) {
		            if (err) console.error(err)
		          })
		        }
		      })            
		    }
		    
		    for(i in broadcasts) {
		    	save(broadcasts[i]);
		    }    
	    }
	    
	    
	    res.send(JSON.stringify(broadcasts))
	  })
	}
)
