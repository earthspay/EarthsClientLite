(function () {
    'use strict';

    function EarthsTabController($scope, dialogService) {
        $scope.isSelected = function () {
            return $scope.pageId === $scope.currentPageId;
        };

        $scope.onClick = function () {
            $scope.onSelect({pageId: $scope.pageId});

            // cleaning unused modal dialog divs, created by previous tab
            dialogService.cleanup();
        };
    }

    function EarthsTabLink(scope, element) {
        element.addClass('tabs-radio');
    }

    angular
        .module('app.navigation')
        .directive('earthsTab', function EarthsTabDirective() {
            return {
                restrict: 'A',
                controller: ['$scope', 'dialogService', EarthsTabController],
                scope: {
                    pageId: '@',
                    caption: '<',
                    onSelect: '&',
                    currentPageId: '<'
                },
                link: EarthsTabLink,
                templateUrl: 'navigation/tab.directive'
            };
        });
})();
