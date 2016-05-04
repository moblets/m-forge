/**
 *	mForge
 *  	developer by: @leualemax in 2/5/2016
 **/
/* eslint no-restricted-modules: [ "error", "fs", "cluster"]  */
var bundler = require('./src/bundler.js');
var proprieties = require('./src/proprieties.js');
var webserver = require('./src/webserver.js');
var dister = require('./src/dister.js');
var colors = require('colors');

/**
 * mForge Commands
 */
var mForge = {
  bundle: {
    compile: function(location, destination, minify, rev, replace, index) {
      bundler.compile(location, destination, function(bundleUri) {
        if (minify) {
          dister.minify(bundleUri, destination, rev, replace, index)
          .on("end", function() {
            console.log(
              colors.green('bundle gereted and save in:'), bundleUri);
          });
        } else {
          console.log(
            colors.green('bundle gereted and save in:'), bundleUri);
        }
      });
    }
  },
  run: function(location, target, env, rev, id, port) {
    proprieties.change(location, target, env, rev, id, function() {
      console.log("base-ionic changed for " + target + " pointing to " + env);
      if (target === "web") {
        webserver(location, port, env, rev);
      }
    });
  }
};

module.exports = mForge;
