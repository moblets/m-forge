
/**
 *	develop  - task for development state.
 *  	developer by: @leualemax in 06/05/2016
 **/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var tinylr = require('tiny-lr')();
var bundler = require('./bundler.js');

var develop = {
  watch: {
    sass: function(path, location, destination) {
      gulp.watch(path, function(event) {
        return bundler.sass(location, destination, false)
              .on('end', function() {
                browserSync.reload(event);
              });
      });
    },
    javascript: function(path, location, destination) {
      gulp.watch(path, function(event) {
        return bundler.compile(location, destination,
                              false, false)
                .then(function() {
                  browserSync.reload(event);
                });
      });
    }
  },
  notifyLiveReload: function(location, event) {
    var fileName = require('path').relative(location, event.path);
    tinylr.changed({
      body: {
        files: [fileName]
      }
    });
  },
  server: function(location) {
    browserSync.init({
      server: location
    });
    // app.use(express.static(location));
    // app.use(require('connect-livereload')({port: 4002}));
    // app.listen(4000, '0.0.0.0');
  },
  livereload: function() {
    tinylr.listen(35729);
  },
  start: function(sass, js, location) {
    develop.watch.sass(sass.path, sass.location, sass.destination);
    develop.watch.javascript(js.path, js.location, js.destination);
    develop.server(location);
  }
};

module.exports = develop;
