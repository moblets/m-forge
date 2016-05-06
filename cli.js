#! /usr/bin/env node
var mForge = require('./m-forge.js');
var cli = require('cli');
/**
 * mForge CLI
 */

cli.parse({
  port: ['p', 'server port', 'number', 3000],
  env: ['e', 'environment', 'string', "dev"],
  rev: ['r', 'revision', 'boolean', false],
  min: ['m', 'minify', 'boolean', false],
  app: ['a', 'app', 'number', 1294524],
  target: ['t', 'target', 'string', "web"]
});

cli.main(function(args, options) {
  var action = args[0];
  if (action === "prepare") {
    var baseIonicBundles = [process.cwd() + "/u-moblets/u-moblets.js",
                            process.cwd() + "/u-core/u-core.js",
                            process.cwd() + "/u-base/u-base.js"];
    var destination = process.cwd() + "/www/bundles/";
    var manifest = process.cwd() + "/www/bundles/rev-manifest.json";
    var index = process.cwd() + "/www/";
    mForge.bundler.compile(baseIonicBundles, destination,
                            options.min, options.rev)
            .on("end", function() {
              mForge.bundler.replace(manifest, index);
            });
  } else if (args[0] === "webserver" || args[0] === "mobile") {
    mForge.proprieties.change(process.cwd(), options.target, options.env,
            options.rev, options.app, function() {
              if (options.target === "web") {
                mForge.webserver(process.cwd(), options.port, options.env,
                                  options.rev);
              }
            });
  } else if (args[0] === "develop") {
    var sass  = {
      path:[process.cwd() + '/u-base/**/*.scss',
            process.cwd() + '/u-core/**/*.scss',
            process.cwd() + '/u-moblets/**/*.scss'],
      location:process.cwd() + '/u-base/u-base.scss',
      destination:process.cwd() + "/www/css/"
    };
    var js  = {
      path:[process.cwd() + '/u-base/**/*',
            process.cwd() + '/u-core/**/*',
            process.cwd() + '/u-moblets/**/*'],
      location:[process.cwd() + "/u-moblets/u-moblets.js",
                process.cwd() + "/u-core/u-core.js",
                process.cwd() + "/u-base/u-base.js"],
      destination:process.cwd() + "/www/bundles/"
    }
    var location = process.cwd() + "/www/";
    mForge.develop.start(sass, js, location)
  }
});

cli.enable('help');
