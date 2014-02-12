/* global async */
var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Config', ['Constants', 'Storage', '$http', '$q', '$log', '$rootScope',
    function (C, Storage, $http, $q, $log, $rootScope) {
        var data = {},
            storageKey = C.STORAGE_KEYS.CONFIG;

        /**
         * loadFromStorage
         * Try to load key from local storage.
         *
         * @return promise
         */
        var loadFromStorage = function () {
            var deferred = $q.defer();

            Storage.get(storageKey, function (items) {
                if (items && items[storageKey]) {
                    $log.log('[Config] - got settings from localstorage');
                    data = items[storageKey];
                    return deferred.resolve();
                }

                $log.log('[Config] - did not find local settings. getting from remote.');
                return deferred.reject();
            });

            return deferred.promise;
        };

        /**
         * Setup config for the first time
         * @returns {promise}
         */
        var setup = function () {
            $log.log('[Config] - starting setup');

            return partnersJSONUrl()
                .then(decidePartner)
                .then(loadPartnerJSON)
                .then(finishSetup, function (e) {
                    //final error handling
                    $log.warn('[Config] - could not get partnerJSON, using default', e);
                    return finishSetup();
                });
        };

        var init = function () {
            console.debug('[Config] - init');
            //load config from storage, or run setup to get from remotes
            return loadFromStorage()
                .then(function () {
                    $log.log('[Config] - data loaded from storage');
                    return data;
                }, setup);
        };

        /**
         * Get the remote games tab json
         * @returns {$http promise}
         */
        var partnersJSONUrl = function () {
            $log.log('[Config] - getting partners json', C.PARTNERS_JSON_URL);
            return $http.get(C.PARTNERS_JSON_URL);
        };

        /**
         * Decide which partner "owns" the app by the partner object install_url_snippit
         * @returns {promise(PARTNER_SETUP_OBJECT)}
         */
        var decidePartner = function (partnersList) {
            var deferred = $q.defer();
            partnersList = partnersList.data;
            $log.log('[Config] - got the partnersList', partnersList);
            if (!partnersList || !partnersList.length) {
                $rootScope.$apply(function () {
                    deferred.reject(C.ERRORS.SETUP.PARTNER_NOT_FOUND);
                });
            } else {
                async.detect(partnersList, function (partner, cb) {
                    chrome.history.search({
                        text: partner.partner_install_url_snippit
                    }, function (found) {
                        if (!found || !found.length) {
                            return cb();
                        }
                        //found
                        $log.log('[Config] - found a matching partner', partner, partner.partner_install_url_snippit);
                        return cb(partner);
                    });
                }, function (partner) {
                    if (!partner) {
                        $log.warn('[Config] - Did not find a matching partner');
                        $rootScope.$apply(function () {
                            return deferred.reject();
                        });
                        return;
                    }

                    $rootScope.$apply(function () {
                        return deferred.resolve(partner);
                    });
                });
            }

            return deferred.promise;
        };

        /**
         * Load partner json from remote
         * @returns {$http promise}
         */
        var loadPartnerJSON = function (partnerObject) {
            $log.log('[Config] - getting remote partner json', partnerObject.partner_config_json_url);
            return $http.get(partnerObject.partner_config_json_url);
        };

        /**
         * finishSetup
         *
         * @param partnerJSON
         * @return promise
         */
        var finishSetup = function (partnerJSON) {
            var _partnersJSON = partnerJSON && partnerJSON.data || {};
            $log.log('[Config] - finishing setup with PartnerJSON - ', _partnersJSON);
            data = angular.extend(C.CONFIG, _partnersJSON);
            return store();
        };

        /**
         * store
         *
         * @return
         */
        var store = function () {
            var deferred = $q.defer();
            Storage.setItem(storageKey, data, function () {
                $rootScope.$apply(function () {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        };

        return {
            init: init,
            get: function () {
                return data;
            },
            set: store,
            setup: setup
        };
    }
]);
