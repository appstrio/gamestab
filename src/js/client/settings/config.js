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

            return updateConfig().then(function () {
                return isReady.resolve(data);
            });

            //load local partners config json
            return Helpers.loadRemoteJson(C.PARTNERS_JSON_URL)
            //decide which partner
            .then(getHistoryByPartner)
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

        var getLastVisitedPartner = function (results) {
            results = _.compact(results);
            if (!results || !results.length) {
                return null;
            }
            //get only results with valid lastVisitTime
            results = _.filter(results, 'lastVisitTime');
            if (!results || !results.length) {
                return null;
            }

            function findLatestVisitTime(memo, item) {
                return item.lastVisitTime > memo.lastVisitTime ? item : memo;
            }

            //find latest visited partner
            return _.reduce(results, findLatestVisitTime, results[0]);
        };

        var getMatchingPartner = function (results) {
            var remoteUrl;
            results = results || {};
            var matchingPartner = getLastVisitedPartner(results);

            //no partner found
            if (!matchingPartner) {
                $log.warn('[Config] - Did not find a matching partner');
                remoteUrl = C.DEFAULT_REMOTE_CONFIG;
            } else {
                //found partner
                $log.log('[Config] - found a matching partner', matchingPartner.partner.partner_id);
                remoteUrl = matchingPartner.partner.partner_config_json_url;
            }

            return remoteUrl;
        };

        /**
         * Decide which partner "owns" the app by the partner object install_url_snippit
         * @returns {promise(PARTNER_SETUP_OBJECT)}
         */
        var getHistoryByPartner = function (partnersList) {
            partnersList = partnersList.data;
            var promises = [];
            var halfHourAgo = Date.now() - 1000 * 60 * 30;

            var bConnection = new bConnect.BackgroundApi('chrome');

            function historyListener(data) {
                if (!data || !data.partner_id) {
                    return console.error('critical error - no partner id', data);
                }

                //find matching partner
                var matchingPartner = _.findWhere(partnersList, {
                    partner_id: data.partner_id
                });

                if (!matchingPartner) {
                    console.error('critical error - no matching partner in list');
                }

                //data is found
                var result = data.result;
                var returnData;

                if (result && result[0]) {
                    returnData = {
                        partner: matchingPartner,
                        lastVisitTime: result[0].lastVisitTime
                    };
                }

                //resolve with nothing
                $rootScope.$apply(function () {
                    return matchingPartner.isReady.resolve(returnData);
                });
            }

            bConnection.addListener(historyListener);

            function searchHistoryForPartner(partner) {
                partner.isReady = $q.defer();

                var postObj = {
                    api: 'historySearch',
                    partner_id: partner.partner_id,
                    searchParams: {
                        text: partner.partner_install_url_snippit,
                        startTime: halfHourAgo,
                        maxResults: 1
                    }
                };

                bConnection.postMessage(postObj);

                return partner.isReady.promise;
            }

            $log.log('[Config] - got the partnersList', partnersList);
            //loop through each partner and search in parallel chrome.history
            promises = _.map(partnersList, searchHistoryForPartner);

            //when all searching in chrome history finishes
            return $q.all(promises).then(function (results) {
                bConnection.removeListener();
                return results;
            });
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
