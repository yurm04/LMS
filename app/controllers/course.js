// course.js ====================================
var Course = require('../models/Course'),
    UserCourse = require('../models/UserCourse'),
    User = require('../models/User'),
    Log = require('../models/Log'),
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

  if (data.instructorId && data.instructorId !== undefined) {
    newData.instructorId = data.instructorId;
  }

  return callback(null, newData);
};

// GET /courses/:id - get course of ID :id
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

// GET /courses - get all courses, only used for registration purposes
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

// POST /courses - create a new course
module.exports.postCourse = function( req, res ) {
  var data = req.body;
  console.log(req.body);
  // check for all required data
  if (!isValid(data))
    return res.json({ type : false, data : 'Missing required course information' });

  // check if course already exists in db
  Course.findOne( { "title" : data.title }, function(err, foundCourse) {
    if (err)
      return res.json({ type: false, data: err });

    if (foundCourse)
      return res.json({ type: false, data: 'Course already exists' });
    console.log(data);
    var newCourse = new Course();
    newCourse.title = data.title;
    newCourse.department = data.department;
    newCourse.number = data.number;

    if (data.instructorId) {
      newCourse.instructorId = data.instructorId;
    }

    newCourse.save( function(err){
      if (err)
        return res.json({ type : false, data : err });

      // log new course
      var log = new Log({
        title : 'Course creation',
        description : 'New course created ' + newCourse.title
      });

      log.save( function(err) {
        if (err)
          console.log('Could not log new course creation ' + newCourse.title);
      });

      res.json({
        type : true,
        data : newCourse
      });
    });
  });
};

// PUT /courses/:id - update course data
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

          // log course update
          var log = new Log({
            title : 'Course Update',
            description : 'Made changes to course ' + foundCourse.title,
            course : foundCourse._id
          });

          log.save( function(err) {
            if (err)
              console.log('Could not log course update ' + foundCourse.title);
          });

          res.json({
            type : true,
            data : updatedCourse
          });
        });
      });
    });
  });
};

// DELETE /course/:id - deletes course of ID :id
module.exports.deleteCourse = function( req, res ) {
  var id = mongoose.Types.ObjectId(req.params.id);
  if ( !id || id === null || id === undefined )
    return res.json({ type : false, data : 'Missing course ID' });

  Course.findOneAndRemove({ "_id" : id }, function(err) {
    if (err)
      return res.json({ type : false, data : err });
    
    // log user login
    var log = new Log({
      title : 'Course delete',
      description : 'Course ' + id + ' was deleted'
    });

    log.save( function(err) {
      if (err)
        console.log('Could not course delete ' + id);
    });

    res.json({
      type : true
    });
  });
};

// GET /courses/:id/students - returns array of all students for course :id
module.exports.getStudents = function( req, res ) {
  var id = mongoose.Types.ObjectId(req.params.id);
  console.log(id);
  if ( !id || id === null || id === undefined )
    return res.json({ type : false, data : 'Missing course ID' });
  
  console.log(id);
  // return userCourse.userId for any document with the specified courseId
  UserCourse.find( { "courseId" : id }, "userId -_id", function(err, ids) {
    console.log(ids);
    if (err)
      return res.json({ type : false, data : err });
    if (ids.length === 0)
      return res.json({ type : false, data : 'No Users found for this course' });

    var userIds = ids.map(function(i) {
      return mongoose.Types.ObjectId(i.userId);
    });
    console.log(userIds);
    User.find( { "role" : "student" , "_id" :{ $in : userIds } }, function(err, students) {
      if (err)
        return res.json({ type : false, data : err });
      if (students.length ===0)
        return res.json({ type : false, data : 'No Users found' });

      res.json({
        type : true,
        data : students
      });
    });
  });
};
