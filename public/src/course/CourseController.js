// CourseController.js ================
angular.module('LMSApp')
.controller('CourseController', ['$scope', '$state', 'courseService', 'userService', function($scope, $state, courseService, userService) {
  // var for new course object
  $scope.newCourse = {
    title : '',
    department : '',
    number : '',
    instructorId : ''
  };

  // need to hook into api
  $scope.addCourse = function(courseId) {
    var selectedCourse = { user : userService.userId, course : courseId };
    // courseService.addCourse(selectedCourse, function(data));
  };

  $scope.createCourse = function() {
    console.log($scope.newCourse);
    courseService.createCourse($scope.newCourse, function(data) {
      if (data.type === true) {
        console.log(data);
        $state.go('courses');
      }
    });
  };

  var getUserCourses = function() {
    var userId = userService.getUserId();
    courseService.getUserCourses(userId, function(data) {
      console.log(data);
      if (data.type === true) {
        $scope.userCourses = data.data;
      }
    });
  };

  // get all courses on load
  var init = function() {
    console.log(userService.getUserId());
    courseService.fetch( function(courses) {
      courseService.getInstructors(function(instructors) {
        $scope.instructors = instructors;
        
        // get user courses
        getUserCourses();

        // set courses
        var allCourses = courses.map( function(course) {
          for (var i = 0; i < instructors.length; i++) {
            if (instructors[i]._id === course.instructorId) {
              course.instructorName = instructors[i].lastname;
            }
          }
          return course;
        });

        $scope.courses = allCourses;
      });
    });
  };

  init();
}]);