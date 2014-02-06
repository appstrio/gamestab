/* global _ */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.factory('Apps', ['$rootScope', '$http', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Setup',
    function($rootScope, $http, Storage, $q, Chrome, C, Config, $log, Setup) {
        var isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.APPS,
            apps;

        var systemApps = [{
            title: 'Settings',
            icon: './img/logo_icons/settings175x175.png',
            overlay: 'settings',
            permanent: true
        }, {
            title: 'Apps Store',
            icon: './img/logo_icons/appstore175x175.png',
            overlay: 'store',
            permanent: true
        }];

        $log.log('[Apps] - init service');

        /**
         *
         */
        var init = function() {
            var t0 = Date.now();
            $log.log('[Apps] - starting init');
            Setup.startSetup().then(function() {
                $log.log('[Apps] - getting apps from local storage', storageKey);
                Storage.get(storageKey, function(items) {
                    if (items && items[storageKey] && angular.isArray(items[storageKey])) {
                        setApps(items[storageKey]);
                        $log.log('[Apps] - got apps from localStorage in ' + (Date.now() - t0) + ' ms.');
                        isReady.resolve(apps);
                        return;
                    }

                    $log.log('[Apps] - did not find apps in localStorage, getting from remote');
                    setup().then(function() {
                        $log.log('[Apps] - finished apps setup in ' + (Date.now() - t0));
                        store(function() {
                            $rootScope.$apply(function() {
                                isReady.resolve(apps);
                            });
                        });
                    });
                });
            });
        };


        /**
         * setApps
         * setter
         *
         * @param _apps
         * @return
         */
        var setApps = function(_apps) {
            apps = _apps;
        };

        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function() {

            $log.log('[Apps] - starting setup');

            return localAppsDB().then(function(_appsDB) {
                var output, deferred, maxDials = 24;

                deferred = $q.defer();

                //get only data, as we got an xhr object {config, data, header}
                _appsDB = _appsDB && _appsDB.data || {};
                $log.log('[Apps] - got the localAppsDb');

                //default=>All, tags=>Featured
                var all = _.chain(_appsDB)
                    .filter(function(app) {
                        return _.has(app, 'default') &&
                            _.contains(app.
                                default, 'ALL');
                    })
                    .first(4)
                    .value();

                $log.log('[Apps] - got all dials', all);

                var partnerApps = Config.get().web_apps_db || [];
                $log.log('[Apps] - got partnersApps dials', partnerApps);
                //calculate the number of games to add
                var numOfGames = maxDials - systemApps.length - all.length - partnerApps.length;
                if (numOfGames < 0) {
                    numOfGames = 0;
                }

                var games = _.chain(_appsDB)
                    .filter(function(app) {
                        return _.has(app, 'tags') && _.contains(app.tags, 'Games');
                    })
                    .shuffle()
                    .first(numOfGames)
                    .value();

                $log.log('[Apps] - got game dials', games);

                output = []
                    .concat(systemApps)
                    .concat(all)
                    .concat(partnerApps)
                    .concat(games);

                Chrome.management.getAll(function(chromeApps) {
                    var j = 0,
                        i,
                        newOutput = [];

                    angular.forEach(chromeApps, function(appOrExtension) {
                        if (appOrExtension.isApp && appOrExtension.enabled) {
                            output.push(chromeAppToObject(appOrExtension));
                        }
                    });

                    for (i = 0; i < output.length; ++i) {
                        if (i !== 0 && i % 12 === 0) {
                            ++j;
                        }
                        newOutput[j] = newOutput[j] || [];
                        newOutput[j].push(output[i]);
                    }

                    setApps(newOutput);
                    deferred.resolve(newOutput);
                });

                return deferred.promise;
            });
        };

        /**
         * localAppsDB
         *
         * @return
         */
        var localAppsDB = function() {
            $log.log('[Apps] - getting localWebAppsDb');
            return $http.get('./data/webAppsDB1.json');
        };

        /**
         * chromeAppToObject
         *
         * @param app
         * @return
         */
        var chromeAppToObject = function(app) {
            return {
                appLaunchUrl: app.appLaunchUrl,
                description: app.description,
                enabled: app.enabled,
                homepageUrl: app.homepageUrl,
                hostPermissions: app.hostPermissions,
                icons: app.icons,
                icon: getLargestIconChromeApp(app.icons).url,
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
            };
        };

        /**
         * getLargestIconChromeApp
         *
         * @param iconsArr
         * @return
         */
        var getLargestIconChromeApp = function(iconsArr) {
            var selected;
            if (!iconsArr.length) {
                return null;
            }

            for (var i = 0; i < iconsArr.length; ++i) {
                if (!selected) {
                    selected = iconsArr[i];
                } else {
                    if (selected.size < iconsArr[i].size) {
                        selected = iconsArr[i];
                    }
                }
            }

            return selected;
        };

        /**
         * store
         *
         * @return promise
         */
        var store = function(cb) {
            //enforce function type
            cb = cb || angular.noop;
            Storage.setItem(storageKey, apps, function() {
                cb();
            });
        };

        /**
         * addNewApp
         *
         * @param app
         * @param cb
         * @return
         */
        var addNewApp = function(app, cb) {
            var lastAvailablePage = getLastAvailablePage();
            app.installTimestamp = Date.now();
            lastAvailablePage.push(app);
            store(cb);
        };

        /**
         * uninstallApp
         *
         * @param app
         * @param cb
         * @return
         */
        var uninstallApp = function(app, cb) {
            var found = false;
            cb = cb || angular.noop;
            angular.forEach(apps, function(page) {
                angular.forEach(page, function(_app, index) {
                    if (app.url === _app.url) {
                        page.splice(index, 1);
                        store(cb);
                        found = true;
                    }
                });
            });
            if (!found) {
                cb();
            }
        };

        /**
         * getLastAvailablePage
         *
         * @return
         */
        var getLastAvailablePage = function() {
            var lastPage = apps[apps.length - 1];
            if (lastPage.length < 12) {
                return lastPage;
            } else {
                var newPage = [];
                apps.push(newPage);
                store();
                return newPage;
            }
        };

        init();

        return {
            promise: isReady.promise,
            apps: function() {
                return apps;
            },
            store: store,
            appsDB: localAppsDB,
            addNewApp: addNewApp,
            uninstallApp: uninstallApp
        };
    }
]);
