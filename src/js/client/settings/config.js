/* global _ */
angular.module('aio.settings').factory('Config', [
    'Constants', 'Storage', '$http', '$q', '$log', '$rootScope', 'Chrome', 'Helpers',
    function (C, Storage, $http, $q, $log, $rootScope, Chrome, Helpers) {
        var data = {},
            isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.CONFIG;

        //setup config from remote
        var setup = function () {
            function onError(e) {
                $log.warn('Error getting remote config json', e);
                updateConfig();
            }

            return Helpers.loadRemoteJson(C.DEFAULT_REMOTE_CONFIG)
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
