// userService.js =====================
angular.module('LMSApp')
.factory('userService', ['$http', 'RESOURCES', function($http, RESOURCES) {
  var baseUrl = 'http://127.0.0.1:3000/api/';
  var userUrl = baseUrl + 'user/';
  var loginUrl = baseUrl + 'login/';
  var instructorUrl = baseUrl + 'instructors';
  var currentUser = '';
  var isLoggedIn = false;
  var courses = '';
  var role = '';

  // For signup page, method to create new user
  var _createUser = function(user, cb) {
    var body = { data : user };
    console.log(RESOURCES);
    $http.post( RESOURCES.USER, body ).then(
      function successCallback(res) {
        currentUser = res.data.data;
        isLoggedIn = true;
        return cb(res.data.data);
      },
      function errorCallback(res) {
        console.log(res.data.data);
      }
    );
  };

  // Login page, method to login a user
  var _login = function(user, cb) {
    var body = { data : user };
    $http.post(loginUrl, body).then(
      function successCallback(res) {
        return cb(res.data.data);
      },
      function errorCallback(res) {
        console.log(res);
      }
    );
  };
  
  // LoginController, set a new user
  var _setUser = function(user) {
    currentUser = user;
    isLoggedIn = true;
    role = user.role;
  };

  // return data of current user
  var _getUser = function() {
    return currentUser;
  };

  // Get all instructors
  var _getInstructors = function(cb) {
    $http.get(instructorUrl).then(
      function successCallback(res) {
        return cb(res.data.data);
      },
      function errorCallback(res) {
        console.log(res);
      }
    );
  };

  // logout the current user, unset any user data
  var _logOut = function() {
    currentUser = '';
    isLoggedIn = false;
    role = '';
  };

  return {
    getInstructors : _getInstructors,
    createUser : _createUser,
    setCurrentUser : _setUser,
    login : _login,
    logout : _logOut,
    role : role,
    getCurrentUser : _getUser
  };
}]);