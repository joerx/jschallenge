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
});
