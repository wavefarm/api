var es = require('es');
var express = require('express');
var url = require('url');

var app = express.createServer();
var port = process.argv[2] || 8168;

app.get('/', function(req, res) {
  es.request({
    path: '/free103/_status',
    res: res,
    respond: true
  });
});

app.get('/search', function(req, res) {
  es.request({
    path: '/free103/_search' + url.parse(req.url).search,
    res: res,
    respond: true
  });
});

app.listen(port);
