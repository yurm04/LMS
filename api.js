// api.js =======================================
var express = require('express'),
    router  = express.Router(),
    bodyParser  = require('body-parser'),
    mongoose = require('mongoose'),
    dbconfig  = require('./config/config').db;

    User = require('./app/models/User');
// connect to DB
mongoose.connect(dbconfig.url);

// Handle error or success once connected to DB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(callback) {
  console.log('succesffully connected to db');
});

// set bodyparser middleware
router.use(bodyParser.json());

// default API route
router.route('/')
  .get(function(req, res) {
    res.json( { message: "Hello API"} );
  });


// login route ==================================
router.route('/login', function(req, res) {
  // do login stuff here
});

// user routes ==================================
router.route('/user')
  // get all users
  .get()
  
  // create new user
  .post( function(req, res) {
    var newUser = new User();
    
    // attempt to create new user with
    newUser.createUser(req.body.reqUser, function(err, user) {
      // error occurred, respond negatively
      if (err)
        res.json( {
          type: false,
          data: err
        });

      // good news everyone!
      res.json( {
        type : true,
        data : user
      });
    });

  });

router.route('/user/:id')
  .get()
  .put()
  .delete();




// DON'T FORGET TO EXPORT ROUTER YOU BUTT!
// Export API router ============================
module.exports = router;