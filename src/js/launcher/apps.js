/* global _ */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.factory('Apps', ['$rootScope', '$http', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Image',
    function ($rootScope, $http, Storage, $q, Chrome, C, Config, $log, Image) {
        var isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.APPS,
            apps;

        var systemApps = [{
            title: 'Settings',
            icon: './img/dials/settings175x175.png',
            overlay: 'settings',
            permanent: true
        }, {
            title: 'Apps Store',
            icon: './img/dials/appstore175x175.png',
            overlay: 'store',
            permanent: true
        }];

        /**
         * init
         *
         * @return
         */
        var init = function () {
            console.debug('[Apps] - init');
            Storage.get(storageKey, function (items) {
                var _apps = items && items[storageKey];
                if (_apps && angular.isArray(_apps)) {
                    $log.log('[Apps] - got apps from local storage');
                    setApps(_apps);
                    return isReady.resolve(_apps);
                }

                $log.log('[Apps] - did not find apps in localStorage, getting from remote');
                return setup();
            });
            return isReady.promise;
        };

        var setApps = function (_apps) {
            $log.log('[Apps] - saving apps to memory');
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
        var isAppEnabled = function (chromeApp) {
            return chromeApp.isApp && chromeApp.enabled;
        };

        /**
         * getAppsFromAppsDb
         * Extracts the First apps from the apps db
         *
         * @param _appsDb
         * @return
         */
        var getAppsFromAppsDb = function (_appsDb) {
            //default=>All, tags=>Featured
            return _.chain(_appsDb)
                .filter(function (app) {
                    return _.has(app, 'default') && _.contains(app.
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
        var getGamesFromAppsDb = function (_appsDb, gamesToAdd) {
            return _.chain(_appsDb)
                .filter(function (app) {
                    return _.has(app, 'tags') && _.contains(app.tags, 'Games');
                })
                .shuffle()
                .first(gamesToAdd)
                .value();
        };

        var parseWebApps = function (webApps) {
            var sortedApps = [];
            var paths = webApps.data;
            _.each(paths, function (filesInPath) {
                _.each(filesInPath.files, function (webApp) {
                    webApp.icon = filesInPath.path + webApp.icon;
                    sortedApps.push(webApp);
                });
            });

            $log.log('[Apps] - found # number of webApps', sortedApps.length);
            return sortedApps;
        };

        /**
         * organizeAppsAsDials
         * Get the webAppsDb and ChromeApps and organizes them into an array
         *
         * @param results
         * @return output
         */
        var organizeAppsAsDials = function (results) {
            var games, maxDials = C.CONFIG.initial_dials_size;
            var _appsDb, chromeApps, returnArr;

            _appsDb = results[0] || [];
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
        var organizeAsPages = function (dials) {
            var count = 0,
                dialsPerPage = C.CONFIG.dials_per_page;

            $log.log('[Apps] - organizing apps in pages of ' + C.CONFIG.dials_per_page);
            //have only 12 dials in a page
            var getPageIndex = function () {
                return Math.floor((count++) / dialsPerPage);
            };

            //split to arrays of 12, groupBy creates an object of {0:..., 1:..., 2:...}
            return _.values(_.groupBy(dials, getPageIndex));
        };

        var lazyCacheIcons = function () {
            var arr = angular.copy(_.flatten(apps));
            return Image.convertFieldToLocalFile('icon', {}, arr)
                .then(organizeAsPages)
                .then(setApps)
                .then(store)
                .then(reportDone.bind(null, 'lazy cache icons'));
        };

        var reportDone = function (activity) {
            $log.info('[Apps] - finished ' + activity);
        };

        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function () {
            var getDials = [getOrganizedWebApps(), Chrome.management.getAll()];

            $log.log('[Apps] - starting setup');
            return $q.all(getDials)
            //organize apps as dials
            .then(organizeAppsAsDials)
            //organize apps as pages
            .then(organizeAsPages)
            //save apps to local object
            .then(setApps)
            //save to storage
            .then(store)
            //report done
            .then(reportDone.bind(null, 'install'))
            //resolve service promise
            .then(isReady.resolve.bind(null, apps));
        };

        /**
         * getWebAppsDb
         *
         * @return
         */
        var getWebAppsDb = function () {
            $log.log('[Apps] - getting webAppsDb from', C.WEB_APPS_DB);
            return $http.get(C.WEB_APPS_DB);
        };

        var getOrganizedWebApps = function () {
            return getWebAppsDb()
                .then(parseWebApps);
        };

        /**
         * chromeAppToObject
         *
         * @param app
         * @return {app}
         */
        var chromeAppToObject = function (app) {
            var _app = angular.copy(app);
            _app.icon = getLargestIconChromeApp(app.icons).url;
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
            if (!iconsArr.length) {
                return null;
            }

            //find item with largest size
            return _.reduce(iconsArr, function (largest, item) {
                if (item.size > largest.size) {
                    return item;
                }
                return largest;
            }, iconsArr[0]);
        };

        /**
         * store
         *
         * @return promise
         */
        var store = function () {
            $log.log('[Apps] - Saving apps to storage');
            var deferred = $q.defer();
            //need to bind here to resolve deferred
            Storage.setItem(storageKey, apps, function () {
                _.defer(function () {
                    $rootScope.$apply(function () {
                        deferred.resolve();
                    });
                });
            });
            return deferred.promise;
        };

        /**
         * addNewApp
         *
         * @param app
         * @param cb
         * @return
         */
        var addNewApp = function (app, cb) {
            var lastAvailablePage = getLastAvailablePage();
            app.installTimestamp = Date.now();
            lastAvailablePage.push(app);
            //TODO change whoever calls this to work with promises
            store().then(cb);
        };

        /**
         * uninstallApp
         * TODO change to work with promises (from originating function)
         *
         * @param app
         * @param cb
         * @return
         */
        var uninstallApp = function (app, cb) {
            var found = false;
            cb = cb || angular.noop;
            angular.forEach(apps, function (page) {
                angular.forEach(page, function (_app, index) {
                    if (app.url === _app.url) {
                        page.splice(index, 1);
                        found = true;
                        store().then(cb);
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
        var getLastAvailablePage = function () {
            var lastPage = apps[apps.length - 1];
            if (lastPage.length < 12) {
                return lastPage;
            }

            var newPage = [];
            apps.push(newPage);
            store();
            return newPage;

        };

        return {
            isReady: isReady.promise,
            init: init,
            apps: function () {
                return apps;
            },
            store: store,
            getWebAppsDb: getOrganizedWebApps,
            lazyCacheIcons: lazyCacheIcons,
            addNewApp: addNewApp,
            uninstallApp: uninstallApp
        };
    }
]);
