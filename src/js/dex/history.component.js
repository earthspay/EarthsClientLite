(function () {
    'use strict';

    function HistoryController() {}

    angular
        .module('app.dex')
        .component('earthsDexHistory', {
            controller: HistoryController,
            bindings: {
                pair: '<',
                trades: '<'
            },
            templateUrl: 'dex/history.component'
        });
})();
