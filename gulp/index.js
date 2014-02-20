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

var vendorPackages = [
    paths.src + '/' + paths.vendor + '/jquery-ui.js',
    paths.src + '/' + paths.vendor + '/jquery.ui.core.js',
    paths.src + '/' + paths.vendor + '/jquery.ui.widget.js',
    paths.src + '/' + paths.vendor + '/jquery.ui.mouse.js',
    paths.src + '/' + paths.vendor + '/jquery.ui.sortable.js',
    paths.src + '/' + paths.vendor + '/sortable.js',
    paths.src + '/' + paths.vendor + '/ga.js'
];

paths.origin = {
    jade: paths.src + '/jade/**/*.jade',
    less: paths.src + '/less/*.less',
    assets: paths.assets + '/**/*',
    manifest: paths.src + '/manifest.json',
    js: [paths.src + '/js/**/*.js', '!' + paths.src + '/js/vendor/**/*.js']
};

paths.dist = {
    less: paths.build + '/css',
    libs: paths.build + '/' + paths.vendor,
    minifiedScripts: 'scripts.min.js',
    minifiedLibs: 'vendors.min.js',
    js: paths.build + '/js'
};

exports.paths = paths;
exports.bowerPackages = bowerPackages;
exports.vendorPackages = vendorPackages;
