var gulp = require('gulp');
var plumber = require('gulp-plumber');

var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');

var gls = require('gulp-live-server');
var server;

var browserify = require('browserify');
var jstify = require('jstify');
var streamify = require('gulp-streamify');
var babelify = require('babelify');
var sourcemaps = require('gulp-sourcemaps')

var template = require('gulp-template');


gulp.task("js", function() {
        return gulp.src('./js/main.js', {read:false})
            .pipe(plumber())
            .pipe( browserify()
                .add('./js/main.js')
                .transform(babelify, {presets: ['es2015']})
                .transform('jstify', {engine:'lodash'})
                .bundle()
                .on('error', function(err){
                    console.log("Error in browserify");
                    console.log(err);
                    this.emit("end");
                })
            )
            .pipe(source('./js/main.js'))
            .pipe(rename("static/index.js"))
            .pipe(gulp.dest('./'))
            .pipe(streamify(uglify()))
            .pipe(rename("static/index.min.js"))  
            .pipe(gulp.dest('./'));
    });

gulp.task('dowatch', function() {
    gulp.watch(['./js/**/*.js'], ["js"]);
});

gulp.task('default', ['js', 'dowatch']);


