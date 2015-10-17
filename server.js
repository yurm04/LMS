var express = require('express'),
    app     = express(),
    api     = require('./api'),
    multer  = require('multer'),
    upload  = multer({ dest: '../tmp/'});

// set api router middleware
app
  .use(express.static('./public'))
  .use('/api', api)
  .use(multer({dest:'./uploads/'}).single('uploadFile'))  // for file uploads
  .get( '*', function(req, res) {
    res.sendFile(__dirname + '/public/main.html');
  });

app.listen(3000, function() {
  console.log('Connected to server...');
});