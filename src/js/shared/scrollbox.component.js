(function () {
    'use strict';

    function ScrollboxController() {}

    angular
        .module('app.shared')
        .component('earthsScrollbox', {
            controller: ScrollboxController,
            transclude: true,
            template: '<div ng-transclude></div>'
        });
})();
