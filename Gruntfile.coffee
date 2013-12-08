module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt

  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  grunt.initConfig
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
      require:
        expand: true
        src: ['./bower_components/requirejs/require.js']
        dest: './build/js'
        flatten: true
      libs:
        expand: true
        src: [
          "bower_components/requirejs/require.js"
          "bower_components/jquery/jquery.min.js"
          "bower_components/jfeed/build/dist/jquery.jfeed.pack.js"
          "bower_components/moment/min/moment.min.js"
          "bower_components/underscore/underscore-min.js"
          "bower_components/uri.js/src/URI.min.js"
        ]
        dest: './build/js/libs'
        flatten: true
      modules:
        expand: true
        src: [
          "src/js/modules/Analytics.js"
          "src/js/modules/Chromesrcs.js"
          "src/js/modules/ClassicLauncher.js"
          "src/js/modules/Config.js"
          "src/js/modules/FileSystem.js"
          "src/js/modules/Geo.js"
          "src/js/modules/Launcher.js"
          "src/js/modules/News.js"
          "src/js/modules/Renderer.js"
          "src/js/modules/Screenshot.js"
          "src/js/modules/Search.js"
          "src/js/modules/Setup.js"
          "src/js/modules/Storage.js"
          "src/js/modules/Topsites.js"
          "src/js/modules/Weather.js"
        ]
        dest: './build/js/modules'
        flatten: true

  #    grunt.registerTask('teint',
  grunt.registerTask "prebuild", ->
    require "shelljs/global"
    mkdir "build/js"
    mkdir "build/js/libs"
    mkdir "build/js/modules"

  grunt.registerTask "init", ['prebuild']
  grunt.registerTask "default", ["jade:dev",'copy:main']
