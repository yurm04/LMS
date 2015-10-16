// api.js =======================================
var express        = require('express'),
    router         = express.Router(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    dbconfig       = require('./config/config').db,
    User           = require('./app/models/User'),
    userController = require('./app/controllers/user'),
    courseController = require('./app/controllers/course'),
    loginController = require('./app/controllers/login'),
    messageController = require('./app/controllers/message');

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
router.route('/login')
  .post( userController.login );

// USER ROUTES ==================================
router.route('/users')
  .get( userController.getUsers )               // get all users
  .post( userController.postUser );             // create new user
          
router.route('/users/:id')
  .get( userController.getUser )                // gets user of ID :id
  .put( userController.putUser )                // updates user of ID :id
  .delete( userController.deleteUser );         // delete user of ID :id
    
router.route('/users/:id/courses/')               // gets list of courses for user
  .get( userController.getCourses );
    
router.route('/users/:id/courses/:cid')
  .post( userController.postCourse )            // creates userCourse of user ID :id and course ID :cid
  .delete( userController.deleteCourse );       // deletes userCourse of user ID :id and course ID :cid

router.route('/instructors')
  .get( userController.getInstructors);         // Gets all instructors
  
// COURSE ROUTES ================================
router.route('/courses')
  .get( courseController.getCourses )           // get all courses
  .post( courseController.postCourse );         // create new course

router.route('/courses/:id')
  .get( courseController.getCourse )            // gets course of ID :id
  .put( courseController.putCourse )            // updates course of ID :id
  .delete( courseController.deleteCourse );     // delete course of ID :id

router.route('/courses/:id/students')
  .get( courseController.getStudents );         // gets students for the course of ID :id

// MESSAGES ROUTES ==============================
router.route('/messages/:uid')
  .get( messageController.getMessages);

router.route('/messages')
  .get( messageController.getAllMessages)
  .post( messageController.postMessage );



// DON'T FORGET TO EXPORT ROUTER YOU BUTT!
// Export API router ============================
module.exports = router;