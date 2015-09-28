var express = require('express'),
    app     = express(),
    api     = require('./api');

// set api router middleware
app.use('/api', api);

app.listen(3000, function() {
  console.log('Connected to server...');
});