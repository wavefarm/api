var docStream = require('elasticsearch-doc-stream');

var count = 0;

var d = docStream({
  url: process.env.ESURL,
  search: {
    query: {
      filtered: {
        filter: {
          and: [
            {type: {value: "event"}},
            {missing: {field: "start"}}
          ]
        }
      }
    }
  }
});

d.on('data', function (doc) {
  count++;
  console.log(doc._id, doc._source.name);
});

d.on('error', function (err) {
  console.error(err);
});

d.on('end', function () {
  console.log('\nTotal:', count);
});
