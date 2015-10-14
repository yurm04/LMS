// CourseController.js ================
angular.module('LMSApp')
.controller('CourseController', ['$scope', 'courseService', function($scope, courseService) {
  $scope.newCourse = {
    title : '',
    department : '',
    number : '',
    instructor : ''
  };

  // need to hook into api
  $scope.addCourse = function() {
    console.log($scope.newCourse);
  }

  // get all courses on load
  var init = function() {
    courseService.fetch( function(courses) {
      // set courses
      $scope.courses = courses;

      // set instructors for new course
      $scope.instructors = [
        { id : 1, firstname : 'Yuraima', lastname : "Estevez" },
        { id : 2, firstname : 'Eric', lastname : "Bishop" },
        { id : 3, firstname : 'Fazil', lastname : "Haroon" },
      ];
    });
  }

  init();
}]);