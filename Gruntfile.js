'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var paths = {
        app:  'app',
        dist: 'dist'
    };

    grunt.initConfig({
        config: paths,
        jshint: {
            options: {},
            files: []
        },
        jade: {
            dev:{
                options:{
                    pretty:true
                },
                files: [{
                    "app/newtab.html":"app/newtab.jade",
                    "app/options.html":"app/options.jade",
                    "app/background.html":"app/background.jade"
                },{}]
            },
            prod:{
                options: {pretty:false }
            },
        }
    });
//    grunt.registerTask('test', [
//        ''
//    ]);
//    grunt.registerTask('build', [
//        ''
//    ]);
    grunt.registerTask('default', [
        // 'jshint',
        'jade:dev'
        // 'test'
        // 'build'
    ]);
};
