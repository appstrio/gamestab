module.exports = (grunt) ->
    # show elapsed time at the end
    require("time-grunt") grunt
    # load all available grunt tasks
    require("load-grunt-tasks") grunt

    initConfig =
        # Core Properties
        # The name and version of the build that"s currently
        # being built. [Overwritten dynamicaly]
        build:
            name: "lovedgames"
            version: "1.0.0.0-omega"
        path:
            build: "build"
            src: "src"
            tmp: "tmp-build"
            builds: "builds/build-<%= build.name %>-<%= build.version %>"
        # Production Only Tasks
        clean:
            build: ["<%= path.build %>"]
        # // https://github.com/jrburke/r.js/blob/master/build/example.build.js
        requirejs:
            production:
                options:
                    name: "init"
                    baseUrl: "<%= path.src %>/js"
                    mainConfigFile: "<%= path.src %>/js/init.js" # path to require.config call
                    out: "<%= path.build %>/js/init.js"
                    findNestedDependencies: true
                    preserveLicenseComments: false # No fucking comments at the top of my build.
                    uglify:
                        defines:
                            DEBUG: ['name', 'false']

        # Core Tasks
        jade:
            compile:
                expand:true
                flatten:true
                cwd:  "src/jade/"
                dest: "<%= path.build %>"
                src : "*.jade"
                ext : ".html"
        less:
            compile:
                expand:true
                cwd: "src/less/"
                src: "*.less"
                dest: "<%= path.build %>/css/",
                ext: ".css"
        dot:
            compile:
                options:
                    requirejs: true
                    node: false
                    variable:"templates"
                src : "src/dot/**.dot"
                dest: "<%= path.build %>/js/templates.js"
            # options: flattenAndExpand
        concat:
            dev:
                src: ["<%= path.src %>/js/debugSettings.js","<%= path.src %>/js/init.js"]
                dest:"<%= path.build %>/js/init.js"
        copy:
            # Development
            setup_dev_env:
                files:
                    "<%= path.src %>/js/debugSettings.js": "<%= path.src %>/js/debugTemplate.js"
            # Build-specific files
            extraAssets:
                expand:true
                cwd: "extra/<%= build.name %>/assets"
                src: "**/*"
                dest: "<%= path.build %>"
            extraBuild:
                files:
                    "<%= path.build %>/data/build.json": "extra/<%= build.name %>/build.json"
            # Core files:
            requirejs:
                files:
                    "<%= path.build %>/js/libs/require.js"    : "bower_components/requirejs/require.js"
            libs:
                files:
                    "<%= path.build %>/js/libs/require.js"    : "bower_components/requirejs/require.js"
                    "<%= path.build %>/js/libs/when.js"       : "bower_components/when/when.js"
                    "<%= path.build %>/js/libs/jquery.js"     : "bower_components/jquery/jquery.min.js"
                    "<%= path.build %>/js/libs/jfeed.js"      : "bower_components/jfeed/build/dist/jquery.jfeed.pack.js"
                    "<%= path.build %>/js/libs/moment.js"     : "bower_components/moment/min/moment.min.js"
                    "<%= path.build %>/js/libs/underscore.js" : "bower_components/underscore/underscore-min.js"
                    "<%= path.build %>/js/libs/uri.js"        : "bower_components/uri.js/src/URI.min.js",
                    "<%= path.build %>/js/libs/typeahead.js"  : "<%= path.src %>/js/modified_libs/typeahead_modified.js"
            assets:
                expand: true
                cwd: "assets"
                src: "**/*"
                dest: "<%= path.build %>"
            js:
                flatten: true
                expand: true
                cwd: "<%= path.src %>/js"
                src: ["*.js","!debug*.js"]
                dest: "<%= path.build %>/js"
            modules:
                flatten: true
                expand: true
                cwd: "<%= path.src %>/js/modules"
                src: "*.js*"
                dest: "<%= path.build %>/js/modules"
            ui:
                flatten: true
                expand: true
                cwd: "<%= path.src %>/js/modules/UI"
                src: "*.js*"
                dest: "<%= path.build %>/js/modules/UI"

    baseJSCopyTasks = ["copy:js", "copy:modules", "copy:ui"]

    # Development Tasks

    grunt.registerTask "copy:development", baseJSCopyTasks.concat ["copy:extraAssets","concat:dev", "createManifestFromOverrides", "copy:extraBuild"]
    grunt.registerTask "start", ["setup_dev_env","build","watch"]
    grunt.registerTask "default", ["build","watch"]
    grunt.registerTask "setup_dev_env", ["clean","copy:setup_dev_env","copy:libs", "copy:assets"]
    grunt.registerTask "build", ["copy:development","jade","less","dot"]

    # Production Building Tasks
    grunt.registerTask "copy:baseJS", baseJSCopyTasks
    grunt.registerTask "copy:production", ["copy:extraAssets", "copy:assets", "createManifestFromOverrides", "copy:requirejs", "copy:extraBuild"]

    grunt.registerTask "package", ->
        if arguments[0]?
            for INDEX in [0..arguments.length - 1] by 2
                name = arguments[INDEX]
                version = arguments[INDEX + 1]

                grunt.config "build.name", name
                grunt.config "build.version", version

                grunt.task.run ["step1", "step2", "step3"]
        else
            builds = grunt.file.readJSON "builds.json"

            for build in builds
                grunt.config "build.name", build.name
                grunt.config "build.version", build.version

                grunt.task.run ["step1", "step2", "step3"]

    grunt.registerTask "copyJS", [
        "cd_tmp"
        "copy:baseJS"
        "copy:libs"
        "dot"
    ]
    grunt.registerTask "step1", "copyJS"
    grunt.registerTask "compileAllJS", [
        "cd_src"
        "cd_mkdir_build"
        "requirejs"
    ]
    grunt.registerTask "step2", "compileAllJS"
    grunt.registerTask "compileAssets", [
        "cd_mkdir_build"
        "copy:production"
        "jade"
        "less"
    ]
    grunt.registerTask "step3", "compileAssets"

    grunt.registerTask "cd_tmp", ->
        grunt.config "path.build", grunt.config "path.tmp"
        console.log "Changed directory path.build ->to->", grunt.config "path.tmp"

    grunt.registerTask "cd_src", ->
        grunt.config "path.src", grunt.config "path.tmp"
        console.log "Changed directory path.src ->to->", grunt.config "path.tmp"

    grunt.registerTask "cd_mkdir_build", ->
        grunt.config "path.build", grunt.config "path.builds"
        console.log "Changed directory path.build ->to->", grunt.config "path.builds"

    # Manifest mangling

    grunt.registerTask "createManifestFromOverrides", "Update manifest with Overriding build values", ->
      fs = require "fs"

      buildName = grunt.config "build.name"
      srcPath = grunt.config "path.src"
      buildPath = grunt.config "path.build"

      overridingManifestPath = "./extra/" + buildName  + "/manifest.json";
      oldManifestPath = "./#{srcPath}/manifest.json"
      buildManifsetPath = "./#{buildPath}/manifest.json"
      console.log overridingManifestPath,oldManifestPath

      defaultManifest = require oldManifestPath
      OverridingManifest = require  overridingManifestPath

      for key, value of OverridingManifest
        defaultManifest[key] = value

      fs.writeFileSync buildManifsetPath, JSON.stringify defaultManifest
      console.log "Created [#{buildManifsetPath}] from override-manifest."


    # Dynamic watchers building
    watchSingleExclude = ["dot","less","concat"]
    dynamicConstructedWatches = buildWatchers initConfig, ["path","copy:libs","copy:assets"]
    initConfig.watch = dynamicConstructedWatches
    initConfig.watch.lessCompile =
        files: ["src/less/**/*.less"]
        tasks: ["less:compile"]
    initConfig.watch.concatDev =
        files: ["<%= path.src %>/js/init.js","<%= path.src %>/js/debugSettings.js"]
        tasks: ["concat:dev"]
    initConfig.watch.copyJs =
        files: ["<%= path.src %>/js/*.js","<%= path.src %>/js/!debug*.js","!<%= path.src %>/js/init.js"]
        tasks: ["copy:js"]
    grunt.initConfig initConfig
    grunt.registerTask "printWatches", -> log dynamicConstructedWatches
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
