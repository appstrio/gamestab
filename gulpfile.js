var gulp = require('gulp');

var paths = {
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  images: 'client/img/**/*'
};


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts', 'images', 'watch']);
