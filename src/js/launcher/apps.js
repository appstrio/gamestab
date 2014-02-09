/* global _,async */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.factory('Apps', ['$rootScope', '$http', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Setup', 'Image',
    function($rootScope, $http, Storage, $q, Chrome, C, Config, $log, Setup, Image) {
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

        /**
         * init
         *
         * @return
         */
        var init = function() {
            var t0 = Date.now();
            $log.log('[Apps] - starting init');
            Setup.startSetup().then(function() {
                $log.log('[Apps] - getting apps from local storage', storageKey);
                Storage.get(storageKey, function(items) {
                    var _apps = items && items[storageKey];
                    if (_apps && angular.isArray(_apps)) {
                        setApps(_apps);
                        $log.log('[Apps] - finished apps setup in ' + (Date.now() - t0), ' ms.');
                        return isReady.resolve(_apps);
                    }

                    $log.log('[Apps] - did not find apps in localStorage, getting from remote');
                    setup().then(function() {
                        store(function() {
                            $log.log('[Apps] - finished apps setup in ' + (Date.now() - t0), ' ms.');
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
            return apps;
        };

        /**
         * isAppEnabled
         * Checks if chrome app is an app and enabled
         *
         * @param chromeApp
         * @return
         */
        var isAppEnabled = function(chromeApp) {
            return chromeApp.isApp && chromeApp.enabled;
        };

        /**
         * getAppsFromAppsDb
         * Extracts the First apps from the apps db
         *
         * @param _appsDb
         * @return
         */
        var getAppsFromAppsDb = function(_appsDb) {
            //default=>All, tags=>Featured
            return _.chain(_appsDb)
                .filter(function(app) {
                    return _.has(app, 'default') &&
                        _.contains(app.
                            default, 'ALL');
                })
                .first(4)
                .value();
        };

        /**
         * getGamesFromAppsDb
         *
         * @param _appsDb
         * @param gamesToAdd Number of games to add
         * @return
         */
        var getGamesFromAppsDb = function(_appsDb, gamesToAdd) {
            return _.chain(_appsDb)
                .filter(function(app) {
                    return _.has(app, 'tags') && _.contains(app.tags, 'Games');
                })
                .shuffle()
                .first(gamesToAdd)
                .value();
        };

        /**
         * isFieldLocal
         * Checks if field is local
         * local field has 'filesystem:chrome-extension' or doesn't beging with http/https
         *
         * @param field
         * @return
         */
        var isFieldLocal = function(field) {
            if (/filesystem:chrome-extension/.test(field)) {
                return true;
            }
            if (/^https?/.test(field)) {
                return false;
            }

            return true;
        };

        /**
         * convertFieldToLocalFile
         * Converts all the icons to local file
         *
         * @param fieldToConvert
         * @param arr
         * @return
         */
        var convertFieldToLocalFile = function(fieldToConvert, arr) {
            var deferred = $q.defer();
            async.eachSeries(arr, function(item, callback) {
                //if field is local, don't change it
                if (isFieldLocal(item[fieldToConvert])) {
                    return callback();
                }

                Image.urlToLocalFile({
                    url: item[fieldToConvert]
                }).then(function(file) {
                    item[fieldToConvert] = file;
                    return callback();
                });
            }, function() {
                $rootScope.$apply(function() {
                    deferred.resolve(arr);
                });
            });
            return deferred.promise;
        };


        /**
         * organizeAppsAsDials
         * Get the webAppsDb and ChromeApps and organizes them into an array
         *
         * @param results
         * @return output
         */
        var organizeAppsAsDials = function(results) {
            var games, maxDials = C.CONFIG.initial_dials_size;
            var _appsDb, chromeApps, returnArr;

            _appsDb = results[0] && results[0].data || {};
            chromeApps = results[1] || [];

            var firstApps = getAppsFromAppsDb(_appsDb);
            $log.log('[Apps] - got # first apps', firstApps.length);
            var partnerApps = Config.get().web_apps_db || [];
            $log.log('[Apps] - got # partner apps', partnerApps.length);

            //calculate the number of games to add
            var numOfGamesToAdd = maxDials - systemApps.length - firstApps.length - partnerApps.length;
            //add the required number of games
            games = numOfGamesToAdd > 0 ? games = getGamesFromAppsDb(_appsDb, numOfGamesToAdd) : [];
            $log.log('[Apps] - got # game dials', games.length);

            if (chromeApps && chromeApps.length) {
                //filter apps & convert to object
                chromeApps = _.chain(chromeApps)
                    .filter(isAppEnabled)
                    .map(chromeAppToObject)
                    .value();
            }
            $log.log('[Apps] - got # chromeApps', chromeApps.length);

            returnArr = [].concat(systemApps)
                .concat(firstApps)
                .concat(partnerApps)
                .concat(games)
                .concat(chromeApps);

            $log.log('[Apps] - added a total of # initial dials', returnArr.length);
            return returnArr;
        };


        /**
         * organizeAsPages
         * Get dials and returns pages with dials grouped in arrays
         *
         * @param dials
         * @return
         */
        var organizeAsPages = function(dials) {
            var count = 0,
                dialsPerPage = C.CONFIG.dials_per_page;

            //have only 12 dials in a page
            var getPageIndex = function() {
                return Math.floor((count++) / dialsPerPage);
            };

            //split to arrays of 12, groupBy creates an object of {0:..., 1:..., 2:...}
            return _.values(_.groupBy(dials, getPageIndex));
        };

        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function() {
            var getDials = [getLocalAppsDb(), Chrome.management.getAll()];

            $log.log('[Apps] - starting setup');
            return $q.all(getDials)
            //organize apps as dials
            .then(organizeAppsAsDials)
            //convert all icons to local file system
            .then(convertFieldToLocalFile.bind(null, 'icon'))
            //organize apps as pages
            .then(organizeAsPages)
            //save apps to local object
            .then(setApps);
        };

        /**
         * getLocalAppsDb
         *
         * @return
         */
        var getLocalAppsDb = function() {
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
            appsDB: getLocalAppsDb,
            addNewApp: addNewApp,
            uninstallApp: uninstallApp
        };
    }
]);
