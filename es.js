var es = require('es');
var url = require('url');

var u = url.parse(process.env.ESURL || '');

module.exports = es({
  _index: (u.path && u.path.substr(1)) || 'free103',
  server: {
    auth: u.auth || '',
    host: u.hostname || 'localhost',
    port: u.port || (u.protocol === 'http:' && 80) || (u.protocol === 'https:' && 443) || 9200
  }
});
