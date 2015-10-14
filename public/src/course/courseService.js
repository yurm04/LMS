// courseService.js
angular.module('LMSApp')

// factory service to communicate with the courses API and retreive data
.factory('courseService', ['$http', function() {
  // base url for API endpoint
  var baseUrl = 'http://127.0.0.1:3000/courses'

  // fetch courses and callbacks ================
  var getAllCourses = function(cb) {
    // cb is the callback provided by the controller
    $http.get(baseUrl).then(
      // callback for successful request
      function successCallback(res) {
        
      },

      // callback for error
      function errorCallback(res) {

      }
    );
  };


  return {
    fetch : getAllCourses;
  },
  }
}]);
