// user.js ============================

var mongoose = require('mongoose');

// User schema
var userSchema = new mongoose.Schema( {
  email : String,
  password : String, // should hash
  role : String,     // should this be an ID to roles table?
  token : String     // what would this actually be?
});

// User model methods
userSchema.methods.updateToken = function() {

};

// check for valid token 
userSchema.methods.checkToken = function() {

};

userSchema.methods.createUser = function(user, callback) {
  // why the hell is this necessary?
  var UserModel = mongoose.model('User', userSchema);

  // search for existing user, error if one found
  UserModel.findOne( { email : user.email }, function(err, foundUser) {
    // some error
    if(err)
      return callback('An error Occurred');

    // user exists, callback with error
    if (foundUser)
      return callback('User with email already exists');

    // set fields
    this.email = user.email;
    this.password = user.password;

    // attempt to save
    console.log('before saving newUser ' + this);
    this.save( function(err, saved) {
      console.log('saved newUser ' + saved);
      if(err)
        return callback('Could not save user');

      // all clear, user created
      callback(null, saved);
    });
  });

};

// before save validate and make other checks
userSchema.pre('save', function() {

});

module.exports = mongoose.model('User', userSchema);