app.factory('Apps', ['$rootScope', '$http','Storage', '$q', function($rootScope, $http,Storage,$q){
    var initting = $q.defer(),
        storageKey = 'gt.apps',
        apps;

    var init = function(){
        Storage.get(storageKey, function(items){
            if(items && items[storageKey] && angular.isArray(items[storageKey])){
                apps = items[storageKey];
                initting.resolve(apps);
            }else{
                firstTimeSetup(function(){
                    initting.resolve(apps);
                });
            }
        });
    };

    var firstTimeSetup = function (cb){
        $http.get('./data/defaultDials.json').success(function(responseApps){
            $http.get('./data/games.json').success(function(responseGames){
                apps = [responseApps.slice(0,12),responseGames.slice(0,12)];
                store(cb);
            });
        });
    };


    var store = function(cb){
        var obj = {};
        obj[storageKey] = apps;
        Storage.set(obj, cb);
    };

    init();

    return {
        promise : initting.promise,
        apps : function(){
            return apps;
        },
        store : store
    };


}]).factory('Storage', ['$rootScope', function($rootScope){
    var StorageArea = chrome.storage.local;
    return {
        get : function(keys, cb){
            StorageArea.get(keys, function(items){
                $rootScope.$apply(function(){
                    cb && cb(items);
                })
            });
        },

        set : function(items, cb){
            StorageArea.set(items, function(){
                $rootScope.$apply(function(){
                    cb && cb();
                });
            });
        },

        remove : function (keys, cb){
            StorageArea.remove(keys, function(){
                $rootScope.$apply(function(){
                    cb && cb();
                });
            });
        }
    }
}]);
