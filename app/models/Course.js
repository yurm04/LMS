// Course.js ====================================
var mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
  title : { type : String, required : true, unique : true },
});

module.exports = mongoose.model('Course', courseSchema);