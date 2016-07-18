#! /usr/bin/env node
var mForge = require('./m-forge.js');
var cli = require('cli');
var awesome = require('awesome-logs');
var https = require('https');
var http = require('http');
var fs = require('fs.extra');
var async = require('async');
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
  path: [process.cwd() + '/m-base/**/*.scss',
    process.cwd() + '/u-moblets/**/*.scss'],
  location: process.cwd() + '/m-base/m-base.scss',
  destination: process.cwd() + "/www/css/"
};
var plataformAndroidDir = process.cwd() + "/platforms/android/";
var pushImageDest = [
  process.cwd() + "/platforms/android/res/drawable-xxxhdpi/push_image.png",
  process.cwd() + "/platforms/android/res/drawable-xxhdpi/push_image.png",
  process.cwd() + "/platforms/android/res/drawable-xhdpi/push_image.png",
  process.cwd() + "/platforms/android/res/drawable-hdpi/push_image.png",
  process.cwd() + "/platforms/android/res/drawable-mdpi/push_image.png",
  process.cwd() + "/platforms/android/res/drawable-ldpi/push_image.png"
];

var js = {
  path: [process.cwd() + '/m-base/**/*',
    process.cwd() + '/www/app.js',
    process.cwd() + '/www/index.html',
    process.cwd() + '/u-moblets/**/*'],
  location: [process.cwd() + "/u-moblets/u-moblets.js",
    process.cwd() + "/m-base/m-base.js"],
  destination: process.cwd() + "/www/bundles/"
};
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  });
};
var downloadImage = function(url, cb) {
  fs.exists(plataformAndroidDir, function(exists) {
    if (exists) {
      var file = fs.createWriteStream(pushImageDest[0]);
      http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(
          function() {
            setTimeout(function() {
              fs.createReadStream(pushImageDest[0])
              .pipe(fs.createWriteStream(pushImageDest[1]));
              fs.createReadStream(pushImageDest[0])
              .pipe(fs.createWriteStream(pushImageDest[2]));
              fs.createReadStream(pushImageDest[0])
              .pipe(fs.createWriteStream(pushImageDest[3]));
              fs.createReadStream(pushImageDest[0])
              .pipe(fs.createWriteStream(pushImageDest[4]));
              fs.createReadStream(pushImageDest[0])
              .pipe(fs.createWriteStream(pushImageDest[5]));
              awesome
                .success("🎉 downloaded push icons 🎉");
              cb();
            }, 500);
          });
        });
      });
    } else {
      awesome
        .info('this is not a android project, no image for push');
      awesome
          .info('if this is an android project, plz add platform');
    }
  });
};
var fileName = function(url) {
  var urlArray = url.split("/");
  return urlArray[urlArray.length - 1].split(".")[0] + ".js";
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
  } else if (args[0] === "webserver") {
    options.target = (args[0] === "webserver") ? 'web' : 'mobile';
    mForge.proprieties.change(process.cwd(), options.target, options.env,
      options.rev, options.app, undefined, function() {
        if (options.target === "web") {
          mForge.webserver.server(process.cwd(), options.port, options.env,
            options.rev, options.target);
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
  } else if (args[0] === "mobile") {
    mForge.webserver.utils.loadConfig(process.cwd(), options.env,
    function(config) {
      var url = config + options.app + ".json";
      mForge.webserver.utils.requestApp(url, options.app, "mobile",
      function(appDef) {
        var asyncFuncs = [];
        mForge.proprieties.replaceAnalytics(js.path[1], process.cwd() + '/www/',
        "mobile", appDef.appAnalytics).on("end", function() {
          var dw = function(moblet) {
            // console.log(moblet);
            return function(callback) {
              download(moblet, js.destination + fileName(moblet), function() {
                awesome
                .success("🎉 downloaded moblet " + fileName(moblet) + " 🎉");
                callback();
              });
            };
          };
          var dwi = function(image) {
            // console.log(moblet);
            return function(callback) {
              downloadImage(image, function() {
                console.log(image, 'downloaded');
                callback();
              });
            };
          };
          var prepare = function(mobletsList) {
            var ml = [];
            for (var i = 0; i < mobletsList.length; i++) {
              ml.push(fileName(mobletsList[i]));
            }
            return function(callback) {
              mForge.proprieties.change(process.cwd(), "mobile", options.env,
                options.rev, options.app, undefined, callback,
                ml);
            };
          };
          asyncFuncs.push(prepare(appDef.moblets));

          for (var i = 0; i < appDef.moblets.length; i++) {
            asyncFuncs.push(dw(appDef.moblets[i]));
          }
          if (appDef.pushImage) {
            asyncFuncs.push(dwi(appDef.pushImage));
          } else {
            console.log("no push icon");
          }

          async.waterfall(asyncFuncs);
        });
    //     // console.log(appDef.moblets);
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
