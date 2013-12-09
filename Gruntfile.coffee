module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt

  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  # misc
  watchDefaultOptions =
    spawn:false

  grunt.initConfig
    watch:
      jade:
        options: watchDefaultOptions
        files: "<%= jade.dev.src %>"
        tasks: ['jade:dev']
      less:
        options: watchDefaultOptions
        files: "<%= less.dev.src %>"
        tasks: ['less:dev']
      copyManifest:
        options: watchDefaultOptions
        files: "<%= copy.manifest.src %>"
        tasks: ['copy:manifest']
      copyJs:
        options: watchDefaultOptions
        files: "<%= copy.js.cwd %>/<%= copy.js.src %>"
        tasks: ['copy:js']
    jade:
      dev:
        expand:true
        flatten:true
        src: './src/jade/*.jade'
        dest: './build'
    less:
      dev:
        expand:true
        flatten: true
        src: 'src/less/*.less'
        dest: 'build/css'
    'compile-templates':
      dist:
        options:
          variable:'templates'
        src : './src/dot/**.dot'
        dest: './build/js/templates.js'
    copy:
      assets:
        expand: true
        cwd: 'assets'
        src: '**/*'
        dest: './build'
      manifest:
        expand: true
        flatten: true
        src: './src/manifest.json'
        dest: './build'
      libs:
        expand: true
        src: [
          "bower_components/requirejs/require.js"
          "bower_components/typeahead/typeahead.js.jquery.js"
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
        src: '**/*.js*'
        dest: 'build/js/'

  grunt.registerTask "prebuild", ->
    require "shelljs/global"
    mkdir "build/js"
    mkdir "build/js/libs"
    mkdir "build/js/modules"

  # change filepath on the fly to compile only the changed file
  grunt.event.on 'watch', (action, fpath, watchtarget) ->
    preconfiguredPath = grunt.config "watch.#{watchtarget}.path"
    if preconfiguredPath?
      actualtarget = preconfiguredPath
    else
      actualtarget = grunt.config("watch.#{watchtarget}.tasks")[0].replace(':','.') # Assuming only one task
    console.log action, fpath, watchtarget, actualtarget
    grunt.config "#{actualtarget}.src", fpath
    grunt.config "#{actualtarget}.cwd", '' # fpath contains full path

  grunt.registerTask "init", ['prebuild','copy:assets']
  grunt.registerTask "default", ["jade",'copy:manifest','copy:libs','copy:js','compile-templates']