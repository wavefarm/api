var es = require('../es')

module.exports = function (req, res, next, id) {
  es.deleteByQuery({query: {ids: {values: [id]}}}, function (err, data) {
    if (err) return next(err)
    res.send(JSON.stringify(data))
  })
}
