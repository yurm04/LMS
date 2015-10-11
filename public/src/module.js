angular.module('LMSApp', ['ngRoute'])
  .config( function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        controller: 'LoginController',
        templateUrl: 'views/login.html'
      });

    $locationProvider.html5Mode(true);  // Is this necessary??
  });
  