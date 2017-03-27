var gulp = require('gulp')
var jsmin = require('gulp-jsmin')
var rename = require('gulp-rename')
var postcss = require("gulp-postcss")
var autoprefixer = require("autoprefixer")
var sass = require("gulp-sass")

gulp.task("sass", () =>
  gulp.src("src/scss/*.scss")
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([autoprefixer()]))
  .pipe(gulp.dest("src/css"))
)

gulp.task('js-min', () =>
  gulp.src('src/js/*.js')
  .pipe(jsmin())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('dist/js'))
)
gulp.task('watch', () => {
  gulp.start('sass')
  gulp.watch('src/scss/*', ['sass'])
})
