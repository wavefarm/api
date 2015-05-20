var es = require('../../es')
var genid = require('../../lib/genid')
var mail = require('../../mail')

module.exports = function (req, res, next) {
  	  	
  req.body = ''
  req.setEncoding('utf8')
  req.on('data', function(chunk) {req.body += chunk})
  req.on('end', function() {
  	
    var i, parser, ct = req.headers['content-type']
    if (!req.body) return next()
    try {
      req.parsedBody = JSON.parse(req.body)
    } catch (e) {
      // just pass body as string if it can't be parsed
    }
		
	  var item = req.parsedBody
	  if (!item) return next({status: 422, message: 'Must include item in post'});
	
	  var now = (new Date()).toISOString()
	  var options = {
	    _id: genid(),
	    _type: 'event',
	    create: true
	  }
	
	  item.id = options._id
	  item.type = options._type
	  item.main = item.name
	  item.timestamp = now
	  item.public = false

	  if (typeof(item.source)!='undefined' && item.source=='ta') {
		  item.categories = ['TA International Calendar']	  		  	
		  item.sites = ['transmissionarts'];	  		  	
	  }
	  else {
		  item.categories = ['WGXC Community Calendar Event']	  	
		  item.sites = ['wgxc'];	  		  	
	  }
	  
	  if (typeof(item.source)!='undefined') {
	  	delete item['source'];
	  }	  
	
	  var itemStr = JSON.stringify(item)
	  es.index(options, itemStr, function (err) {
	    if (err) return next(err)
	    res.send(itemStr)
	  })
	
	  // send mail to admin
	  // TODO: request is to notify info@wgxc.org for WGXC and info@wavefarm.ort for TA.
	  mail('The following event was added by ' + item.email + ':\nhttps://wavefarm.org/admin/' + item.id)
	  
  })
	
	
	  
}

