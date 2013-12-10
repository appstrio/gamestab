module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt
  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  flattenAndExpand =
    flatten: true
    expand: true

  initConfig =
    path:
      build: 'build'
    jade:
      dev:
        files:[
          expand:true
          flatten:true
          src: 'src/jade/*.jade'
          dest: '<%= path.build %>'
        ]
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
        options: flattenAndExpand
      assets:
        cwd: 'assets'
        src: '**/*'
        dest: '<%= path.build %>'
      manifest:
        options: flattenAndExpand
        src: 'src/manifest.json'
        dest: '<%= path.build %>'
      libs:
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
      js:
        options: flattenAndExpand
        cwd: 'src/js'
        src: '*.js*'
        dest: '<%= path.build %>/js'
      modules:
        options: flattenAndExpand
        cwd: 'src/js/modules'
        src: '*.js*'
        dest: '<%= path.build %>/js/modules'

  # Dynamic watchers building
  initConfig.watch = buildWatchers initConfig, 'copy:assets'
  grunt.initConfig initConfig

  grunt.registerTask "preinit", ->
    require "shelljs/global"
    mkdir '-p', "build/js"
    mkdir "build/js/libs"
    mkdir "build/js/modules"

  # change filepath on the fly to compile only the changed file NOTE only works with flatten:true for some reason, has something todo with cwd
  grunt.event.on 'watch', (action, fpath, watchtarget) ->
    preconfiguredPath = grunt.config "watch.#{watchtarget}.path"
    if preconfiguredPath?
      actualtarget = preconfiguredPath
    else
      actualtarget = grunt.config("watch.#{watchtarget}.tasks")[0].replace(':','.') # Assuming only one task
    grunt.config "#{actualtarget}.src", fpath
    grunt.config "#{actualtarget}.cwd", '' # fpath contains full path

  grunt.registerTask "init", ['preinit','copy','jade']
  grunt.registerTask "default", ["watch"]
  grunt.registerTask "publish", []

log = -> console.log JSON.stringify arg, undefined, 2 for arg in arguments
String.prototype.capitalize = (string) -> this.charAt(0).toUpperCase() + this.slice(1)
buildWatchers = (initConfig, excludeArray) ->
  excludeArray = if typeof excludeArray is 'string' then [excludeArray]
  watch =
    options:
      spawn:false
      forever:true
  for own taskType, targets of initConfig
    for own targetName, targetContents of targets
      if "#{taskType}:#{targetName}" not in excludeArray
        cwd = if targetContents.cwd? then targetContents.cwd else '.'
        if Array.isArray targetContents.src
          files = "#{cwd}/#{src}" for src in targetContents.src
        else
          files = "#{cwd}/#{targetContents.src}"

        watchTargetName = if targets.length is 1 then targetName else "#{targetName}" + taskType.capitalize()

        watch[watchTargetName] =
          files: files
          tasks: ["#{taskType}:#{targetName}"]
  watch
