angular.module('aio.common.helpers').factory('Helpers', [
    '$q', '$log', '$http', '$rootScope', 'Storage',
    function ($q, $log, $http, $rootScope, Storage) {

        /**
         * Load a remote json
         * @param {String} remoteJsonUrl the remote json url to load
         * @returns {$http promise}
         */
        var loadRemoteJson = function (remoteJsonUrl) {
            $log.log('getting remote json', remoteJsonUrl);
            return $http.get(remoteJsonUrl);
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
            store: store
        };
    }
]);
