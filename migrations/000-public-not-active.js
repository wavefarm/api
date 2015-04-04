var fs = require('fs')

require('esindexdump')({
  url: process.env.ESURL,
  out: fs.createWriteStream('data.ldj')
}, function (err, doc) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  var s = doc._source
  if (s.active) {
    s.public = s.active
    delete s.active
  }
  return doc
})
