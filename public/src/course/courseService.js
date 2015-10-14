// courseService.js
angular.module('LMSApp')

// factory service to communicate with the courses API and retreive data
.factory('courseService', ['$http', function($http) {
  // base url for API endpoint
  var baseUrl = 'http://127.0.0.1:3000/api/course'

  // fetch courses and callbacks ================
  var getAllCourses = function(cb) {
    // cb is the callback provided by the controller
    $http.get(baseUrl).then(
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


  return {
    fetch : getAllCourses
  }
}]);
