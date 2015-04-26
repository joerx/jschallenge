'use strict';

/**
 * @ngdoc function
 * @name jschallengeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jschallengeApp
 */
angular.module('jschallengeApp')

.controller('MainCtrl', function(
  $scope, $http, $interval, $location, $anchorScroll, notify, availableCars) {

  // default to a booking in 1 day from now, for 2 hours.
  var start = Date.now() + 24 * 3600 * 1000;
  var end = start + 2 * 3600 * 1000;

  $scope.availableCars = [];
  $scope.loading = false;
  $scope.hasCars = false;
  $scope.selectedCar = null;
  $scope.today = new Date();

  $scope.search = {
    start: new Date(start),
    end: new Date(end)
  };

  function getCars() {
    $scope.loading = true;
    availableCars($scope.search)
      .then(function(result) {
        $scope.availableCars = result.cars;
        $scope.hasCars = result.total > 0;
        if (result.total > 0) {
          notify('info', 'Yippie - we found ' + result.total + ' cars for you!');
        } else {
          notify('info', 'Duh - nothing available, sorry!');
        }
      })
      .catch(function(err) {
        notify('error', 'Failed to load data from server: "' + err + '"');
      })
      .finally(function() {
        $scope.loading = false;
      });
  }

  $scope.setSelectedCar = function setSelectedCar(car) {
    $scope.selectedCar = car;
  };

  $scope.carSelectedOnMap = function carSelectedOnMap(car) {
    $scope.setSelectedCar(car);
    $scope.$digest();
    $location.hash('car-' + car.id);
    $anchorScroll(); // still some trouble with offset here
  };

  $scope.update = getCars;
  getCars();

});
