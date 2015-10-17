// Assignment.js ======================
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var assignmentSchema = new Schema({
  title : { type : String, required : true },
  description : { type : String, required : true },
  courseId : { type : Schema.Types.ObjectId },
  filename : { type : String }
});

module.exports = mongoose.model('Assignment', assignmentSchema);


