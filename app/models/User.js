// user.js ============================

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');    // for hashing passwords

// User schema ========================
var userSchema = new mongoose.Schema( {
  email : { type : String, unique : true, required : true},
  password : { type : String, required : true }, // should hash
  firstname : { type : String, required : true },
  lastname : { type : String, required : true },
  role : { type : String, required : true },
  token : String     // what would this actually be?
});

// user model methods =================

// hash password
userSchema.methods.hashPassword = function(pwd, callback) {
  var user = this;
  bcrypt.genSalt(5, function(err, salt) {
    if (err)
      return callback(err);
    console.log(pwd);
    // hash password and set
    bcrypt.hash(pwd, salt, null, function(err, hash) {
      console.log(hash);
      // user.password = hash;
      // all good, user saved
      callback(null, hash);
    });
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

// before save hash password if it's been modified
userSchema.pre('save', function(next, done) {
  var user = this;

  // if password hasn't been modified, return callback
  if (!user.isModified('password'))
    next();
  console.log('user password ' + user.password);
  // NO ERROR, generate salt
  user.hashPassword( user.password, function(err, hash) {
    if (err)
      done(err);
    console.log(hash);
    console.log(user);
    user.password = hash;
    next();
  });

});

module.exports = mongoose.model('User', userSchema);