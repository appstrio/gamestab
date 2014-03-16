/* global _ */
angular.module('aio.settings').factory('Config', [
    'Constants', 'Storage', '$http', '$q', '$log', '$rootScope', 'Chrome', 'Helpers', 'bConnect',
    function (C, Storage, $http, $q, $log, $rootScope, Chrome, Helpers, bConnect) {
        var data = {},
            isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.CONFIG;

        //setup config from remote
        var setup = function () {
            function onError(e) {
                $log.warn('Error getting remote config json', e);
                updateConfig();
            }
            //load local partners config json
            return Helpers.loadRemoteJson(C.PARTNERS_JSON_URL)
            //decide which partner
            .then(findPartnerByCookies)
            //get the matching partner
            .then(getMatchingPartner)
            //get remote partner's json
            .then(Helpers.loadRemoteJson)
            //update config
            .then(updateConfig, onError)
                .then(function () {
                    return isReady.resolve(data);
                });
        };

        var assignData = function (_data) {
            data = _data;
            return data;
        };

        var loadFromStorage = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var init = function () {
            // console.debug('[Config] - init');
            //load config from storage, or run setup to get from remotes
            return loadFromStorage().then(assignData).then(function () {
                isReady.resolve();
                return data;
            });
        };

        var getMatchingPartner = function (matchingPartner) {
            var remoteUrl;
            //no partner found
            if (!matchingPartner || !matchingPartner.partner_id) {
                $log.warn('[Config] - Did not find a matching partner');
                remoteUrl = C.DEFAULT_REMOTE_CONFIG;
            } else {
                //found partner
                $log.log('[Config] - found a matching partner', matchingPartner.partner_id);
                remoteUrl = matchingPartner.partner_config_json_url;
            }

            return remoteUrl;
        };

        /**
         * Decide which partner "owns" the app by the partner object install_url_snippit
         * @returns {promise(PARTNER_SETUP_OBJECT)}
         */
        var findPartnerByCookies = function (partnersList) {
            var deferred = $q.defer();
            partnersList = partnersList.data;
            var regId = /(\w{24})/;

            var bConnection = new bConnect.BackgroundApi('chrome');

            function cookieListener(data) {
                var result;
                if (data && data.result && data.result.length) {
                    //sanitize values for a 24 characters id
                    var sanitizedResults = _.filter(data.result, function (item) {
                        return regId.test(item.value);
                    });

                    if (sanitizedResults && sanitizedResults[0]) {
                        //find the matching app_id from first matching cookie
                        result = _.findWhere(partnersList, {
                            app_id: sanitizedResults[0].value
                        });
                    }
                }
                //resolve with nothing
                $rootScope.$apply(function () {
                    deferred.resolve(result);
                    bConnection.removeListener();
                });
            }
            bConnection.addListener(cookieListener);

            $log.log('[Config] - got the partnersList', partnersList);
            var postObj = {
                api: 'cookieSearch',
                searchParams: {
                    domain: C.COOKIES_DOMAIN,
                    name: 'app_id'
                }
            };

            bConnection.postMessage(postObj);
            return deferred.promise;
        };

        var setConfig = function (newConfig) {
            data = newConfig;
        };

        var store = function () {
            return Helpers.store(storageKey, data);
        };

        var getConfig = function () {
            //check if data exists and has a timestamp
            if (data && data.timestamp) {
                return data;
            }

            //return default config
            return C.CONFIG;
        };

        var updateConfigFields = function (withJson) {
            var curConfig = getConfig();

            //if user has preferences and remote json doesn't specify we should override user preferences
            if (data && data.updatedAt && !withJson.override_user_preferences) {
                $log.info('[Config] - merging without user preferences');
                withJson = _.omit(withJson, 'user_preferences');
            } else {
                $log.warn('[Config] - overriding user preferences');
            }

            //deep merge
            data = _.merge(curConfig, withJson);
            //get latest timestamp or use now
            data.updatedAt = Date.now();
            return data;
        };

        /**
         * updateConfig
         *
         * @param partnerJson
         * @return promise
         */
        var updateConfig = function (partnerJson) {
            if (partnerJson && partnerJson.data) {
                partnerJson = partnerJson.data;
                $log.log('[Config] - got remote Json', partnerJson);
            } else {
                $log.warn('[Config] - using only default settings');
                partnerJson = {};
            }

            updateConfigFields(partnerJson);
            return store();
        };

        return {
            init: init,
            isReady: isReady.promise,
            updateConfig: updateConfig,
            loadFromStorage: loadFromStorage,
            get: function () {
                return data;
            },
            set: store,
            setConfig: setConfig,
            setup: setup
        };
    }
]);
