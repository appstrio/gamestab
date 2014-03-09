var bump = require('gulp-bump');
var rev = require('gulp-rev');
var filesize = require('gulp-filesize');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var flatten = require('gulp-flatten');
var gulp = require('gulp');
var gutil = require('gulp-util');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var inject = require('gulp-inject');
var jade = require('gulp-jade');
var less = require('gulp-less');
var openBrowser = require('open');
var path = require('path');
var semver = require('semver');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var es = require('event-stream');
var pkg;

var assetPath = ['assets/**/*', 'src/manifest.json'];

var bowerPackages = [
    'src/bower_components/jquery/dist/jquery.min.js',
    'src/bower_components/angular/angular.min.js',
    'src/bower_components/lodash/dist/lodash.min.js',
    'src/bower_components/angular-fallback-src/fallback-src.js',
    'src/bower_components/ngprogress/build/ngProgress.min.js',
];

var vendorLibs = bowerPackages.concat(['src/js/vendor/*.js']);
//default target dir
var targetDir = 'build/';
var isProduction = false;

//params for gulp-inject
var vendorParams = {
    addRootSlash: false,
    starttag: '<!-- inject:vendors:{{ext}} -->',
    ignorePath: ['src', 'build']
};

var scriptsParams = {
    addRootSlash: false,
    ignorePath: ['src', 'build']
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

gulp.task('copy', function () {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest(targetDir + 'js/'));

    return gulp.src('src/bower_components/jquery/dist/jquery.min.map')
        .pipe(gulp.dest(targetDir + 'js/vendor/'));
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
    gulp.src(targetDir + '**/*')
        .pipe(zip('gamesTab.' + _pkg.version + '.zip'))
        .pipe(gulp.dest('builds'));
});

//concat/uglify scripts & vendors. needs to run after jade task
gulp.task('scripts', ['jade'], function () {

    var streams = {
        vendor: {
            target: path.join(targetDir, 'js/vendor/'),
            stream: gulp.src(vendorLibs)
        },
        client: {
            target: path.join(targetDir, 'js/client/'),
            stream: gulp.src(['src/js/client/**/*.js'])
        },
        common: {
            target: path.join(targetDir, 'js/common/'),
            stream: gulp.src(['src/js/common/**/*.js'])
        },
        bg: {
            target: path.join(targetDir, 'js/background/'),
            stream: gulp.src(['src/js/background/**/*.js'])
        }
    };

    var uglifyConcat = function (stream, targetName) {
        return stream
            .pipe(concat(targetName))
            .pipe(uglify())
            .pipe(filesize());
    };

    //handle production deploy
    if (isProduction) {
        streams.vendor.stream = streams.vendor.stream
        // .pipe(concat('vendors.min.js'))
        // .pipe(uglify())
        .pipe(filesize());

        streams.client.stream = uglifyConcat(streams.client.stream, 'scripts.min.js');
        streams.bg.stream = uglifyConcat(streams.bg.stream, 'backscripts.min.js');
        streams.common.stream = uglifyConcat(streams.common.stream, 'common.min.js');
    }

    for (var i in streams) {
        if (streams.hasOwnProperty(i)) {
            var stream = streams[i];
            //generate hash for each file
            stream.stream = stream.stream.pipe(rev());
            //output file to build/
            stream.stream.pipe(gulp.dest(stream.target));
        }
    }

    //inject to background placeholders
    gulp.src(targetDir + '/background.html')
        .pipe(inject(streams.vendor.stream, vendorParams))
        .pipe(inject(es.merge(streams.bg.stream, streams.common.stream), scriptsParams))
        .pipe(gulp.dest(targetDir));

    //inject to newtab placeholders
    return gulp.src(targetDir + '/newtab.html')
        .pipe(inject(streams.vendor.stream, vendorParams))
        .pipe(inject(es.merge(streams.client.stream, streams.common.stream), scriptsParams))
        .pipe(gulp.dest(targetDir));
});

gulp.task('clean', function () {
    return gulp.src(targetDir, {
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
    return gulp.src('./src/manifest.json')
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./src'));
});

//handle assets
gulp.task('assets', function () {
    //copy regular assets
    return gulp.src(assetPath)
        .pipe(gulp.dest(targetDir));
});

//imagemin only in deploy
gulp.task('images', ['assets'], function () {
    return gulp.src(targetDir + '**/*.{jpeg,png,gif,jpg}')
        .pipe(imagemin())
        .pipe(gulp.dest(targetDir));
});

//use alongside with chrome extension reload-extension
gulp.task('reload', function () {
    openBrowser('http://reload.extensions');
});

//only in production
gulp.task('html', ['jade', 'scripts'], function () {
    return gulp.src(targetDir + '*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(targetDir));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    return gulp.watch(['src/**/*.{js,html,jade,css,less,json}'], ['build']);
});

gulp.task('build', ['clean'], function () {
    return gulp.start('scripts', 'assets', 'copy', 'less');
});

gulp.task('deploy', ['clean'], function () {
    isProduction = true;
    return gulp.start('scripts', 'assets', 'copy', 'less', 'images', 'html');
});

//default task
gulp.task('default', function () {
    gulp.start('build', 'watch');
});
