// Activity logs for LMS
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var logSchema = Schema({
  title : { type : String, required : true },
  description : { type : String, required : true },
  courseId : { type : String }
});

module.exports = mongoose.model('Log', logSchema);