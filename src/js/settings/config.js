var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Config', ['Constants', 'Storage', '$http', '$q', '$log',
    function(C, Storage, $http, $q, $log) {
        var data = {},
            storageKey = C.STORAGE_KEYS.CONFIG;

        /**
         * init
         *
         * @return
         */
        var init = function() {
            Storage.get(storageKey);
        };

        /**
         * getter
         *
         * @return
         */
        var getter = function() {
            return data;
        };

        /**
         * Setup config for the first time
         * @returns {promise}
         */
        var setup = function() {
            $log.log('[Config] - starting setup');

            return partnersJSONUrl()
                .then(decidePartner)
                .then(loadPartnerJSON)
                .then(finishSetup, function(e) {
                    //final error handling
                    $log.warn('[Config] - could not get partnerJSON, using default', e);
                    return finishSetup();
                });
        };

        /**
         * Get the remote games tab json
         * @returns {$http promise}
         */
        var partnersJSONUrl = function() {
            $log.log('[Config] - starting partnersJSONUrl');
            return $http.get(C.PARTNERS_JSON_URL);
        };

        /**
         * Decide which partner "owns" the app by the partner object install_url_snippit
         * @returns {promise(PARTNER_SETUP_OBJECT)}
         */
        var decidePartner = function(partnersList) {
            $log.log('[Config] - starting decidePartner');
            var deferred = $q.defer();
            if (!partnersList || !partnersList.length) {
                return deferred.reject(C.ERRORS.SETUP.PARTNER_NOT_FOUND);
            } else {
                async.detect(partnersList, function(partner, cb) {
                    chrome.history.search({
                        text: partner.partner_install_url_snippit
                    }, function(found) {
                        if (found.length) {
                            cb(partner);
                        }
                    });
                }, function(partner) {
                    if (partner) {
                        deferred.resolve(partner);
                    } else {
                        deferred.reject();
                    }
                });
            }
            return deferred.promise;
        };

        /**
         * Load partner json from remote
         * @returns {$http promise}
         */
        var loadPartnerJSON = function(partnerObject) {
            $log.log('[Config] - starting loadPartnerJSON');
            return $http.get(partnerObject.partner_config_json_url);
        };

        /**
         * finishSetup
         *
         * @param partnerJSON
         * @return promise
         */
        var finishSetup = function(partnerJSON) {
            $log.log('[Config] - finishing setup with PartnerJSON - ', partnerJSON);
            data = angular.extend(C.CONFIG, partnerJSON || {});
            return store();
        };

        /**
         * store
         *
         * @return
         */
        var store = function() {
            var deferred = $q.defer();
            Storage.setItem(storageKey, data, function() {
                deferred.resolve();
            });
            return deferred.promise;
        };

        return {
            init: init,
            get: getter,
            setup: setup
        };
    }
]);
