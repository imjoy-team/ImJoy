var express = require('express');
var app = express();
var path = require('path');
var packageData = require('../package');

app.use(express.static('dist'));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

// server
var server = app.listen('23002', (req, res) => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('server is running .  http://%s:%s', host, port);
});

module.exports = app;
