require('esindexdump')(function (doc) {
  var s = doc._source
  if (s.active) {
    s.public = s.active
    delete s.active
  }
  return doc
})
