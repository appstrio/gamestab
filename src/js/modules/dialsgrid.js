define(function DialsGrid () {
    var self = {
        dialAmount: 8
    };

    self.renderDials = function renderDials (dialsArr) {
        for (var i = dialsArr.length - 1; i >= 0; i--) {
            dial = dialsArr[i];
            self.renderDial(dial);
        };
    }
    self.ignoreDial = function ignoreDial (dial) {

    }



    // self.init = (function initDialsGrid () {

    // })();

    return self;
})