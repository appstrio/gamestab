var paths = {};
var bowerPackages = [
    'src/bower_components/jquery/jquery.min.js',
    'src/bower_components/angular/angular.min.js',
    'src/bower_components/lodash/dist/lodash.min.js',
    'src/bower_components/angular-fallback-src/fallback-src.js',
    'src/bower_components/ngprogress/build/ngProgress.min.js',
    'src/bower_components/async/lib/async.js'
];

paths.origin = {
    jade: paths.src + '/jade/**/*.jade',
    less: paths.src + '/less/*.less',
    assets: ['assets/**/*', 'src/manifest.json'],
};

exports.paths = paths;
exports.bowerPackages = bowerPackages;
