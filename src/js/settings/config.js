/* global _ */
angular.module('aio.settings').factory('Config', ['Constants', 'Storage', '$http', '$q', '$log', '$rootScope', 'Chrome',
    function (C, Storage, $http, $q, $log, $rootScope, Chrome) {
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
                    return deferred.resolve(data);
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
            partnersList = partnersList.data;
            var deferred = $q.defer();
            var promises = [];
            var oneHourAgo = Date.now() - 1000 * 60 * 60;
            $log.log('[Config] - got the partnersList', partnersList);
            partnersList.forEach(function (partner) {
                promises.push(Chrome.history.search({
                    text: partner.partner_install_url_snippit,
                    startTime: oneHourAgo,
                    maxResults: 1
                }));
            });

            $q.all(promises).then(function (results) {
                var partnerIndex = -1;
                results = _.flatten(results);
                var historyMatch = _.reduce(results, function (memo, item, index) {
                    if (!item || !item.lastVisitTime) {
                        return memo;
                    }
                    if (!memo || !memo.lastVisitTime) {
                        partnerIndex = index;
                        return item;
                    }

                    if (item.lastVisitTime > memo.lastVisitTime) {
                        partnerIndex = index;
                        return item;
                    }

                    return memo;
                }, results[0]);

                //if first element was the closest
                if (partnerIndex === -1 && historyMatch && historyMatch.lastVisitTime) {
                    partnerIndex = 0;
                }

                if (partnerIndex === -1) {
                    $log.warn('[Config] - Did not find a matching partner');
                    return deferred.reject();
                }

                var partner = partnersList[partnerIndex];
                $log.log('[Config] - found a matching partner', partner, partner.partner_install_url_snippit);
                return deferred.resolve(partner);
            });

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
            loadFromStorage: loadFromStorage,
            get: function () {
                return data;
            },
            set: store,
            setup: setup
        };
    }
]);
