
/**
 *	Bundler  - bundle the browserify dependece and turn it on a angular module.
 *  	developer by: @leualemax in 10/12/2015
 **/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var gulp = require('gulp');
var browserify = require('browserify');
var brfs = require('brfs');
var rename = require('gulp-rename');
var tap = require('gulp-tap');
var buffer = require('gulp-buffer');
var stripDebug = require('gulp-strip-debug');
var strip = require('gulp-strip-comments');
var revision = require('gulp-rev');
var minify = require('gulp-minify');
var revReplace = require('gulp-rev-replace');

var bundler = {
  compile: function(location, destination, min, rev) {
    var stream = gulp.src(location, {read: false})
          .pipe(tap(function(file) {
            file.contents = browserify(file.path, {transform: [brfs]}).bundle();
          }))
          .pipe(buffer());
    if (min) {
      stream
      .pipe(stripDebug())
      .pipe(strip())
      .pipe(minify({noSource: true, mangle: false, ext: {min: '.js'}}));
      if (rev) {
        stream
        .pipe(rename({extname: '.bundle.js'}))
        .pipe(gulp.dest(destination))
        .pipe(revision())
        .pipe(gulp.dest(destination))
        .pipe(revision.manifest())
        .pipe(gulp.dest(destination));
      } else {
        stream
       .pipe(rename({extname: '.bundle.js'}))
       .pipe(gulp.dest(destination));
      }
    } else {
      stream
     .pipe(rename({extname: '.bundle.js'}))
     .pipe(gulp.dest(destination));
    }
    return stream;
  },
  replace: function(manifest, index) {
    setTimeout(function() {
      return gulp.src(index + "index.html")
      .pipe(rename('index-rev.html'))
      .pipe(revReplace({manifest: gulp.src(manifest)}))
      .pipe(gulp.dest(index));
    }, 5000);
  }
};

module.exports = bundler;
