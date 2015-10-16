var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

gulp.task('js', function () {
  gulp.src(['public/src/**/module.js', 'public/src/**/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('public/app.js'))
      .pipe(ngAnnotate())
      // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
})

gulp.task('watch', ['js'], function () {
  gulp.watch('public/src/**/*.js', ['js']);
});

gulp.task('default', ['watch']);