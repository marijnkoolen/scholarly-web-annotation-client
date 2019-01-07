var gulp = require('gulp'),
    pump = require('pump'),
    sass = require('gulp-sass'),
    webpack = require('webpack-stream'),
    connect = require('gulp-connect'),
    named = require('vinyl-named');

gulp.task('css', function(cb) {
    pump([
        gulp.src('src/scss/swac.scss'),
        sass({includePaths: 'node_modules/bootstrap/scss'}),
        gulp.dest('dist/'),
        gulp.dest('demo/build/'),
        gulp.dest('public/css/')
    ], cb);
})

gulp.task('js', function(cb) {
    pump([
        gulp.src('src/swac.jsx'),
        named(function(f) { return 'swac'; }),
        webpack({
            mode: "development",
            output: {
                filename: "[name].js",
                libraryTarget: "var",
                library: "ScholarlyWebAnnotator"
            },
            module: {
                rules: [{
                        exclude: /node_modules/,
                        test: /\.jsx?$/,
                        use: {
                            loader: 'babel-loader'
                        }
                    }]
            },
            resolve: {
                extensions: ['*', '.js', '.jsx']
            },
            optimization: {
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        commons: {
                            test: /node_modules/,
                            name: "vendor",
                            chunks: "initial",
                            minSize: 1
                        }
                    }
                }
            }
        }, require('webpack')),
        gulp.dest('dist/'),
        gulp.dest('public/js/'),
        gulp.dest('demo/build/')
    ], cb);
});

gulp.task('watch', gulp.series(['css', 'js']), function() {
    gulp.watch('src/scss/**/*.scss', ['css']);
    gulp.watch('src/**/*.js*', ['js']);
});

gulp.task('serve:reload', function(cb) {
    pump([
        gulp.src('demo'),
        connect.reload()
    ], cb);
})

gulp.task('serve', gulp.series(['watch']), function() {
    connect.server({
        root: 'demo',
        livereload: true
    });
    gulp.watch('demo/**/*.*', ['serve:reload']);
});

gulp.task('default', gulp.series(['css', 'js']));

