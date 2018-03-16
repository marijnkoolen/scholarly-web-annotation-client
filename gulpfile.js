var gulp = require('gulp'),
    pump = require('pump'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    webpack = require('gulp-webpack'),
    path = require('path'),
    connect = require('gulp-connect');

gulp.task('default', ['css', 'js']);

gulp.task('watch', ['css', 'js'], function() {
    gulp.watch('src/scss/**/*.scss', ['css']);
    gulp.watch('src/**/*.js*', ['js']);
});

gulp.task('serve', ['watch'], function() {
    connect.server({
        root: 'demo',
        livereload: true
    });
    gulp.watch('demo/**/*.*', ['serve:reload']);
});
gulp.task('serve:reload', function(cb) {
    pump([
        gulp.src('demo'),
        connect.reload()
    ], cb);
})

gulp.task('css', function(cb) {
    pump([
        gulp.src('src/scss/swac.scss'),
        sass({includePaths: 'node_modules/bootstrap/scss'}),
        gulp.dest('dist/'),
        gulp.dest('demo/')
    ], cb);
})

gulp.task('js', function(cb) {
    pump([
        gulp.src('src/main.jsx'),
        webpack({
            output: {
                filename: "swac.js",
        		libraryTarget: "var",
        		library: "ScholarlyWebAnnotator"
            },
            module: {
                loaders: [
        			{ test: path.join(__dirname, 'src'), loader: 'babel' },
                    { test: /\.css$/, loader: "style!css" }
                ]
            },
            resolve: {
                extensions: ['', '.js', '.jsx']
            }
        }),
        gulp.dest('dist/'),
        gulp.dest('demo/')
    ], cb);
});
