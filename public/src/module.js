angular.module('LMSApp', ['ui.router'])

// app constants ======================
// .constant()

// config settings for router
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    
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
      
})

// For authentication checks
.run(function ($rootScope) {

  // listen on state change events
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    // if login is required and there is no currentUser set, 
    if (toState.requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();
      // redirect to login
      $state.go('login');
    }
  });

});