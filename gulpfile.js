// For more information on how to configure a task runner, please visit:
// https://github.com/gulpjs/gulp

var gulp    = require('gulp');                  // Gulp, of course
var del     = require('del');                   // For deleting files
var connect = require('gulp-connect');          // Run a dev server

// Nuke the /dist folder
gulp.task('clean', function () {
    return del(['dist/**/*.*']);
});

// Copy static resources and assets to the /dist folder
gulp.task('copy', function () {
    return gulp.src(['src/**/*.*', 'src/*.*', 'package.json'])
        .pipe(gulp.dest('dist'));
});

// This task copies the npm installations of libraries that will be used in the front end.
// The module installations are copied to /dest/lib, where they can be included/referenced
// with a regular script tag in index.html
gulp.task('frontend', function() {
    var frontendPackages = ["foundation-sites", "jquery", "paper", "justmath"];

    var glob = "node_modules/+(" + frontendPackages.join("|") + ")/**/*";

    return gulp.src([glob])
        .pipe(gulp.dest('dist/lib'));
});

// Tell gulp to watch files for changes, and run certain tasks on change.
// When resources change, re-copy them; when scripts change, recompile them.
gulp.task('watch', function() {
    gulp.watch('src/**/*.*', gulp.task('copy'));
});

// Run a dev server
gulp.task('server', function() {
    return connect.server({
        root: 'dist'
    });
});

// Just compile the site into /dist
gulp.task('dist', gulp.series('clean', gulp.parallel('copy', 'frontend')));

// The regular top level task does the following in order:
gulp.task('default', gulp.series('dist', gulp.parallel('watch', 'server')));
