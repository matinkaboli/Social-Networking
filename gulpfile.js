const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const uglify = require('gulp-uglify-es').default;
const pump = require('pump');

const config = require("./config.json");

gulp.task("default", ["watch"]);

gulp.task("miniCSS", () => {
  return gulp.src("./st/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/styles"));
});
gulp.task("miniHTML", () => {
  return gulp.src("view/*.njk")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("views"));
});
gulp.task("rep1", () => {
  return gulp.src("./view/*.njk")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./view"));
});
gulp.task("rep2", () => {
  return gulp.src("./server/*.js")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./server"));
});
gulp.task("rep3", () => {
  return gulp.src("./server/*.js")
    .pipe(replace(/maindir/g, config.dir))
    .pipe(gulp.dest("./server"));
});
gulp.task("miniJS", ["miniCSS", "miniHTML", "rep1", "rep2", "rep3"], () => {
  return gulp.src("./sc/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("./public/script"));
});

gulp.task("watch", () => {
  gulp.watch("./sc/*.js", ["miniJS"]);
});
