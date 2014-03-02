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

        return {
            loadRemoteJson: loadRemoteJson,
            //alias
            loadLocalJson: loadRemoteJson,

            loadFromStorage: loadFromStorage,
            store: store
        };
    }
]);
