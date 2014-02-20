/* global _ */
angular.module('aio.settings').factory('Config', [
    'Constants', 'Storage', '$http', '$q', '$log', '$rootScope', 'Chrome', 'Helpers',
    function (C, Storage, $http, $q, $log, $rootScope, Chrome, Helpers) {
        var data = {},
            storageKey = C.STORAGE_KEYS.CONFIG;

        /**
         * Setup config for the first time
         * @returns {promise}
         */
        var setup = function () {
            function onError(e) {
                $log.warn('Error getting remote config json', e);
                updateConfig();
            }
            //load local partners config json
            return Helpers.loadRemoteJson(C.PARTNERS_JSON_URL)
            //decide which partner
            .then(decidePartner)
            //get the partner's json
            .then(Helpers.loadRemoteJson)
            //update config
            .then(updateConfig, onError);
        };

        var assignData = function (_data) {
            data = _data;
            return data;
        };

        var loadFromStorage = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var init = function () {
            console.debug('[Config] - init');
            //load config from storage, or run setup to get from remotes
            return loadFromStorage().then(assignData);
        };

        var getLastVisitedPartner = function (results, partnersList) {
            var partner = null;

            function findLatestVisitTime(memo, item) {
                if (!memo.lastVisitTime || item.lastVisitTime > memo.lastVisitTime) {
                    return item;
                }
                return memo;
            }

            //find latest visited partner
            var startingPartner = results[0];
            var lastVisitedPartner = _.reduce(results, findLatestVisitTime, startingPartner);

            //if last visited partner
            if (lastVisitedPartner && lastVisitedPartner.lastVisitTime) {
                partner = _.findWhere(partnersList, {
                    partner_id: lastVisitedPartner.partner_id
                });
            }

            return partner;
        };

        /**
         * Decide which partner "owns" the app by the partner object install_url_snippit
         * @returns {promise(PARTNER_SETUP_OBJECT)}
         */
        var decidePartner = function (partnersList) {
            partnersList = partnersList.data;
            var deferred = $q.defer();
            var promises = [];
            var halfHourAgo = Date.now() - 1000 * 60 * 30;

            function searchHistoryForPartner(partner) {
                promises.push(Chrome.history.search({
                    text: partner.partner_install_url_snippit,
                    startTime: halfHourAgo,
                    maxResults: 1
                }).then(function (result) {
                    //build return object
                    return {
                        partner_id: partner.partner_id,
                        lastVisitTime: result && result[0] && result[0].lastVisitTime
                    };
                }));
            }

            function getMatchingPartner(results) {
                var remoteUrl;
                results = results || {};
                var partner = getLastVisitedPartner(results, partnersList);

                //no partner found
                if (!partner) {
                    $log.warn('[Config] - Did not find a matching partner');
                    remoteUrl = C.DEFAULT_REMOTE_CONFIG;
                } else {
                    //found partner
                    $log.log('[Config] - found a matching partner', partner.partner_id);
                    remoteUrl = partner.partner_config_json_url;
                }

                return deferred.resolve(remoteUrl);
            }

            $log.log('[Config] - got the partnersList', partnersList);
            //loop through each partner and search in parallel chrome.history
            partnersList.forEach(searchHistoryForPartner);

            //when all searching in chrome history finishes
            $q.all(promises).then(getMatchingPartner, getMatchingPartner);

            return deferred.promise;
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
            updateConfig: updateConfig,
            loadFromStorage: loadFromStorage,
            get: function () {
                return data;
            },
            set: store,
            setup: setup
        };
    }
]);
