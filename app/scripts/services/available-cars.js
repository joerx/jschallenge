'use strict';

angular.module('jschallengeApp')

/**
 * Service that fetches the list of available cars for a given search query. Returns a promise.
 */
.factory('availableCars', function($http) {

  function sumCars(previous, current) {
    return previous + current.cars_available || 0; // jshint ignore:line
  }

  return function getAvailableCars(search) {

    // TODO: make sure these are actual dates
    if (!search.start) {
      throw Error('Start date is required');
    }
    if (!search.end) {
      throw Error('End date is required');
    }

    var start = search.start.getTime();
    var end = search.end.getTime();
    var url = 'http://jschallenge.smove.sg/provider/1/availability?book_start=' + start + '&book_end=' + end;

    return $http.get(url).then(function(result) {
      return {
        total: result.data.reduce(sumCars, 0),
        cars: result.data
      };
    });
  };
});
