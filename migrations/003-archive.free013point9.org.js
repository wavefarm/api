var docStream = require('elasticsearch-doc-stream')
var http = require('http')
var url = require('url')

var d = docStream({
  url: process.env.ESURL,
  search: {
    query: {
      //constantScore: {
      //  filter: {
      //    query: {
            match: {
              url: 'archive.free103point9'
            }
            //prefix: {url: 'http://archive.free103point9.org'}
          }
    //    }
    //  }
    //}
  }
});

var data = '';
var count = 0;

d.on('data', function (doc) {
  count++
  var s = doc._source
  s.url = s.url.replace('http://archive.free103point9.org', 'https://data.wavefarm.org')
  console.log(s)
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
  console.log('Count:', count)
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
