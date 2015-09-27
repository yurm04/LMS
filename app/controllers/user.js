// controller/user.js ==================
var User = require('../models/User'),
    mongoose = require('mongoose');

// check for all required information
var isValid = function(data) {
  if ( !data.email || !data.password || !data.role ) {
    return false;
  } else {
    return true;
  }
}

// GET /user/:id - returns user of id :id
module.exports.getUser = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id);
  
  User.findOne( { "_id" : id }, function(err, user) {
    console.log(user);
    if (err)
      return res.json( { type : false, data : err });

    if (!user)
      return res.json( { type : false, data : 'User does not exist'});

    // return user if no errors
    res.json( {
      type : true,
      data : user
    })


  });
};

// GET /user - gets all users
module.exports.getUsers = function(req, res) {
  User.find( function(err, users) {
    if (err)
      return res.json( { type : false, data : err });

    if ( users === undefined || users.length == 0 )
      return res.json( { type : false, data : 'There are no users'});

    res.json({
      type : true,
      data : users
    });
  });
};

// POST /user
module.exports.postUser = function(req, res) {
  var data = req.body.user;
  // check to make sure all required values are set
  if ( !isValid(data) )
    // return error if data missing
    res.json({ type : false, data : 'Missing required user data' });

  // set user data
  var newUser = new User();
  newUser.email = data.email;
  newUser.password = data.password;
  newUser.role = data.role;

  newUser.save( function(err) {
    // if error send word
    if (err)
      return res.json( { type : false, data : err });

    // "Good news, Everyone!" - Professor Farnsworth
    res.json({
      type : true,
      data : newUser
    });
  });
};

// PUT /user/:id
module.exports.putUser = function(req, res) {

};

// DELETE /user/:id
module.exports.deleteUser = function(req, res) {

};
