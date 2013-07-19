var elasticsearch = require('elasticsearch')

module.exports = elasticsearch({
  _index: 'free103',
  server: {
    auth: process.env.ESAUTH || '', // set with user:pass
    host: process.env.ESHOST || 'localhost',
    port: process.env.ESPORT || 9200
  }
})
