// user.js ============================

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');    // for hashing passwords

// User schema ========================
var userSchema = new mongoose.Schema( {
  email : { type : String, unique : true, required : true},
  password : { type : String, required : true }, // should hash
  role : { type : String, unique : true, required : true },     // should this be an ID to roles table?
  token : String     // what would this actually be?
});

// User model methods
userSchema.methods.updateToken = function(callback) {

};

// check for valid token 
userSchema.methods.checkToken = function() {

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

// before save validate and make other checks
userSchema.pre('save', function(next, done) {
  // check if user exists
  var user = this;
  user.userExists(this.email, function(err, userExists) {
    // if error occurred, return
    if (err)
      return done(err);
    // if user exists, return
    if (userExists)
      return done('User email already exists');

    // NO ERROR, generate salt
    bcrypt.genSalt(5, function(err, salt) {
      if (err)
        done(err);

      // hash password and set
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        user.password = hash;
        // all good, user saved
        next();
      })
    });
    
  });

});

module.exports = mongoose.model('User', userSchema);