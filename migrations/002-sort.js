var docStream = require('elasticsearch-doc-stream')
var http = require('http')
var url = require('url')

var d = docStream({url: process.env.ESURL});

var data = '';

d.on('data', function (doc) {
  var s = doc._source
  s.sort = s.sortName || s.main
  delete s.sortName
  delete s.nonsort
  data += JSON.stringify({index: {
    _type: doc._type,
    _id: doc._id
  }}) + '\n'
  data += JSON.stringify(s) + '\n'
});

d.on('error', function (err) {
  console.error(err)
});

d.on('end', function () {
  //process.stdout.write(data)
  if (!data) return console.log('0 hits')

  var opt = url.parse(process.env.ESURL + '/_bulk')
  opt.method = 'POST'
  http.request(opt, function (res) {
    res.pipe(process.stdout)
  }).on('error', function (err) {
    console.error(err)
  }).end(data)
})
