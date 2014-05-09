var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-ruby-sass');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var gulpFilter = require('gulp-filter');

var paths = {
  styles: 'styles/app.sass',
  scripts: 'scripts/**/*.js',
  templates: 'templates/**/*.jade'
}

gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(sass())
    .pipe(gulp.dest('../css'));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('../js'));
});

gulp.task('templates', function() {
  indexFilter = gulpFilter('index.jade');
  supportFilter = gulpFilter('!index.jade');

  return gulp.src(paths.templates)
    // Compile all templates except index to ../templates.
    .pipe(supportFilter)
    .pipe(jade())
    .pipe(gulp.dest('../templates'))
    .pipe(supportFilter.restore())

    // Compile index to ../
    .pipe(indexFilter)
    .pipe(jade())
    .pipe(gulp.dest('../'));
});

gulp.task('watch', function() {
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', [
  'styles',
  'scripts',
  'templates',
  'watch'
]);
