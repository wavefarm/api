var schemas = require('../schemas')

module.exports = function (req, res, next) {
  res.end(JSON.stringify(schemas))
}
