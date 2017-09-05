var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();

gulp.task('scss', () => {
    return gulp.src('./src/scss/**/*.scss')
               .pipe(sass().on('error', sass.logError))
               .pipe(cleanCSS())
               .pipe(concat('style.min.css'))
               .pipe(gulp.dest('./dist/css/'));
});

gulp.task('reloadBrowser', ['scss'], (done) => {
    browserSync.reload();
    done();
});

gulp.task('watchForReload', () => {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(['**/*.js', './src/scss/**/*.scss', '**/*.html'], ['reloadBrowser']);
});