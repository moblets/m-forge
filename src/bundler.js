/**
 *    Bundler  - bundle the browserify dependece and turn it on a angular module.
 *      developer by: @leualemax in 10/12/2015
 **/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var gulp = require('gulp');
var browserify = require('browserify');
var brfs = require('brfs');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var buffer = require('gulp-buffer');
var sassify = require('sassify');
var stripDebug = require('gulp-strip-debug');
var strip = require('gulp-strip-comments');
var revision = require('gulp-rev');
var minify = require('gulp-minify');
var minifyCss = require('gulp-minify-css');
var revReplace = require('gulp-rev-replace');
var vinylSource = require('vinyl-source-stream');
var awesome = require('awesome-logs');
var mobletfy = require("./moblet");
var q = require('q');

var bundler = {
  bundleName: function(location) {
    var splited = location.split("js");
    var name = "";
    if (splited[0].trim() === "") {
      name = false;
    } else {
      var urlSplited = splited[0].trim().split("/");
      name = urlSplited[urlSplited.length - 1];
    }
    return name;
  },
  build: function(location, destination, min, rev) {
    var deferred = q.defer();
    var mobletName = bundler.bundleName(location);
    var stream = browserify({
      paths: ['./node_modules']
    })
      .transform(mobletfy)
      .transform(sassify, {
        'auto-inject': true, // Inject css directly in the code
        'base64Encode': false, // Use base64 to inject css
        'sourceMap': false // Add source map to the code
      })
      .transform(brfs, {})
      .add(location)
      .bundle()
      .pipe(vinylSource(mobletName + "bundle.js"))
      .pipe(gulp.dest(destination));
    stream.on('end', function() {
      var newStream;
      if (min) {
        newStream = gulp.src(destination + mobletName + "bundle.js")
          .pipe(stripDebug())
          .pipe(strip())
          .pipe(minify({
            noSource: true,
            mangle: false,
            ext: {
              min: '.js'
            }
          }))
          .pipe(gulp.dest(destination));
        if (rev) {
          newStream
            // .pipe(buffer())
            .pipe(gulp.dest(destination))
            .pipe(revision())
            .pipe(gulp.dest(destination))
            .pipe(revision.manifest())
            .pipe(gulp.dest(destination));
        }
        newStream.on('end', function() {
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  },
  compile: function(location, destination, min, rev) {
    var deferred = q.defer();
    var promises = [];
    awesome.row();
    awesome.info("building bundles for for: ");
    awesome.row();
    if (typeof location === "string") {
      awesome.info("‣ " + location);
      promises.push(bundler.build(location, destination, min, rev));
    } else {
      for (var i = 0; i < location.length; i++) {
        awesome.info("‣ " + location[i]);
        promises.push(bundler.build(location[i], destination, min, rev));
      }
    }
    q.all(promises).then(function() {
      deferred.resolve();
    });
    return deferred.promise;
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

    stream
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({
        extname: '.min.css'
      }))
      .pipe(gulp.dest(destination));

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
