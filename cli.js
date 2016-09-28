#! /usr/bin/env node
var mForge = require('./m-forge.js');
var cli = require('cli');
var awesome = require('awesome-logs');
var merge = require('lodash.merge');
var async = require('async');
/**
 * mForge CLI
 */

cli.parse({
  port: ['p', 'server port', 'number', 3000],
  env: ['e', 'environment', 'string', "dev"],
  rev: ['r', 'revision', 'boolean', false],
  min: ['m', 'minify', 'boolean', false],
  appId: ['a', 'app', 'number', 1294524],
  version: ['v', 'version', 'boolean', false],
  target: ['t', 'target', 'string', "web"]
});
var sass = {
  path: [process.cwd() + '/m-base/**/*.scss',
    process.cwd() + '/u-moblets/**/*.scss'],
  location: process.cwd() + '/m-base/m-base.scss',
  destination: process.cwd() + "/www/css/"
};

var js = {
  path: [process.cwd() + '/m-base/**/*',
    process.cwd() + '/www/app.js',
    process.cwd() + '/www/index.html',
    process.cwd() + '/u-moblets/**/*'],
  location: [process.cwd() + "/u-moblets/u-moblets.js",
    process.cwd() + "/m-base/m-base.js"],
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
  },
  prepare: function(args, options) {
    routines.resources(args, options, function() {
      mForge.proprieties.change(process.cwd(), options, function() {
        awesome.success("🎉 Action Prepare successfully completed 🎉");
      });
    });
  },
  develop: function(args, options) {
    // subs options
    options.target = "mobile";
    // excs action
    mForge.utils.appDef(process.cwd(), options, function(config) {
      options = merge(options, config);
      var asyncFuncs = [];
      // add moblet injection to functions array
      asyncFuncs.push(function(callback) {
        var ml = [];
        for (var i = 0; i < config.moblets.length; i++) {
          ml.push(mForge.utils.fileName(config.moblets[i]));
        }
        options.moblets = ml;
        mForge.proprieties.change(process.cwd(), options, callback);
      });
      // add download moblets to functions array
      if (config.moblets.length > 0) {
        for (var i = 0; i < config.moblets.length; i++) {
          asyncFuncs.push(mForge.utils.moblets.download(process.cwd(), config.moblets[i]));
        }
      } else {
        console.log("no new moblets");
      }
      awesome.row();
      awesome.info("executing now " + asyncFuncs.length + " async functions");
      awesome.row();
      asyncFuncs.push(function() {
        awesome.success("✅  waterfall async functions done");
        awesome.success("🌐  now starting develop auto reload server");
        routines.resources(args, options, function() {
          mForge.develop.start(sass, js, process.cwd() + "/www/");
        });
      });
      async.waterfall(asyncFuncs);
    });
  },
  webserver: function(args, options) {
    // subs options
    options.target = 'web';
    // excs action
    mForge.proprieties.change(process.cwd(), options, function() {
      mForge.webserver.server(process.cwd(), options);
    });
  },
  mobile: function(args, options) {
    // subs options
    options.target = 'mobile';
    // excs action
    mForge.utils.appDef(process.cwd(), options, function(config) {
      options = merge(options, config);
      var asyncFuncs = [];
      // add moblet injection to functions array
      asyncFuncs.push(function(callback) {
        var ml = [];
        for (var i = 0; i < config.moblets.length; i++) {
          ml.push(mForge.utils.fileName(config.moblets[i]));
        }
        options.moblets = ml;
        mForge.proprieties.change(process.cwd(), options, callback);
      });

      // add replace facebook to functions array
      asyncFuncs.push(function(callback) {
        mForge.utils.replaceFacebookAndroid(process.cwd(), options, callback);
      });

      asyncFuncs.push(function(callback) {
        mForge.utils.replaceFacebookIOS(process.cwd(), options, callback);
      });

      // add download push icon to functions array
      if (config.pushImage) {
        asyncFuncs.push(function(callback) {
          mForge.utils.images.download(process.cwd(), config.pushImage, callback);
        });
      } else {
        console.log("no push icon");
      }
      // add download moblets to functions array
      if (config.moblets.length > 0) {
        for (var i = 0; i < config.moblets.length; i++) {
          asyncFuncs.push(function(callback) {
            mForge.utils.moblets.download(process.cwd(), config.moblets[i], callback);
          });
        }
      } else {
        console.log("no new moblets");
      }
      awesome.row();
      awesome.info("executing now " + asyncFuncs.length + " async functions");
      awesome.row();
      asyncFuncs.push(function() {
        awesome.success("✅  waterfall async functions done");
      });
      async.waterfall(asyncFuncs);
    });
  },
  moblet: function(args, options) {
    js.path.push(args[2] + "/moblet/**/*");
    js.location.push(args[2] + "/moblet/" + args[1] + ".js");
    // subs options
    options.target = 'mobile';
    // excs action
    mForge.utils.appDef(process.cwd(), options, function(config) {
      options = merge(options, config);
      routines.resources(args, options, function() {
        options.moblets.push(args[2] + "/moblet/" + args[1] + ".js");
        mForge.proprieties.change(process.cwd(), options, function() {
          mForge.develop.start(sass, js, process.cwd() + "www/");
        });
      });
    });
  }
};
cli.main(function(args, options) {
  var action = args[0];
  if (options.version) {
    awesome.row();
    awesome.info("v1.8.89");
    awesome.row();
  } else {
    awesome.row();
    awesome.info("starting " + action + " build");
    awesome.row();
    options.id = options.appId;
    routines[args[0]](args, options);
  }
});

cli.enable('help');
