// course.js ====================================
var Course = require('../models/Course'),
    mongoose = require('mongoose');

var isValid = function (data) {
  if ( !data.title ) {
    return false;
  } else {
    return true;
  }
};

// GET /course/:id - get course of ID :id
module.exports.getCourse = function( req, res ) {
  var id = req.params.id;

  Course.findById(id, function(err, foundCourse) {
    if (err)
      return res.json({ type : false, data : 'Course does not exists' });

    res.json({
      type : true,
      data : foundCourse
    });
  });
};

// GET /course - get all courses, only used for registration purposes
module.exports.getCourses = function ( req, res ) {
  Course.find( function(err, courses) {
    if (err)
      return res.json({ type : false, data : err });
    if (courses === undefined || courses.length < 0)
      return res.json({ type : false, data : 'No courses exist' });

    res.json({
      type : true,
      data : courses
    });
  });
};

module.exports.postCourse = function( req, res ) {
  var data = req.body.course;
  // check for all required data
  if (!isValid(data))
    return res.json({ type : false, data : 'Missing required course information' });

  // check if course already exists in db
  Course.findOne( { "title" : data.title }, function(err, foundCourse) {
    if (err)
      return res.json({ type: false, data: err });

    if (foundCourse)
      return res.json({ type: false, data: 'Course already exists' });

    var newCourse = new Course();
    newCourse.title = data.title;

    newCourse.save( function(err){
      if (err)
        return res.json({ type : false, data : err });

      res.json({
        type : true,
        data : newCourse
      });
    });
  });
};

// PUT /course/:id - update course data
module.exports.putCourse = function( req, res ) {
  var id = req.params.id;
  Courses.findById(id, function(err, foundCourse) {
    
  });
};

module.exports.deleteCourse = function( req, res ) {

};
