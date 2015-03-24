var docStream = require('elasticsearch-doc-stream');

var mimetypes = {
  audio: {},
  image: {},
  text: {},
  video: {}
};

var d = docStream({
  url: process.env.ESURL,
  search: {
    query: {
      filtered: {
        filter: {
          or: [
            {type: {value: "audio"}},
            {type: {value: "image"}},
            {type: {value: "text"}},
            {type: {value: "video"}}
          ]
        }
      }
    }
  }
});

d.on('data', function (doc) {
  var type = doc._type;
  var mimetype = doc._source.mimetype;
  if (mimetypes[type][mimetype]) mimetypes[type][mimetype]++;
  else mimetypes[type][mimetype] = 1;
});

d.on('error', function (err) {
  console.error(err);
});

d.on('end', function () {
  console.log(mimetypes);
  process.exit();
});
