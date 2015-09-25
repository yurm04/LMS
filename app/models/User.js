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
userSchema.methods.updateToken = function(callback) {

};

// check for valid token 
userSchema.methods.checkToken = function() {

};

userSchema.methods.setData = function(data, callback) {
  // check for existing user
  var user = this;
  user.userExists(data.email, function (err, userExists) {
    if (err)
      return callback(err);

    if (userExists)
      return callback('User email already exists');

    user.email = data.email;
  });

  // ENCRYPT FIRST!!!
  user.password = data.password;
  user.role = data.role;
  // set token
  user.updateToken( function(err, status) {
    if (err)
      callback(err);

    if (status)
      ;
  });

};

userSchema.methods.userExists = function(userEmail, callback) {
  // still don't know
  var UserModel = mongoose.model('User', userSchema);

  UserModel.findOne( { email : userEmail }, function (err, foundUser) {
    if (err)
      return callback(err);

    if (foundUser)
      return callback (null, true);

    // no user exists, proceed
    callback(null, false);

  });
};

userSchema.methods.createUser = function(user, callback) {
  // why the hell is this necessary?
  var UserModel = mongoose.model('User', userSchema);
  var newUser = this;

  // search for existing user, error if one found
  UserModel.findOne( { email : user.email }, function(err, foundUser) {
    // some error
    if(err)
      return callback('An error Occurred');

    // user exists, callback with error
    if (foundUser)
      return callback('User with email already exists');

    // set fields
    newUser.email = user.email;
    newUser.password = user.password;

    // attempt to save
    console.log('before saving newUser ' + this);
    newUser.save( function(err, saved) {
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