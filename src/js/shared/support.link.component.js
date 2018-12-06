(function () {
    'use strict';

    var url = 'https://support.earths.ga';

    function SupportLinkController() {}

    angular
        .module('app.shared')
        .component('earthsSupportLink', {
            controller: SupportLinkController,
            template: '<a href="http://' + url + '" target="_blank">' + url + '</a>'
        });
})();
