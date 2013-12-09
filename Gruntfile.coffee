module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt

  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  grunt.initConfig
    watch:
      pages:
        files: '<%= jade.dev.files %>'
        tasks: ['jade:dev']
      modules:
        files: '<%= copy.modules.files %>'
        tasks: ['copy:modules']
    jade:
      dev:
        options:
          pretty: true
        files: [
          dest: "build/newtab.html"
          src : "src/jade/newtab.jade"
        ,
          dest: "build/options.html"
          src : "src/jade/options.jade"
        ,
          dest: "build/background.html"
          src : "src/jade/background.jade"
        ]
    copy:
      manifest:
        expand: true
        src: ['./src/manifest.json']
        dest: './build'
        flatten: true
      libs:
        expand: true
        src: [
          "bower_components/requirejs/require.js"
          "bower_components/requirejs-promise/requirejs-promise.js"
          "bower_components/jquery/jquery.min.js"
          "bower_components/jfeed/build/dist/jquery.jfeed.pack.js"
          "bower_components/moment/min/moment.min.js"
          "bower_components/underscore/underscore-min.js"
          "bower_components/uri.js/src/URI.min.js"
        ]
        dest: './build/js/libs'
        flatten: true
      js:
        expand: true
        cwd: 'src/js'
        src: '**/*.js'
        dest: 'build/js/'
        # rename:
  grunt.registerTask "prebuild", ->
    require "shelljs/global"
    mkdir "build/js"
    mkdir "build/js/libs"
    mkdir "build/js/modules"


  grunt.registerTask "init", ['prebuild']
  grunt.registerTask "default", ["jade",'']