define(['env','when'],function Module (env, when) {
    var initting = when.defer(),
        self = {

        };

    var init = function initModule() {

    }

    init()
    initting.otherwise(env.errhandler)

    return self;
})