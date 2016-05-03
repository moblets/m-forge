/**
 *	mForge
 *  	developer by: @leualemax in 2/5/2016
 **/
/* eslint no-restricted-modules: [ "error", "fs", "cluster"]  */
var bundler = require('./src/bundler.js');
var dister = require('./src/dister.js');
var colors = require('colors');
var cli = require('cli');
// var proprieties = require('./src/proprieties.js');
// var webserver = require('./src/webserver.js');
// proprieties.change('./www', 'mobile', 'production', undefined, "./www/env.json",
// function() {
//   console.log("passsssei carai!");
// });

/**
 * mForge Commands
 */
var mForge = {
  bundle: {
    compile: function(location, destination, minify, rev) {
      bundler.compile(location, destination, function(bundleUri) {
        if (minify) {
          dister.minify(bundleUri, destination, rev)
          .on("end", function() {
            console.log(
              colors.green('🔝🔝🔝 bundle gereted and save in:'), bundleUri);
          });
        } else {
          console.log(
            colors.green('🔝🔝🔝  bundle gereted and save in:'), bundleUri);
        }
      });
    }
  }
};

/**
 * mForge CLI
 */

cli.parse({
  rev: ['r', 'build with revision', 'boolean', false],
  min: ['m', 'build with minify', 'boolean', false],
  file: [false, 'file to build a bundle', 'path', "./www/teste.js"],
  dest: [false, 'file to save build a bundle', 'path', "./www/compiled/"]
});

cli.main(function(args, options) {
  console.log(args);
  var file = args[0] || options.file;
  var dest = args[1] || options.dest;
  // validing dest uri
  if (dest[dest.length - 1] !== "/") {
    dest += "/";
  }
  mForge.bundle.compile(file, dest, options.min, options.rev);
});

cli.enable('help');

/** target, env, id, callback
 * registe gulp tasks
 */

module.exports = mForge;
