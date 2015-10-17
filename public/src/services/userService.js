// userService.js =====================
angular.module('LMSApp')
.factory('userService', ['$http', 'RESOURCES', function($http, RESOURCES) {
  // factory user vars
  var currentUser = '';
  var userId = '';
  var isLoggedIn = false;
  var role = '';

  // For signup page, method to create new user
  var _createUser = function(user, cb) {
    var body = { data : user };
    $http.post( RESOURCES.USERS, body ).then(
      function successCallback(res) {
        currentUser = res.data.data;
        isLoggedIn = true;
        return cb(res.data);
      },
      function errorCallback(res) {
        console.log(res.data.data);
      }
    );
  };

  // Login page, method to login a user
  var _login = function(user, cb) {
    var body = { data : user };
    console.log(body);
    $http.post(RESOURCES.LOGIN, body).then(
      function successCallback(res) {
        return cb(res.data);
      },
      function errorCallback(res) {
        console.log(res);
      }
    );
  };
  
  // LoginController, set a new user
  var _setUser = function(user) {
    currentUser = user;
    userId = user._id;
    isLoggedIn = true;
    role = user.role;
  };

  // return data of current user
  var _getUser = function() {
    return currentUser;
  };

  var _getUserId = function() {
    return userId;
  };

  // logout the current user, unset any user data
  var _logOut = function() {
    currentUser = '';
    userId = '';
    isLoggedIn = false;
    role = '';
  };

  return {
    createUser : _createUser,
    setCurrentUser : _setUser,
    login : _login,
    logout : _logOut,
    role : role,
    getCurrentUser : _getUser,
    getUserId : _getUserId
  };
}]);