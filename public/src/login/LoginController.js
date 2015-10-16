angular.module('LMSApp')
.controller('LoginController', ['$scope', '$state', 'userService', function ($scope, $state, userService ) {
  // email pattern regex
  $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  // initialize user object with empty values
  $scope.user = {};

  $scope.login = function() {
    userService.login($scope.user, function(data) {
      console.log(data);
      if (data.type === true) {
        userService.setUser = data.user;
        $state.go('courses');
      }
    });
  };

  // Validation -------------
  $scope.validate = function() {
    console.log('hello');
    $location.path('/');
  };

  // username validation
  function validateUser() {
    var username = $scope.user.username;

    if ( username === '' || username === 0 || !sanitizeInput(username) ) {
      console.log('invalid username');
      return false;   // Need to add incorrect bootstrap class
    } else {
      return true;
    }
  }

  // password validation
  function validatePassword() {
    var password = $scope.user.password;

    if ( password === '' || password === 0 || !sanitizeInput(password) ) {
      console.log('invalid password');
      return false;
    } else {
      return true;
    }
  }

  // sanitize inputs before sending to server
  function sanitizeInput(val) {
    return true;
  }
}]);


