var fs = require('fs')

fs.readdirSync(__dirname).forEach(function (file) {
  if (/\.js$/.test(file)) return // skip js files
  var schema = file.replace(/\.[^.]+$/, ''); // drop extension
  exports[schema] = require('./' + file)
});
