var gulp = require('gulp');
var path = require('path');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var flatten = require('gulp-flatten');
var gulpOpen = require('gulp-open');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var bump = require('gulp-bump');
// var jsValidate = require('gulp-jsvalidate');
// var watch = require('gulp-watch');
var less = require('gulp-less');
var pkg = require('./package.json');

var paths = {
    build: 'build',
    assets: 'assets',
    vendor: 'js/vendor',
    bower: 'src/bower_components',
    less: 'less',
    css: 'css',
    jade: 'jade',
    src: 'src',
};

var bowerPackages = [
    'requirejs/require.js',
    'when/when.js',
    'jquery/jquery.min.js',
    'angular/angular.min.js',
    'jfeed/build/dist/jquery.jfeed.pack.js',
    'moment/min/moment.min.js',
    'underscore/underscore-min.js',
    'uri.js/src/URI.min.js',
    'async/lib/async.js'
];
var vendorPackages = [
    'jquery-ui.js',
    'jquery.ui.core.js',
    'jquery.ui.widget.js',
    'jquery.ui.mouse.js',
    'jquery.ui.sortable.js',
    'sortable.js'
];

var shouldReload = false;

//generate libs combined packages
var libs = bowerPackages.map(function (item) {
    return path.join(paths.bower, item);
}).concat(vendorPackages.map(function (item) {
    return path.join(paths.src, paths.vendor, item);
}));

paths.origin = {
    jade: path.join(paths.src, paths.jade, '**/*.jade'),
    less: path.join(paths.src, paths.less, '*.less'),
    assets: path.join(paths.assets, '**/*'),
    extraAssets: 'extra/lovedGames/assets/**/*',
    extraBuild: 'extra/lovedGames/build.json',
    manifest: path.join(paths.src, 'manifest.json'),
    js: [path.join(paths.src, 'js') + '/**/*.js', '!' + path.join(paths.src, 'js') + '/vendor/**/*.js']
};

paths.dist = {
    less: path.join(paths.build, paths.css),
    libs: path.join(paths.build, paths.vendor),
    extraBuild: path.join(paths.build, 'data'),
    js: path.join(paths.build, 'js')
};

gulp.task('default', ['clean'], function () {
    gulp.start('assets', 'jade', 'libs', 'less', 'manifest', 'scripts', 'reloadExtension', 'watch');
});

gulp.task('jade', function () {
    return gulp.src(paths.origin.jade)
        .pipe(flatten())
        .pipe(jade({
            pretty: false
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('less', function () {
    return gulp.src(paths.origin.less)
        .pipe(less())
        .pipe(gulp.dest(paths.dist.less));
});

gulp.task('zip', function () {
    gulp.src('build/**/*')
        .pipe(zip('gamesTab.' + pkg.version + '.zip'))
        .pipe(gulp.dest('builds'));
});

gulp.task('scripts', function () {
    return gulp.src(paths.origin.js)
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.js));
});

gulp.task('manifest', function () {
    return gulp.src(paths.origin.manifest)
        .pipe(gulp.dest(paths.build));
});

gulp.task('clean', function () {
    return gulp.src(paths.build, {
        read: false
    }).pipe(clean());
});

gulp.task('bump', function () {
    gulp.src(['./bower.json', './package.json', 'src/manifest.json'])
        .pipe(bump({
            type: 'path'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('assets', function () {
    //copy regular assets
    gulp.src(paths.origin.assets)
        .pipe(gulp.dest(paths.build));

    //copy extra assets
    gulp.src(paths.origin.extraAssets)
        .pipe(gulp.dest(paths.build));

    //extra build stuff
    gulp.src(paths.origin.extraBuild)
        .pipe(gulp.dest(paths.dist.extraBuild));
});

gulp.task('libs', function () {
    return gulp.src(libs)
        .pipe(gulp.dest(paths.dist.libs));
});

gulp.task('reloadExtension', function () {
    if (!shouldReload) {
        return;
    }
    gulp.src('README.md')
        .pipe(gulpOpen('', {
            url: 'http://reload.extensions',
            app: 'chrome'
        }));
});

gulp.task('watch', function () {
    gulp.watch(libs, ['libs', 'reloadExtension']);
    gulp.watch([paths.origin.assets, paths.origin.extraAssets, paths.origin.extraBuild], ['assets', 'reloadExtension']);
    gulp.watch(paths.origin.js, ['scripts', 'reloadExtension']);
    gulp.watch(paths.origin.less, ['less', 'reloadExtension']);
    gulp.watch(paths.origin.jade, ['jade', 'reloadExtension']);
});
