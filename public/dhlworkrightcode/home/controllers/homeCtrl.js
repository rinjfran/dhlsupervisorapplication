/* Controller for dashboard page
   scope of the controller is private */

app.controller('homeCtrl', function($scope, $state, $ionicPopup, $rootScope, $ionicLoading, $window, homeService, $filter, $timeout, toaster, NgTableParams) {

  $scope.overviewshow = true;
  $scope.workershow = false;
  $scope.overviewItem = "col col-20 dahsboardtab-itemselected";
  $scope.workersItem = "col col-20 dahsboardtab-item";
  $scope.completed = true;
  $scope.active = false;
  $scope.highPerformance = false;
  $scope.lowPerformance = false;
  $scope.kpi = false;
  $scope.completedItem = "col col-20 overviewtab-itemselected";
  $scope.activeItem = "col col-20 overviewtab-item";
  $scope.kpiItem = "col col-20 overviewtab-item";
  $scope.highItem = "col col-20 overviewtab-item";
  $scope.lowItem = "col col-20 overviewtab-item";
  $scope.workersalltab = true;
  $scope.workerssummarytab = false;
  $scope.allWorkerItem = "col col-20 overviewtab-itemselected";
  $scope.workerSummaryItem = "col col-20 overviewtab-item";
  $scope.completedActivities = [];
  $scope.activeActivities = [];
  $scope.allActivities = [];
  $scope.highPerformanceActivities = [];
  $scope.lowPerformanceActivities = [];
  $scope.workers = [];
  $scope.workerChartData = [];
  $scope.workerDetails = [];
  $scope.workerSummary = [];
  $scope.noCompletedDataFlag = false;
  $scope.noActiveDataFlag = false;
  $scope.noKpiDataFlag = false;
  $scope.noAllDataFlag = false;
  $scope.noSummaryDataFlag = false;
  $scope.chartData = [];
  google.charts.load('current', {
    'packages': ['corechart']
  });
  $scope.appuser = $rootScope.loginDetails.fullname;

  ////////////////////////////////////////////////////////////

  function drawChart() {

    //var data = google.visualization.arrayToDataTable();
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Activity');
    data.addColumn('number', 'Time spent');
    data.addRows($scope.seriesArray);
    // Set chart options
    //var options = {'height':400,'tooltip':{trigger:"selection",isHtml:true},legend:{position:"left"}};

    var options = {
      width: 355,
      'tooltip': {
        trigger: "selection",
        isHtml: true
      }
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
  }
  //////////////////////////////////////////////////////////////

  $rootScope.showLoading = function() {
    $ionicLoading.show({
      content: 'Loading...',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  };

  $rootScope.hideLoading = function() {
    $ionicLoading.hide();
  };

  //set the time to format hours:minutes
  $scope.timeFormatter = function(unformattedTime) {
    var date = new Date(unformattedTime.toString());
    // var day = date.getDate();
    // var monthIndex = date.getMonth();
    // var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (hours < 10) {
      hours = '0' + hours;
    }

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    formattedtime = hours + ':' + minutes;
    return formattedtime;
  };

  //Convert epoch time stamp to normal time stamp
  $scope.convertEpochTime = function(datetime) {
    var date = new Date(datetime);
    return $scope.timeFormatter(date);

  };

  $scope.workerSummaryTableShow = function() {
    if ($scope.workerSummary.length === 0) {
      $scope.noSummaryDataFlag = true;
      $scope.chart = false;
      $scope.ShowWorkersSummaryTable = false;
    } else {
      $scope.noSummaryDataFlag = false;
      $scope.chart = true;
      $scope.ShowWorkersSummaryTable = true;
      $scope.workersSummaryTable = new NgTableParams({
        //page: 4,
        //count: 1000
      }, {
        dataset: $scope.workerSummary
      });
    }
    google.charts.setOnLoadCallback(drawChart);
  };

  $scope.getWorkerSummary = function(username) {
    $scope.seriesArray = [];
    //$rootScope.showLoading();
    homeService.getWorkerSummary(username).then(function(response) {
      if (response.status === 200) {
        $rootScope.hideLoading();
        console.log(response);
        $scope.workerSummary = response.data.list.activity_array;
        $scope.workerChartData = response.data.chart.activity_array;
        for (i = 0; i < $scope.workerChartData.length; i++) {
          if ($scope.workerChartData[i].time_spent < 0) {
            $scope.workerChartData[i].posTime = Math.abs($scope.workerChartData[i].time_spent);
          } else {
            $scope.workerChartData[i].posTime = $scope.workerChartData[i].time_spent;
          }

          $scope.seriesArray.push([$scope.workerChartData[i].activity, $scope.workerChartData[i].posTime]);
        }
        //$scope.chartData = JSON.stringify(seriesArray);
        console.log($scope.seriesArray);
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error,unable to load workers summary Data");
        $scope.ShowWorkersSummaryTable = false;
        $scope.chart = false;
        $scope.workerSummary = [];
        console.log("error in fetching workers summary Data");
      }
      // $scope.seriesArray=[['idle',3],['put away',3],['picking',3]];
      // console.log($scope.seriesArray);
      $scope.workerSummaryTableShow();
    });
  };

  $scope.workerAllDetailsTableShow = function() {
    if ($scope.workerDetails.length === 0) {
      $scope.noAllDataFlag = true;
      $scope.ShowWorkersAllTable = false;
    } else {
      $scope.noAllDataFlag = false;
      $scope.ShowWorkersAllTable = true;
      $scope.workersAllTable = new NgTableParams({
        //page: 4,
        //count: 10
      }, {
        dataset: $scope.workerDetails
      });
    }
    $scope.getWorkerSummary($scope.user);
  };

  $scope.getWorkerAll = function(username) {
    //$rootScope.showLoading();
    homeService.getWorkerAll(username).then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.workerDetails = response.data.activity_array;
        var isActive = false;
        for (var i = 0; i < response.data.activity_array.length; i++) {
          var formatDuration = $scope.convertTime($scope.workerDetails[i].duration);
          if ($scope.workerDetails[i].start_time) {
            var formatStartTime = $scope.convertEpochTime($scope.workerDetails[i].start_time);
          } else {
            var formatStartTime = "";
          }
          if ($scope.workerDetails[i].end_time) {
            var formatEndTime = $scope.convertEpochTime($scope.workerDetails[i].end_time);
          } else {
            var formatEndTime = "";
            isActive = true;
          }

          $scope.workerDetails[i].formatedstart_time = formatStartTime;
          $scope.workerDetails[i].formatedend_time = formatEndTime;
          $scope.workerDetails[i].formatedduration = formatDuration;
          $scope.workerDetails[i].isActive = isActive;
        }
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Unable to load workers all data");
        $scope.ShowWorkersAllTable = false;
        $scope.workerDetails = [];
        console.log("error in fetching workers all data");
      }
      $scope.workerAllDetailsTableShow();
    });
  };

  $scope.getWorkerDetails = function(worker) {
    $rootScope.showLoading();
    console.log("Clicked Worker:" + worker.username);
    $scope.workersalltab = true;
    $scope.workerssummarytab = false;
    $scope.allWorkerItem = "col col-20 overviewtab-itemselected";
    $scope.workerSummaryItem = "col col-20 overviewtab-item";
    $scope.usernameDisplay = worker.fullname;
    $scope.user = worker.username;
    $scope.getWorkerAll($scope.user);
  };

  $scope.getMyWorkersList = function() {
    //$rootScope.showLoading();
    homeService.getMyWorkersList().then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.workers = response.data.user_array;
        $scope.usernameDisplay = $scope.workers[0].fullname;
        $scope.user = $scope.workers[0].username;
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Unable to laod workers list data");
        console.log("error in fetching workers list data");
      }
      $scope.getWorkerAll($scope.user);
    });
  };

  /* function to show/hide table based on the tableData length
     scope of the function is private */
  $scope.lowPerformanceTableShow = function() {
    if ($scope.lowPerformanceActivities.length === 0) {
      $scope.noLowPerformanceFlag = true;
      $scope.ShowLowPerformanceTable = false;
    } else {
      $scope.noLowPerformanceFlag = false;
      $scope.ShowLowPerformanceTable = true;
      $scope.overviewLowPerformanceTable = new NgTableParams({
        //page: 4,
        //count: 10
      }, {
        dataset: $scope.lowPerformanceActivities
      });
    }
    $scope.getMyWorkersList();
  };

  $scope.getLowPerformanceActivities = function() {
    //$rootScope.showLoading();
    homeService.getLowPerformanceActivities().then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.lowPerformanceActivities = response.data.activity_array;
        for (var i = 0; i < response.data.activity_array.length; i++) {
          var formatStartTime = $scope.convertEpochTime($scope.lowPerformanceActivities[i].start_time);
          var formatDuration = $scope.convertTime($scope.lowPerformanceActivities[i].duration);
          if ($scope.lowPerformanceActivities[i].end_time) {
            var formatEndTime = $scope.convertEpochTime($scope.lowPerformanceActivities[i].end_time);
          } else {
            var formatEndTime = "";
          }
          $scope.lowPerformanceActivities[i].formatedstart_time = formatStartTime;
          $scope.lowPerformanceActivities[i].formatedend_time = formatEndTime;
          $scope.lowPerformanceActivities[i].formatedduration = formatDuration;
        }

      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Couldn't load low performance data");
        $scope.ShowLowPerformanceTable = false;
        console.log("error in fetching low performance activities");
      }
      $scope.lowPerformanceTableShow();
    });
  };

  /* function to show/hide table based on the tableData length
     scope of the function is private */
  $scope.highPerformanceTableShow = function() {
    if ($scope.highPerformanceActivities.length === 0) {
      $scope.noHighPerformanceDataFlag = true;
      $scope.ShowHighPerformanceTable = false;
    } else {
      $scope.noHighPerformanceDataFlag = false;
      $scope.ShowHighPerformanceTable = true;
      $scope.overviewHighPerformanceTable = new NgTableParams({
        //page: 4,
        //count: 10
      }, {
        dataset: $scope.highPerformanceActivities
      });
    }
    $scope.getLowPerformanceActivities();
  };

  $scope.getHighPerformanceActivities = function() {
    //$rootScope.showLoading();
    homeService.getHighPerformanceActivities().then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.highPerformanceActivities = response.data.activity_array;
        for (var i = 0; i < response.data.activity_array.length; i++) {
          var formatStartTime = $scope.convertEpochTime($scope.highPerformanceActivities[i].start_time);
          var formatDuration = $scope.convertTime($scope.highPerformanceActivities[i].duration);
          if ($scope.highPerformanceActivities[i].end_time) {
            var formatEndTime = $scope.convertEpochTime($scope.highPerformanceActivities[i].end_time);
          } else {
            var formatEndTime = "";
          }
          $scope.highPerformanceActivities[i].formatedstart_time = formatStartTime;
          $scope.highPerformanceActivities[i].formatedend_time = formatEndTime;
          $scope.highPerformanceActivities[i].formatedduration = formatDuration;
        }
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Couldn't load high performance data");
        $scope.ShowHighPerformanceTable = false;
        console.log("error in fetching high performing activities");
      }
      $scope.highPerformanceTableShow();
    });
  };

  $scope.allTableShow = function() {
    if ($scope.allActivities.length === 0) {
      $scope.noKpiDataFlag = true;
      $scope.ShowSummaryTable = false;
    } else {
      $scope.noKpiDataFlag = false;
      $scope.ShowSummaryTable = true;
      $scope.overviewAllTable = new NgTableParams({
        //page: 4,
        //count: 12
      }, {
        dataset: $scope.allActivities
      });
    }
    $scope.getHighPerformanceActivities();
  };

  $scope.getAllActivities = function() {
    //$rootScope.showLoading();
    homeService.getAllActivities().then(function(response) {
      if (response.status === 200) {
        //$rootScope.hideLoading();
        console.log(response);
        $scope.allActivities = response.data.activity_array;
        for (var i = 0; i < $scope.allActivities.length; i++) {
          $scope.allActivities[i].progress_perc = ($scope.allActivities[i].kpi_average / $scope.allActivities[i].kpi_maximum) * 100;
        }
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Couldn't load overview all data");
        $scope.ShowSummaryTable = false;
        console.log("error in fetching overview all data");
      }
      $scope.allTableShow();
    });
  };

  $scope.activeTableShow = function() {
    if ($scope.activeActivities.length === 0) {
      $scope.noActiveDataFlag = true;
      $scope.ShowActiveTable = false;
    } else {
      $scope.noActiveDataFlag = false;
      $scope.ShowActiveTable = true;
      $scope.overviewActiveTable = new NgTableParams({
        //page: 4,
        //count: 10
      }, {
        dataset: $scope.activeActivities
      });
    }
    $scope.getAllActivities();
  };

  $scope.getActiveActivities = function() {
    //$rootScope.showLoading();
    homeService.getActiveActivities().then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.activeActivities = response.data.activity_array;
        for (var i = 0; i < response.data.activity_array.length; i++) {
          var formatStartTime = $scope.convertEpochTime($scope.activeActivities[i].start_time);
          var elapsed = $scope.convertTime($scope.activeActivities[i].duration);
          $scope.activeActivities[i].formatedstart_time = formatStartTime;
          $scope.activeActivities[i].elapsed = elapsed;
        }
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Couldn't load overview active data");
        $scope.ShowActiveTable = false;
        console.log("error in fetching active activities");
      }
      $scope.activeTableShow();
    });
  };

  /* function to show/hide table based on the tableData length
     scope of the function is private */
  $scope.completedTableShow = function() {
    if ($scope.completedActivities.length === 0) {
      $scope.noCompletedDataFlag = true;
      $scope.ShowCompletedTable = false;
    } else {
      $scope.noCompletedDataFlag = false;
      $scope.ShowCompletedTable = true;
      $scope.overviewCompletedTable = new NgTableParams({
        //page: 4,
        //count: 10
      }, {
        dataset: $scope.completedActivities
      });
    }
    $rootScope.hideLoading();
    $scope.getActiveActivities();
  };

  $scope.getCompletedActivities = function() {
    $rootScope.showLoading();
    homeService.getCompletedActivities().then(function(response) {
      if (response.status === 200) {
        console.log(response);
        $scope.completedActivities = response.data.activity_array;
        for (var i = 0; i < response.data.activity_array.length; i++) {
          var formatStartTime = $scope.convertEpochTime($scope.completedActivities[i].start_time);
          var fomratDuration = $scope.convertTime($scope.completedActivities[i].duration);
          if ($scope.completedActivities[i].end_time) {
            var formatEndTime = $scope.convertEpochTime($scope.completedActivities[i].end_time);
          } else {
            var formatEndTime = "";
          }
          $scope.completedActivities[i].formatedstart_time = formatStartTime;
          $scope.completedActivities[i].formatedend_time = formatEndTime;
          $scope.completedActivities[i].formatedduration = fomratDuration;
        }
      } else {
        $rootScope.hideLoading();
        toaster.pop('error', "", "Connection error, Couldn't load overview completed data");
        $scope.ShowCompletedTable = false;
        console.log("error in fetching completed data");
      }
      var currentTime = new Date();
      var time = currentTime.getTime();
      var hours = currentTime.getHours();
      console.log("Time" + $scope.convertEpochTime(time));
      $scope.currenttime = $scope.convertEpochTime(time);
      $scope.completedTableShow();
    });
  };

  //$scope.getCompletedActivities();

  $scope.overviewcontent = function() {
    //$rootScope.showLoading();
    $scope.overviewshow = true;
    $scope.workershow = false;
    $scope.overviewItem = "col col-20 dahsboardtab-itemselected";
    $scope.workersItem = "col col-20 dahsboardtab-item";
    $scope.completed = true;
    $scope.active = false;
    $scope.kpi = false;
    $scope.highPerformance = false;
    $scope.lowPerformance = false;
    $scope.completedItem = "col col-20 overviewtab-itemselected";
    $scope.activeItem = "col col-20 overviewtab-item";
    $scope.kpiItem = "col col-20 overviewtab-item";
    $scope.highItem = "col col-20 overviewtab-item";
    $scope.lowItem = "col col-20 overviewtab-item";
    //$scope.getCompletedActivities();
  };

  $scope.completedcontent = function() {
    $scope.completedItem = "col col-20 overviewtab-itemselected";
    $scope.activeItem = "col col-20 overviewtab-item";
    $scope.kpiItem = "col col-20 overviewtab-item";
    $scope.highItem = "col col-20 overviewtab-item";
    $scope.lowItem = "col col-20 overviewtab-item";
    $scope.completed = true;
    $scope.active = false;
    $scope.kpi = false;
    $scope.highPerformance = false;
    $scope.lowPerformance = false;
  };

  $scope.activecontent = function() {
    $scope.completedItem = "col col-20 overviewtab-item";
    $scope.activeItem = "col col-20 overviewtab-itemselected";
    $scope.kpiItem = "col col-20 overviewtab-item";
    $scope.highItem = "col col-20 overviewtab-item";
    $scope.lowItem = "col col-20 overviewtab-item";
    $scope.completed = false;
    $scope.active = true;
    $scope.kpi = false;
    $scope.highPerformance = false;
    $scope.lowPerformance = false;
  };

  $scope.highcontent = function() {
    $scope.completedItem = "col col-20 overviewtab-item";
    $scope.activeItem = "col col-20 overviewtab-item";
    $scope.kpiItem = "col col-20 overviewtab-item";
    $scope.highItem = "col col-20 overviewtab-itemselected";
    $scope.lowItem = "col col-20 overviewtab-item";
    $scope.completed = false;
    $scope.active = false;
    $scope.kpi = false;
    $scope.highPerformance = true;
    $scope.lowPerformance = false;
  };

  $scope.lowcontent = function() {
    $scope.completedItem = "col col-20 overviewtab-item";
    $scope.activeItem = "col col-20 overviewtab-item";
    $scope.kpiItem = "col col-20 overviewtab-item";
    $scope.highItem = "col col-20 overviewtab-item";
    $scope.lowItem = "col col-20 overviewtab-itemselected";
    $scope.completed = false;
    $scope.active = false;
    $scope.kpi = false;
    $scope.highPerformance = false;
    $scope.lowPerformance = true;
  };

  $scope.kpicontent = function() {
    $scope.completedItem = "col col-20 overviewtab-item";
    $scope.activeItem = "col col-20 overviewtab-item";
    $scope.kpiItem = "col col-20 overviewtab-itemselected";
    $scope.highItem = "col col-20 overviewtab-item";
    $scope.lowItem = "col col-20 overviewtab-item";
    $scope.completed = false;
    $scope.active = false;
    $scope.kpi = true;
    $scope.highPerformance = false;
    $scope.lowPerformance = false;
  };

  $scope.workerscontent = function() {
    $scope.overviewshow = false;
    $scope.workershow = true;
    $scope.overviewItem = "col col-20 dahsboardtab-item";
    $scope.workersItem = "col col-20 dahsboardtab-itemselected"
    $scope.workersalltab = true;
    $scope.workerssummarytab = false;
    $scope.allWorkerItem = "col col-20 overviewtab-itemselected";
    $scope.workerSummaryItem = "col col-20 overviewtab-item";
  };

  $scope.allworkercontent = function() {
    $scope.allWorkerItem = "col col-20 overviewtab-itemselected";
    $scope.workerSummaryItem = "col col-20 overviewtab-item";
    $scope.workersalltab = true;
    $scope.workerssummarytab = false;
  };

  $scope.workersummarycontent = function() {
    $scope.allWorkerItem = "col col-20 overviewtab-item";
    $scope.workerSummaryItem = "col col-20 overviewtab-itemselected";
    $scope.workersalltab = false;
    $scope.workerssummarytab = true;
  };

  document.onkeydown = function() {
    switch (event.keyCode) {
      case 116: //F5 button
        event.returnValue = false;
        event.keyCode = 0;
        return false;

      case 82: //R button
        if (event.ctrlKey) {
          event.returnValue = false;
          event.keyCode = 0;
          return false;
        }
    }
  };

  $scope.getContent = function(obj) {
    return obj.value + " " + obj.text;
  };

  $scope.convertTime = function(millseconds) {
    var seconds = Math.floor(millseconds / 1000);
    var h = 3600;
    var m = 60;
    var hours = Math.floor(seconds / h);
    var minutes = Math.floor((seconds % h) / m);
    var scnds = Math.floor((seconds % m));
    var timeString = '';
    if (scnds < 10) scnds = "0" + scnds;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    timeString = hours + ":" + minutes + ":" + scnds;
    return timeString;
  };

  $scope.reload = function() {
    $scope.getCompletedActivities();
    $timeout(function() {
      $scope.reload();
    }, (60000 * 15))
  };
  $scope.reload();

});

