var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
// var gulpFilter = require('gulp-filter');
// var using = require('gulp-using');
var usemin = require('gulp-usemin');
var flatten = require('gulp-flatten');
var gulpOpen = require('gulp-open');
var cssmin = require('gulp-cssmin');
// var gulpif = require('gulp-if');
var semver = require('semver');
// var imagemin = require('gulp-imagemin');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var bump = require('gulp-bump');
var less = require('gulp-less');
var config = require('./gulp');
var pkg;

//get paths from config file
var paths = config.paths;
var bowerPackages = config.bowerPackages;
var vendorPackages = config.vendorPackages;
var libs = bowerPackages.concat(vendorPackages);

var getPackageJson = function () {
    var fs = require('fs');

    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg;
};

// var imageFilter = gulpFilter(['**/*.{png,jpeg,jpg,gif}']);

//to set production env use --production in command line
//production will minify & concat scripts/libs
var isProduction = Boolean(gutil.env.production);

//jade -> html
gulp.task('jade', function () {
    return gulp.src(paths.origin.jade)
        .pipe(flatten())
        .pipe(jade({
            pretty: !isProduction
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('usemin', ['jade', 'libs'], function () {
    if (!isProduction) {
        gulp.start('scripts');
        return;
    }
    gulp.src('build/newtab.html')
        .pipe(usemin({
            jsmin: uglify()
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('copyMaps', function () {
    gulp.src('src/bower_components/jquery/jquery.min.map')
        .pipe(gulp.dest('build/js/vendor/'));
});

//less -> css
gulp.task('less', function () {
    return gulp.src(paths.origin.less)
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest(paths.dist.less));
});

// zip build folder. buggy
gulp.task('zip', function () {
    var _pkg = getPackageJson();
    gulp.src('build/**/*')
        .pipe(zip('gamesTab.' + _pkg.version + '.zip'))
        .pipe(gulp.dest('builds'));
});

// copy & uglify js scripts
gulp.task('scripts', function () {
    return gulp.src(paths.origin.js)
        .pipe(gulp.dest(paths.dist.js));
});

//copy manifest
gulp.task('manifest', function () {
    return gulp.src(paths.origin.manifest)
        .pipe(gulp.dest(paths.build));
});

//clean build folder
gulp.task('clean', function () {
    return gulp.src(paths.build, {
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
gulp.task('assets', function () {
    //copy regular assets
    gulp.src(paths.origin.assets)
        .pipe(gulp.dest(paths.build));
});

//copy libs
gulp.task('libs', function () {
    return gulp.src(libs)
        .pipe(gulp.dest(paths.dist.libs));
});

//use alongside with chrome extension reload-extension
gulp.task('reloadExtension', function () {
    gulp.src('README.md')
        .pipe(gulpOpen('', {
            url: 'http://reload.extensions',
            app: 'chrome'
        }));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    var afterTasks = [];

    gulp.watch(libs, ['libs'].concat(afterTasks));
    gulp.watch(paths.origin.assets, ['assets'].concat(afterTasks));
    gulp.watch(paths.origin.js, ['scripts'].concat(afterTasks));
    gulp.watch(paths.src + '/less/**/*.less', ['less'].concat(afterTasks));
    gulp.watch(paths.origin.jade, ['jade'].concat(afterTasks));
});

//default task
gulp.task('default', ['clean'], function () {
    gulp.start('assets', 'copyMaps', 'jade', 'libs', 'less', 'manifest', 'usemin', 'watch');
});
