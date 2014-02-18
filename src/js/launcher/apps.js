/* global _ */
angular.module('aio.launcher').factory('Apps', [
    '$rootScope', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Image', 'Helpers',
    function ($rootScope, Storage, $q, Chrome, C, Config, $log, Image, Helpers) {
        var isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.APPS,
            cachedSortedWebApps,
            isCacheNeededFlag = false,
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

        var loadFromStorage = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var store = function () {
            return Helpers.store(storageKey, apps);
        };

        /**
         * init
         *
         * @return
         */
        var init = function () {
            console.debug('[Apps] - init');
            return loadFromStorage().then(function (_apps) {
                $log.info('[Apps] - Done with loading from storage');
                setApps(_apps);
                return isReady.resolve(_apps);
            });
        };

        var setApps = function (_apps) {
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

            cachedSortedWebApps = sortedApps;
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
            console.debug('[Apps] - starting to lazy cache items');
            var arr = angular.copy(_.flatten(apps));
            return Image.convertFieldToLocalFile('icon', {}, arr)
                .then(organizeAsPages)
                .then(setApps)
                .then(store)
                .then(reportDone.bind(null, 'lazy cache icons'))
                .then(function () {
                    isCacheNeededFlag = false;
                });
        };

        var reportDone = function (activity) {
            $log.info('[Apps] - finished ' + activity);
        };

        /**
         * isCacheNeeded
         * returns true if any app.icon is a remote url
         *
         * @return
         */
        var isCacheNeeded = function () {
            var arr = _.flatten(apps);

            return _.some(arr, function (item) {
                return Image.helpers.isPathRemote(item.icon);
            });
        };

        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function () {
            var getDials = [getOrganizedWebApps(), Chrome.management.getAll()];
            isCacheNeededFlag = true;

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

        var getOrganizedWebApps = function () {
            // if sorted web apps are sorted are already there, just return them
            if (cachedSortedWebApps) {
                var defer = $q.defer();
                defer.resolve(cachedSortedWebApps);
                return defer.promise;
            }
            return Helpers.loadRemoteJson(C.WEB_APPS_DB).then(parseWebApps);
        };

        /**
         * chromeAppToObject
         *
         * @param app
         * @return {app}
         */
        var chromeAppToObject = function (app) {
            var _app = angular.copy(app);
            _app.icon = getLargestIconChromeApp(app.icons).url || 'unknown.png';
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
            return store().then(cb);
        };

        /**
         * uninstallApp
         * TODO change to work with promises (from originating function)
         *
         * @param app
         * @param cb
         * @return
         */
        var uninstallApp = function (appToUninstall, cb) {
            var found = false;
            cb = cb || angular.noop;

            //first let's find the page in which the app's in
            found = _.find(apps, function (page) {
                return _.find(page, function (app, index) {
                    if (appToUninstall.url && appToUninstall.url === app.url ||
                        appToUninstall.chromeId && appToUninstall.chromeId === app.chromeId) {

                        //delete app from page
                        page.splice(index, 1);
                        return true;
                    }
                    return false;
                });
            });

            if (!found) {
                $log.warn('App to uninstall was not found', appToUninstall);
                return cb();
            }
            //store new dials
            return store().then(cb);
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
            setup: setup,
            init: init,
            isCacheNeeded: function () {
                //return true if flag is up, or if any items pass the remote url check
                return isCacheNeededFlag || isCacheNeeded();
            },
            setApps: setApps,
            apps: function () {
                return apps;
            },
            store: store,
            organizeAsPages: organizeAsPages,
            getWebAppsDb: getOrganizedWebApps,
            lazyCacheIcons: lazyCacheIcons,
            addNewApp: addNewApp,
            uninstallApp: uninstallApp
        };
    }
]);
