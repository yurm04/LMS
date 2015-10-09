var express = require('express'),
    app     = express(),
    api     = require('./api');

// set api router middleware
app
  .use(express.static('./public'))
  .use('/api', api)
  .get( '*', function(req, res) {
    res.sendFile(__dirname + '/public/main.html');
  });

app.listen(3000, function() {
  console.log('Connected to server...');
});