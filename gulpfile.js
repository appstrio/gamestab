var gulp = require('gulp');
var clean = require('clean');


var paths = {
    build: 'build',
    src: 'src',
    bower: 'src/bower_components'
};

gulp.task('clean', function () {
    gulp.src(paths.build, {
        read: false
    }).pipe(clean());
});
