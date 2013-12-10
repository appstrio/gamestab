module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt
  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  initConfig =
    path:
      build: 'build'
    jade:
      compile:
        expand:true
        flatten:true
        src: 'src/jade/*.jade'
        dest: '<%= path.build %>'
    less:
      compile:
        expand:true
        flatten: true
        src: 'src/less/*.less'
        dest: '<%= path.build %>/css'
    'compile-templates':
      compile:
        options:
          variable:'templates'
        src : 'src/dot/**.dot'
        dest: '<%= path.build %>/js/templates.js'
    copy:
      assets:
        expand: true
        cwd: 'assets'
        src: '**/*'
        dest: '<%= path.build %>'
      manifest:
        expand: true
        flatten: true
        src: 'src/manifest.json'
        dest: '<%= path.build %>'
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
        dest: '<%= path.build %>/js/libs'
        flatten: true
      js:
        expand: true
        cwd: 'src/js'
        src: '**/*.js*'
        dest: '<%= path.build %>/js/'

  # Dynamic watchers building
  initConfig.watch = buildWatchers initConfig
  grunt.initConfig initConfig


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
  grunt.registerTask "default", ["watch"]
  grunt.registerTask "publish", []

log = -> console.log JSON.stringify arg, undefined, 2 for arg in arguments
String.prototype.capitalize = (string) -> this.charAt(0).toUpperCase() + this.slice(1)
buildWatchers = (initConfig) ->
  watch =
    options:
      spawn:false
      forever:true
  for own taskType, targets of initConfig
    for own targetName, targetContents of targets
      cwd = if targetContents.cwd? then targetContents.cwd else ''
      if Array.isArray targetContents.src
        files = "#{cwd}/#{src}" for src in targetContents.src
      else
        files = "#{cwd}/#{targetContents.src}"

      watchTargetName = if targets.length is 1 then targetName else "#{targetName}" + taskType.capitalize()

      watch[watchTargetName] =
        files: files
        tasks: ["#{taskType}:#{targetName}"]
  watch