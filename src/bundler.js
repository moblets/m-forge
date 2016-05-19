/**
 *    Bundler  - bundle the browserify dependece and turn it on a angular module.
 *      developer by: @leualemax in 10/12/2015
 **/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var gulp = require('gulp');
var browserify = require('browserify');
var brfs = require('brfs');
var rename = require('gulp-rename');
var tap = require('gulp-tap');
var sass = require('gulp-sass');
var buffer = require('gulp-buffer');
var sassify = require('sassify');
var stripDebug = require('gulp-strip-debug');
var strip = require('gulp-strip-comments');
var revision = require('gulp-rev');
var minify = require('gulp-minify');
var minifyCss = require('gulp-minify-css');
var revReplace = require('gulp-rev-replace');
var awesome = require('awesome-logs');

var bundler = {
  compile: function(location, destination, min, rev) {
    if (typeof location === "string") {
      location = [location];
    }
    awesome.row();
    awesome.info("building bundles for for: ");
    awesome.row();
    for (var i = 0; i < location.length; i++) {
      console.log("‣" + location[i]);
    }
    awesome.row();
    var stream = gulp.src(location, {
      read: false
    })
      .pipe(tap(function(file) {
        file.contents = browserify({})
          .transform(sassify, {
            'auto-inject': true, // Inject css directly in the code
            'base64Encode': false, // Use base64 to inject css
            'sourceMap': false // Add source map to the code
          })
          .transform(brfs, {})
          .add(file.path)
          .bundle();
      }))
      .pipe(buffer());
    if (min) {
      stream
        .pipe(stripDebug())
        .pipe(strip())
        .pipe(minify({
          noSource: true,
          mangle: false,
          ext: {
            min: '.js'
          }
        }));
      if (rev) {
        stream
          .pipe(rename({
            extname: '.bundle.js'
          }))
          .pipe(gulp.dest(destination))
          .pipe(revision())
          .pipe(gulp.dest(destination))
          .pipe(revision.manifest())
          .pipe(gulp.dest(destination));
      } else {
        stream
          .pipe(rename({
            extname: '.bundle.js'
          }))
          .pipe(gulp.dest(destination));
      }
    } else {
      stream
        .pipe(rename({
          extname: '.bundle.js'
        }))
        .pipe(gulp.dest(destination));
    }
    return stream;
  },
  sass: function(location, destination, min) {
    if (typeof location === "string") {
      location = [location];
    }
    awesome.row();
    awesome.info("building sass for for: ");
    awesome.row();
    for (var i = 0; i < location.length; i++) {
      console.log("‣" + location[i]);
    }
    awesome.row();
    var stream = gulp.src(location)
      .pipe(sass())
      .on('error', sass.logError)
      .pipe(gulp.dest(destination));
    if (min) {
      stream
        .pipe(minifyCss({
          keepSpecialComments: 0
        }))
        .pipe(rename({
          extname: '.min.css'
        }))
        .pipe(gulp.dest(destination));
    }
    return stream;
  },
  replace: function(manifest, index) {
    setTimeout(function() {
      return gulp.src(index + "index.html")
        .pipe(rename('index-rev.html'))
        .pipe(revReplace({
          manifest: gulp.src(manifest)
        }))
        .pipe(gulp.dest(index));
    }, 5000);
  }
};

module.exports = bundler;
