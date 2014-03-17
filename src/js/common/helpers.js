angular.module('aio.common.helpers', []);
angular.module('aio.common.helpers').factory('Helpers', [
    '$q', '$log', '$http', '$rootScope', 'Storage',
    function ($q, $log, $http, $rootScope, Storage) {

        /**
         * Load a remote json
         * @param {String} remoteJsonUrl the remote json url to load
         * @returns {$http promise}
         */
        var loadRemoteJson = function (remoteJsonUrl) {
            $log.log('[Helpers] - getting remote json', remoteJsonUrl);
            return $http.get(remoteJsonUrl);
        };

        /**
         * loadFromStorage
         * Try to load key from local storage.
         *
         * @return promise
         */
        var loadFromStorage = function (storageKey) {
            var deferred = $q.defer();

            Storage.get(storageKey, function (items) {
                if (items && items[storageKey]) {
                    var returnData = items[storageKey];
                    return deferred.resolve(returnData);
                }

                $log.log('[Helpers] - did not find ' + storageKey + ' in localStorage');
                return deferred.reject();
            });

            return deferred.promise;
        };

        var store = function (storageKey, data) {
            var deferred = $q.defer();
            Storage.setItem(storageKey, data, function () {
                $rootScope.$apply(function () {
                    deferred.resolve(data);
                });
            });
            return deferred.promise;
        };

        /**
         * isAppEnabled
         * Checks if chrome app is an app and enabled
         *
         * @param chromeApp
         * @return
         */
        var isAppEnabled = function (chromeApp) {
            return chromeApp.isApp && chromeApp.enabled;
        };

        /**
         * chromeAppToObject
         *
         * @param app
         * @return {app}
         */
        var chromeAppToObject = function (app) {
            var _app = angular.copy(app);
            _app.icon = getLargestIconChromeApp(app.icons).url || 'img/dials/default.png';
            _app.chromeId = app.id;
            _app.title = app.shortName || app.name;
            delete _app.id;
            return _app;
        };

        /**
         * getLargestIconChromeApp
         *
         * @param iconsArr
         * @return
         */
        var getLargestIconChromeApp = function (iconsArr) {
            if (!iconsArr || !iconsArr.length) {
                return {};
            }

            //find item with largest size
            return _.reduce(iconsArr, function (largest, item) {
                if (item.size > largest.size) {
                    return item;
                }
                return largest;
            }, iconsArr[0]);
        };

        return {
            loadRemoteJson: loadRemoteJson,
            //alias
            loadLocalJson: loadRemoteJson,
            isAppEnabled: isAppEnabled,
            chromeAppToObject: chromeAppToObject,

            loadFromStorage: loadFromStorage,
            store: store
        };
    }
]);
