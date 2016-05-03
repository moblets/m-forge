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
var minify = require('gulp-minify');

var dister = {
  minify: function(location, destination, rev) {
    console.log(colors.yellow("- minifying bundle"));
    var minifyit = gulp.src(location)
          .pipe(stripDebug())
          .pipe(strip())
          .pipe(minify({noSource: true, mangle: false, ext: {min: '.min.js'}}))
          .pipe(gulp.dest(destination));
    if (rev) {
      console.log(colors.yellow("- generating revision dist"));
      minifyit.pipe(revision())
        .pipe(gulp.dest(destination))
        .pipe(revision.manifest())
        .pipe(gulp.dest(destination));
    }
    return minifyit;
  }
};

module.exports = dister;