app.filter('millSecondsToTimeString', function() {
  return function(millseconds) {
    var oneSecond = 1000;
    var oneMinute = oneSecond * 60;
    var oneHour = oneMinute * 60;
    var oneDay = oneHour * 24;

    var seconds = Math.floor((millseconds % oneMinute) / oneSecond);
    var minutes = Math.floor((millseconds % oneHour) / oneMinute);
    var hours = Math.floor((millseconds % oneDay) / oneHour);
    var days = Math.floor(millseconds / oneDay);

    var timeString = '';
    if (days !== 0) {
      //timeString += (days !== 1) ? (days + ' days ') : (days + ' day ');
      timeString += (days !== 1) ? (days + ':') : (days + ':');
    }
    if (hours !== 0) {
      // timeString += (hours !== 1) ? (hours + ' hrs ') : (hours + ' hr ');
      timeString += (hours !== 1) ? (hours + ':') : (hours + ':');
    }
    if (minutes !== 0) {
      // timeString += (minutes !== 1) ? (minutes + 'mins') : (minutes + 'min');
      timeString += (minutes !== 1) ? (minutes) : (minutes);
    }
    // if (seconds !== 0 || millseconds < 1000) {
    //     // timeString += (seconds !== 1) ? (seconds + 'secs') : (seconds + 'sec');
    //       timeString += (seconds !== 1) ? (seconds) : (seconds);
    // }

    return timeString;
  };
});
