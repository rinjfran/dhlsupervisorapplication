
var app = angular.module('dhlWorkrightApp', ['ionic','toaster','ngTable'])

app.run(function($ionicPlatform,$window) {
  $ionicPlatform.ready(function() {
    //  window.onbeforeunload=function(event){
    //   //  if ($state.current.controller === 'homeCtrl') {
    //   //      // Ask the user if he wants to reload
    //   //      return "are you sure?";
    //   //    } else {
    //   //      // Allow reload without any alert
    //   //      return "are you sure?";
    //   //   //   event.preventDefault()
    //   //    }
    //      return "you have unsaved changes";
    //  }
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

      .state('login', {
        url: '/',
        templateUrl: 'dhlworkrightcode/authentication/templates/login.html',
        controller: 'loginCtrl'
      })

      .state('home', {
        //url: '/home',
        //abstract: true,
        templateUrl: 'dhlworkrightcode/home/templates/home.html',
        controller: 'homeCtrl'
      });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

});
