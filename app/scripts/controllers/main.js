'use strict';

/**
 * @ngdoc function
 * @name jschallengeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jschallengeApp
 */
angular.module('jschallengeApp')

.controller('MainCtrl', function($scope, $http, $interval) {

  // Query for a booking in 1 day from now, for 2 hours.
  var start = Date.now() + 24 * 3600 * 1000;
  var end = start + 2 * 3600 * 1000;
  var url = 'http://jschallenge.smove.sg/provider/1/availability?book_start=' + start + '&book_end=' + end;
  var stop = function() {/*noop*/};

  $scope.availableCars = [];
  $scope.stats = {};

  function getAvailableCars() {
    console.log('Fetching available cars...');
    $http.get(url)
      .success(function(result) {
        console.log('Result from the API call:', result);
        $scope.availableCars = result;
        $scope.stats.totalAvailableCars = result.reduce(function(previous, current) {
          return previous + current.cars_available || 0;
        }, 0);
      })
      .error(function(err) {
        // Hum, this is odd ... contact us...
        console.error(err);
        $interval.cancel(stop);
      });
  }

  $scope.$on('$destroy', function() {
    $interval.cancel(stop);
  });

  stop = $interval(getAvailableCars, 10000);
});
