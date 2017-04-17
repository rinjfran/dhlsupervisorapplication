/* Controller for login page
   scope of the controller is private */
app.controller('loginCtrl', function($scope, $state, $ionicPopup, $window, $rootScope, $ionicLoading, $ionicScrollDelegate,toaster,loginService) {

  // var windowElement = angular.element($window);
  // windowElement.on('onbeforeunload', function(event) {
  //   console.log("inside");
  //   if ($state.current.controller === 'homeCtrl') {
  //     // Ask the user if he wants to reload
  //     return 'Are you sure you want to reload?'
  //   } else {
  //     // Allow reload without any alert
  //     event.preventDefault()
  //   }
  // });

  /* Scope variable for showing loading indicator
     scope of the variable is global */
  $rootScope.showLoading = function() {
    $ionicLoading.show({
      content: 'Loading...',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  };

    /* Scope variable for hiding loading indicator
       scope of the variable is global */
    $rootScope.hideLoading = function() {
      $ionicLoading.hide();
    };

    /* scope object to get the username & password inputted in login page
       scope of the object is private */
    $rootScope.user = {};

    $rootScope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop();
  };

  $rootScope.scrollTop();

  /*function for enabling enter key in login pagescope of the function is private*/
  $scope.enterButtonHandler = function(event) {
    if (event.keyCode === 13) {
      if (event.currentTarget.attributes[2].nodeValue === "user.username") {
        var element = $window.document.getElementsByClassName("userPassword");
        element[0].focus();
      } else {
        $scope.doLogin($rootScope.user);
      }
    }
  };

    /* function to perform login on hit of login button
       scope of the function is private */
    $scope.doLogin = function(user) {
      $rootScope.loginDetails = [];
      $rootScope.showLoading();
      if (!$rootScope.user.username) {
        $rootScope.hideLoading();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Please enter your user id to continue'
        });
      } else if (!$rootScope.user.password) {
        $rootScope.hideLoading();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Please enter your password to continue'
        });
      } else {
        loginService.login().then(function(response) {
          console.log(response);
          if (response.status === 200) {
            console.log(response);
            $rootScope.loginDetails = response.data;
            $state.transitionTo('home');
          } else {
            $rootScope.hideLoading();
            console.log(response.statusText);
            $ionicPopup.alert({
              title: 'Error',
              template: response.statusText
            });
          }
        });
      }
    };
  });
