
define(["env", "jquery", "Renderer", "when"], function DialContainer(env, $, renderer, when) {
    "use strict";

    var self = {},
        animationDuration = 1000,
        defaultOptions = {
            timeToDisplay : 1200
        },
        $alert = $('#alert'),
        $inner = $alert.find('.inner').eq(0);

    self.show = function(msg, _options){
        _options = _options || {};
        var options = $.extend({}, defaultOptions, _options);
        $inner.text(msg);
        $alert.addClass('showed');
        setTimeout(function(){
            $alert.removeClass('showed');
        }, options.timeToDisplay + animationDuration);
    }

    return self;
});
