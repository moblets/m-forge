#! /usr/bin/env node
var mForge = require('./m-forge.js');
var cli = require('cli');
var awesome = require('awesome-logs');
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

var sass = {
  path: [process.cwd() + '/u-base/**/*.scss',
    process.cwd() + '/u-core/**/*.scss',
    process.cwd() + '/u-moblets/**/*.scss'],
  location: process.cwd() + '/u-base/u-base.scss',
  destination: process.cwd() + "/www/css/"
};
var js = {
  path: [process.cwd() + '/u-base/**/*',
    process.cwd() + '/www/app.js',
    process.cwd() + '/www/index.html',
    process.cwd() + '/u-core/**/*',
    process.cwd() + '/u-moblets/**/*'],
  location: [process.cwd() + "/u-moblets/u-moblets.js",
    process.cwd() + "/u-core/u-core.js",
    process.cwd() + "/u-base/u-base.js"],
  destination: process.cwd() + "/www/bundles/"
};
var location = process.cwd() + "/www/";
var destination = process.cwd() + "/www/bundles/";
var manifest = process.cwd() + "/www/bundles/rev-manifest.json";


var routines = {
  resources: function(args, options, callback) {
    mForge.bundler.sass(sass.location, sass.destination, options.min)
      .on('end', function() {
        mForge.bundler.compile(js.location, destination,
          options.min, options.rev)
          .then(function() {
            mForge.bundler.replace(manifest, location);
            callback();
          });
      });
  }
};

cli.main(function(args, options) {
  var action = args[0];
  awesome.row();
  awesome.info("starting " + action + " build");
  awesome.row();
  if (action === "prepare") {
    routines.resources(args, options, function() {
      mForge.proprieties.change(process.cwd(), options.target, options.env,
      options.rev, options.app, undefined, function() {
        awesome
          .success("🎉 Bundles and Sass successfully compiled 🎉");
      });
    });
  } else if (args[0] === "webserver" || args[0] === "mobile") {
    options.target = (args[0] === "webserver") ? 'web' : 'mobile';
    mForge.proprieties.change(process.cwd(), options.target, options.env,
      options.rev, options.app, undefined, function() {
        if (options.target === "web") {
          mForge.webserver(process.cwd(), options.port, options.env,
            options.rev);
        }
      });
  } else if (args[0] === "develop") {
    routines.resources(args, options, function() {
      awesome
        .success("🎉 Bundles and Sass successfully compiled 🎉");
      mForge.proprieties.change(process.cwd(), "mobile", options.env,
        options.rev, options.app, undefined, function() {
          mForge.develop.start(sass, js, location);
        });
    });
  } else if (args[0] === "moblet") {
    js.path.push(args[2] + "/moblet/**/*");
    js.location.push(args[2] + "/moblet/" + args[1] + ".js");
    routines.resources(args, options, function() {
      awesome
        .success("🎉 Bundles and Sass successfully compiled 🎉");
      mForge.proprieties.change(process.cwd(), "mobile", options.env,
        options.rev, options.app, args[1] + ".bundle.js", function() {
          mForge.develop.start(sass, js, location);
        });
    });
  }
});

cli.enable('help');
