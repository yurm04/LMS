// controller/user.js ==================
var User = require('../models/User'),
    Course = require('../models/Course'),
    UserCourse = require('../models/UserCourse'),
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    _ = require('underscore');

var setUpdateData = function(user, data, callback) {
  var newData = {};

  if (data.email && data.email !== undefined)
    newData.email = data.email;

  if (data.firstname && data.firstname !== undefined)
    newData.firstname = data.firstname;

  if (data.lastname && data.lastname !== undefined)
    newData.lastname = data.lastname;

  if (data.role && data.role !== undefined) {
    newData.role = data.role;
  }
  
  // if password is being set, make sure to hash it first
  if (data.password && data.password !== undefined){

    user.hashPassword( data.password, function(err, hash) {
      if (err)
        return ( callback(err) );

      newData.password = hash;
      // execute callback at this point
      return (callback(null, newData));
    });
  } else {
    // if password not being updated go ahead and callback
    callback(null, newData);
  }
  
};

// check for all required information
var isValid = function(data) {
  if ( !data.email || !data.password || !data.role || !data.firstname || !data.lastname ) {
    return false;
  } else {
    return true;
  }
};

// GET /user/:id - returns user of id :id
module.exports.getUser = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id);
  
  User.findOne( { "_id" : id }, function(err, user) {
    if (err)
      return res.json( { type : false, data : err });

    if (!user)
      return res.json( { type : false, data : 'User not found'});

    // return user if no errors
    res.json( {
      type : true,
      data : user
    });

  });
};

// GET /user - gets all users
module.exports.getUsers = function(req, res) {
  User.find( function(err, users) {
    if (err)
      return res.json( { type : false, data : err });

    if ( users === undefined || users.length === 0 )
      return res.json( { type : false, data : 'There are no users'});

    res.json({
      type : true,
      data : users
    });
  });
};

// POST /user - create new user
module.exports.postUser = function(req, res) {
  var data = req.body.data;
  // check to make sure all required values are set
  if ( !isValid(data) )
    // return error if data missing
    res.json({ type : false, data : 'Missing required user data' });

  // check if user exists
  User.findOne( { email : data.email }, function (err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });

    if (foundUser)
      return res.json( { type : false, data : 'User already exists'});

    // No user exists, set user data
    var newUser = new User();
    newUser.email = data.email;
    newUser.password = data.password;
    newUser.firstname = data.firstname;
    newUser.lastname = data.lastname;
    newUser.role = data.role;

    newUser.save( function(err) {
      // if error send word
      if (err)
        return res.json( { type : false, data : err });

      // "Good news, Everyone!" - Professor Farnsworth
      res.json({
        type : true,
        data : newUser
      });
    });
  });

};

// PUT /user/:id - update user of ID :id
module.exports.putUser = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id);

  User.findOne( { "_id" : id }, function(err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });

    if (!foundUser)
      return res.json( { type : false, data : 'User not found' });

    var data = req.body.data;

    setUpdateData(foundUser, data, function(err, newData) {
      if (err)
        return res.json( { type : false, data : err });

      User.update( { "_id" : id }, newData, function(err) {
        if (err)
          return res.json( { type : false, data : err });

        User.findById( id, function(err, updatedUser) {
          if (err)
            return res.json( { type : false, data : err });

          res.json({
            type : true,
            data : updatedUser
          });
        });
      });
    });
  });
};

// DELETE /user/:id
module.exports.deleteUser = function(req, res) {
  var id = req.params.id;
  if (!id || id === null || id === undefined )
    return res.json( { type : false, data : 'Missing User ID' });

  User.findOneAndRemove( { "_id" : id }, function(err) {
    if (err)
      return res.json( { type : false, data : err });

    res.json({
      type : true
    });
  });
};

// GET /user/:id/course/ - return a list of courses for user
module.exports.getCourses = function ( req, res ) {
  var uid = mongoose.Types.ObjectId(req.params.id);

  User.findById(uid, function(err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });
    if (!foundUser)
      return res.json( { type : false, data : 'User not found' });

    UserCourse.find( {}, function(err, courses) {
      if (err)
        return res.json( { type : false, data : err });
      if (courses === undefined || courses.length === 0)
        return res.json( { type : false, data : 'No courses found' });
      console.log(courses);
      var courseIds = _.pluck(courses,'courseId');
      Course.find({ '_id' : { $in : courseIds } }, function(err, foundCourses){
        if (err)
          return res.json({ type : false, data : err });
        if (!foundCourses)
          return res.json({ type : false, data : 'No courses found' });

        res.json({
          type : true,
          data : foundCourses
        });
      });
    });
  });
};

// POST /user/:id/course/:cid - add a userCourse
module.exports.postCourse = function( req, res ) {
  var uid = req.params.id;

  User.findById(uid, function(err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });
    if (!foundUser)
      return res.json( { type : false, data : 'User not found' });

    var cid = req.params.cid;

    Course.findById(cid, function(err, foundCourse) {
      if (err)
        return res.json( { type : false, data : err });
      if (!foundCourse)
        return res.json( { type : false, data : 'Course not found' });

      var userCourse = new UserCourse();
      userCourse.userId = uid;
      userCourse.courseId = cid;
      userCourse.save( function(err) {
        if (err)
          return res.json( { type : false, data : err });

        res.json({
          type : true,
          data : userCourse
        });
      });
    });
  });
};

// DELETE /user/:id/course/:cid
module.exports.deleteCourse = function( req, res ) {
  var uid = mongoose.Types.ObjectId(req.params.id);

  User.findById(uid, function(err, foundUser) {
    if (err)
      return res.json({ type : false, data : err });

    if (!foundUser)
      return res.json({ type : false, data : 'User not found' });

    var cid = req.params.cid;
    UserCourse.findOneAndRemove({ "courseId" : cid, "userId" : uid }, function(err) {
      if (err)
        return res.json({ type : false, data : err });

      res.json({
        type : true,
      });
    });
  });
};

// GET /instructors - returns array of all instructors
module.exports.getInstructors = function( req, res ) {
  User.find( { 'role' : 'instructor' }, 'firstname lastname', function(err, instructors) {
    if (err)
      return res.json({ type : false, data : err });
    if (instructors === 0)
      return res.json({ type : false, data : 'No Instructors found' });

    res.json({
      type : true,
      data : instructors
    });

  });
}

module.exports.login = function( req, res) {
  // console.log(req);
  var data = req.body.data;
  var invalid = 'Invalid email/password';

  User.findOne( { 'email' : data.email }, function(err, user) {
    if (err)
      return res.json({ type : false, data : err });
    if (!user)
      return res.json({ type : false, data : invalid });

    var pw = "" + data.password;
      
    bcrypt.compare(data.password, user.password, function(err, result) {
      if (err)
        return res.json({ type : false, data : err });
      console.log(result);
      if (result === false)
        return res.json({ type : false, data : invalid });

      res.json({
        type : true,
        data : user
      });
    });
  });
}
