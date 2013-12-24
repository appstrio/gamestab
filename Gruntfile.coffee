module.exports = (grunt) ->
  # show elapsed time at the end
  require("time-grunt") grunt
  # load all available grunt tasks
  require("load-grunt-tasks") grunt

  initConfig =
    # Core Properties
    path:
      build: "build"
    # Production Only Tasks
    build: grunt.file.readJSON "src/js/data/build.json"
    clean:
      build: ["<%= path.build %>"]
    requirejs:
      production:
        options:
          baseUrl: "./src/js"
          mainConfigFile: "./src/js/init.js" # path to require.config call
          out: "./<%= path.build %>/js/init.js"
    # Core Tasks
    jade:
      compile:
        expand:true
        flatten:true
        cwd:  "./src/jade/"
        dest: "<%= path.build %>"
        src : "*.jade"
        ext : ".html"
    less:
      compile:
        expand:true
        flatten: true
        src: "src/less/*.less"
        dest: "<%= path.build %>/css/",
        ext: ".css"
    "compile-templates":
      compile:
        options:
          variable:"templates"
        src : "src/dot/**.dot"
        dest: "<%= path.build %>/js/templates.js"
      # options: flattenAndExpand
    concat:
      dev:
        src: ["src/js/debugSettings.js","src/js/init.js"]
        dest:"<%= path.build %>/js/init.js"
    copy:
      # Development
      setup_dev_env:
        "src/js/debugSettings.js": "src/js/debugTemplate.js"
      # Build-specific files
      extra:
        expand:true
        cwd: "extra/<%= build.buildName %>"
        src: "**"
        dest: "<%= path.build %>"
      dev:
        files:
          "<%= path.build %>/manifest.json": "src/manifest.json"
      prod:
        files:
          "<%= path.build %>/manifest.json": "src/manifest.json"
          "<%= path.build %>/js/init.js": "src/js/init.js"
      # Core files:
      libs:
        files:
          "<%= path.build %>/js/libs/require.js"    : "bower_components/requirejs/require.js"
          "<%= path.build %>/js/libs/when.js"       : "bower_components/when/when.js"
          "<%= path.build %>/js/libs/jquery.js"     : "bower_components/jquery/jquery.min.js"
          "<%= path.build %>/js/libs/jfeed.js"      : "bower_components/jfeed/build/dist/jquery.jfeed.pack.js"
          "<%= path.build %>/js/libs/moment.js"     : "bower_components/moment/min/moment.min.js"
          "<%= path.build %>/js/libs/underscore.js" : "bower_components/underscore/underscore-min.js"
          "<%= path.build %>/js/libs/uri.js"        : "bower_components/uri.js/src/URI.min.js",
          "<%= path.build %>/js/libs/typeahead.js"  : "src/js/modified_libs/typeahead_modified.js"
          "<%= path.build %>/css/bootstrap.css"     : "bower_components/bootstrap/dist/css/bootstrap.css"
      assets:
        expand: true
        cwd: "assets"
        src: "**/*"
        dest: "<%= path.build %>"
      js:
        flatten: true
        expand: true
        cwd: "src/js"
        src: ["*.js","!init.js","!debug*.js"]
        dest: "<%= path.build %>/js"
      modules:
        flatten: true
        expand: true
        cwd: "src/js/modules"
        src: "*.js*"
        dest: "<%= path.build %>/js/modules"
      data:
        flatten: true
        expand: true
        cwd: "src/js/data"
        src: "*.js*"
        dest: "<%= path.build %>/js/data"

  # Dynamic watchers building
  watchSingleExclude = ["compile-templates","less"]
  initConfig.watch   = buildWatchers initConfig, ["path","copy:libs","copy:assets"]
  initConfig.watch.lessCompile =
    files: ["src/less/**/*.less"]
    tasks: ["less:compile"]
  grunt.initConfig initConfig

  # change filepath on the fly to compile only the changed file NOTE only works with flatten:true for some reason, has something todo with cwd
  grunt.event.on "watch", (action, fpath, watchtarget) ->
    preconfiguredPath = grunt.config "watch.#{watchtarget}.path"
    if preconfiguredPath?
      actualtarget = preconfiguredPath
    else
      actualtarget = grunt.config("watch.#{watchtarget}.tasks")[0].replace(":",".") # Assuming only one task
    # log actualtarget, watchSingleExclude, watchtarget
    if actualtarget not in watchSingleExclude and actualtarget.split(".")[0] not in watchSingleExclude
      grunt.config "#{actualtarget}.src", fpath
      grunt.config "#{actualtarget}.cwd", "" # fpath contains full path

  baseCopyTasks = ["copy:extra", "copy:libs", "copy:assets", "copy:data", "copy:js", "copy:modules"]
  grunt.registerTask "copy:production", baseCopyTasks.concat ["copy:prod"]
  grunt.registerTask "copy:development", baseCopyTasks.concat ["concat:dev", "copy:dev"]

  grunt.registerTask "build", ["clean","copy:development","jade","less","compile-templates"]
  grunt.registerTask "package", ["prepackage","requirejs","copy:production","jade","less","compile-templates"]

  grunt.registerTask "testnow", ["prepackage","requirejs"]
  grunt.registerTask "setup_dev_env", ["copy:setup_dev_env"]
  grunt.registerTask "default", ["setup_dev_env","build","watch"]
  grunt.registerTask "prepackage", ->
    buildName = grunt.config("build").buildName
    grunt.config "path.build", "tmp-build-#{buildName}"

log = -> console.log JSON.stringify arg, undefined, 2 for arg in arguments
String.prototype.capitalize = (string) -> this.charAt(0).toUpperCase() + this.slice(1)
buildWatchers = (initConfig, excludeArray) ->
  excludeArray = if typeof excludeArray is "string" then [excludeArray] else excludeArray
  watch =
    options:
      spawn:false
      forever:false
  for own taskType, targets of initConfig
    for own targetName, targetContents of targets
      if "#{taskType}" not in excludeArray and "#{taskType}:#{targetName}" not in excludeArray
        cwd = if targetContents.cwd? then targetContents.cwd else "."
        if Array.isArray targetContents.src
          files = "#{cwd}/#{src}" for src in targetContents.src
        else
          files = "#{cwd}/#{targetContents.src}"

        watchTargetName = if targets.length is 1 then targetName else "#{targetName}" + taskType.capitalize()

        watch[watchTargetName] =
          files: files
          tasks: ["#{taskType}:#{targetName}"]
  watch
