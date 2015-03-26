var es = require('es');
var url = require('url');

var u = url.parse(process.env.ESURL);
var port = u.port || (u.protocol === 'https:' ? 443 : 80);

module.exports = es({
  _index: u.path.substr(1) || process.env.ESINDEX || 'free103',
  server: {
    auth: u.auth || process.env.ESAUTH || '', // set with user:pass
    host: u.hostname || process.env.ESHOST || 'localhost',
    port: port || process.env.ESPORT || 9200
  }
});
