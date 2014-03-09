angular.module('aio.overlay', []);

angular.module('aio.overlay').directive('aioOverlay', ['$timeout', '$log',
    function ($timeout, $log) {
        return {
            scope: {
                overlayOptions: '='
            },
            link: function (scope, element) {
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
                    $('#container').removeClass('blurred');
                    $overlay.removeClass('enlarged');
                    scope.templateURL = '';
                    scope.overlayOptions = null;
                    if (typeof done === 'function') {
                        done();
                    }
                };
                /**
                 * show
                 *
                 * @param done
                 * @return
                 */
                var show = function () {
                    $overlay.addClass('showed');
                    $('#container').addClass('blurred');
                    $overlay.addClass('enlarged');
                };

                element.on('click', function () {
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
