var request = require('request')

module.exports = function (url, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  options.url = 'http://user:pass@127.0.0.1:1040' + url
  request(options, function(err, res, body) {
    if (err) throw err
    if (!body) throw new Error('No body in response')
    cb(JSON.parse(body))
  })
}
