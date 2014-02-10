var gulp = require('gulp');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var flatten = require('gulp-flatten');
var less = require('gulp-less');
var watch = require('gulp-watch');

var paths = {
    build: 'build/',
    assets: 'assets/',
    vendor: 'js/vendor/',
    less: 'less/',
    css: 'css/',
    jade: 'jade/',
    src: 'src/',
    bower: 'src/bower_components/'
};

var libs = [
    paths.bower + 'requirejs/require.js',
    paths.bower + 'when/when.js',
    paths.bower + 'jquery/jquery.min.js',
    paths.bower + 'angular/angular.min.js',
    paths.bower + 'jfeed/build/dist/jquery.jfeed.pack.js',
    paths.bower + 'moment/min/moment.min.js',
    paths.bower + 'underscore/underscore-min.js',
    paths.bower + 'uri.js/src/URI.min.js',
    paths.bower + 'async/lib/async.js',
    paths.src + paths.vendor + 'jquery-ui/jquery-ui.js',
    paths.src + paths.vendor + 'jquery.ui.core.js',
    paths.src + paths.vendor + 'jquery.ui.widget.js',
    paths.src + paths.vendor + 'jquery.ui.mouse.js',
    paths.src + paths.vendor + 'jquery.ui.sortable.js',
    paths.src + paths.vendor + 'sortable.js'
];

gulp.task('default', ['clean'], function () {
    gulp.start('assets', 'jade', 'libs', 'less', 'watch');
});

gulp.task('jade', function () {
    gulp.src(paths.src + paths.jade + '**/*.jade')
        .pipe(flatten())
        .pipe(jade({
            pretty: false
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('less', function () {
    gulp.src(paths.src + paths.less + '*.less')
        .pipe(less())
        .pipe(gulp.dest(paths.build + paths.css));
});

gulp.task('clean', function () {
    gulp.src(paths.build, {
        read: false
    }).pipe(clean());
});

gulp.task('assets', function () {
    gulp.src(paths.assets + '**/*')
        .pipe(gulp.dest(paths.build));
});

gulp.task('libs', function () {
    gulp.src(libs)
        .pipe(gulp.dest(paths.build + paths.vendor));
});

gulp.task('watch', function () {
    gulp.watch(libs, ['libs']);
    gulp.watch(paths.assets + '**/*', ['assets']);
    gulp.watch(paths.src + paths.less + '*.less', ['less']);
    gulp.watch(paths.src + paths.jade + '**/*.jade', ['jade']);
});
