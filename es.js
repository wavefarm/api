var es = require('es')

module.exports = es({
  _index: 'free103',
  server: {
    auth: process.env.ESAUTH || '', // set with user:pass
    host: process.env.ESHOST || 'localhost',
    port: process.env.ESPORT || 9200
  }
})
