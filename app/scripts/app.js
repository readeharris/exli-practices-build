var practices = angular.module('practices', ['ngRoute', 'UserApp', 'uiSlider']);

// Initialize UserApp

practices.run(function($rootScope, user) {
  user.init({ appId: '53613b135ec0b' });
});

// Routes

practices.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/welcome', {
      templateUrl: 'templates/welcome.html',
      controller: 'WelcomeController',
      login: true
    })
    .when('/sign-up', {
      templateUrl: 'templates/sign-up.html',
      controller: 'WelcomeController',
      public: true
    })
    .when('/reminders', {
      templateUrl: 'templates/reminders.html',
      controller: 'RemindersController'
    })
    .when('/check-ins', {
      templateUrl: 'templates/check-ins.html',
      controller: 'CheckInsController'
    })
    .when('/begin/:type', {
      templateUrl: 'templates/begin.html',
      controller: 'BeginController'
    })
    .when('/check-in/:type', {
      templateUrl: 'templates/check-in.html',
      controller: 'CheckInController'
    })
    .when('/complete', {
      templateUrl: 'templates/complete.html',
      controller: 'CompleteController'
    })
    .otherwise({
      redirectTo: '/reminders'
    });
}]);

// Load Angular when device is ready.

var deviceReady = function() {
  angular.bootstrap(document, ['practices']);
}

document.addEventListener('deviceready', deviceReady, false);
