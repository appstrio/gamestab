var storageModule = angular.module('aio.storage', []);

storageModule.factory('Storage', ['$rootScope', function($rootScope){
    var localStorageAbstraction = {
        get : function(key, cb){
            var raw = localStorage.getItem(key);
            setTimeout(function(){
                try{
                    var output = {};
                    output[key] = JSON.parse(raw);
                    cb && cb(output);
                }catch(e){
                    console.error('Uncaught error:', e);
                    cb && cb();
                }
            },0);
        },
        set : function(items, cb){
            var item, stringified;
            setTimeout(function(){
                try{
                    for (var i in items){
                        item = items[i];
                        stringified = JSON.stringify(item);
                        console.log(i, stringified);
                        localStorage.setItem(i, stringified);
                    }
                    cb && cb(1);
                }catch(e){
                    console.error('Uncaught error:', e);
                    cb && cb();
                }
            });
        },
        remove : function(key, cb){
            setTimeout(function(){
                try{
                    localStorage.removeItem(key);
                    cb && cb(1);
                }catch(e){
                    console.error('Uncaught error:', e);
                    cb && cb();
                }
            },0);
        }
    };

    var StorageArea = localStorageAbstraction || chrome.storage.local;
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

        setItem : function(key, item, cb){
            var objToStore = {};
            objToStore[key] = item;
            StorageArea.set(item, cb);
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