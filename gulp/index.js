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
    paths.bower + '/jquery/jquery.min.js',
    paths.bower + '/angular/angular.min.js',
    paths.bower + '/lodash/dist/lodash.min.js',
    paths.bower + '/angular-fallback-src/fallback-src.js',
    paths.bower + '/ngprogress/build/ngProgress.min.js',
    paths.bower + '/async/lib/async.js'
];

paths.origin = {
    jade: paths.src + '/jade/**/*.jade',
    less: paths.src + '/less/*.less',
    assets: paths.assets + '/**/*',
    manifest: paths.src + '/manifest.json',
    otherJs: paths.src + '/js/*.js'
};

paths.dist = {
    less: paths.build + '/css',
    libs: paths.build + '/' + paths.vendor,
    minifiedScripts: 'scripts.min.js',
    minifiedLibs: 'vendors.min.js',
    clientJs: paths.build + '/js/client/',
    backgroundJs: paths.build + '/js/background/',
    otherJs: paths.build + '/js/'
};

exports.paths = paths;
exports.bowerPackages = bowerPackages;
