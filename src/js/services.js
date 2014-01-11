app.factory('Apps', ['$rootScope', '$http','Storage', '$q', function($rootScope, $http,Storage,$q){
    var initting = $q.defer(),
        storageKey = 'gt.apps',
        apps;

    var systemApps = [
        {title : "Settings", icon :  '/img/logo_icons/target.png', overlay:'settings'},
        {title : "Web Apps Store", icon : '/img/logo_icons/thumblr.png', overlay:'store'}
    ];
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
            responseApps = responseApps.slice(0,10);
            responseApps.push(systemApps[0]);
            responseApps.push(systemApps[1]);

            $http.get('./data/games.json').success(function(responseGames){
                chrome.management.getAll(function(chromeApps){
                    $rootScope.$apply(function(){
                        var onlyAppsArr = [];
                        angular.forEach(chromeApps, function(appOrExtension){
                            if(appOrExtension.isApp){
                                onlyAppsArr.push(chromeAppToObject(appOrExtension));
                            }
                        });

                        apps = [responseApps.slice(0,12),responseGames.slice(0,12),onlyAppsArr.slice(0,12)];
                        store(cb);

                    });
                });
            });
        });
    };



    var chromeAppToObject = function(app){
        return {
            appLaunchUrl: app.appLaunchUrl,
            description: app.description,
            enabled: app.enabled,
            homepageUrl: app.homepageUrl,
            hostPermissions: app.hostPermissions,
            icons: app.icons,
            icon: getLargestIcon(app.icons).url,
            id: app.id,
            chromeId: app.id,
            installType: app.installType,
            isApp: app.isApp,
            mayDisable: app.mayDisable,
            name: app.name,
            title: app.name,
            offlineEnabled: app.offlineEnabled,
            optionsUrl: app.optionsUrl,
            permissions: app.permissions,
            shortName: app.shortName,
            type: app.type,
            version: app.version
        }
    }

    var getLargestIcon = function(iconsArr){
        var selected;
       for ( var i = 0 ; i < iconsArr.length; ++i){
           if(!selected){
               selected = iconsArr[i];
           }else{
               if(selected.size<iconsArr[i].size){
                   selected = iconsArr[i];
               }
           }
       }

        return selected;
    }


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


}]).factory('Background', ['$rootScope', '$http','Storage', '$q', function($rootScope, $http,Storage,$q){
        var initting = $q.defer(),
            storageKey = 'gt.background',
            background = {},
            backgrounds = [
                {image : '/img/wallpapers/bg.jpg'},
                {image : '/img/wallpapers/bg1.jpg'},
                {image : '/img/wallpapers/bg2.jpg'},
                {image : '/img/wallpapers/bg3.jpg'},
                {image : '/img/wallpapers/bg4.jpg'},
                {image : '/img/wallpapers/bg6.jpg'},
                {image : '/img/wallpapers/bike_unsplash.jpg'},
                {image : '/img/wallpapers/farm_unsplash.jpg'},
                {image : '/img/wallpapers/lake_unsplash.jpg'},
                {image : '/img/wallpapers/rail_unsplash.jpg'},
                {image : '/img/wallpapers/ship_unsplash.jpg'}
            ],
            defaultBackground = backgrounds[0]

        var init = function(){
            Storage.get(storageKey, function(items){
                if(items && items[storageKey]){
                    angular.extend(background, items[storageKey]);
                    initting.resolve(background);
                }else{
                    angular.extend(background, defaultBackground);
                    initting.resolve(background);
                }
            });
        };

        var selectBackground = function(newBackground){
            angular.extend(background, newBackground);
            store();
        };

        var store = function(cb){
            var obj = {};
            obj[storageKey] = background;
            Storage.set(obj, cb);
        };

        init();

        return {
            promise : initting.promise,
            background : background,
            backgrounds : function(){
                return backgrounds;
            },
            selectBackground : selectBackground,
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
