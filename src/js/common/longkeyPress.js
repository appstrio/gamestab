var longKeyPressModule = angular.module('aio.interactions', []);

longKeyPressModule.directive('hlLongPress', ['$parse',
    function($parse) {
        return function(scope, element, attr) {
            var fn = $parse(attr.hlLongPress);
            element.longPress(function(event) {
                scope.$apply(function() {
                    fn(scope, {
                        $event: event
                    });
                });
            }, 200);
        };
    }
])

(function($) {
    $.fn.longPress = function(callback, timeout) {
        var timer, isLongPress = false;
        timeout = timeout || 500;
        $(this).mousedown(function(e) {
            isLongPress = false;
            timer = setTimeout(function() {
                callback(e);
                isLongPress = true;
            }, timeout);
        }).click(function(e) {
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        $(document).mouseup(function(e) {
            if (isLongPress) {
                e.stopPropagation();
                e.preventDefault();
            }
            clearTimeout(timer);
        });
    };

})(jQuery);
