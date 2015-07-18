var es = require('../es')
var genid = require('../lib/genid')
var genb = require('../lib/genb')

module.exports = function (req, res, next, id, startDate, endDate) {
	
	var debug = true;
	
  es.get({_type: '_all', _id: id}, function (err, data) {
  	
  	
    if (err) return next() // 404 on any error

    if (data['_type']!='show') return next() // 404 on any error
    
    //console.log(data['_type']);
    //console.log(data['_source']['id']);
    //console.log(startDate);
    //console.log(endDate);
    
    show = data._source;
            
    broadcasts = genb(show,startDate,endDate);
    
    if (debug) {
	    debugStr = '';
	    for(i in broadcasts) {
	    	broadcast = broadcasts[i];
	      //console.log(broadcast);
	    	if (debugStr.length>0) debugStr = debugStr.concat(',');
	    	debugStr = debugStr.concat(broadcast.id);
	    }
	    debugStr = data['_source']['id'].concat(' {',debugStr,'}');

	    console.log(debugStr);
	    //res.send(JSON.stringify(debugStr));
	    //return debugStr;
    }
    

    if (!show.broadcasts)
    	show.broadcasts = [];

    processedCount = 0;
    
    // save the new broadcasts
    for(i in broadcasts) {
    	broadcast = broadcasts[i];
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
    
        
    console.log(broadcasts);
    
    
    //res.send(JSON.stringify(data._source))
    
    
    res.send(JSON.stringify(broadcasts))
  })
}
