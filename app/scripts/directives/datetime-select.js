'use strict';

(function() {

  function before(date1, date2) {
    return date1 < date2;
  }

  function after(date1, date2) {
    return date1 > date2;
  }

  function dateValidation(name, compare) {
    return function($parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function(scope, elem, attr, ctrl) {

          function validate() {
            var thisDate = $parse(attr.ngModel)(scope);
            var otherDate = $parse(attr[name])(scope);
            return compare(thisDate, otherDate);
          }

          scope.$watch(attr[name], function() {
            ctrl.$setValidity(name, validate());
          });

          ctrl.$parsers.unshift(function(value) {
            var valid = validate();
            ctrl.$setValidity(name, valid);
            return valid ? new Date(value) : false;
          });

          ctrl.$formatters.unshift(function(value) {
            var valid = validate();
            ctrl.$setValidity(name, valid);
            return value.toString();
          });
        }
      };
    };
  }

  angular.module('jschallengeApp')

  .directive('dateBefore', dateValidation('dateBefore', before))
  .directive('dateAfter', dateValidation('dateAfter', after))

  .directive('datetimeSelect', function() {
    return {
      restrict: 'EA',
      scope: true,
      require: 'ngModel',
      template: function(elem, attr) {

        var name = attr.name;
        var id = 'dropdown-' + name;
        var ngModel = attr.ngModel;
        var validators = [];

        if (attr.validateDateBefore) {
          validators.push('date-before="' + attr.validateDateBefore + '"');
        }
        if (attr.validateDateAfter) {
          validators.push('date-after="' + attr.validateDateAfter + '"');
        }

        return '<div class="dropdown">' +
            '  <a class="dropdown-toggle"' +
            '      id="' + id + '"' +
            '      role="button"' +
            '      data-toggle="dropdown"' +
            '      data-target="#"' +
            '      href="#">' +
            '    <div class="input-group">' +
            '       <input type="text"' +
            '         class="form-control"' +
            '         data-ng-model="' + ngModel + '"' +
            '         name="' + name + '"' +
            '         ' + validators.join(' ') + '>' +
            '       <span class="input-group-addon">' +
            '         <i class="glyphicon glyphicon-calendar"></i>' +
            '       </span>' +
            '     </div>' +
            '   </a>' +
            '   <ul class="dropdown-menu" role="menu">' +
            '     <datetimepicker' +
            '       data-ng-model="' + ngModel + '"' +
            '       data-datetimepicker-config="{dropdownSelector: \'#' + id + '\'}">' +
            '     </datetimepicker>' +
            '   </ul>' +
            '</div>';
      }
    };
  });

})();
