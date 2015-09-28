// api.js =======================================
var express        = require('express'),
    router         = express.Router(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    dbconfig       = require('./config/config').db,
    User           = require('./app/models/User'),
    userController = require('./app/controllers/user');

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
  .get( userController.getUsers )           // get all users
  .post( userController.postUser );         // create new user
      
router.route('/user/:id')     
  .get( userController.getUser )           // gets user of ID :id
  .put( userController.putUser )            // updates user of ID :id
  .delete( userController.deleteUser );     // delete user of ID :id

 


// DON'T FORGET TO EXPORT ROUTER YOU BUTT!
// Export API router ============================
module.exports = router;