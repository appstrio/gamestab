/* global _ */
angular.module('aio.launcher').factory('Apps', [
    '$rootScope', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Image', 'Helpers', 'bConnect',
    function ($rootScope, Storage, $q, Chrome, C, Config, $log, Image, Helpers, bConnect) {
        var isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.APPS,
            deletedAppsStorageKey = C.STORAGE_KEYS.DELETED_APPS,
            cachedSortedWebApps,
            managementAppsPromise,
            isCacheNeededFlag = false,
            removedApps = [],
            apps;

        var systemApps = [{
            title: 'Settings',
            icon: './img/preset_dials/settings175x175.png',
            overlay: 'settings',
            permanent: true
        }, {
            title: 'Apps Store',
            icon: './img/preset_dials/appstore175x175.png',
            overlay: 'store',
            permanent: true
        }];

        var loadFromStorage = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var store = function () {
            return Helpers.store(storageKey, apps);
        };

        function getChromeApps(data) {
            var returnData;
            if (data && data.api === 'getManagementApps' && data.results) {
                returnData = data.results;
            }
            $rootScope.$apply(function () {
                managementAppsPromise.resolve(returnData);
            });
        }

        var bConnection = new bConnect.BackgroundApi('chrome');
        bConnection.addListener(getChromeApps);

        var setApps = function (_apps) {
            apps = _apps;
            return apps;
        };

        //load from storage
        var init = function () {
            // console.debug('[Apps] - init');
            return loadFromStorage().then(function (_apps) {
                // $log.info('[Apps] - Done with loading from storage');
                setApps(_apps);
                return isReady.resolve(_apps);
            });
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
            var count = 0;
            var conf = Config.get();
            var dialsPerPage = conf && conf.dials_per_page || C.CONFIG.dials_per_page;

            $log.log('[Apps] - organizing apps in pages of ' + C.CONFIG.dials_per_page);
            //have only 12 dials in a page
            var getPageIndex = function () {
                return Math.floor((count++) / dialsPerPage);
            };

            //split to arrays of 12, groupBy creates an object of {0:..., 1:..., 2:...}
            return _.values(_.groupBy(dials, getPageIndex));
        };

        var receiveCachedItems = function (items) {
            var newApps = organizeAsPages(items);
            setApps(newApps);
            store().then(function () {
                console.debug('[Apps] - got cached icons', items.length);
                isCacheNeededFlag = false;
            });
        };

        var lazyCacheIcons = function () {
            console.debug('[Apps] - starting to lazy cache items');
            var cacheConnection = new bConnect.BackgroundApi('cache');
            cacheConnection.addListener(receiveCachedItems);

            var arr = angular.copy(_.flatten(apps));
            cacheConnection.postMessage({
                type: 'cache',
                field: 'icon',
                items: arr
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
                return item && item.icon && Image.helpers.isPathRemote(item.icon);
            });
        };

        var getAllChromeApps = function () {
            if (Config.get().use_chrome_apps) {
                bConnection.postMessage({
                    api: 'getManagementApps'
                });
                managementAppsPromise = $q.defer();
                return managementAppsPromise.promise;
            }
        };

        var fetchDials = function () {
            return $q.all([getOrganizedWebApps(), getAllChromeApps()]);
        };
        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function () {
            isCacheNeededFlag = true;

            $log.log('[Apps] - starting setup');
            return fetchDials()
            //organize apps as dials
            .then(organizeAppsAsDials, organizeAppsAsDials)
            //organize apps as pages
            .then(organizeAsPages)
            //save apps to local object
            .then(setApps)
            //save to storage
            .then(store)
            //resolve service promise
            .then(function () {
                reportDone('install');
                return isReady.resolve(apps);
            });
        };

        /**
         * getOrganizedWebApps
         * get apps from cache or remote json
         *
         * @return {Promise}
         */
        var getOrganizedWebApps = function () {
            // if sorted web apps are sorted are already there, just return them
            if (cachedSortedWebApps) {
                return $q.when(cachedSortedWebApps);
            }
            return Helpers.loadRemoteJson(C.WEB_APPS_DB).then(parseWebApps);
        };

        /**
         * addNewApp
         *
         * @param app
         * @param cb
         * @return
         */
        var addNewApp = function (app) {
            var lastAvailablePage = getLastAvailablePage();
            app.installTimestamp = Date.now();
            lastAvailablePage.push(app);
            return store();
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

                        var deletedApp = angular.copy(appToUninstall);
                        deletedApp.deletedTimestamp = Date.now();
                        removedApps.push(appToUninstall);
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
            return $q.when(organizeAsPages(_.flatten(apps)))
                .then(setApps)
                .then(store)
                .then(storeRemoveApps)
                .then(cb);
        };

        var storeRemoveApps = function () {
            return Helpers.store(deletedAppsStorageKey, removedApps);
        };

        var loadRemovedApps = function () {
            return Helpers.loadFromStorage(deletedAppsStorageKey).then(function (deleted) {
                removedApps = deleted || [];
            }, function () {
                return [];
            });
        };

        //mark item to delete in srcArr if not in targetArr
        var markDeletedIfNotFound = function (srcArr, targetArr, srcField, targetField) {
            //loop through local chrome apps finding redundant apps
            srcArr.forEach(function (ourApp) {
                var query = {};
                query[targetField] = ourApp[srcField];
                if (!_.findWhere(targetArr, query)) {
                    console.info('marking app for deletion', ourApp);
                    ourApp.toDelete = true;
                }
            });
        };

        var syncChromeApps = function (flattenedApps, chromeApps) {
            //get only the chrome apps from all apps
            var ourChromeApps = _.filter(flattenedApps, 'chromeId');

            //loop through system chrome apps finding and syncing apps
            chromeApps.forEach(function (cApp) {
                var newChromeApp;
                var isChromeAppRemoved = _.findWhere(removedApps, {
                    chromeId: cApp.id
                });

                //if it's removed - don't re add it
                if (isChromeAppRemoved) {
                    return;
                }

                //if it's found in ours
                var isChromeAppFound = _.findWhere(ourChromeApps, {
                    chromeId: cApp.id
                });

                newChromeApp = Helpers.chromeAppToObject(cApp);

                if (isChromeAppFound) {
                    //sync it
                    isChromeAppFound = angular.extend(isChromeAppFound, newChromeApp);
                    return;
                }

                //app is new and needs to be inserted
                flattenedApps.push(newChromeApp);
            });

            markDeletedIfNotFound(ourChromeApps, chromeApps, 'chromeId', 'id');
            return flattenedApps;
        };

        //remove if not existant. add if not found
        var syncPartnerApps = function (flattenedApps, partnerApps) {

            //loop through remote partner apps finding and syncing apps
            partnerApps.forEach(function (pApp) {
                var isPartnerAppFound = _.findWhere(flattenedApps, {
                    url: pApp.url
                });

                //sync it
                if (isPartnerAppFound) {
                    isPartnerAppFound = angular.extend(isPartnerAppFound, pApp);
                    return;
                }

                //partner app not found in ours
                var isPartnerAppRemoved = _.findWhere(removedApps, {
                    url: pApp.url
                });

                //if it's removed, don't add it back
                if (isPartnerAppRemoved) {
                    return;
                }

                //else add it
                //TODO decide at what spot
                console.info('adding new partner app', pApp);
                flattenedApps.push(pApp);
            });

            //loop through local partner apps finding redundant apps
            var ourPartnerApps = _.filter(flattenedApps, 'owner_partner_id');

            markDeletedIfNotFound(ourPartnerApps, partnerApps, 'url', 'url');
            return flattenedApps;
        };

        //remove app if not found in web apps db
        var syncAllApps = function (flattenedApps, allApps) {
            flattenedApps.forEach(function (app) {
                //skip partner & chrome apps
                if (app.owner_partner_id || app.chromeId || app.overlay) {
                    return;
                }
                //find app in all apps
                var isAppFound = _.findWhere(allApps, {
                    url: app.url
                });

                //sync it
                if (isAppFound) {
                    app = angular.extend(app, isAppFound);
                    return;
                }

                //otherwise delete it
                app.toDelete = true;
            });

            return flattenedApps;
        };

        //sync web apps db
        var syncWebAppsDb = function () {
            var flattenedApps = _.flatten(apps);
            var partnerApps = Config.get().web_apps_db || [];

            $log.log('Syncing web apps db');

            loadRemovedApps().then(fetchDials).then(function (results) {
                var webApps = results[0] || [];
                // var chromeApps = results[1] || [];

                // chromeApps = _.filter(chromeApps, isAppEnabled);

                $log.info('Done getting remote apps. Now syncing', flattenedApps.length);
                //make sure all partner dials are synced
                flattenedApps = syncPartnerApps(flattenedApps, partnerApps);
                //make sure web apps db are synced
                flattenedApps = syncAllApps(flattenedApps, webApps);
                //make sure chrome apps are synced

                //DEPRECATED for now
                // flattenedApps = syncChromeApps(flattenedApps, chromeApps);

                flattenedApps = _.filter(flattenedApps, function (i) {
                    return (i && !i.toDelete);
                });
                return $q.when(organizeAsPages(flattenedApps)).then(setApps).then(store);
            });
        };

        /**
         * getLastAvailablePage
         *
         * @return
         */
        var getLastAvailablePage = function () {
            var lastPage = apps[apps.length - 1];
            //if enough room on last page
            if (lastPage.length < 12) {
                return lastPage;
            }
            //else add a new page
            var newPage = [];
            apps.push(newPage);
            return newPage;
        };

        return {
            init: init,
            isReady: isReady.promise,
            setup: setup,
            isCacheNeeded: function () {
                //return true if flag is up, or if any items pass the remote url check
                return isCacheNeededFlag || isCacheNeeded();
            },
            setApps: setApps,
            apps: function () {
                return apps;
            },
            addNewApp: addNewApp,
            getWebAppsDb: getOrganizedWebApps,
            lazyCacheIcons: lazyCacheIcons,
            organizeAsPages: organizeAsPages,
            store: store,
            syncWebAppsDb: syncWebAppsDb,
            uninstallApp: uninstallApp
        };
    }
]);
