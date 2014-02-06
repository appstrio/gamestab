var overlayModule = angular.module('aio.overlay', []);

overlayModule.directive('aioOverlay', ['$timeout',
    function($timeout) {
        return {
            scope: {
                overlayOptions: '='
            },
            link: function(scope, element, attrs) {

                var $overlay = element;
                scope.$watch('overlayOptions', function(newVal) {
                    if (!newVal || !newVal.name) {
                        hide();
                    } else {
                        scope.templateURL = newVal.name + '.html';
                        setTimeout(show, 0);
                    }
                });

                var hide = function(done) {
                    $overlay.removeClass('showed');
                    $('#wrapper').removeClass('blurred');
                    $overlay.removeClass('enlarged');
                    $timeout(function() {
                        scope.templateURL = '';
                        scope.overlayOptions = null;
                        done && done();
                    }, 0);
                };
                var show = function(done) {
                    $overlay.addClass('showed');
                    $('#wrapper').addClass('blurred');
                    $timeout(function() {
                        $overlay.addClass('enlarged');
                        $timeout(function() {
                            done && done();
                        }, 0);
                    }, 0);
                };

                element.on('click', function(e) {
                    hide();
                }).on('click', '.main', function(e) {
                    e.stopPropagation();
                });

                scope.$on('$destroy', function() {
                    element.off();
                });
            }
        };
    }
]);
