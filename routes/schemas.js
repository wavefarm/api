var schemas = require('../schemas')

module.exports = function (req, res, next) {
  res.send(JSON.stringify(schemas))
}
