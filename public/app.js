angular.module('LMSApp', ['ui.router'])

// app constants ======================
.constant('RESOURCES', (function() {
  var base_url = 'http://127.0.0.1:3000/api/';
  return {
    BASE : base_url,
    USERS : base_url + 'users/',
    COURSES : base_url + 'courses/',
    LOGIN : base_url + 'login/'
  };
})())

// config settings for router
.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    
  $urlRouterProvider.otherwise('/login');

  $stateProvider
      
      // login state ==================
      .state('login', {
          url: '/login',
          templateUrl: 'src/login/login.html'
          // requireLogin: false
      })

      // signup state =================
      .state('signup', {
        url: '/signup',
        templateUrl: 'src/signup/signup.html'
      })
      
      // overview state ===============
      .state('overview', {
          url: '/overview',
          templateUrl: 'src/login/overview.html'
          // requireLogin: true
      })

      // courses state ================
      .state('courses', {
        url: '/courses',
        templateUrl: 'src/course/courses.html'
        // requireLogin: true
      })

      // quiz state ===================
      .state('quizes', {
        url: '/quizes',
        templateUrl: 'src/quiz/quizes.html'
      })

      // profile state ================
      .state('profile', {
        url : '/profile',
        templateUrl: 'src/profile/profile.html'
      })

  $locationProvider.html5Mode(true);
      
}])

