var gulp = require('gulp')
var jsmin = require('gulp-jsmin')
var rename = require('gulp-rename')
var postcss = require("gulp-postcss")
var autoprefixer = require("autoprefixer")
var sass = require("gulp-sass")

gulp.task("sass", () =>
  return gulp.src("assets/sass/website.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("client/dist/css"))
)

gulp.task('js-min', () =>
  gulp.src('client/src/js/*.js')
  .pipe(jsmin())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('client/dist/js'))
)
