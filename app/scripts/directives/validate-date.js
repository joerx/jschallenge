function after(val1, val2) {
  return val1 > val2;
}

function before(val1, val2) {
  return val1 < val2;
}

function dateValidator(op, name) {
  return function($parse) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        function validateDate(op) {
          var thisVal = $parse(attrs.ngModel)(scope);
          var otherVal = $parse(attrs[name])(scope);
          ctrl.$setValidity('date', op(thisVal, otherVal));
        }
        scope.$watch(attrs.ngModel, validateDate.bind(null, op));
        scope.$watch(attrs[name], validateDate.bind(null, op));
      }
    };
  }
}

angular.module('jschallengeApp')
.directive('dateAfter', dateValidator(after, 'dateAfter'))
.directive('dateBefore', dateValidator(before, 'dateBefore'));
