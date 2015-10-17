// Quiz.js
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var quizSchema = new Schema({
  title : { type : String, required : true},
  description : { type : String, required : true},
});