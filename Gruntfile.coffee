module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt

  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  # configurable paths
  path =
    app: "app"
    build: "app"
    package: "package"
    pkgs: "pkgs"
  path.js      = "#{path.app}/js"
  path.libs    = "#{path.js}/libs"
  path.modules = "#{path.js}/modules"

  includes = {
    modules: [
      "#{path.modules}/Analytics.js"
      "#{path.modules}/ChromeApps.js"
      "#{path.modules}/ClassicLauncher.js"
      "#{path.modules}/Config.js"
      "#{path.modules}/FileSystem.js"
      "#{path.modules}/Geo.js"
      "#{path.modules}/Launcher.js"
      "#{path.modules}/News.js"
      "#{path.modules}/Renderer.js"
      "#{path.modules}/Screenshot.js"
      "#{path.modules}/Search.js"
      "#{path.modules}/Setup.js"
      "#{path.modules}/Storage.js"
      "#{path.modules}/Topsites.js"
      "#{path.modules}/Weather.js"
    ]
    libs: [
      "#{path.libs}/common.js"
      "#{path.libs}/jFeed.js"
      "#{path.libs}/jquery.2.0.1.min.js"
      "#{path.libs}/moment.min.js"
      "#{path.libs}/underscore.min.js"
      "#{path.libs}/uri.min.js"
    ]
  }

  files =
    jade:[
        dest: "#{path.build}/newtab.html"
        src : "#{path.app}/newtab.jade"
      ,
        dest: "#{path.build}/options.html"
        src : "#{path.app}/options.jade"
      ,
        dest: "#{path.build}/background.html"
        src : "#{path.app}/background.jade"
    ]
    uglify:
      includes:
        "app/js/parts.min/libs.min.js": includes.libs
        "app/js/parts.min/modules.min.js": includes.modules
      dev: [
        dest: "#{path.app}/js/build/background.min.js"
        src : [
          "#{path.js}/parts.min/libs.min.js"
          "#{path.js}/modules/modules.min.js"
          "#{path.js}/env.js"
          "#{path.js}/background.js"
        ]
      ,
        dest: "#{path.app}/js/build/newtab.min.js"
        src : [
          "#{path.js}/parts.min/modules.min.js"
          "#{path.js}/env.js"
          "#{path.js}/first.js"
          "#{path.js}/newtab.js"
        ]
      ]
#  console.log('\n** Gruntfile.coffee [exports] in line #: 68 ** ' + JSON.stringify(files.uglify));﻿

  grunt.initConfig
    gruntTestCmd: 'uglify:dev'
    watch:
      grunt:
        options:
          nospawn: true
          interrupt: true
        files: 'Gruntfile.coffee'
        tasks: ['<%= gruntTestCmd %>']
    jshint:
      options: {}
      files: []
    jade:
      dev:
        options:
          pretty: true
        files: files.jade
    uglify:
      options: {}
      includes:
        files: files.uglify.includes
      dev:
        files: files.uglify.dev

  #    grunt.registerTask('test',

  #        ''
  #    ]);
  #    grunt.registerTask('build', [
  #        ''
  #    ]);

  # 'jshint',
  grunt.registerTask "default", ["jade:dev"]

# 'test'
# 'build'