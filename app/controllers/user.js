// controller/user.js ==================
var User = require('../models/User'),
    mongoose = require('mongoose');

var setUpdateData = function(user, data, callback) {
  var newData = {};

  if (data.email && data.email !== undefined)
    newData.email = data.email;

  if (data.firstname && data.firstname !== undefined)
    newData.firstname = data.firstname;

  if (data.lastname && data.lastname !== undefined)
    newData.lastname = data.lastname;
  
  // if password is being set, make sure to hash it first
  if (data.password && data.password !== undefined){
    user.hashPassword( function(err, hash) {
      if (err)
        callback(err)

      newData.password = hash;
      callback(null, newData);
    });
  }
  callback(null, newData);
};

// check for all required information
var isValid = function(data) {
  if ( !data.email || !data.password || !data.role || !data.firstname || !data.lastname ) {
    return false;
  } else {
    return true;
  }
};

// GET /user/:id - returns user of id :id
module.exports.getUser = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id);
  
  User.findOne( { "_id" : id }, function(err, user) {
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

// POST /user - create new user
module.exports.postUser = function(req, res) {
  var data = req.body.user;
  // check to make sure all required values are set
  if ( !isValid(data) )
    // return error if data missing
    res.json({ type : false, data : 'Missing required user data' });

  // check if user exists
  User.findOne( { email : data.email }, function (err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });

    if (foundUser)
      return res.json( { type : false, data : 'User already exists'});

    // No user exists, set user data
    var newUser = new User();
    newUser.email = data.email;
    newUser.password = data.password;
    newUser.firstname = data.firstname;
    newUser.lastname = data.lastname;
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
  });

};

// PUT /user/:id - update user of ID :id
module.exports.putUser = function(req, res) {
  var id = mongoose.Types.ObjectId(req.params.id);

  User.findOne( { "_id" : id }, function(err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });

    if (!foundUser)
      return res.json( { type : false, data : 'User does not exist' });

    var data = req.body.user;
    // setUpdateData(foundUser, data, function(err, newData) {
    //   if (err)
    //     return res.json( { type : false, data : err });
    //   console.log('res.json headersSent ' + res.headersSent);
    //   res.json({
    //     type : true,
    //     data : foundUser
    //   })
    // }); 
    User.update( { "_id" : id }, { "email" : 'testingemail' }, function(err) {
      if (err)
        console.log('some error on update');
        return res.json( { type : false, data : 'User does not exist' });

      res.json({
        type : true,
        data : foundUser
      })
    });
  });






  /*
    console.log('Before findOne ' + res.headersSent);
  User.findOne({ "_id" : id }, function(err, foundUser) {
    if (err)
      return res.json( { type : false, data : err });

    if (!foundUser)
      return res.json( { type : false, data : 'User does not exist' });

    console.log('Before setUpdateData ' + res.headersSent);
    var data = req.body.user;
    setUpdateData(foundUser, data, function(err, newData) {
      if (err)
        return res.json( { type : false, data : err });
      console.log('Before user update ' + res.headersSent);
      User.update({ "_id" : id }, newData, function(err) {
        if (err)
          return res.json( { type : false, data : err });

        console.log('Before res.json ' + res.headersSent);
        res.json({
          type : true
        });
      })
    });

  });
   */
};

// DELETE /user/:id
module.exports.deleteUser = function(req, res) {

};