// For authentication checks
.run(["$rootScope", function ($rootScope) {

  // listen on state change events
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    // if login is required and there is no currentUser set, 
    if (toState.requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();
      // redirect to login
      $state.go('login');
    }
  });

}]);
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

  return {
    fetch : getAllCourses
  }
}]);

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
      };
    });
  }

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
        return cb(res.data.data);
      },
      function errorCallback(res) {
        // console.log(res.data.data);
      }
    );
  };

  // Login page, method to login a user
  var _login = function(user, cb) {
    var body = { data : user };
    console.log(body);
    $http.post(RESOURCES.LOGIN, body).then(
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
// SignUpController.js ================
angular.module('LMSApp')
.controller('SignupController', ['$scope', '$state', 'userService', 'courseService', function($scope, $state, userService, courseService) {
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
      $state.go('courses');
    });
  }

}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvdXJzZS9Db3Vyc2VDb250cm9sbGVyLmpzIiwiY291cnNlL2NvdXJzZVNlcnZpY2UuanMiLCJsb2dpbi9Mb2dpbkNvbnRyb2xsZXIuanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsInNpZ251cC9TaWdudXBDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxVQUFBLENBQUE7OztDQUdBLFNBQUEsYUFBQSxDQUFBLFdBQUE7RUFDQSxJQUFBLFdBQUE7RUFDQSxPQUFBO0lBQ0EsT0FBQTtJQUNBLFFBQUEsV0FBQTtJQUNBLFVBQUEsV0FBQTtJQUNBLFFBQUEsV0FBQTs7Ozs7Q0FLQSxxRUFBQSxTQUFBLGdCQUFBLG9CQUFBLG1CQUFBOztFQUVBLG1CQUFBLFVBQUE7O0VBRUE7OztPQUdBLE1BQUEsU0FBQTtVQUNBLEtBQUE7VUFDQSxhQUFBOzs7OztPQUtBLE1BQUEsVUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBOzs7O09BSUEsTUFBQSxZQUFBO1VBQ0EsS0FBQTtVQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7Ozs7T0FJQSxNQUFBLFdBQUE7UUFDQSxNQUFBO1FBQ0EsYUFBQTs7O0VBR0Esa0JBQUEsVUFBQTs7Ozs7Q0FLQSxtQkFBQSxVQUFBLFlBQUE7OztFQUdBLFdBQUEsSUFBQSxxQkFBQSxVQUFBLE9BQUEsU0FBQSxVQUFBOztJQUVBLElBQUEsUUFBQSxnQkFBQSxPQUFBLFdBQUEsZ0JBQUEsYUFBQTtNQUNBLE1BQUE7O01BRUEsT0FBQSxHQUFBOzs7Ozs7QUN2RUEsUUFBQSxPQUFBO0NBQ0EsV0FBQSxvQkFBQSxDQUFBLFVBQUEsaUJBQUEsZUFBQSxTQUFBLFFBQUEsZUFBQSxhQUFBOztFQUVBLE9BQUEsWUFBQTtJQUNBLFFBQUE7SUFDQSxhQUFBO0lBQ0EsU0FBQTtJQUNBLGFBQUE7Ozs7RUFJQSxPQUFBLFlBQUEsU0FBQSxVQUFBO0lBQ0EsSUFBQSxpQkFBQSxFQUFBLE9BQUEsWUFBQSxRQUFBLFNBQUE7Ozs7O0VBS0EsSUFBQSxPQUFBLFdBQUE7SUFDQSxjQUFBLE9BQUEsU0FBQSxTQUFBO01BQ0EsWUFBQSxlQUFBLFNBQUEsYUFBQTtRQUNBLE9BQUEsY0FBQTs7O1FBR0EsSUFBQSxhQUFBLFFBQUEsS0FBQSxTQUFBLFFBQUE7VUFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsWUFBQSxRQUFBLEtBQUE7WUFDQSxJQUFBLFlBQUEsR0FBQSxRQUFBLE9BQUEsY0FBQTtjQUNBLE9BQUEsaUJBQUEsWUFBQSxHQUFBO2FBQ0E7V0FDQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsVUFBQTs7Ozs7RUFLQTs7O0FDckNBLFFBQUEsT0FBQTs7O0NBR0EsUUFBQSxpQkFBQSxDQUFBLFNBQUEsYUFBQSxTQUFBLE9BQUEsV0FBQTs7O0VBR0EsSUFBQSxnQkFBQSxTQUFBLElBQUE7O0lBRUEsTUFBQSxJQUFBLFVBQUEsU0FBQTs7TUFFQSxTQUFBLGdCQUFBLEtBQUE7UUFDQSxPQUFBLEdBQUEsSUFBQSxLQUFBOzs7O01BSUEsU0FBQSxjQUFBLEtBQUE7UUFDQSxRQUFBLElBQUE7Ozs7O0VBS0EsT0FBQTtJQUNBLFFBQUE7Ozs7QUN2QkEsUUFBQSxPQUFBO0NBQ0EsV0FBQSxtQkFBQSxDQUFBLFVBQUEsVUFBQSxlQUFBLFVBQUEsUUFBQSxRQUFBLGNBQUE7O0VBRUEsT0FBQSxlQUFBOzs7RUFHQSxPQUFBLE9BQUE7O0VBRUEsT0FBQSxRQUFBLFdBQUE7SUFDQSxZQUFBLE1BQUEsT0FBQSxNQUFBLFNBQUEsTUFBQTtNQUNBLFFBQUEsSUFBQTtNQUNBLElBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxZQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsR0FBQTtPQUNBOzs7OztFQUtBLE9BQUEsV0FBQSxXQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsVUFBQSxLQUFBOzs7O0VBSUEsU0FBQSxlQUFBO0lBQ0EsSUFBQSxXQUFBLE9BQUEsS0FBQTs7SUFFQSxLQUFBLGFBQUEsTUFBQSxhQUFBLEtBQUEsQ0FBQSxjQUFBLFlBQUE7TUFDQSxRQUFBLElBQUE7TUFDQSxPQUFBO1dBQ0E7TUFDQSxPQUFBOzs7OztFQUtBLFNBQUEsbUJBQUE7SUFDQSxJQUFBLFdBQUEsT0FBQSxLQUFBOztJQUVBLEtBQUEsYUFBQSxNQUFBLGFBQUEsS0FBQSxDQUFBLGNBQUEsWUFBQTtNQUNBLFFBQUEsSUFBQTtNQUNBLE9BQUE7V0FDQTtNQUNBLE9BQUE7Ozs7O0VBS0EsU0FBQSxjQUFBLEtBQUE7SUFDQSxPQUFBOzs7Ozs7O0FDakRBLFFBQUEsT0FBQTtDQUNBLFFBQUEsZUFBQSxDQUFBLFNBQUEsYUFBQSxTQUFBLE9BQUEsV0FBQTs7RUFFQSxJQUFBLGNBQUE7RUFDQSxJQUFBLFNBQUE7RUFDQSxJQUFBLGFBQUE7RUFDQSxJQUFBLE9BQUE7OztFQUdBLElBQUEsY0FBQSxTQUFBLE1BQUEsSUFBQTtJQUNBLElBQUEsT0FBQSxFQUFBLE9BQUE7SUFDQSxNQUFBLE1BQUEsVUFBQSxPQUFBLE9BQUE7TUFDQSxTQUFBLGdCQUFBLEtBQUE7UUFDQSxjQUFBLElBQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxPQUFBLEdBQUEsSUFBQSxLQUFBOztNQUVBLFNBQUEsY0FBQSxLQUFBOzs7Ozs7O0VBT0EsSUFBQSxTQUFBLFNBQUEsTUFBQSxJQUFBO0lBQ0EsSUFBQSxPQUFBLEVBQUEsT0FBQTtJQUNBLFFBQUEsSUFBQTtJQUNBLE1BQUEsS0FBQSxVQUFBLE9BQUEsTUFBQTtNQUNBLFNBQUEsZ0JBQUEsS0FBQTtRQUNBLE9BQUEsR0FBQSxJQUFBLEtBQUE7O01BRUEsU0FBQSxjQUFBLEtBQUE7UUFDQSxRQUFBLElBQUE7Ozs7OztFQU1BLElBQUEsV0FBQSxTQUFBLE1BQUE7SUFDQSxjQUFBO0lBQ0EsYUFBQTtJQUNBLE9BQUEsS0FBQTs7OztFQUlBLElBQUEsV0FBQSxXQUFBO0lBQ0EsT0FBQTs7OztFQUlBLElBQUEsa0JBQUEsU0FBQSxJQUFBO0lBQ0EsTUFBQSxJQUFBLGVBQUE7TUFDQSxTQUFBLGdCQUFBLEtBQUE7UUFDQSxPQUFBLEdBQUEsSUFBQSxLQUFBOztNQUVBLFNBQUEsY0FBQSxLQUFBO1FBQ0EsUUFBQSxJQUFBOzs7Ozs7RUFNQSxJQUFBLFVBQUEsV0FBQTtJQUNBLGNBQUE7SUFDQSxhQUFBO0lBQ0EsT0FBQTs7O0VBR0EsT0FBQTtJQUNBLGlCQUFBO0lBQ0EsYUFBQTtJQUNBLGlCQUFBO0lBQ0EsUUFBQTtJQUNBLFNBQUE7SUFDQSxPQUFBO0lBQ0EsaUJBQUE7Ozs7QUMzRUEsUUFBQSxPQUFBO0NBQ0EsV0FBQSxvQkFBQSxDQUFBLFVBQUEsVUFBQSxlQUFBLGlCQUFBLFNBQUEsUUFBQSxRQUFBLGFBQUEsZUFBQTs7RUFFQSxPQUFBLGVBQUE7O0VBRUEsT0FBQSxRQUFBLENBQUEsV0FBQTs7O0VBR0EsT0FBQSxVQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7SUFDQSxRQUFBO0lBQ0EsV0FBQTtJQUNBLE9BQUE7OztFQUdBLE9BQUEsU0FBQSxXQUFBO0lBQ0EsWUFBQSxXQUFBLE9BQUEsU0FBQSxTQUFBLE1BQUE7TUFDQSxPQUFBLEdBQUE7Ozs7SUFJQSIsImZpbGUiOiJwdWJsaWMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcsIFsndWkucm91dGVyJ10pXG5cbi8vIGFwcCBjb25zdGFudHMgPT09PT09PT09PT09PT09PT09PT09PVxuLmNvbnN0YW50KCdSRVNPVVJDRVMnLCAoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlX3VybCA9ICdodHRwOi8vMTI3LjAuMC4xOjMwMDAvYXBpLyc7XG4gIHJldHVybiB7XG4gICAgQkFTRSA6IGJhc2VfdXJsLFxuICAgIFVTRVJTIDogYmFzZV91cmwgKyAndXNlcnMvJyxcbiAgICBDT1VSU0VTIDogYmFzZV91cmwgKyAnY291cnNlcy8nLFxuICAgIExPR0lOIDogYmFzZV91cmwgKyAnbG9naW4vJ1xuICB9O1xufSkoKSlcblxuLy8gY29uZmlnIHNldHRpbmdzIGZvciByb3V0ZXJcbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICBcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIFxuICAgICAgLy8gbG9naW4gc3RhdGUgPT09PT09PT09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvbG9naW4vbG9naW4uaHRtbCdcbiAgICAgICAgICAvLyByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICAvLyBzaWdudXAgc3RhdGUgPT09PT09PT09PT09PT09PT1cbiAgICAgIC5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvc2lnbnVwL3NpZ251cC5odG1sJ1xuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy8gb3ZlcnZpZXcgc3RhdGUgPT09PT09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ292ZXJ2aWV3Jywge1xuICAgICAgICAgIHVybDogJy9vdmVydmlldycsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvbG9naW4vb3ZlcnZpZXcuaHRtbCdcbiAgICAgICAgICAvLyByZXF1aXJlTG9naW46IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIGNvdXJzZXMgc3RhdGUgPT09PT09PT09PT09PT09PVxuICAgICAgLnN0YXRlKCdjb3Vyc2VzJywge1xuICAgICAgICB1cmw6ICcvY291cnNlcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2NvdXJzZS9jb3Vyc2VzLmh0bWwnXG4gICAgICAgIC8vIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgfSlcblxuICAgICAgLy8gcXVpeiBzdGF0ZSA9PT09PT09PT09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ3F1aXplcycsIHtcbiAgICAgICAgdXJsOiAnL3F1aXplcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL3F1aXovcXVpemVzLmh0bWwnXG4gICAgICB9KVxuXG4gICAgICAvLyBwcm9maWxlIHN0YXRlID09PT09PT09PT09PT09PT1cbiAgICAgIC5zdGF0ZSgncHJvZmlsZScsIHtcbiAgICAgICAgdXJsIDogJy9wcm9maWxlJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvcHJvZmlsZS9wcm9maWxlLmh0bWwnXG4gICAgICB9KVxuXG4gICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAgIFxufSlcblxuLy8gRm9yIGF1dGhlbnRpY2F0aW9uIGNoZWNrc1xuLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG4gIC8vIGxpc3RlbiBvbiBzdGF0ZSBjaGFuZ2UgZXZlbnRzXG4gICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcbiAgICAvLyBpZiBsb2dpbiBpcyByZXF1aXJlZCBhbmQgdGhlcmUgaXMgbm8gY3VycmVudFVzZXIgc2V0LCBcbiAgICBpZiAodG9TdGF0ZS5yZXF1aXJlTG9naW4gJiYgdHlwZW9mICRyb290U2NvcGUuY3VycmVudFVzZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gcmVkaXJlY3QgdG8gbG9naW5cbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG4gIH0pO1xuXG59KTsiLCIvLyBDb3Vyc2VDb250cm9sbGVyLmpzID09PT09PT09PT09PT09PT1cbmFuZ3VsYXIubW9kdWxlKCdMTVNBcHAnKVxuLmNvbnRyb2xsZXIoJ0NvdXJzZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICdjb3Vyc2VTZXJ2aWNlJywgJ3VzZXJTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCBjb3Vyc2VTZXJ2aWNlLCB1c2VyU2VydmljZSkge1xuICAvLyB2YXIgZm9yIG5ldyBjb3Vyc2Ugb2JqZWN0XG4gICRzY29wZS5uZXdDb3Vyc2UgPSB7XG4gICAgdGl0bGUgOiAnJyxcbiAgICBkZXBhcnRtZW50IDogJycsXG4gICAgbnVtYmVyIDogJycsXG4gICAgaW5zdHJ1Y3RvciA6ICcnXG4gIH07XG5cbiAgLy8gbmVlZCB0byBob29rIGludG8gYXBpXG4gICRzY29wZS5hZGRDb3Vyc2UgPSBmdW5jdGlvbihjb3Vyc2VJZCkge1xuICAgIHZhciBzZWxlY3RlZENvdXJzZSA9IHsgdXNlciA6IHVzZXJTZXJ2aWNlLnVzZXJJZCwgY291cnNlIDogY291cnNlSWQgfTtcbiAgICAvLyBjb3Vyc2VTZXJ2aWNlLmFkZENvdXJzZShzZWxlY3RlZENvdXJzZSwgZnVuY3Rpb24oZGF0YSkpO1xuICB9XG5cbiAgLy8gZ2V0IGFsbCBjb3Vyc2VzIG9uIGxvYWRcbiAgdmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBjb3Vyc2VTZXJ2aWNlLmZldGNoKCBmdW5jdGlvbihjb3Vyc2VzKSB7XG4gICAgICB1c2VyU2VydmljZS5nZXRJbnN0cnVjdG9ycyhmdW5jdGlvbihpbnN0cnVjdG9ycykge1xuICAgICAgICAkc2NvcGUuaW5zdHJ1Y3RvcnMgPSBpbnN0cnVjdG9ycztcbiAgICAgICAgXG4gICAgICAgIC8vIHNldCBjb3Vyc2VzXG4gICAgICAgIHZhciBhbGxDb3Vyc2VzID0gY291cnNlcy5tYXAoIGZ1bmN0aW9uKGNvdXJzZSkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zdHJ1Y3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpbnN0cnVjdG9yc1tpXS5faWQgPT09IGNvdXJzZS5pbnN0cnVjdG9ySWQpIHtcbiAgICAgICAgICAgICAgY291cnNlLmluc3RydWN0b3JOYW1lID0gaW5zdHJ1Y3RvcnNbaV0ubGFzdG5hbWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIGNvdXJzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY291cnNlcyA9IGFsbENvdXJzZXM7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQoKTtcbn1dKTsiLCIvLyBjb3Vyc2VTZXJ2aWNlLmpzXG5hbmd1bGFyLm1vZHVsZSgnTE1TQXBwJylcblxuLy8gZmFjdG9yeSBzZXJ2aWNlIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIGNvdXJzZXMgQVBJIGFuZCByZXRyZWl2ZSBkYXRhXG4uZmFjdG9yeSgnY291cnNlU2VydmljZScsIFsnJGh0dHAnLCAnUkVTT1VSQ0VTJywgZnVuY3Rpb24oJGh0dHAsIFJFU09VUkNFUykge1xuXG4gIC8vIGZldGNoIGNvdXJzZXMgYW5kIGNhbGxiYWNrcyA9PT09PT09PT09PT09PT09XG4gIHZhciBnZXRBbGxDb3Vyc2VzID0gZnVuY3Rpb24oY2IpIHtcbiAgICAvLyBjYiBpcyB0aGUgY2FsbGJhY2sgcHJvdmlkZWQgYnkgdGhlIGNvbnRyb2xsZXJcbiAgICAkaHR0cC5nZXQoUkVTT1VSQ0VTLkNPVVJTRVMpLnRoZW4oXG4gICAgICAvLyBjYWxsYmFjayBmb3Igc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBmdW5jdGlvbiBzdWNjZXNzQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIHJldHVybiBjYihyZXMuZGF0YS5kYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIGNhbGxiYWNrIGZvciBlcnJvclxuICAgICAgZnVuY3Rpb24gZXJyb3JDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgZmV0Y2ggOiBnZXRBbGxDb3Vyc2VzXG4gIH1cbn1dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdMTVNBcHAnKVxuLmNvbnRyb2xsZXIoJ0xvZ2luQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICd1c2VyU2VydmljZScsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgdXNlclNlcnZpY2UgKSB7XG4gIC8vIGVtYWlsIHBhdHRlcm4gcmVnZXhcbiAgJHNjb3BlLmVtYWlsUGF0dGVybiA9IC9eKFtcXHctXSsoPzpcXC5bXFx3LV0rKSopQCgoPzpbXFx3LV0rXFwuKSpcXHdbXFx3LV17MCw2Nn0pXFwuKFthLXpdezIsNn0oPzpcXC5bYS16XXsyfSk/KSQvaTtcblxuICAvLyBpbml0aWFsaXplIHVzZXIgb2JqZWN0IHdpdGggZW1wdHkgdmFsdWVzXG4gICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UubG9naW4oJHNjb3BlLnVzZXIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgaWYgKGRhdGEudHlwZSA9PT0gdHJ1ZSkge1xuICAgICAgICB1c2VyU2VydmljZS5zZXRVc2VyID0gZGF0YS51c2VyO1xuICAgICAgICAkc3RhdGUuZ28oJ2NvdXJzZXMnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBWYWxpZGF0aW9uIC0tLS0tLS0tLS0tLS1cbiAgJHNjb3BlLnZhbGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ2hlbGxvJyk7XG4gICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgfTtcblxuICAvLyB1c2VybmFtZSB2YWxpZGF0aW9uXG4gIGZ1bmN0aW9uIHZhbGlkYXRlVXNlcigpIHtcbiAgICB2YXIgdXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcblxuICAgIGlmICggdXNlcm5hbWUgPT09ICcnIHx8IHVzZXJuYW1lID09PSAwIHx8ICFzYW5pdGl6ZUlucHV0KHVzZXJuYW1lKSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIHVzZXJuYW1lJyk7XG4gICAgICByZXR1cm4gZmFsc2U7ICAgLy8gTmVlZCB0byBhZGQgaW5jb3JyZWN0IGJvb3RzdHJhcCBjbGFzc1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBwYXNzd29yZCB2YWxpZGF0aW9uXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGFzc3dvcmQoKSB7XG4gICAgdmFyIHBhc3N3b3JkID0gJHNjb3BlLnVzZXIucGFzc3dvcmQ7XG5cbiAgICBpZiAoIHBhc3N3b3JkID09PSAnJyB8fCBwYXNzd29yZCA9PT0gMCB8fCAhc2FuaXRpemVJbnB1dChwYXNzd29yZCkgKSB7XG4gICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBwYXNzd29yZCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBzYW5pdGl6ZSBpbnB1dHMgYmVmb3JlIHNlbmRpbmcgdG8gc2VydmVyXG4gIGZ1bmN0aW9uIHNhbml0aXplSW5wdXQodmFsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1dKTtcblxuXG4iLCIvLyB1c2VyU2VydmljZS5qcyA9PT09PT09PT09PT09PT09PT09PT1cbmFuZ3VsYXIubW9kdWxlKCdMTVNBcHAnKVxuLmZhY3RvcnkoJ3VzZXJTZXJ2aWNlJywgWyckaHR0cCcsICdSRVNPVVJDRVMnLCBmdW5jdGlvbigkaHR0cCwgUkVTT1VSQ0VTKSB7XG4gIC8vIGZhY3RvcnkgdXNlciB2YXJzXG4gIHZhciBjdXJyZW50VXNlciA9ICcnO1xuICB2YXIgdXNlcklkID0gJyc7XG4gIHZhciBpc0xvZ2dlZEluID0gZmFsc2U7XG4gIHZhciByb2xlID0gJyc7XG5cbiAgLy8gRm9yIHNpZ251cCBwYWdlLCBtZXRob2QgdG8gY3JlYXRlIG5ldyB1c2VyXG4gIHZhciBfY3JlYXRlVXNlciA9IGZ1bmN0aW9uKHVzZXIsIGNiKSB7XG4gICAgdmFyIGJvZHkgPSB7IGRhdGEgOiB1c2VyIH07XG4gICAgJGh0dHAucG9zdCggUkVTT1VSQ0VTLlVTRVJTLCBib2R5ICkudGhlbihcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgY3VycmVudFVzZXIgPSByZXMuZGF0YS5kYXRhO1xuICAgICAgICBpc0xvZ2dlZEluID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGNiKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgLy8gTG9naW4gcGFnZSwgbWV0aG9kIHRvIGxvZ2luIGEgdXNlclxuICB2YXIgX2xvZ2luID0gZnVuY3Rpb24odXNlciwgY2IpIHtcbiAgICB2YXIgYm9keSA9IHsgZGF0YSA6IHVzZXIgfTtcbiAgICBjb25zb2xlLmxvZyhib2R5KTtcbiAgICAkaHR0cC5wb3N0KFJFU09VUkNFUy5MT0dJTiwgYm9keSkudGhlbihcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgcmV0dXJuIGNiKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcbiAgXG4gIC8vIExvZ2luQ29udHJvbGxlciwgc2V0IGEgbmV3IHVzZXJcbiAgdmFyIF9zZXRVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgIGN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICBpc0xvZ2dlZEluID0gdHJ1ZTtcbiAgICByb2xlID0gdXNlci5yb2xlO1xuICB9O1xuXG4gIC8vIHJldHVybiBkYXRhIG9mIGN1cnJlbnQgdXNlclxuICB2YXIgX2dldFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3VycmVudFVzZXI7XG4gIH07XG5cbiAgLy8gR2V0IGFsbCBpbnN0cnVjdG9yc1xuICB2YXIgX2dldEluc3RydWN0b3JzID0gZnVuY3Rpb24oY2IpIHtcbiAgICAkaHR0cC5nZXQoaW5zdHJ1Y3RvclVybCkudGhlbihcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgcmV0dXJuIGNiKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICAvLyBsb2dvdXQgdGhlIGN1cnJlbnQgdXNlciwgdW5zZXQgYW55IHVzZXIgZGF0YVxuICB2YXIgX2xvZ091dCA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRVc2VyID0gJyc7XG4gICAgaXNMb2dnZWRJbiA9IGZhbHNlO1xuICAgIHJvbGUgPSAnJztcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldEluc3RydWN0b3JzIDogX2dldEluc3RydWN0b3JzLFxuICAgIGNyZWF0ZVVzZXIgOiBfY3JlYXRlVXNlcixcbiAgICBzZXRDdXJyZW50VXNlciA6IF9zZXRVc2VyLFxuICAgIGxvZ2luIDogX2xvZ2luLFxuICAgIGxvZ291dCA6IF9sb2dPdXQsXG4gICAgcm9sZSA6IHJvbGUsXG4gICAgZ2V0Q3VycmVudFVzZXIgOiBfZ2V0VXNlclxuICB9O1xufV0pOyIsIi8vIFNpZ25VcENvbnRyb2xsZXIuanMgPT09PT09PT09PT09PT09PVxuYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcpXG4uY29udHJvbGxlcignU2lnbnVwQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICd1c2VyU2VydmljZScsICdjb3Vyc2VTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHVzZXJTZXJ2aWNlLCBjb3Vyc2VTZXJ2aWNlKSB7XG4gIC8vIGVtYWlsIHBhdHRlcm5cbiAgJHNjb3BlLmVtYWlsUGF0dGVybiA9IC9eKFtcXHctXSsoPzpcXC5bXFx3LV0rKSopQCgoPzpbXFx3LV0rXFwuKSpcXHdbXFx3LV17MCw2Nn0pXFwuKFthLXpdezIsNn0oPzpcXC5bYS16XXsyfSk/KSQvaTtcblxuICAkc2NvcGUucm9sZXMgPSBbJ3N0dWRlbnQnLCAnaW5zdHJ1Y3RvciddO1xuXG4gIC8vIG5ldyB1c2VyIGZyb20gZm9ybVxuICAkc2NvcGUubmV3VXNlciA9IHtcbiAgICBmaXJzdG5hbWUgOiAnJyxcbiAgICBsYXN0bmFtZSA6ICcnLFxuICAgIGVtYWlsIDogJycsXG4gICAgcGFzc3dvcmQgOiAnJyxcbiAgICByb2xlIDogJydcbiAgfTtcblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdXNlclNlcnZpY2UuY3JlYXRlVXNlcigkc2NvcGUubmV3VXNlciwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHN0YXRlLmdvKCdjb3Vyc2VzJyk7XG4gICAgfSk7XG4gIH1cblxufV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
