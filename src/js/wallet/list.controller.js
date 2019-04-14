(function () {
    'use strict';

    var TRANSACTIONS_TO_LOAD = 100;

    function EarthsWalletListController($scope, $interval, events, applicationContext,
                                       apiService, transactionLoadingService, dialogService) {
        var ctrl = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        function sendCommandEvent(event, currency) {
            var assetWallet = findWalletByCurrency(currency);
            var earthsWallet = findWalletByCurrency(Currency.EARTHS);

            $scope.$broadcast(event, {
                assetBalance: assetWallet.balance,
                earthsBalance: earthsWallet.balance
            });
        }

        function findWalletByCurrency(currency) {
            return _.find(ctrl.wallets, function (w) {
                return w.balance.currency === currency;
            });
        }

        ctrl.wallets = [
     /*       {
                balance: new Money(0, Currency.USD),
                depositWith: Currency.USD
            },
            {
                balance: new Money(0, Currency.EUR),
                depositWith: Currency.EUR
            },
            {
                balance: new Money(0, Currency.BTC),
                depositWith: Currency.BTC
            }, */
            {
                balance: new Money(0, Currency.EARTHS),
                depositWith: Currency.BTC
            }
 /*           {
                balance: new Money(0, Currency.ETH),
                depositWith: Currency.ETH
            },
            {
                balance: new Money(0, Currency.LTC),
                depositWith: Currency.LTC
            },
            {
                balance: new Money(0, Currency.ZEC),
                depositWith: Currency.ZEC
            },
            {
                balance: new Money(0, Currency.TRY),
                depositWith: Currency.TRY
            },
            {
                balance: new Money(0, Currency.BCH),
                depositWith: Currency.BCH
            } */
        ];

        ctrl.transactions = [];
        ctrl.send = send;
        ctrl.withdraw = withdraw;
        ctrl.deposit = deposit;
        ctrl.depositFromCard = depositFromCard;

        loadDataFromBackend();
        patchCurrencyIdsForTestnet();

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function send (wallet) {
            sendCommandEvent(events.WALLET_SEND, wallet.balance.currency);
        }

        function withdraw (wallet) {
            var id = wallet.balance.currency.id,
                type;

            if (id === Currency.BTC.id ||
                id === Currency.ETH.id ||
                id === Currency.EARTHS.id ||
                id === Currency.LTC.id ||
                id === Currency.ZEC.id ||
                id === Currency.BCH.id
            ) {
                type = 'crypto';
            } else if (id === Currency.EUR.id || id === Currency.USD.id) {
                type = 'fiat';
            } else if (id === Currency.TRY.id) {
                dialogService.open('#digilira-dialog');
            } else {
                throw new Error('Add an option here!');
            }

            sendCommandEvent(events.WALLET_WITHDRAW + type, wallet.balance.currency);
        }

        function deposit (wallet) {
            if (wallet.balance.currency === Currency.EARTHS) {
                depositFromCard(wallet.balance.currency);
            } else if (wallet.balance.currency === Currency.TRY) {
                dialogService.open('#digilira-dialog');
            } else {
                $scope.$broadcast(events.WALLET_DEPOSIT + wallet.balance.currency.id, {
                    assetBalance: wallet.balance,
                    depositWith: wallet.depositWith
                });
            }
        }

        function depositFromCard (currency) {
            dialogService.close();

            $scope.$broadcast(events.WALLET_CARD_DEPOSIT, {
                currency: currency
            });
        }

        function loadDataFromBackend() {
            refreshWallets();
            refreshTransactions();

            refreshPromise = $interval(function() {
                refreshWallets();
                refreshTransactions();
            }, refreshDelay);
        }

        function refreshWallets() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    var earthsWallet = findWalletByCurrency(Currency.EARTHS);
                    earthsWallet.balance = Money.fromCoins(response.balance, Currency.EARTHS);
                });

            apiService.assets.balance(applicationContext.account.address).then(function (response) {
                _.forEach(response.balances, function (assetBalance) {
                    var id = assetBalance.assetId;

                    // adding asset details to cache
                    applicationContext.cache.putAsset(assetBalance.issueTransaction);
                    applicationContext.cache.updateAsset(id, assetBalance.balance,
                        assetBalance.reissuable, assetBalance.quantity);
                });

                _.forEach(ctrl.wallets, function (wallet) {
                    var asset = applicationContext.cache.assets[wallet.balance.currency.id];
                    if (asset) {
                        wallet.balance = asset.balance;
                    }
                });
            });
        }

        function refreshTransactions() {
            var txArray;
            transactionLoadingService.loadTransactions(applicationContext.account, TRANSACTIONS_TO_LOAD)
                .then(function (transactions) {
                    txArray = transactions;

                    return transactionLoadingService.refreshAssetCache(applicationContext.cache, transactions);
                })
                .then(function () {
                    ctrl.transactions = txArray;
                });
        }

        // Assets ID substitution for testnet
        function patchCurrencyIdsForTestnet() {
            if ($scope.isTestnet()) {
                Currency.EUR.id = 'AsuWyM9MUUsMmWkK7jS48L3ky6gA1pxx7QtEYPbfLjAJ';
                Currency.USD.id = 'D6N2rAqWN6ZCWnCeNFWLGqqjS6nJLeK4m19XiuhdDenr';
                Currency.BTC.id = 'DWgwcZTMhSvnyYCoWLRUXXSH1RSkzThXLJhww9gwkqdn';
                Currency.ETH.id = 'BrmjyAWT5jjr3Wpsiyivyvg5vDuzoX2s93WgiexXetB3';
                Currency.LTC.id = 'BNdAstuFogzSyN2rY3beJbnBYwYcu7RzTHFjW88g8roK';
                Currency.ZEC.id = 'CFg2KQfkUgUVM2jFCMC5Xh8T8zrebvPc4HjHPfAugU1S';
                Currency.BCH.id = '8HT8tXwrXAYqwm8XrZ2hywWWTUAXxobHB5DakVC1y6jn';
                Currency.TRY.id = '7itsmgdmomeTXvZzaaxqF3346h4FhciRoWceEw9asNV3';
                Currency.DASH.id = 'DGgBtwVoXKAKKvV2ayUpSoPzTJxt7jo9KiXMJRzTH2ET';
                Currency.EFYT.id = 'FvKx3cerSVYGfXKFvUgp7koNuTAcLs8DmtmwRrFVCqJv';
                Currency.WNET.id = '3P8gkhcLhFQvBkDzMnWeqqwvq3qxkpTNQPs4LUQ95tKD';
                Currency.invalidateCache();
            }
        }
    }

    EarthsWalletListController.$inject = ['$scope', '$interval', 'wallet.events', 'applicationContext',
                                         'apiService', 'transactionLoadingService', 'dialogService'];

    angular
        .module('app.wallet')
        .controller('walletListController', EarthsWalletListController);
})();
