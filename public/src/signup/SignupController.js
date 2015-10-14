// SignUpController.js ================
angular.module('LMSApp')
.controller('SignupController', ['$scope', 'userService', 'courseService', function($scope, userService, courseService) {
  // email pattern
  $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  $scope.roles = ['student', 'instructor'];

  // new user from form
  $scope.newUser = {
    firstname : '',
    lastname : '',
    email : '',
    password : '',
    role : ''
  };

  $scope.submit = function() {
    userService.createUser($scope.newUser, function(data) {
      console.log(data);
    });
  }

}]);