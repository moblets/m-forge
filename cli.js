#! /usr/bin/env node
var mForge = require('./mforge.js');
var cli = require('cli');
/**
 * mForge CLI
 */

cli.parse({
  port: ['p', 'server port', 'number', 3000],
  env: ['e', 'environment', 'string', "dev"],
  rev: ['r', 'revision', 'boolean', false],
  min: ['m', 'minify', 'boolean', false],
  app: ['a', 'minify', 'number', 1294524],
  target: ['t', 'target', 'string', "web"]
});

cli.main(function(args, options) {
  var file = "";
  var dest = "";
  if (args[0] === "webserver") {
    mForge.run(process.cwd(), options.target, options.env, options.rev,
                    undefined, options.port);
  } else if (args[0] === "mobile") {
    mForge.run(process.cwd(), "mobile", options.env, options.rev,
                    options.app, options.port);
  } else if (args[0] === "prepare") {
    file = [process.cwd() + "/u-moblets/u-moblets.js",
            process.cwd() + "/u-core/u-core.js",
            process.cwd() + "/u-base/u-base.js"];
    dest = process.cwd() + "/www/bundles/";
    mForge.bundle.compile(file, dest, options.min, options.rev, options.rev,
                          process.cwd() + "/www/");
  } else if (args[0] === "bundle") {
    file = args[1] || options.file;
    dest = args[2] || options.dest;
    // validing dest uri
    if (dest[dest.length - 1] !== "/") {
      dest += "/";
    }
    mForge.bundle.compile(file, dest, options.min, options.rev);
  }
});

cli.enable('help');
