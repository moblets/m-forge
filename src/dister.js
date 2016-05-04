/**
*	Dister  - prepares the files to distribution
*  	developer by: @leualemax in 27/04/2016
**/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var gulp = require('gulp');
var stripDebug = require('gulp-strip-debug');
var strip = require('gulp-strip-comments');
var revision = require('gulp-rev');
var colors = require('colors');
var rename = require("gulp-rename");
var minify = require('gulp-minify');
var buffer = require('gulp-buffer');
var revReplace = require('gulp-rev-replace');

var dister = {
  minify: function(location, destination, rev, replace, index) {
    console.log(colors.yellow("- minifying bundle"));
    var minifyit = gulp.src(location)
          .pipe(stripDebug())
          .pipe(strip())
          .pipe(minify({noSource: true, mangle: false, ext: {min: '.js'}}));
    if (rev) {
      console.log(colors.yellow("- generating revision dist"));
      minifyit.pipe(buffer())
        .pipe(revision({merge: true}))
        .pipe(gulp.dest(destination))
        .pipe(revision.manifest())
        .pipe(gulp.dest(destination));
      if (replace) {
        // minifyit.on('end', function() {
        var manifest = gulp.src(destination + "rev-manifest.json");
        minifyit.pipe(gulp.src(index + "index.html"))
        .pipe(revReplace({manifest: manifest}))
        .pipe(rename('index-rev.html'))
        .pipe(gulp.dest(index))
        .on('end', function() {
          console.log("revisions file replaced in " + index + "index.html");
        });
      }
    } else {
      minifyit.pipe(gulp.dest(destination));
    }
    return minifyit;
  }
};

module.exports = dister;
