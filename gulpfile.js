var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var filter = require('gulp-filter');
// var using = require('gulp-using');
var usemin = require('gulp-usemin');
var inject = require('gulp-inject');
var flatten = require('gulp-flatten');
var gulpOpen = require('gulp-open');
var cssmin = require('gulp-cssmin');
// var gulpif = require('gulp-if');
var semver = require('semver');
// var imagemin = require('gulp-imagemin');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var bump = require('gulp-bump');
var less = require('gulp-less');
var config = require('./gulp');
var pkg;

//get paths from config file
var paths = config.paths;
var bowerPackages = config.bowerPackages;

var getPackageJson = function () {
    var fs = require('fs');

    //use read file inste;w
    //jd of require because require caches the results
    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg;
};

// var imageFilter = gulpFilter(['**/*.{png,jpeg,jpg,gif}']);
var newtabFilter = filter(['newtab.jade']);
var backgroundFilter = filter(['background.jade']);

var injectToNewTab = function () {
    return inject(gulp.src(['src/js/client/**/*.js'], {
        read: false
    }), {
        ignorePath: 'src'
    });
};

var injectToBackground = function () {
    return inject(gulp.src(['src/js/background/**/*.js'], {
        read: false
    }), {
        ignorePath: 'src'
    });
};

//inject script tags to selected jade files, and then convert all jade files to html
gulp.task('jade', function () {
    gulp.src('src/jade/**/*.jade')
        .pipe(flatten())
        .pipe(newtabFilter)
        .pipe(injectToNewTab())
        .pipe(newtabFilter.restore())
        .pipe(backgroundFilter)
        .pipe(injectToBackground())
        .pipe(backgroundFilter.restore())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('build/'));
});

// html -> minify scripts
gulp.task('usemin', ['jade', 'libs'], function () {
    return gulp.src('build/newtab.html')
        .pipe(usemin({
            jsmin: uglify()
        }))
        .pipe(gulp.dest('build/'));
});

//all scripts no libs
gulp.task('scripts', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('build/js/'));
});

//less -> css
gulp.task('less', function () {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest('build/css/'));
});

// build folder -> *boom*
gulp.task('clean', function () {
    return gulp.src(['build/', 'dist/'], {
        read: false
    }).pipe(clean());
});

//bump versions on package/bower/manifest
gulp.task('bump', function () {
    //reget package
    var _pkg = getPackageJson();
    //increment version
    var newVer = semver.inc(_pkg.version, 'patch');
    //log action
    gutil.log('Bumping version', gutil.colors.cyan(_pkg.version), '=>', gutil.colors.blue(newVer));
    //increment bower & package version separately since they are in different places
    gulp.src(['./bower.json', './package.json'])
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));

    //increment manifest version
    gulp.src('./src/manifest.json')
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./src'));
});

//handle assets
gulp.task('copyAssets', function () {
    gulp.src(bowerPackages)
        .pipe(gulp.dest('build/js/vendor'));

    gulp.src(paths.origin.manifest)
        .pipe(gulp.dest('build/'));

    gulp.src('src/bower_components/jquery/jquery.min.map')
        .pipe(gulp.dest('build/js/vendor/'));

    //copy regular assets
    return gulp.src(paths.origin.assets)
        .pipe(gulp.dest('build/'));
});

//use alongside with chrome extension reload-extension
gulp.task('reloadExtension', function () {
    return gulp.src('README.md')
        .pipe(gulpOpen('', {
            url: 'http://reload.extensions',
            app: 'chrome'
        }));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    gulp.watch(['src/js/**/*'], ['scripts', 'jade']);
    gulp.watch(['assets/**/*'], ['assets']);
    gulp.watch(['src/less/**/*'], ['less']);
    gulp.watch(['src/jade/**/*'], ['jade']);
});

gulp.task('deploy', ['build'], function () {

});

//default task
gulp.task('build', ['clean'], function () {
    gulp.start('copyAssets', 'scripts', 'less', 'jade', 'watch');
});
