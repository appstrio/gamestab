/* global _ */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.factory('Apps', ['$rootScope', '$http', 'Storage', '$q', 'Chrome', 'Constants', 'Config', '$log', 'Setup',
    function($rootScope, $http, Storage, $q, Chrome, C, Config, $log, Setup) {
        var initting = $q.defer(),
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
            $log.log('[Apps] - starting init');
            Setup.startSetup().then(function() {
                Storage.get(storageKey, function(items) {
                    if (items && items[storageKey] && angular.isArray(items[storageKey])) {
                        apps = items[storageKey];
                        initting.resolve(apps);
                        return;
                    }

                    setup().then(function(_apps) {
                        apps = _apps;
                        initting.resolve(apps);
                    });
                });
            });
        };

        /**
         * setup
         *
         * @param cb
         * @return
         */
        var setup = function() {
            var config = Config.get();
            var partnerWebApps = config.web_apps_db;

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
                                default, 'ALL') &&
                            _.has(app, 'tags') &&
                            _.contains(app.tags, 'Featured');
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

                    store(function() {
                        $rootScope.$apply(function() {
                            deferred.resolve(newOutput);
                        });
                    });
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
         * @param cb
         * @return
         */
        var store = function(cb) {
            Storage.setItem(storageKey, apps, cb);
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
                cb && cb();
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
            promise: initting.promise,
            apps: function() {
                return apps;
            },
            store: store,
            appsDB: localAppsDB,
            addNewApp: addNewApp,
            uninstallApp: uninstallApp
        };
    }
]).directive('hlLauncher', ['Apps',
    function(Apps) {
        return function(scope, element) {

            scope.curScreen = 0;

            var $viewport = element.find('.viewport').eq(0);
            var $arrowLeft = element.find('.icon-left-open-big').eq(0);
            var $arrowRight = element.find('.icon-right-open-big').eq(0);
            var screenWidth = 880;
            scope.isDragging = false;

            var getScreenWidth = function(numberOfScreen) {
                return screenWidth * numberOfScreen + 'px';
            };

            var getScreenPosition = function(curScreen) {
                return screenWidth * curScreen * (-1) + 'px';
            };

            var checkArrows = function() {
                if (!scope.rawScreens) {
                    return;
                }

                if (scope.curScreen > 0) {
                    $arrowLeft.show();
                } else {
                    $arrowLeft.hide();
                }

                if (scope.curScreen < scope.rawScreens.length - 1) {
                    $arrowRight.show();
                } else {
                    $arrowRight.hide();
                }
            };


            $arrowLeft.click(function() {
                if (scope.curScreen > 0) {
                    --scope.curScreen;
                    moveViewport();
                } else if (scope.curScreen === 0) {

                } else {

                }
            }).mouseover(function() {
                if (!scope.isDragging) return;
                if (scope.curScreen > 0) {
                    --scope.curScreen;
                    moveViewport();
                    $draggingHelper.animate({
                        left: '-=' + screenWidth + 'px'
                    }, 1300);
                }
            });


            $arrowRight.click(function() {
                if (scope.rawScreens && scope.rawScreens.length && scope.curScreen < scope.rawScreens.length - 1) {
                    ++scope.curScreen;
                    moveViewport();
                } else if (scope.curScreen === scope.rawScreens.length) {

                } else {

                }

            }).mouseover(function() {
                if (!scope.isDragging) {
                    return;
                }
                if (scope.curScreen < scope.rawScreens.length - 1) {
                    ++scope.curScreen;
                    $draggingHelper.animate({
                        left: '+=' + screenWidth + 'px'
                    }, 1300);
                    moveViewport();
                }
            });

            var moveViewport = function() {
                var newVal = scope.curScreen || 0;
                $viewport.css({
                    left: getScreenPosition(newVal)
                });
                checkArrows();
            };

            // watch the number of screens to set the width of the viewport
            scope.$watch('rawScreens', function(newVal) {
                if (newVal && newVal.length) {
                    $viewport.css({
                        width: getScreenWidth(newVal.length)
                    });
                }
                checkArrows();
            });

            var $draggingItem, $draggingHelper, $draggingPlaceholder;
            scope.sortableOptions = {
                //tolerance : 'pointer',
                disabled: true,
                start: function(e, u) {
                    $draggingItem = $(u.item);
                    $draggingHelper = $(u.helper);
                    $draggingPlaceholder = $(u.placeholder);
                    $draggingItem.appendTo($draggingItem.parent());
                    $draggingHelper.addClass('dragging');
                    setTimeout(function() {
                        $draggingHelper.parent().parent().addClass('edit');
                    }, 0);

                    scope.isDragging = true;
                },
                stop: function(e, u) {
                    // remove unnecessary classes
                    $draggingHelper.removeClass('dragging');
                    $draggingHelper.parent().parent().removeClass('edit');
                    // clean variables
                    scope.isDragging = false;
                    $draggingHelper = null;
                    $draggingItem = null;
                    $draggingPlaceholder = null;
                    scope.$apply(function() {
                        Apps.store();
                    });
                },
                placeholder: 'app',
                revert: 500,
                opacity: .75,
                helper: 'clone',
                over: function(e, u) {},
                sort: function(e, u) {},
                receive: function(e, u) {
                    angular.forEach(scope.rawScreens, function(screen, index) {

                        if (screen.length > 12) {
                            var lastApp = screen.pop();
                            moveLastAppToNewScreen(lastApp, index);
                        }
                    });
                },
                connectWith: '.apps-container'
            };

            var moveLastAppToNewScreen = function(app, startIndex) {
                var foundNewScreen = false,
                    screen;
                for (var i = startIndex; i < scope.rawScreens.length; ++i) {
                    screen = scope.rawScreens[i];
                    if (screen.length < 12) {
                        screen.push(app);
                        Apps.store();
                        foundNewScreen = true;
                        break;
                    }
                }

                if (!foundNewScreen) {
                    var newScreen = [app];
                    scope.rawScreens.push(newScreen);
                    Apps.store();
                }

            };

            scope.longPress = function(app, e) {
                scope.isEditing = true;
                scope.sortableOptions.disabled = false;
            };

            $(document).click(function() {
                scope.$apply(function() {
                    scope.isEditing = false;
                    scope.sortableOptions.disabled = true;
                });
            });
        };
    }
]);
