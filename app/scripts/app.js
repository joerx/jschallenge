'use strict';

/**
 * @ngdoc overview
 * @name jschallengeApp
 * @description
 * # jschallengeApp
 *
 * Main module of the application.
 */
angular

.module('jschallengeApp', ['ui.bootstrap', 'ui.bootstrap.datetimepicker', 'ngToast'])

// Display toasts on top center position, max 3 toasts at a time
.config(['ngToastProvider', function(ngToast) {
  ngToast.configure({
    horizontalPosition: 'center',
    maxNumber: 3
  });
}])

/**
 * Notification service, displays notifications etc. to the user. Abstracts the concrete way
 * notifications are displayed.
 *
 * First argument corresponds to Boostraps notification classes (`info`, `warning`, etc.),
 * second argument is the message content to display.
 *
 * Usage: `notify('info', 'Hello World!')`;
 */
.factory('notify', function($rootScope, ngToast) {

  function _doNotify(className, evt, msg) {
    ngToast.dismiss();
    ngToast.create({
      className: className,
      content: msg
    });
  }

  return function(type, msg) {
    _doNotify(type, null, msg);
  }
});
