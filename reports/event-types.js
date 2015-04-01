var docStream = require('elasticsearch-doc-stream');

var categories = {};

var d = docStream({
  url: process.env.ESURL,
  search: {
    query: {
      filtered: {
        filter: {
          type: {value: "event"}
        }
      }
    }
  }
});

d.on('data', function (doc) {
  var cats = doc._source.categories;
  if (!cats) return console.log(doc._source);
  // else console.log(doc._source);
  cats.forEach(function (cat) {
    if (categories[cat]) categories[cat]++;
    else categories[cat] = 1;
  });
});

d.on('error', function (err) {
  console.error(err);
});

d.on('end', function () {
  console.log(categories);
});
