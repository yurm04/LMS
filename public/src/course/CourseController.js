// CourseController.js ================
angular.module('LMSApp')
.controller('CourseController', ['$scope', 'courseService', 'userService', function($scope, courseService, userService) {
  // var for new course object
  $scope.newCourse = {
    title : '',
    department : '',
    number : '',
    instructor : ''
  };

  // need to hook into api
  $scope.addCourse = function(courseId) {
    var selectedCourse = { user : userService.userId, course : courseId };
    // courseService.addCourse(selectedCourse, function(data));
  }

  // get all courses on load
  var init = function() {
    courseService.fetch( function(courses) {
      userService.getInstructors(function(instructors) {
        $scope.instructors = instructors;
        
        // set courses
        var allCourses = courses.map( function(course) {
          for (var i = 0; i < instructors.length; i++) {
            if (instructors[i]._id === course.instructorId) {
              course.instructorName = instructors[i].lastname;
            };
          };
          return course;
        });
        
        $scope.courses = allCourses;
      });
    });
  }

  init();
}]);