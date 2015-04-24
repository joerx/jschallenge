'use strict';

/**
 * @ngdoc function
 * @name jschallengeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jschallengeApp
 */
angular.module('jschallengeApp')

/**
 * This directive renders the map of available cars. It's using isolate scope, so it requires an
 * 'available-cars' attribute referencing the list of cars available.
 *
 * TODO: some sort of validation that the 'available-cars' attribute is present
 */
.directive('carMap', function() {
  return {
    restrict: 'AE',
    scope: {
      availableCars: '='
    },
    template: '<div id="car-map" class="map"></div>',
    controller: function($scope, $element, $attrs, $transclude) {

      var map, carLayer, geoJson;

      // converts an available car as returned by server into a feature for the map
      function carToFeature(car) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              car.longitude,
              car.latitude
            ]
          },
          properties: {
            'title': car.parking_name,
            'marker-color': '#9c89cc',
            'marker-size': 'medium',
            'marker-symbol': 'car'
          }
        }
      }

      // convert list of cars into GeoJSON and adds that to the map, replacing the existing markers
      function addMarkersToMap() {
        geoJson = [{
          type: 'FeatureCollection',
          features: $scope.availableCars.map(carToFeature)
        }];
        carLayer.setGeoJSON(geoJson);
      }

      // initialize map.
      // TODO: fix hardcoded access token
      function initMap() {
        L.mapbox.accessToken = 'pk.eyJ1Ijoiam9lcmdoZW5uaW5nIiwiYSI6IlpoLWVrb0EifQ.x8NjGUAXZUe9mJHs4AFXKw';
        map = L.mapbox.map('car-map', 'mapbox.streets');
        map.setView([1.303, 103.788], 12);
        carLayer = L.mapbox.featureLayer().addTo(map);
      }

      // init map, watch car list and update if necessary
      initMap();
      $scope.$watch('availableCars', addMarkersToMap);
    }
  }
})

/**
 * Service that fetches the list of available cars for a given search query. Returns a promise.
 */
.factory('getAvailableCars', function($http) {

  function sumCars(previous, current) {
    return previous + current.cars_available || 0;
  }

  return function getAvailableCars(search) {

    // TODO: make sure these are actual dates
    if (!search.start) throw Error('Start date is required');
    if (!search.end) throw Error('End date is required');

    var start = search.start.getTime();
    var end = search.end.getTime();
    var url = 'http://jschallenge.smove.sg/provider/1/availability?book_start=' + start + '&book_end=' + end;

    return $http.get(url).then(function(result) {
      console.log(result);
      return {
        total: result.data.reduce(sumCars, 0),
        cars: result.data
      }
    });
  }
})

