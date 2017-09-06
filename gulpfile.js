var gulp = require("gulp");
var cleanCSS = require("gulp-clean-css");
var replace = require("gulp-replace");
var htmlmin = require("gulp-htmlmin");
var uglify = require('gulp-uglify-es').default;
var babel = require("gulp-babel");
var rimraf = require("gulp-rimraf");
var jshint = require("gulp-jshint");
var fs = require("fs");
var config = require("./config.json");

gulp.task("default", ["watch"]);

gulp.task("clean", function() {
  return gulp.src("./build/**/*")
    .pipe(rimraf());
});
gulp.task("miniC", function() {
  return gulp.src("./src/public/styles/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("./build/public/styles"));
});
gulp.task("miniH", function() {
  return gulp.src("./src/views/*.njk")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./build/views"));
});
gulp.task("rep1", function() {
  return gulp.src("./src/views/*.njk")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(gulp.dest("./build/views"));
});
gulp.task("rep2", function() {
  return gulp.src("./src/server/*.js")
    .pipe(replace(/rootpath/g, config.website))
    .pipe(replace(/maindir/g, config.maindir))
    .pipe(replace(/localpath/g, config.localpath))
    .pipe(replace(/builddir/g), config.builddir)
    .pipe(gulp.dest("./build/server"));
});
gulp.task("miniJ1", function() {
  return gulp.src("./src/public/script/*.js")
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest("./build/public/script"));
});
gulp.task("miniJ2", function() {
  return gulp.src("./src/server/*.js")
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest("./build/server"));
});
gulp.task("moveDefault", function() {
  return gulp.src("./src/public/default/*")
    .pipe(gulp.dest("./build/public/default"));
});
gulp.task("start", ["moveDefault"], function() {
  fs.mkdir("./build/public/profile/", err => {
    if (err) throw err;
  });
});
gulp.task("lint", function() {
  return gulp.src("./src/server/**/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"));
});
gulp.task("watch", function() {
  gulp.watch("./src/server/**/*.js", ["lint"]);
});
