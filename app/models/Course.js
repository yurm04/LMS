// Course.js ====================================
var mongoose = require('mongoose');
var Schema = mongoose.Schema

var courseSchema = new Schema({
  title : { type : String, required : true, unique : true },
  department : { type : String, required : true },
  number : { type : String, required : true },
  instructorId : { type : Schema.Types.ObjectId }
});

module.exports = mongoose.model('Course', courseSchema);