// course.js ====================================
var Course = require('../models/Course'),
    mongoose = require('mongoose');

var isValid = function (data) {
  if ( !data.title || !data.department || !data.number) {
    return false;
  } else {
    return true;
  }
};

var setUpdateData = function (course, data, callback) {
  var newData = {};
  
  if (data.title && data.title !== undefined) {
    newData.title = data.title;
  }

  if (data.department && data.department !== undefined) {
    newData.department = data.department;
  }

  if (data.number && data.number !== undefined) {
    newData.number = data.number;
  }

  if (data.instructor && data.instructor !== undefined) {
    newData.instructor = data.instructor;
  }

  return callback(null, newData);
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

// POST /course - create a new course
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
    newCourse.department = data.department;
    newCourse.number = data.number;

    if (data.instructor) {
      newCourse.instructor = data.instructor;
    };

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
  var id = mongoose.Types.ObjectId(req.params.id);
  var data = req.body.course;
  Course.findById(id, function(err, foundCourse) {
    if (err)
      return res.json({ type : false, data : err });
    if (!foundCourse)
      return res.json({ type : false, data : 'Course does not exists' });

    setUpdateData(foundCourse, data, function(err, newData) {
      Course.update( {"_id" : id}, newData, function(err) {
        if (err)
          return res.json({ type : false, data : err });

        Course.findById(id, function(err, updatedCourse) {
          if (err)
            return res.json({ type : false, data : err });

          res.json({
            type : true,
            data : updatedCourse
          });
        });
      });
    });
  });
};

module.exports.deleteCourse = function( req, res ) {
  var id = mongoose.Types.ObjectId(req.params.id);
  if ( !id || id === null || id === undefined )
    return res.json({ type : false, data : 'Missing course ID' });

  Course.findOneAndRemove({ "_id" : id }, function(err) {
    if (err)
      return res.json({ type : false, data : err });
    
    res.json({
      type : true
    });
  });
};
