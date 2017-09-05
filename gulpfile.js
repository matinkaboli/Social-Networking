var gulp = require("gulp");
var cleanCSS = require("gulp-clean-css");
var replace = require("gulp-replace");
var htmlmin = require("gulp-htmlmin");
var uglify = require('gulp-uglify-es').default;
var babel = require("gulp-babel");

var config = require("./config.json");

gulp.task("default", ["watch"]);

gulp.task("miniC", function() {
  return gulp.src("./st/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/styles"));
});
gulp.task("miniH", function() {
  return gulp.src("view/*.njk")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("views"));
});
gulp.task("rep1", function() {
  return gulp.src("./view/*.njk")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./view"));
});
gulp.task("rep2", function() {
  return gulp.src("./server/*.js")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./server"));
});
gulp.task("rep3", function() {
  return gulp.src("./server/*.js")
    .pipe(replace(/maindir/g, config.dir))
    .pipe(gulp.dest("./server"));
});
gulp.task("miniJ", function() {
  return gulp.src("./sc/*.js")
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest("./public/script"));
});

gulp.task("watch", function() {
  gulp.watch("./sc/*.js", ["miniJ"]);
});
