// courseService.js
angular.module('LMSApp')

// factory service to communicate with the courses API and retreive data
.factory('courseService', ['$http', 'RESOURCES', function($http, RESOURCES) {

  // fetch courses and callbacks ================
  var getAllCourses = function(cb) {
    // cb is the callback provided by the controller
    $http.get(RESOURCES.COURSES).then(
      // callback for successful request
      function successCallback(res) {
        return cb(res.data.data);
      },

      // callback for error
      function errorCallback(res) {
        console.log(res);
      }
    );
  };


  // Get all instructors
  var _getInstructors = function(cb) {
    $http.get(RESOURCES.INSTRUCTORS).then(
      function successCallback(res) {
        return cb(res.data.data);
      },
      function errorCallback(res) {
        console.log(res);
      }
    );
  };

  return {
    fetch : getAllCourses,
    getInstructors : _getInstructors
  };
}]);
