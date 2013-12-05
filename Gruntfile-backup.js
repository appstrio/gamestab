module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all available grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var path = {
        app:  'app',
        build: 'app',

        "package": 'package',
        "pkgs": 'pkgs'
    };

    var files = {
        jade: {},
        uglify: {}
    };

    files.jade["" + path.build + "/newtab.html"]     = path.app + "/newtab.jade";
    files.jade["" + path.build + "/options.html"]    = path.app + "/options.jade";
    files.jade["" + path.build + "/background.html"] = path.app + "/background.jade";

    var tmp = path.build;
    path.build = path.app + "/js/build";

    files.uglify["" + path.build + "/background.min.js"] = [
        "" + path.app + "libs/libs.min.js",
        "" + path.app + "modules/modules.min.js",
        "" + path.app + "env.js",
        "" + path.app + "background.js",
    ];
    files.uglify["" + path.build + "/newtab.min.js"] = [
        "" + path.app + "modules/modules.min.js",
        "" + path.app + "env.js",
        "" + path.app + "first.js",
        "" + path.app + "newtab.js",
    ];

    path.build = tmp;

    grunt.initConfig({
        jshint: {
            options: {},
            files: []
        },
        jade: {
            dev:{
                options:{
                    pretty:true
                },
                files: files.jade
            }
        },
        uglify: {
            options: {},
            libs:{
                file:[{
                    expand: true,
                    cwd: path.app + '/js/libs',
                    src: '*.js',
                    dest: path.app + '/js/libs/libs.min.js'
                }]
            },
            modules:{
                file:[{
                    expand: true,
                    cwd: path.app + '/js/modules',
                    src: '*.js',
                    dest: path.app + '/js/modules/modules.min.js'
                }]
            },
            dev:{
                files:files.uglify
            }
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

