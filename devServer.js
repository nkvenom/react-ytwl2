var path = require('path');
var fs = require('fs');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

var clientIdPath = path.join(__dirname, 'client-id.txt');
var clientId = null;
fs.readFile(clientIdPath, {encoding: 'utf-8'}, (err,data) => {
  if(err) return;
  console.log("data=", data);
  clientId = data.trim();
});

app.get('/src/auth.js', function(req, res) {
  console.log("Auth requested");

  if(clientId === null) {
      res.sendFile(path.join(__dirname, 'src/auth.js'));
      return;
  }

  fs.readFile(path.join(__dirname, 'src/auth.js'), {encoding: 'utf-8'}, (err,data) => {
    if(err) {
      console.log("Error", error);
      res.send("Error");
      return;
    }
    res.send(data.replace('__YOUR_CLIENT_ID__', clientId));
  });
});


app.use(express.static('./'));
app.listen(3000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
