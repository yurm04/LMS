// user.js ============================

var mongoose = require('mongoose');

// User schema
var userSchema = new mongoose.Schema( {
  email : String,
  password : String, // should encrypt
  role : String,     // should this be an ID to roles table?
  token : String     // what would this actually be?
});

// User model methods
userSchema.methods.updateToken = function() {

};

// check for valid token 
userSchema.methods.checkToken = function() {

};

userSchema.methods.userExists = function() {

};

// before save validate and make other checks
userSchema.pre('save', function() {

});

module.exports = mongoose.model('User', userSchema);