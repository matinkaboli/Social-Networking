const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const uglify = require('gulp-uglify-es').default;
const pump = require('pump');

const config = require("./config.json");
gulp.task("default", ["watch"]);

gulp.task("miniCSS", () => {
  return gulp.src("./public/st/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/styles"));
});
gulp.task("miniHTML", () => {
  return gulp.src("view/*.njk")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("views"));
});
gulp.task("dev:replace", () => {
  return gulp.src("./**/*")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./**/*"));
});
gulp.task("miniJS", ["miniCSS", "miniHTML"], () => {
  return gulp.src("./public/sc/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("./public/script"));
});

gulp.task("watch", () => {
  gulp.watch("./public/sc/*.js", ["miniJS"]);
});
