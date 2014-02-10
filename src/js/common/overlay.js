var overlayModule = angular.module('aio.overlay', []);

overlayModule.directive('aioOverlay', ['$timeout', '$log',
    function ($timeout, $log) {
        return {
            scope: {
                overlayOptions: '='
            },
            link: function (scope, element, attrs) {
                var $overlay = element;
                scope.$watch('overlayOptions', function (newVal) {
                    if (!newVal || !newVal.name) {
                        return hide();
                    }

                    $log.log('[aioOverlay] - opening overlay', newVal);

                    scope.templateURL = newVal.name + '.html';
                    show();
                });

                /**
                 * hide
                 *
                 * @param done
                 * @return
                 */
                var hide = function (done) {
                    $overlay.removeClass('showed');
                    $('#wrapper').removeClass('blurred');
                    $overlay.removeClass('enlarged');
                    scope.templateURL = '';
                    scope.overlayOptions = null;
                };
                /**
                 * show
                 *
                 * @param done
                 * @return
                 */
                var show = function (done) {
                    $overlay.addClass('showed');
                    $('#wrapper').addClass('blurred');
                    $overlay.addClass('enlarged');
                };

                element.on('click', function (e) {
                    hide();
                }).on('click', '.main', function (e) {
                    e.stopPropagation();
                });

                scope.$on('$destroy', function () {
                    element.off();
                });
            }
        };
    }
]);
