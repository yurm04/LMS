var express = require('express'),
    app     = express(),
    api     = require('./api');

// set api router middleware
app.use('/api', api);

app.listen(3000, function() {
  console.log('Connected to server...');
});

/*
  using passport-http-bearer for authentication.  Sample project followed:
  https://github.com/passport/express-4.x-http-bearer-example
*/