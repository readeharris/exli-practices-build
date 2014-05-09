var practices = angular.module('practices', ['ngRoute', 'UserApp']);

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

practices.controller('ApplicationController', function($scope, $document, user) {
  $scope.initializeFastClick = function() {
    $document.ready(function() {
      FastClick.attach(document.body);
    });
  }

  $scope.trackEvent = function(event_name, event_data) {
    user.getCurrent().then(function(currentUser) {
      var default_data = { "distinct_id": currentUser.user_id }
      $.extend(event_data, default_data);

      mixpanel.identify(currentUser.user_id);
      mixpanel.people.set({ "$email": currentUser.email });
      mixpanel.track(event_name, event_data);
    });
  }

  // -------------------------------------------------------
  // Initialize

  $scope.initializeFastClick();
});

practices.controller('WelcomeController', function($scope, $location) {
  $scope.redirectToSignIn = function() {
    $location.path('/sign-in');
  }

  $scope.redirectToSignUp = function() {
    $location.path('/sign-up');
  }
});

practices.controller('RemindersController', function($scope, $location, $window, user) {
  //
  // TODO: Refactor User and Push into services.
  //

  $scope.currentUser = {};
  $scope.device_type = navigator.userAgent;

  // ---------------------------------------------------
  // Push
  // This is the first unauthenticated controller, so we do Push here.

  $scope.initializePush = function() {
    var pushNotification = $window.plugins.pushNotification;

    var iosHandler = function(result) {
      UserApp.User.save({
        "user_id": $scope.currentUser.user_id,
        "properties": {
          "device_type": "ios",
          "device_id": result
        }
      });
    }

    var androidHandler = function(result) {
      UserApp.User.save({
        "user_id": $scope.currentUser.user_id,
        "properties": {
          "device_type": "android",
          "device_id": result
        }
      });
    }

    var errorHandler = function(error) {
      alert('There was an error setting up Push Notifications: ' + error);
    }

    if (!!$scope.device_type.match(/Android/g)) {
      pushNotification.register(
        androidHandler,
        errorHandler, {
          "senderID": "150054670823",
          "ecb": "onNotificationGCM"
        }
      );
    } else {
      pushNotification.register(
        iosHandler,
        errorHandler, {
          "badge": "true",
          "sound": "true",
          "alert": "true",
          "ecb": "onNotificationAPN"
        }
      );
    }
  }

  // ---------------------------------------------------
  // Reminder Frequencies

  $scope.setReminderFrequency = function(frequency) {
    UserApp.User.save({
      "user_id": $scope.currentUser.user_id,
      "properties": {
        "reminder_frequency": frequency
      }
    }, function(error, result) {
      if(!error) {
        $scope.trackEvent('Chose a Reminder Frequency', { "frequency": frequency });
        $location.path('/check-ins');
        $scope.$apply();
      } else {
        alert('There was an error setting reminder frequencies: ' + error);
      }
    });
  };

  // ---------------------------------------------------
  // Initialize

  $scope.initializeRemindersController = function() {
    user.getCurrent().then(function(currentUser) {
      $scope.currentUser = currentUser;

      // Redirect onboarded users.
      if(currentUser.properties.reminder_frequency.value !== 0) {
        $location.path('/check-ins');
      } else {
        $scope.initializePush();
      }
    });
  }

  $scope.initializeRemindersController();
});

practices.controller('CheckInsController', function($scope, $location) {
  $scope.$on('$routeChangeSuccess', function() {
    $scope.trackEvent('Prompted to Choose a Check-In');
  });

  $scope.selectCheckIn = function(type) {
    $scope.trackEvent('Chose a Check-In', { "Check-In Type": type });
    $location.path('/begin/' + type);
  };
});

practices.controller('BeginController', function($scope, $routeParams, $location) {
  $scope.proceed = function() {
    $scope.trackEvent('Began a Check-In', { "Check-In Type": $routeParams.type });
    $location.path('/check-in/' + $routeParams.type);
  };
});

practices.controller('CheckInController', function($scope, $location, $routeParams) {
  $scope.checkInType = $routeParams.type;
  $scope.steps       = ['mind', 'body', 'heart'];
  $scope.stepIndex   = 0;
  $scope.currentStep = $scope.steps[$scope.stepIndex];

  // -------------------------------------------------------
  // Functions

  $scope.prepare = function() {
    $scope.preparing = true;
    $scope.expressing = false;
  };

  $scope.express = function() {
    $scope.preparing = false;
    $scope.expressing = true;
  };

  $scope.evaluate = function(evaluation) {
    // Use the Expression input if it's filled out.
    if(!!$scope.expression) {
      evaluation = $scope.expression;
    };

    $scope.trackEvent('Evaluated his/her state of ' + $scope.currentStep, { "Check-In Type": $scope.checkInType, "Evaluation": evaluation });
    $scope.nextStep();
  };

  $scope.nextStep = function() {
    angular.element('input#expression').val(''); // Reset text field.
    $scope.stepIndex += 1;

    if(($scope.stepIndex + 1) <= $scope.steps.length) {
      $scope.currentStep = $scope.steps[$scope.stepIndex]
      $scope.prepare();
    } else {
      $location.path('/complete');
    }
  }

  // -------------------------------------------------------
  // Initialize

  $scope.prepare();
});

practices.controller('CompleteController', function($scope, $location) {
  $scope.redirectToCheckIns = function() {
    $location.path('/check-ins');
  }
});
