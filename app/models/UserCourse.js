// UserCourse.js ================================
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userCourseSchema = new Schema({
  userId : { type : Schema.Types.ObjectId, required : true },
  courseId : { type : Schema.Types.ObjectId, required : true }
});

module.exports = mongoose.model('UserCourse', userCourseSchema);