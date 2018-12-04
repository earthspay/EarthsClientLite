(function () {
    'use strict';

    function EarthsBalanceDetailsController () {
        var ctrl = this;

        ctrl.formattedBalance = {};

        ctrl.$onChanges = function () {
            if (ctrl.balanceDetails) {
                ctrl.formattedBalance = {
                    regular: formatMoney(ctrl.balanceDetails.regular),
                    effective: formatMoney(ctrl.balanceDetails.effective),
                    generating: formatMoney(ctrl.balanceDetails.generating)
                };
            }
        };

        function formatMoney(amount) {
            return amount.formatAmount(true) + ' ' + amount.currency.shortName;
        }
    }

    angular
        .module('app.leasing')
        .component('earthsLeasingBalanceDetails', {
            controller: EarthsBalanceDetailsController,
            bindings: {
                balanceDetails: '<'
            },
            templateUrl: 'leasing/balance.details.component'
        });
})();
