var bump = require('gulp-bump');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var filesize = require('gulp-size');
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

//this is used instead of require to prevent caching in watch (require caches)
var getPackageJson = function () {
    var fs = require('fs');

    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg;
};

var appName = 'Gamestab';
var redirectUrl = 'http://my.gamestab.me';

//replace interpolation signs in code - used for white-labels
var replaceStream = function () {
    return replace(/(#{appName})|(#{redirectUrl})/g, function (item) {
        if (item === '#{appName}') {
            return appName;
        }
        if (item === '#{redirectUrl}') {
            return redirectUrl;
        }
    });
};

var bowerPackages = [
    'src/bower_components/jquery/dist/jquery.min.js',
    'src/bower_components/angular/angular.min.js',
    'src/bower_components/angular-black-contrast/dist/angular-black-contrast.min.js',
    'src/bower_components/angular-fallback-src/fallback-src.js',
    'src/bower_components/lodash/dist/lodash.min.js',
    'src/bower_components/ngprogress/build/ngProgress.min.js'
];

//default target dir
var targetDir = 'build/';
var isProduction = false; //is set using gulp deploy

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

//jade -> html
gulp.task('jade', function () {
    return gulp.src('src/jade/**/*.jade')
        .pipe(replaceStream())
        .pipe(flatten())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(targetDir));
});

gulp.task('copy', function () {
    gulp.src('src/js/*.js')
        .pipe(replaceStream())
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
gulp.task('zip', ['scripts', 'assets', 'copy', 'less', 'images', 'html'], function () {
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
            stream: gulp.src(bowerPackages.concat(['src/js/vendor/*.js'])).pipe(replaceStream())
        },
        client: {
            target: path.join(targetDir, 'js/client/'),
            stream: gulp.src(['src/js/client/**/*.js']).pipe(replaceStream())
        },
        common: {
            target: path.join(targetDir, 'js/common/'),
            stream: gulp.src(['src/js/common/**/*.js']).pipe(replaceStream())
        },
        bg: {
            target: path.join(targetDir, 'js/background/'),
            stream: gulp.src(['src/js/background/**/*.js']).pipe(replaceStream())
        }
    };

    var uglifyConcat = function (stream, targetName) {
        return stream
            .pipe(concat(targetName))
            .pipe(uglify())
            .pipe(filesize({
                showFiles: true
            }));
    };

    //handle production deploy
    if (isProduction) {
        streams.vendor.stream = streams.vendor.stream
            .pipe(concat('vendors.min.js'))
            .pipe(filesize({
                showFiles: true
            }));

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
    return gulp.src(['assets/**/*', 'src/manifest.json'])
        .pipe(gulp.dest(targetDir));
});

//optimize images - used only in deploy
gulp.task('images', ['assets'], function () {
    return gulp.src(targetDir + '**/*.{jpeg,png,gif,jpg}')
        .pipe(imagemin())
        .pipe(gulp.dest(targetDir));
});

//minify html - only in deploy
gulp.task('html', ['jade', 'scripts'], function () {
    return gulp.src(targetDir + '*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(targetDir));
});

//all tasks are watched
gulp.task('watch', function () {
    return gulp.watch(['src/**/*.{js,html,jade,css,less,json}'], ['build']);
});

gulp.task('build', ['clean'], function () {
    return gulp.start('scripts', 'assets', 'copy', 'less');
});

gulp.task('deploy', ['clean'], function () {
    isProduction = true;
    return gulp.start('scripts', 'assets', 'copy', 'less', 'images', 'html', 'zip');
});

//default task
gulp.task('default', function () {
    gulp.start('build', 'watch');
});
