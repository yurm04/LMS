angular.module('LMSApp', ['ui.router'])

// app constants ======================
// .constant()

// config settings for router
.config(function($stateProvider, $urlRouterProvider) {
    
  $urlRouterProvider.otherwise('/login');

  $stateProvider
      
      // login state ==================
      .state('login', {
          url: '/login',
          templateUrl: 'src/login/login.html'
          // requireLogin: false
      })
      
      // overview state ==================
      .state('overview', {
          url: '/overview',
          templateUrl: 'src/login/overview.html'
          // requireLogin: true
      })

      // quiz state ===================
      .state('quizes', {
        url: '/quizes',
        templateUrl: 'src/quiz/quizes.html'
      })

      
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