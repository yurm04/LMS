angular.module('LMSApp', ['ui.router'])

// app constants ======================
.constant('RESOURCES', (function() {
  var base_url = 'http://127.0.0.1:3000/api/';
  return {
    BASE : base_url,
    USERS : base_url + 'users/',
    COURSES : base_url + 'courses/',
    LOGIN : base_url + 'login/',
    INSTRUCTORS : base_url + 'instructors/'
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

      // createCourse state ===========
      .state('createCourse', {
        url : '/createCourse',
        templateUrl: 'src/course/createCourse.html'
      });

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
  };

  $scope.createCourse = function() {
    courseService.createCourse($scope.newCourse, function(data) {
      
    });
  };

  // get all courses on load
  var init = function() {
    courseService.fetch( function(courses) {
      courseService.getInstructors(function(instructors) {
        $scope.instructors = instructors;
        
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
        console.log(res.data.data);
      }
    );
  };

  // Login page, method to login a user
  var _login = function(user, cb) {
    var body = { data : user };
    console.log(body);
    $http.post(RESOURCES.LOGIN, body).then(
      function successCallback(res) {
        return cb(res.data);
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

  // logout the current user, unset any user data
  var _logOut = function() {
    currentUser = '';
    isLoggedIn = false;
    role = '';
  };

  return {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvdXJzZS9Db3Vyc2VDb250cm9sbGVyLmpzIiwiY291cnNlL2NvdXJzZVNlcnZpY2UuanMiLCJsb2dpbi9Mb2dpbkNvbnRyb2xsZXIuanMiLCJzZXJ2aWNlcy91c2VyU2VydmljZS5qcyIsInNpZ251cC9TaWdudXBDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxVQUFBLENBQUE7OztDQUdBLFNBQUEsYUFBQSxDQUFBLFdBQUE7RUFDQSxJQUFBLFdBQUE7RUFDQSxPQUFBO0lBQ0EsT0FBQTtJQUNBLFFBQUEsV0FBQTtJQUNBLFVBQUEsV0FBQTtJQUNBLFFBQUEsV0FBQTtJQUNBLGNBQUEsV0FBQTs7Ozs7Q0FLQSxxRUFBQSxTQUFBLGdCQUFBLG9CQUFBLG1CQUFBOztFQUVBLG1CQUFBLFVBQUE7O0VBRUE7OztPQUdBLE1BQUEsU0FBQTtVQUNBLEtBQUE7VUFDQSxhQUFBOzs7OztPQUtBLE1BQUEsVUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBOzs7O09BSUEsTUFBQSxZQUFBO1VBQ0EsS0FBQTtVQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7Ozs7O09BS0EsTUFBQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7Ozs7T0FJQSxNQUFBLFdBQUE7UUFDQSxNQUFBO1FBQ0EsYUFBQTs7OztPQUlBLE1BQUEsZ0JBQUE7UUFDQSxNQUFBO1FBQ0EsYUFBQTs7O0VBR0Esa0JBQUEsVUFBQTs7Ozs7Q0FLQSxtQkFBQSxVQUFBLFlBQUE7OztFQUdBLFdBQUEsSUFBQSxxQkFBQSxVQUFBLE9BQUEsU0FBQSxVQUFBOztJQUVBLElBQUEsUUFBQSxnQkFBQSxPQUFBLFdBQUEsZ0JBQUEsYUFBQTtNQUNBLE1BQUE7O01BRUEsT0FBQSxHQUFBOzs7Ozs7QUM5RUEsUUFBQSxPQUFBO0NBQ0EsV0FBQSxvQkFBQSxDQUFBLFVBQUEsaUJBQUEsZUFBQSxTQUFBLFFBQUEsZUFBQSxhQUFBOztFQUVBLE9BQUEsWUFBQTtJQUNBLFFBQUE7SUFDQSxhQUFBO0lBQ0EsU0FBQTtJQUNBLGFBQUE7Ozs7RUFJQSxPQUFBLFlBQUEsU0FBQSxVQUFBO0lBQ0EsSUFBQSxpQkFBQSxFQUFBLE9BQUEsWUFBQSxRQUFBLFNBQUE7Ozs7RUFJQSxPQUFBLGVBQUEsV0FBQTtJQUNBLGNBQUEsYUFBQSxPQUFBLFdBQUEsU0FBQSxNQUFBOzs7Ozs7RUFNQSxJQUFBLE9BQUEsV0FBQTtJQUNBLGNBQUEsT0FBQSxTQUFBLFNBQUE7TUFDQSxjQUFBLGVBQUEsU0FBQSxhQUFBO1FBQ0EsT0FBQSxjQUFBOzs7UUFHQSxJQUFBLGFBQUEsUUFBQSxLQUFBLFNBQUEsUUFBQTtVQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxZQUFBLFFBQUEsS0FBQTtZQUNBLElBQUEsWUFBQSxHQUFBLFFBQUEsT0FBQSxjQUFBO2NBQ0EsT0FBQSxpQkFBQSxZQUFBLEdBQUE7OztVQUdBLE9BQUE7OztRQUdBLE9BQUEsVUFBQTs7Ozs7RUFLQTs7O0FDM0NBLFFBQUEsT0FBQTs7O0NBR0EsUUFBQSxpQkFBQSxDQUFBLFNBQUEsYUFBQSxTQUFBLE9BQUEsV0FBQTs7O0VBR0EsSUFBQSxnQkFBQSxTQUFBLElBQUE7O0lBRUEsTUFBQSxJQUFBLFVBQUEsU0FBQTs7TUFFQSxTQUFBLGdCQUFBLEtBQUE7UUFDQSxPQUFBLEdBQUEsSUFBQSxLQUFBOzs7O01BSUEsU0FBQSxjQUFBLEtBQUE7UUFDQSxRQUFBLElBQUE7Ozs7Ozs7RUFPQSxJQUFBLGtCQUFBLFNBQUEsSUFBQTtJQUNBLE1BQUEsSUFBQSxVQUFBLGFBQUE7TUFDQSxTQUFBLGdCQUFBLEtBQUE7UUFDQSxPQUFBLEdBQUEsSUFBQSxLQUFBOztNQUVBLFNBQUEsY0FBQSxLQUFBO1FBQ0EsUUFBQSxJQUFBOzs7OztFQUtBLE9BQUE7SUFDQSxRQUFBO0lBQ0EsaUJBQUE7Ozs7QUNyQ0EsUUFBQSxPQUFBO0NBQ0EsV0FBQSxtQkFBQSxDQUFBLFVBQUEsVUFBQSxlQUFBLFVBQUEsUUFBQSxRQUFBLGNBQUE7O0VBRUEsT0FBQSxlQUFBOzs7RUFHQSxPQUFBLE9BQUE7O0VBRUEsT0FBQSxRQUFBLFdBQUE7SUFDQSxZQUFBLE1BQUEsT0FBQSxNQUFBLFNBQUEsTUFBQTtNQUNBLFFBQUEsSUFBQTtNQUNBLElBQUEsS0FBQSxTQUFBLE1BQUE7UUFDQSxZQUFBLFVBQUEsS0FBQTtRQUNBLE9BQUEsR0FBQTs7Ozs7O0VBTUEsT0FBQSxXQUFBLFdBQUE7SUFDQSxRQUFBLElBQUE7SUFDQSxVQUFBLEtBQUE7Ozs7RUFJQSxTQUFBLGVBQUE7SUFDQSxJQUFBLFdBQUEsT0FBQSxLQUFBOztJQUVBLEtBQUEsYUFBQSxNQUFBLGFBQUEsS0FBQSxDQUFBLGNBQUEsWUFBQTtNQUNBLFFBQUEsSUFBQTtNQUNBLE9BQUE7V0FDQTtNQUNBLE9BQUE7Ozs7O0VBS0EsU0FBQSxtQkFBQTtJQUNBLElBQUEsV0FBQSxPQUFBLEtBQUE7O0lBRUEsS0FBQSxhQUFBLE1BQUEsYUFBQSxLQUFBLENBQUEsY0FBQSxZQUFBO01BQ0EsUUFBQSxJQUFBO01BQ0EsT0FBQTtXQUNBO01BQ0EsT0FBQTs7Ozs7RUFLQSxTQUFBLGNBQUEsS0FBQTtJQUNBLE9BQUE7Ozs7Ozs7QUNqREEsUUFBQSxPQUFBO0NBQ0EsUUFBQSxlQUFBLENBQUEsU0FBQSxhQUFBLFNBQUEsT0FBQSxXQUFBOztFQUVBLElBQUEsY0FBQTtFQUNBLElBQUEsU0FBQTtFQUNBLElBQUEsYUFBQTtFQUNBLElBQUEsT0FBQTs7O0VBR0EsSUFBQSxjQUFBLFNBQUEsTUFBQSxJQUFBO0lBQ0EsSUFBQSxPQUFBLEVBQUEsT0FBQTtJQUNBLE1BQUEsTUFBQSxVQUFBLE9BQUEsT0FBQTtNQUNBLFNBQUEsZ0JBQUEsS0FBQTtRQUNBLGNBQUEsSUFBQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLE9BQUEsR0FBQSxJQUFBLEtBQUE7O01BRUEsU0FBQSxjQUFBLEtBQUE7UUFDQSxRQUFBLElBQUEsSUFBQSxLQUFBOzs7Ozs7RUFNQSxJQUFBLFNBQUEsU0FBQSxNQUFBLElBQUE7SUFDQSxJQUFBLE9BQUEsRUFBQSxPQUFBO0lBQ0EsUUFBQSxJQUFBO0lBQ0EsTUFBQSxLQUFBLFVBQUEsT0FBQSxNQUFBO01BQ0EsU0FBQSxnQkFBQSxLQUFBO1FBQ0EsT0FBQSxHQUFBLElBQUE7O01BRUEsU0FBQSxjQUFBLEtBQUE7UUFDQSxRQUFBLElBQUE7Ozs7OztFQU1BLElBQUEsV0FBQSxTQUFBLE1BQUE7SUFDQSxjQUFBO0lBQ0EsYUFBQTtJQUNBLE9BQUEsS0FBQTs7OztFQUlBLElBQUEsV0FBQSxXQUFBO0lBQ0EsT0FBQTs7OztFQUlBLElBQUEsVUFBQSxXQUFBO0lBQ0EsY0FBQTtJQUNBLGFBQUE7SUFDQSxPQUFBOzs7RUFHQSxPQUFBO0lBQ0EsYUFBQTtJQUNBLGlCQUFBO0lBQ0EsUUFBQTtJQUNBLFNBQUE7SUFDQSxPQUFBO0lBQ0EsaUJBQUE7Ozs7QUM5REEsUUFBQSxPQUFBO0NBQ0EsV0FBQSxvQkFBQSxDQUFBLFVBQUEsVUFBQSxlQUFBLGlCQUFBLFNBQUEsUUFBQSxRQUFBLGFBQUEsZUFBQTs7RUFFQSxPQUFBLGVBQUE7O0VBRUEsT0FBQSxRQUFBLENBQUEsV0FBQTs7O0VBR0EsT0FBQSxVQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7SUFDQSxRQUFBO0lBQ0EsV0FBQTtJQUNBLE9BQUE7OztFQUdBLE9BQUEsU0FBQSxXQUFBO0lBQ0EsWUFBQSxXQUFBLE9BQUEsU0FBQSxTQUFBLE1BQUE7TUFDQSxPQUFBLEdBQUE7Ozs7SUFJQSIsImZpbGUiOiJwdWJsaWMvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcsIFsndWkucm91dGVyJ10pXG5cbi8vIGFwcCBjb25zdGFudHMgPT09PT09PT09PT09PT09PT09PT09PVxuLmNvbnN0YW50KCdSRVNPVVJDRVMnLCAoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlX3VybCA9ICdodHRwOi8vMTI3LjAuMC4xOjMwMDAvYXBpLyc7XG4gIHJldHVybiB7XG4gICAgQkFTRSA6IGJhc2VfdXJsLFxuICAgIFVTRVJTIDogYmFzZV91cmwgKyAndXNlcnMvJyxcbiAgICBDT1VSU0VTIDogYmFzZV91cmwgKyAnY291cnNlcy8nLFxuICAgIExPR0lOIDogYmFzZV91cmwgKyAnbG9naW4vJyxcbiAgICBJTlNUUlVDVE9SUyA6IGJhc2VfdXJsICsgJ2luc3RydWN0b3JzLydcbiAgfTtcbn0pKCkpXG5cbi8vIGNvbmZpZyBzZXR0aW5ncyBmb3Igcm91dGVyXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9sb2dpbicpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgICBcbiAgICAgIC8vIGxvZ2luIHN0YXRlID09PT09PT09PT09PT09PT09PVxuICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2xvZ2luL2xvZ2luLmh0bWwnXG4gICAgICAgICAgLy8gcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgfSlcblxuICAgICAgLy8gc2lnbnVwIHN0YXRlID09PT09PT09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL3NpZ251cC9zaWdudXAuaHRtbCdcbiAgICAgIH0pXG4gICAgICBcbiAgICAgIC8vIG92ZXJ2aWV3IHN0YXRlID09PT09PT09PT09PT09PVxuICAgICAgLnN0YXRlKCdvdmVydmlldycsIHtcbiAgICAgICAgICB1cmw6ICcvb3ZlcnZpZXcnLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2xvZ2luL292ZXJ2aWV3Lmh0bWwnXG4gICAgICAgICAgLy8gcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICB9KVxuXG4gICAgICAvLyBjb3Vyc2VzIHN0YXRlID09PT09PT09PT09PT09PT1cbiAgICAgIC5zdGF0ZSgnY291cnNlcycsIHtcbiAgICAgICAgdXJsOiAnL2NvdXJzZXMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NyYy9jb3Vyc2UvY291cnNlcy5odG1sJ1xuICAgICAgICAvLyByZXF1aXJlTG9naW46IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIHF1aXogc3RhdGUgPT09PT09PT09PT09PT09PT09PVxuICAgICAgLnN0YXRlKCdxdWl6ZXMnLCB7XG4gICAgICAgIHVybDogJy9xdWl6ZXMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NyYy9xdWl6L3F1aXplcy5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLy8gcHJvZmlsZSBzdGF0ZSA9PT09PT09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ3Byb2ZpbGUnLCB7XG4gICAgICAgIHVybCA6ICcvcHJvZmlsZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL3Byb2ZpbGUvcHJvZmlsZS5odG1sJ1xuICAgICAgfSlcblxuICAgICAgLy8gY3JlYXRlQ291cnNlIHN0YXRlID09PT09PT09PT09XG4gICAgICAuc3RhdGUoJ2NyZWF0ZUNvdXJzZScsIHtcbiAgICAgICAgdXJsIDogJy9jcmVhdGVDb3Vyc2UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NyYy9jb3Vyc2UvY3JlYXRlQ291cnNlLmh0bWwnXG4gICAgICB9KTtcblxuICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgICBcbn0pXG5cbi8vIEZvciBhdXRoZW50aWNhdGlvbiBjaGVja3Ncbi5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcblxuICAvLyBsaXN0ZW4gb24gc3RhdGUgY2hhbmdlIGV2ZW50c1xuICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG4gICAgLy8gaWYgbG9naW4gaXMgcmVxdWlyZWQgYW5kIHRoZXJlIGlzIG5vIGN1cnJlbnRVc2VyIHNldCwgXG4gICAgaWYgKHRvU3RhdGUucmVxdWlyZUxvZ2luICYmIHR5cGVvZiAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIC8vIHJlZGlyZWN0IHRvIGxvZ2luXG4gICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgfVxuICB9KTtcblxufSk7IiwiLy8gQ291cnNlQ29udHJvbGxlci5qcyA9PT09PT09PT09PT09PT09XG5hbmd1bGFyLm1vZHVsZSgnTE1TQXBwJylcbi5jb250cm9sbGVyKCdDb3Vyc2VDb250cm9sbGVyJywgWyckc2NvcGUnLCAnY291cnNlU2VydmljZScsICd1c2VyU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgY291cnNlU2VydmljZSwgdXNlclNlcnZpY2UpIHtcbiAgLy8gdmFyIGZvciBuZXcgY291cnNlIG9iamVjdFxuICAkc2NvcGUubmV3Q291cnNlID0ge1xuICAgIHRpdGxlIDogJycsXG4gICAgZGVwYXJ0bWVudCA6ICcnLFxuICAgIG51bWJlciA6ICcnLFxuICAgIGluc3RydWN0b3IgOiAnJ1xuICB9O1xuXG4gIC8vIG5lZWQgdG8gaG9vayBpbnRvIGFwaVxuICAkc2NvcGUuYWRkQ291cnNlID0gZnVuY3Rpb24oY291cnNlSWQpIHtcbiAgICB2YXIgc2VsZWN0ZWRDb3Vyc2UgPSB7IHVzZXIgOiB1c2VyU2VydmljZS51c2VySWQsIGNvdXJzZSA6IGNvdXJzZUlkIH07XG4gICAgLy8gY291cnNlU2VydmljZS5hZGRDb3Vyc2Uoc2VsZWN0ZWRDb3Vyc2UsIGZ1bmN0aW9uKGRhdGEpKTtcbiAgfTtcblxuICAkc2NvcGUuY3JlYXRlQ291cnNlID0gZnVuY3Rpb24oKSB7XG4gICAgY291cnNlU2VydmljZS5jcmVhdGVDb3Vyc2UoJHNjb3BlLm5ld0NvdXJzZSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gZ2V0IGFsbCBjb3Vyc2VzIG9uIGxvYWRcbiAgdmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBjb3Vyc2VTZXJ2aWNlLmZldGNoKCBmdW5jdGlvbihjb3Vyc2VzKSB7XG4gICAgICBjb3Vyc2VTZXJ2aWNlLmdldEluc3RydWN0b3JzKGZ1bmN0aW9uKGluc3RydWN0b3JzKSB7XG4gICAgICAgICRzY29wZS5pbnN0cnVjdG9ycyA9IGluc3RydWN0b3JzO1xuICAgICAgICBcbiAgICAgICAgLy8gc2V0IGNvdXJzZXNcbiAgICAgICAgdmFyIGFsbENvdXJzZXMgPSBjb3Vyc2VzLm1hcCggZnVuY3Rpb24oY291cnNlKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0cnVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGluc3RydWN0b3JzW2ldLl9pZCA9PT0gY291cnNlLmluc3RydWN0b3JJZCkge1xuICAgICAgICAgICAgICBjb3Vyc2UuaW5zdHJ1Y3Rvck5hbWUgPSBpbnN0cnVjdG9yc1tpXS5sYXN0bmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNvdXJzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY291cnNlcyA9IGFsbENvdXJzZXM7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBpbml0KCk7XG59XSk7IiwiLy8gY291cnNlU2VydmljZS5qc1xuYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcpXG5cbi8vIGZhY3Rvcnkgc2VydmljZSB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBjb3Vyc2VzIEFQSSBhbmQgcmV0cmVpdmUgZGF0YVxuLmZhY3RvcnkoJ2NvdXJzZVNlcnZpY2UnLCBbJyRodHRwJywgJ1JFU09VUkNFUycsIGZ1bmN0aW9uKCRodHRwLCBSRVNPVVJDRVMpIHtcblxuICAvLyBmZXRjaCBjb3Vyc2VzIGFuZCBjYWxsYmFja3MgPT09PT09PT09PT09PT09PVxuICB2YXIgZ2V0QWxsQ291cnNlcyA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgLy8gY2IgaXMgdGhlIGNhbGxiYWNrIHByb3ZpZGVkIGJ5IHRoZSBjb250cm9sbGVyXG4gICAgJGh0dHAuZ2V0KFJFU09VUkNFUy5DT1VSU0VTKS50aGVuKFxuICAgICAgLy8gY2FsbGJhY2sgZm9yIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgZnVuY3Rpb24gc3VjY2Vzc0NhbGxiYWNrKHJlcykge1xuICAgICAgICByZXR1cm4gY2IocmVzLmRhdGEuZGF0YSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBjYWxsYmFjayBmb3IgZXJyb3JcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuXG4gIC8vIEdldCBhbGwgaW5zdHJ1Y3RvcnNcbiAgdmFyIF9nZXRJbnN0cnVjdG9ycyA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgJGh0dHAuZ2V0KFJFU09VUkNFUy5JTlNUUlVDVE9SUykudGhlbihcbiAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgcmV0dXJuIGNiKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGZldGNoIDogZ2V0QWxsQ291cnNlcyxcbiAgICBnZXRJbnN0cnVjdG9ycyA6IF9nZXRJbnN0cnVjdG9yc1xuICB9O1xufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcpXG4uY29udHJvbGxlcignTG9naW5Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJ3VzZXJTZXJ2aWNlJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCB1c2VyU2VydmljZSApIHtcbiAgLy8gZW1haWwgcGF0dGVybiByZWdleFxuICAkc2NvcGUuZW1haWxQYXR0ZXJuID0gL14oW1xcdy1dKyg/OlxcLltcXHctXSspKilAKCg/OltcXHctXStcXC4pKlxcd1tcXHctXXswLDY2fSlcXC4oW2Etel17Miw2fSg/OlxcLlthLXpdezJ9KT8pJC9pO1xuXG4gIC8vIGluaXRpYWxpemUgdXNlciBvYmplY3Qgd2l0aCBlbXB0eSB2YWx1ZXNcbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB1c2VyU2VydmljZS5sb2dpbigkc2NvcGUudXNlciwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICBpZiAoZGF0YS50eXBlID09PSB0cnVlKSB7XG4gICAgICAgIHVzZXJTZXJ2aWNlLnNldFVzZXIgPSBkYXRhLnVzZXI7XG4gICAgICAgICRzdGF0ZS5nbygnY291cnNlcycpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFZhbGlkYXRpb24gLS0tLS0tLS0tLS0tLVxuICAkc2NvcGUudmFsaWRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICB9O1xuXG4gIC8vIHVzZXJuYW1lIHZhbGlkYXRpb25cbiAgZnVuY3Rpb24gdmFsaWRhdGVVc2VyKCkge1xuICAgIHZhciB1c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuXG4gICAgaWYgKCB1c2VybmFtZSA9PT0gJycgfHwgdXNlcm5hbWUgPT09IDAgfHwgIXNhbml0aXplSW5wdXQodXNlcm5hbWUpICkge1xuICAgICAgY29uc29sZS5sb2coJ2ludmFsaWQgdXNlcm5hbWUnKTtcbiAgICAgIHJldHVybiBmYWxzZTsgICAvLyBOZWVkIHRvIGFkZCBpbmNvcnJlY3QgYm9vdHN0cmFwIGNsYXNzXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIHBhc3N3b3JkIHZhbGlkYXRpb25cbiAgZnVuY3Rpb24gdmFsaWRhdGVQYXNzd29yZCgpIHtcbiAgICB2YXIgcGFzc3dvcmQgPSAkc2NvcGUudXNlci5wYXNzd29yZDtcblxuICAgIGlmICggcGFzc3dvcmQgPT09ICcnIHx8IHBhc3N3b3JkID09PSAwIHx8ICFzYW5pdGl6ZUlucHV0KHBhc3N3b3JkKSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIHBhc3N3b3JkJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIHNhbml0aXplIGlucHV0cyBiZWZvcmUgc2VuZGluZyB0byBzZXJ2ZXJcbiAgZnVuY3Rpb24gc2FuaXRpemVJbnB1dCh2YWwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufV0pO1xuXG5cbiIsIi8vIHVzZXJTZXJ2aWNlLmpzID09PT09PT09PT09PT09PT09PT09PVxuYW5ndWxhci5tb2R1bGUoJ0xNU0FwcCcpXG4uZmFjdG9yeSgndXNlclNlcnZpY2UnLCBbJyRodHRwJywgJ1JFU09VUkNFUycsIGZ1bmN0aW9uKCRodHRwLCBSRVNPVVJDRVMpIHtcbiAgLy8gZmFjdG9yeSB1c2VyIHZhcnNcbiAgdmFyIGN1cnJlbnRVc2VyID0gJyc7XG4gIHZhciB1c2VySWQgPSAnJztcbiAgdmFyIGlzTG9nZ2VkSW4gPSBmYWxzZTtcbiAgdmFyIHJvbGUgPSAnJztcblxuICAvLyBGb3Igc2lnbnVwIHBhZ2UsIG1ldGhvZCB0byBjcmVhdGUgbmV3IHVzZXJcbiAgdmFyIF9jcmVhdGVVc2VyID0gZnVuY3Rpb24odXNlciwgY2IpIHtcbiAgICB2YXIgYm9keSA9IHsgZGF0YSA6IHVzZXIgfTtcbiAgICAkaHR0cC5wb3N0KCBSRVNPVVJDRVMuVVNFUlMsIGJvZHkgKS50aGVuKFxuICAgICAgZnVuY3Rpb24gc3VjY2Vzc0NhbGxiYWNrKHJlcykge1xuICAgICAgICBjdXJyZW50VXNlciA9IHJlcy5kYXRhLmRhdGE7XG4gICAgICAgIGlzTG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgICByZXR1cm4gY2IocmVzLmRhdGEuZGF0YSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gZXJyb3JDYWxsYmFjayhyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEuZGF0YSk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICAvLyBMb2dpbiBwYWdlLCBtZXRob2QgdG8gbG9naW4gYSB1c2VyXG4gIHZhciBfbG9naW4gPSBmdW5jdGlvbih1c2VyLCBjYikge1xuICAgIHZhciBib2R5ID0geyBkYXRhIDogdXNlciB9O1xuICAgIGNvbnNvbGUubG9nKGJvZHkpO1xuICAgICRodHRwLnBvc3QoUkVTT1VSQ0VTLkxPR0lOLCBib2R5KS50aGVuKFxuICAgICAgZnVuY3Rpb24gc3VjY2Vzc0NhbGxiYWNrKHJlcykge1xuICAgICAgICByZXR1cm4gY2IocmVzLmRhdGEpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcbiAgXG4gIC8vIExvZ2luQ29udHJvbGxlciwgc2V0IGEgbmV3IHVzZXJcbiAgdmFyIF9zZXRVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgIGN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICBpc0xvZ2dlZEluID0gdHJ1ZTtcbiAgICByb2xlID0gdXNlci5yb2xlO1xuICB9O1xuXG4gIC8vIHJldHVybiBkYXRhIG9mIGN1cnJlbnQgdXNlclxuICB2YXIgX2dldFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3VycmVudFVzZXI7XG4gIH07XG5cbiAgLy8gbG9nb3V0IHRoZSBjdXJyZW50IHVzZXIsIHVuc2V0IGFueSB1c2VyIGRhdGFcbiAgdmFyIF9sb2dPdXQgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50VXNlciA9ICcnO1xuICAgIGlzTG9nZ2VkSW4gPSBmYWxzZTtcbiAgICByb2xlID0gJyc7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVVc2VyIDogX2NyZWF0ZVVzZXIsXG4gICAgc2V0Q3VycmVudFVzZXIgOiBfc2V0VXNlcixcbiAgICBsb2dpbiA6IF9sb2dpbixcbiAgICBsb2dvdXQgOiBfbG9nT3V0LFxuICAgIHJvbGUgOiByb2xlLFxuICAgIGdldEN1cnJlbnRVc2VyIDogX2dldFVzZXJcbiAgfTtcbn1dKTsiLCIvLyBTaWduVXBDb250cm9sbGVyLmpzID09PT09PT09PT09PT09PT1cbmFuZ3VsYXIubW9kdWxlKCdMTVNBcHAnKVxuLmNvbnRyb2xsZXIoJ1NpZ251cENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCAndXNlclNlcnZpY2UnLCAnY291cnNlU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCB1c2VyU2VydmljZSwgY291cnNlU2VydmljZSkge1xuICAvLyBlbWFpbCBwYXR0ZXJuXG4gICRzY29wZS5lbWFpbFBhdHRlcm4gPSAvXihbXFx3LV0rKD86XFwuW1xcdy1dKykqKUAoKD86W1xcdy1dK1xcLikqXFx3W1xcdy1dezAsNjZ9KVxcLihbYS16XXsyLDZ9KD86XFwuW2Etel17Mn0pPykkL2k7XG5cbiAgJHNjb3BlLnJvbGVzID0gWydzdHVkZW50JywgJ2luc3RydWN0b3InXTtcblxuICAvLyBuZXcgdXNlciBmcm9tIGZvcm1cbiAgJHNjb3BlLm5ld1VzZXIgPSB7XG4gICAgZmlyc3RuYW1lIDogJycsXG4gICAgbGFzdG5hbWUgOiAnJyxcbiAgICBlbWFpbCA6ICcnLFxuICAgIHBhc3N3b3JkIDogJycsXG4gICAgcm9sZSA6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHVzZXJTZXJ2aWNlLmNyZWF0ZVVzZXIoJHNjb3BlLm5ld1VzZXIsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzdGF0ZS5nbygnY291cnNlcycpO1xuICAgIH0pO1xuICB9XG5cbn1dKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