.controller('MainCtrl', function($scope, $http, $interval, notify, getAvailableCars) {

  // default to a booking in 1 day from now, for 2 hours.
  var start = Date.now() + 24 * 3600 * 1000;
  var end = start + 2 * 3600 * 1000;

  $scope.availableCars = [];
  $scope.loading = false;

  $scope.search = {
    start: new Date(start),
    end: new Date(end)
  };

  function getCars() {
    $scope.loading = true;
    getAvailableCars($scope.search)
      .then(function(result) {
        $scope.availableCars = result.cars;
        notify('info', 'Yippie - we found ' + result.total + ' cars for you!');
      })
      .catch(function(err) {
        notify('error', 'Failed to load data from server: "' + err + '"');
      })
      .finally(function() {
        $scope.loading = false;
      });
  }

  $scope.update = getCars;
  getCars();

  // debug only
  // $scope.availableCars = [{
  //   "deleted":0,
  //   "deleted_date":null,
  //   "provider_id":1,
  //   "parking_name":"Fusionopolis, 1 Fusionopolis Way",
  //   "parking_shortname":"Fusionopolis",
  //   "fleet_category_id":1,
  //   "has_season_parking":false,
  //   "code":"FSN",
  //   "latitude":"1.2988151960774983",
  //   "longitude":"103.78783783914798",
  //   "id":1,
  //   "deleted_by":null,
  //   "cars_available":1
  // },
  // {"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Pixel, 10 Central Exchange Green","parking_shortname":"Pixel","fleet_category_id":1,"has_season_parking":true,"code":"PXL","latitude":"1.300923","longitude":"103.78975100000002","id":3,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"71 Ayer Rajah Crescent","parking_shortname":"Block 71","fleet_category_id":1,"has_season_parking":true,"code":"B71","latitude":"1.2964691695107815","longitude":"103.78691379999998","id":4,"deleted_by":null,"cars_available":3},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Chromos, 10 Biopolis Rd","parking_shortname":"Biopolis","fleet_category_id":1,"has_season_parking":true,"code":"BOP","latitude":"1.3040029","longitude":"103.79152240000008","id":5,"deleted_by":null,"cars_available":2},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"INSEAD, 1 Ayer Rajah Ave","parking_shortname":"INSEAD","fleet_category_id":1,"has_season_parking":true,"code":"ISD","latitude":"1.299296834918858","longitude":"103.78631911772163","id":6,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"28 Dover Crescent","parking_shortname":"28 Dover Crescent","fleet_category_id":1,"has_season_parking":false,"code":"DVC","latitude":"1.304381","longitude":"103.78195200000005","id":41,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Dawson Place, 57 Dawson Road","parking_shortname":"Dawson Place","fleet_category_id":1,"has_season_parking":false,"code":"DSP","latitude":"1.292802","longitude":"103.81093399999997","id":42,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Tiong Bahru Market, 30 Seng Poh Rd","parking_shortname":"Tiong Bahru Market","fleet_category_id":1,"has_season_parking":false,"code":"TBM","latitude":"1.2847359","longitude":"103.83241029999999","id":43,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"88 Tanglin Halt Road","parking_shortname":"88 Tanglin Halt Rd","fleet_category_id":1,"has_season_parking":false,"code":"TLH","latitude":"1.302208","longitude":"103.79771700000003","id":45,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"8A Empress Road","parking_shortname":"8A Empress Rd","fleet_category_id":1,"has_season_parking":false,"code":"EPR","latitude":"1.316827","longitude":"103.80635099999995","id":46,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"24 Ghim Moh Link, Deck 3A, Lots 583/584","parking_shortname":"Ghim Moh Link","fleet_category_id":1,"has_season_parking":true,"code":"GMV","latitude":"1.308896","longitude":"103.78562299999999","id":47,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Mapletree Business City, 20 Pasir Panjang Rd","parking_shortname":"Mapletree Business City","fleet_category_id":1,"has_season_parking":false,"code":"MBC","latitude":"1.2749379","longitude":"103.79892900000004","id":48,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Kent Vale, 121 Clementi Road","parking_shortname":"Kent Vale","fleet_category_id":1,"has_season_parking":true,"code":"KVL","latitude":"1.302108","longitude":"103.76909339999997","id":50,"deleted_by":null,"cars_available":2},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Tiong Bahru Plaza, Deck B3, Lots 56/57","parking_shortname":"Tiong Bahru Plaza","fleet_category_id":1,"has_season_parking":true,"code":"TBP","latitude":"1.286145","longitude":"103.82734200000004","id":33,"deleted_by":null,"cars_available":2},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Anchorpoint, 370 Alexandra Rd","parking_shortname":"Anchorpoint","fleet_category_id":1,"has_season_parking":false,"code":"ACP","latitude":"1.288541","longitude":"103.805249","id":32,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Clementi Mall","parking_shortname":"Clementi Mall","fleet_category_id":1,"has_season_parking":true,"code":"CMM","latitude":"1.314918","longitude":"103.76430890000006","id":31,"deleted_by":null,"cars_available":2},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"10A Holland Drive","parking_shortname":"10A Holland Dr","fleet_category_id":1,"has_season_parking":false,"code":"HLD","latitude":"1.308358","longitude":"103.79357890000006","id":34,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Serene Centre, 10 Jalan Serene","parking_shortname":"Serene Centre","fleet_category_id":1,"has_season_parking":false,"code":"SRC","latitude":"1.322372","longitude":"103.81374000000005","id":35,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"PSA Building, 460 Alexandra Rd","parking_shortname":"PSA Building","fleet_category_id":1,"has_season_parking":false,"code":"PSA","latitude":"1.273644","longitude":"103.80159349999997","id":36,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"8A Ghim Moh Rd","parking_shortname":"8A Ghim Moh Rd","fleet_category_id":1,"has_season_parking":false,"code":"GMR","latitude":"1.311103","longitude":"103.78733799999998","id":37,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"59 Lengkok Bahru","parking_shortname":"59 Lengkok Bahru","fleet_category_id":1,"has_season_parking":false,"code":"LKB","latitude":"1.288783","longitude":"103.814348","id":38,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Dempsey Hill","parking_shortname":"Dempsey Hill","fleet_category_id":1,"has_season_parking":false,"code":"DSH","latitude":"1.3061557","longitude":"103.81035440000005","id":39,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"Westway, 27 West Coast Hwy","parking_shortname":"Westway","fleet_category_id":1,"has_season_parking":false,"code":"WWY","latitude":"1.283221","longitude":"103.78068099999996","id":40,"deleted_by":null,"cars_available":1},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"462A Clementi Ave 3, Deck 8A, Lots 437/438 ","parking_shortname":"Clementi Avenue 3","fleet_category_id":1,"has_season_parking":true,"code":"CA3","latitude":"1.3117555","longitude":"103.76555880000001","id":53,"deleted_by":null,"cars_available":2},{"deleted":0,"deleted_date":null,"provider_id":1,"parking_name":"416A Clementi Ave 1, Deck 2, Lots 631/632","parking_shortname":"Casa Clementi","fleet_category_id":1,"has_season_parking":true,"code":"CSC","latitude":"1.309842","longitude":"103.77011199999993","id":54,"deleted_by":null,"cars_available":2}];
});
