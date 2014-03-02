var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var path = require('path');
var inject = require('gulp-inject');
var openBrowser = require('open');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var flatten = require('gulp-flatten');
var cssmin = require('gulp-cssmin');
var semver = require('semver');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var bump = require('gulp-bump');
var less = require('gulp-less');
var config = require('./gulp');
var es = require('event-stream');
var pkg;

//get paths from config file
var paths = config.paths;
var bowerPackages = config.bowerPackages;
var vendorLibs = bowerPackages.concat(['src/js/vendor/*.js']);
//default target dir
var targetDir = 'build/';
var isProduction = false;

//params for gulp-inject
var vendorParams = {
    addRootSlash: false,
    starttag: '<!-- inject:vendors:{{ext}} -->',
    ignorePath: ['src', 'build', 'dist']
};

var scriptsParams = {
    addRootSlash: false,
    ignorePath: ['src', 'build', 'dist']
};

var getPackageJson = function () {
    var fs = require('fs');

    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg;
};

//jade -> html
gulp.task('jade', function () {
    return gulp.src('src/jade/**/*.jade')
        .pipe(flatten())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(targetDir));
});

gulp.task('copyMaps', function () {
    return gulp.src('src/bower_components/jquery/jquery.min.map')
        .pipe(gulp.dest('build/js/vendor/'));
});

//less -> css
gulp.task('less', function () {
    var cssTarget = path.join(targetDir, 'css');

    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest(cssTarget));
});

// zip build folder. buggy
gulp.task('zip', function () {
    var _pkg = getPackageJson();
    gulp.src('dist/**/*')
        .pipe(zip('gamesTab.' + _pkg.version + '.zip'))
        .pipe(gulp.dest('builds'));
});

//concat/uglify scripts & vendors. needs to run after jade task
gulp.task('scripts', ['jade'], function () {
    var vendorTarget = path.join(targetDir, 'js/vendor/');
    var clientScripts = path.join(targetDir, 'js/client/');
    var bgScripts = path.join(targetDir, 'js/background/');

    //get src for streams
    var vendorStream = gulp.src(vendorLibs);
    var clientStream = gulp.src(['src/js/client/**/*.js']);
    var bgStream = gulp.src(['src/js/background/**/*.js']);

    //handle production deploy
    if (isProduction) {
        vendorStream = vendorStream.pipe(concat('vendors.min.js'));
        clientStream = clientStream
            .pipe(concat('scripts.min.js'))
            .pipe(uglify());

        bgStream = bgStream
            .pipe(concat('backscripts.min.js'))
            .pipe(uglify());
    }

    //ouput scripts
    vendorStream.pipe(gulp.dest(vendorTarget));
    clientStream.pipe(gulp.dest(clientScripts));
    bgStream.pipe(gulp.dest(bgScripts));

    gulp.src(targetDir + '/background.html')
        .pipe(inject(bgStream, scriptsParams))
        .pipe(gulp.dest(targetDir));

    //inject scripts to jade/html
    return gulp.src(targetDir + '/newtab.html')
        .pipe(inject(vendorStream, vendorParams))
        .pipe(inject(clientStream, scriptsParams))
        .pipe(gulp.dest(targetDir));
});

gulp.task('cleanDev', function () {
    return gulp.src('build/', {
        read: false
    }).pipe(clean());
});

gulp.task('cleanProd', function () {
    return gulp.src('dist/', {
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
    return gulp.src(paths.origin.assets)
        .pipe(gulp.dest(targetDir));
});

//imagemin only in deploy
gulp.task('images', function () {
    return gulp.src('dist/**/*.{jpeg,png,gif,jpg}')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/'));
});

//use alongside with chrome extension reload-extension
gulp.task('reload', function () {
    openBrowser('http://reload.extensions');
});

//only in production
gulp.task('html', ['scripts'], function () {
    return gulp.src(targetDir + '*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(targetDir));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    gulp.watch(['./src/**/*', './assets/**/*'], ['build']);
});

gulp.task('build', ['cleanDev'], function () {
    targetDir = 'build/';
    return gulp.start('scripts', 'assets', 'copyMaps', 'less');
});

gulp.task('deploy', ['cleanProd'], function () {
    targetDir = 'dist/';
    isProduction = true;
    return gulp.start('scripts', 'assets', 'copyMaps', 'less', 'images', 'html');
});

//default task
gulp.task('default', function () {
    gulp.start('build', 'watch');
});
