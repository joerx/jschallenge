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
      availableCars: '=',
      selectedCar: '=',
      onCarSelected: '='
    },
    template: '<div id="car-map" class="map"></div>',
    controller: function($scope, $element, $attrs, $transclude) {

      L.mapbox.accessToken = 'pk.eyJ1Ijoiam9lcmdoZW5uaW5nIiwiYSI6IlpoLWVrb0EifQ.x8NjGUAXZUe9mJHs4AFXKw';

      var map, geoJson;
      var markers = [], cars = [];
      var selectedMarker = null;

      var defaultIcon = L.mapbox.marker.icon({
        'marker-color': '#9c89cc',
        'marker-size': 'medium',
        'marker-symbol': 'car'
      });

      var selectedIcon = L.mapbox.marker.icon({
        'marker-color': '#edba14',
        'marker-size': 'large',
        'marker-symbol': 'car'
      });

      $scope.$watch('selectedCar', function() {
        // null if nothing selected or undefined if attribute 'selected-car' not set
        if (!$scope.selectedCar) return;
        // find marker for this car (find() is FFX only, filter() is the next best thing)
        var target = markers.filter(function(marker) {
          return marker.car === $scope.selectedCar;
        })[0];
        setMarkerSelected(target);
      });

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

      function clearMarkers() {
        // use for-loop instead of forEach so we iterate & clear the list in one sweep
        for(var marker = null; markers.length > 0; marker = markers.pop()) {
          map.removeLayer(marker);
        }
      }

      function clickHandler(car) {
        return function handleClick(e) {
          setMarkerSelected(e.target);
          if (typeof $scope.onCarSelected === 'function') {
            $scope.onCarSelected(car);
          } else {
            console.warn('Invalid handler type: ' + (typeof $scope.onCarSelected));
          }
        }
      }

      function setMarkerSelected(target) {
        if (selectedMarker) {
          selectedMarker.setIcon(defaultIcon);
          selectedMarker.closePopup();
        }
        selectedMarker = target;
        selectedMarker.setIcon(selectedIcon);
        selectedMarker.openPopup(); // fixme: couldn't get popups to work (yet)
        map.setView(target.getLatLng(), 14);
      }

      // convert list of cars into GeoJSON and adds that to the map, replacing the existing markers
      function addMarkersToMap() {
        clearMarkers();
        $scope.availableCars.forEach(function(car) {
          var marker = L.marker(
            [car.latitude, car.longitude],
            {icon: defaultIcon}
          );
          marker.addTo(map);
          marker.car = car; // need to memoize in case selected car changes outside
          marker.setPopupContent('<p>' + car.parking_name + '</p>');
          marker.on('click', clickHandler(car));
          markers.push(marker);
        });
      }

      // initialize map.
      // TODO: fix hardcoded access token
      function initMap() {
        map = L.mapbox.map('car-map', 'mapbox.streets');
        map.setView([1.303, 103.788], 12);
      }

      // init map, watch car list and update if necessary
      initMap();
      $scope.$watch('availableCars', addMarkersToMap);
    }
  }
});
