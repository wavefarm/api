var es = require('../../es')
var genid = require('../../lib/genid')
var mail = require('../../mail')
var scalpel = require('scalpel')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
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
    item.categories = ['WGXC Community Calendar Event']

    var itemStr = JSON.stringify(item)
    es.index(options, itemStr, function (err) {
      if (err) return next(err)
      res.send(itemStr)
    })

    // send mail to admin
    mail('The following event was added by ' + item.email + ':\nhttps://wavefarm.org/admin/' + item.id)
  }
)
