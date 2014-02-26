/* global _ */
angular.module('aio.launcher').directive('hlLauncher', ['Apps', '$log', '$timeout', 'Analytics', 'Chrome',
    function (Apps, $log, $timeout, Analytics, Chrome) {
        return function (scope, element) {
            //jshint unused:false

            scope.curScreen = 0;

            var $viewport = element.find('.viewport').eq(0);
            var $arrowLeft = element.find('.icon-left-open-big').eq(0);
            var $arrowRight = element.find('.icon-right-open-big').eq(0);
            var screenWidth = 880;
            scope.isDragging = false;

            scope.launchApp = function (app) {
                //user is editing dials. don't launch
                if (scope.isEditing) {
                    return false;
                }

                //click on a partner dial
                if (app.owner_partner_id) {
                    Analytics.reportEvent(201, {
                        label: app.title || app.url,
                        waitForFinish: true
                    }).then(function () {
                        window.parent.location = app.url;
                    });
                    return;
                }

                //regular app link. open it
                if (app.url) {
                    Analytics.reportEvent(101, {
                        label: app.title || app.url,
                        waitForFinish: true
                    }).then(function () {
                        // window.location = app.url;
                        window.parent.location = app.url;
                    });
                    return;
                }

                //app is a chrome app. launch it
                if (app.chromeId) {
                    return Analytics.reportEvent(101, {
                        label: app.title || app.chromeId,
                        waitForFinish: true
                    }).then(Chrome.management.launchApp.bind(null, app.chromeId));
                }

                //app is an overlay. run it
                if (app.overlay) {
                    var analyticsEvent;
                    scope.setOverlay(app.overlay);
                    //report analytics
                    if (app.overlay === 'settings') {
                        analyticsEvent = 701;
                    } else if (app.overlay === 'store') {
                        analyticsEvent = 601;
                    }

                    return Analytics.reportEvent(analyticsEvent);
                }
            };

            /**
             * uninstallApp
             * User clicked to uninstall app
             *
             * @param app
             * @param e
             * @return
             */
            scope.uninstallApp = function (app) {
                if (app.overlay && _.contains(app.overlay, ['settings', 'store'])) {
                    //can't allow them to uninstall system apps, even by error
                    return;
                }

                //deprecated
                // if (app.chromeId) {
                // need to confirm before delete
                // var response = window.confirm('Are you sure you want to delete your Chrome App ' + app.title + '?');
                // if (!response) {
                // return;
                // }
                // }

                Apps.uninstallApp(app, function () {
                    console.debug('deleted app');
                    //reassign scope vars
                    scope.refreshScope();
                    verifyCurScreen();
                    //report analytics
                    Analytics.reportEvent(103, {
                        label: app.title || app.url
                    });
                });
            };

            //move screen left if needed
            var verifyCurScreen = function () {
                if (scope.rawScreens.length && scope.curScreen >= scope.rawScreens.length) {
                    --scope.curScreen;
                    moveViewport();
                }
            };

            var getScreenWidth = function (numberOfScreen) {
                return screenWidth * numberOfScreen + 'px';
            };

            var getScreenPosition = function (curScreen) {
                return screenWidth * curScreen * (-1) + 'px';
            };

            var checkArrows = function () {
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

            $arrowLeft.click(function () {
                //user on first screen
                if (scope.curScreen <= 0) {
                    return;
                }

                --scope.curScreen;
                moveViewport();
                Analytics.reportEvent(401, {
                    label: 'left'
                });
            }).mouseover(function () {
                //only run this code if user is dragging
                if (!scope.isDragging) {
                    return;
                }

                //we are not on the lefmost screen
                if (scope.curScreen > 0) {
                    --scope.curScreen;
                    moveViewport();
                    $draggingHelper.animate({
                        left: '-=' + screenWidth + 'px'
                    }, 1300);
                }
            });

            $arrowRight.click(function () {
                //clicks on right arrow and we have screen to show him
                if (scope.rawScreens && scope.rawScreens.length && scope.curScreen < scope.rawScreens.length - 1) {
                    ++scope.curScreen;
                    moveViewport();
                    Analytics.reportEvent(401, {
                        label: 'right'
                    });
                } else if (scope.curScreen >= scope.rawScreens.length) {
                    //user clicked on right arrow and is on top right screen
                    return;
                }
            }).mouseover(function () {
                //only run this code if user is dragging
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

            var moveViewport = function () {
                var newVal = scope.curScreen || 0;
                $viewport.css({
                    left: getScreenPosition(newVal)
                });
                checkArrows();
            };

            // watch the number of screens to set the width of the viewport
            scope.$watch('rawScreens', function (newVal) {
                if (newVal && newVal.length) {
                    $viewport.css({
                        width: getScreenWidth(newVal.length)
                    });
                }

                checkArrows();
            }, true);

            var $draggingItem, $draggingHelper, $draggingPlaceholder;
            scope.sortableOptions = {
                //tolerance : 'pointer',
                disabled: true,
                start: function (e, u) {
                    $draggingItem = $(u.item);
                    $draggingHelper = $(u.helper);
                    $draggingPlaceholder = $(u.placeholder);
                    $draggingItem.appendTo($draggingItem.parent());
                    $draggingHelper.addClass('dragging');
                    $timeout(function () {
                        $draggingHelper.parent().parent().addClass('edit');
                    }, 0);

                    scope.isDragging = true;

                    scope.activeApp = scope.activeApp || {};
                    Analytics.reportEvent(102, {
                        label: scope.activeApp.title || scope.activeApp.url
                    });
                },
                stop: function (e, u) {
                    // remove unnecessary classes
                    $draggingHelper.removeClass('dragging');
                    $draggingHelper.parent().parent().removeClass('edit');
                    // clean variables
                    scope.isDragging = false;
                    $draggingHelper = null;
                    $draggingItem = null;
                    $draggingPlaceholder = null;
                    scope.$apply(function () {
                        Apps.store();
                    });
                },
                placeholder: 'app',
                revert: 500,
                opacity: 0.75,
                helper: 'clone',
                over: function (e, u) {},
                sort: function (e, u) {},
                receive: function (e, u) {
                    angular.forEach(scope.rawScreens, function (screen, index) {
                        if (screen.length > 12) {
                            var lastApp = screen.pop();
                            moveLastAppToNewScreen(lastApp, index);
                        }
                    });
                },
                connectWith: '.apps-container'
            };

            var moveLastAppToNewScreen = function (app, startIndex) {
                var foundNewScreen = false,
                    screen;

                $log.log('[hlLauncher] - moveLastAppToNewScreen');
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

            scope.longPress = function (app, e) {
                $log.log('[hlLauncher] - starting drag');
                scope.isEditing = true;
                scope.sortableOptions.disabled = false;
                scope.activeApp = app;

                //track only once - since this turns off dragging
                $(document).one('click', function () {
                    $log.log('[hlLauncher] - ended drag');
                    scope.$apply(function () {
                        //turn editing off
                        scope.isEditing = false;
                        scope.sortableOptions.disabled = true;
                    });
                });
            };
        };
    }
]);
