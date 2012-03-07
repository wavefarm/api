var es = require('es');
var express = require('express');

var app = express.createServer();
var port = process.argv[2] || 8168;

app.get('/', function(req, res) {
  es.request({
    path: '/free103/_status',
    res: res,
    respond: true
  });
});

app.listen(port);
