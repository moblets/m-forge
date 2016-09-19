var fs = require('fs');
var awesome = require('awesome-logs');
var request = require('request');
var uniq = require('lodash.uniq');
var replace = require('gulp-replace');
var gulp = require('gulp');

var utils = {
  httpOrHttps: function(url) {
    return url.match(/^(http:\/\/)/) ? require('http') : require('https');
  },
  destination: function(file) {
    var pathSplit = file.split("/");
    var fileName = pathSplit[pathSplit.length - 1];
    return file.replace(fileName, "");
  },
  fileName: function(url) {
    var urlArray = url.split("/");
    return urlArray[urlArray.length - 1].split(".")[0] + ".js";
  },
  download: function(url, dest, cb) {
    var file = fs.createWriteStream(dest);

    var httpOrHttps = utils.httpOrHttps(url);
    httpOrHttps.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        awesome.success("⏬  downloaded file : " + utils.fileName(url));
        file.close(cb);  // close() is async, call cb after close completes.
      });
    });
  },
  loadJson: function(configUrl, callback) {
    require('fs').readFile(configUrl, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(JSON.parse(data));
      }
    });
  },
  config: function(location, options, callback) {
    var config = location + "/env." + options.env + ".json";
    utils.loadJson(config, function(data) {
      callback(data);
    });
  },
  replaceFacebookIOS: function(location, options, callback) {
    var FACEBOOKIDREGEX = /("FacebookAppID":[^,]*,)/ig;
    var FACEBOOKNAMEREGEX = /("FacebookDisplayName":[^,]*,)/ig;
    var FACEBOOKURLREGEX = /(>CFBundleURLSchemes<\/key><array><string>fb[^,]*,)/ig;
    var plataformIosDir = location + "/platforms/ios/";
    var idToReplace = "\"FacebookAppID\": [ \n\t\t\t\t\t\t\t{\t\t\t\t\t\t\t\t\"xml\": \"<string>" +
                        options.facebookAppId + "</string>\",";
    var nameToReplace = "\"FacebookDisplayName\": [ \n\t\t\t\t\t\t\t{\t\t\t\t\t\t\t\t\"xml\": \"<string>" +
                        options.appName + "</string>\",";
    var urlToReplace = ">CFBundleURLSchemes</key><array><string>fb" + options.facebookAppId +
                        "</string></array></dict></array>\",";
    awesome.success("🔄  replace in ios ");
    awesome.success("🔄  replace Facebook App Id to: " + options.facebookAppId);
    awesome.success("🔄  replace Facebook App Name to: " + options.appName);
    fs.exists(plataformIosDir, function(exists) {
      if (exists) {
        gulp.src(plataformIosDir + "/ios.json")
          .pipe(replace(FACEBOOKIDREGEX, idToReplace))
          .pipe(replace(FACEBOOKNAMEREGEX, nameToReplace))
          .pipe(replace(FACEBOOKURLREGEX, urlToReplace))
          .pipe(gulp.dest(plataformIosDir))
          .on("end", callback);
      }
    });
  },
  replaceFacebookAndroid: function(location, options, callback) {
    var FACEBOOKIDREGEX = /(<string name=\\"fb_app_id\\">.[^<]*<\/string>)/ig;
    var FACEBOOKNAMEREGEX = /(<string name=\\"fb_app_name\\">.[^<]*<\/string>)/ig;
    var plataformAndroidDir = location + "/platforms/android/";
    var idToReplace = "<string name=\\\"fb_app_id\\\">" + options.facebookAppId + "</string>";
    var nameToReplace = "<string name=\\\"fb_app_name\\\">" + options.appName + "</string>";
    awesome.success("🔄  replace in android ");
    awesome.success("🔄  replace Facebook App Id to: " + options.facebookAppId);
    awesome.success("🔄  replace Facebook App Name to: " + options.appName);
    fs.exists(plataformAndroidDir, function(exists) {
      if (exists) {
        gulp.src(plataformAndroidDir + "/android.json")
          .pipe(replace(FACEBOOKIDREGEX, idToReplace))
          .pipe(replace(FACEBOOKNAMEREGEX, nameToReplace))
          .pipe(gulp.dest(plataformAndroidDir))
          .on("end", callback);
      }
    });
  },
  appDef: function(location, options, callback) {
    utils.config(location, options, function(config) {
      var url;
      if (options.fromName) {
        url = config.API_URL + "web_mobile/" + options.name + ".json";
      } else {
        url = config.API_URL + options.appId + ".json";
      }
      awesome.row();
      awesome.info("requesting app from:" + url);
      awesome.row();
      request(url, function(error, response, body) {
        try {
          var bodyJson = JSON.parse(body);
          if (error || bodyJson.error) {
            awesome.row();
            awesome.error("erro requestin app " + options.appId);
            awesome.error(error || bodyJson.error.code);
            awesome.error(error || bodyJson.error.message);
            awesome.row();
          } else {
            var info = bodyJson.info || {};
            var style = bodyJson.style || {};
            var newMoblets = utils.moblets.list(bodyJson, options);
            bodyJson.google_analytics_id_web = bodyJson.google_analytics_id_web || "UA-30056146-11";
            bodyJson.google_analytics_id_native = bodyJson.google_analytics_id_native || "UA-30056146-7";
            var analyticsKey = (options.target === "web") ? bodyJson.google_analytics_id_web :
                                                            bodyJson.google_analytics_id_native;

            var object = {
              moblets: newMoblets || null,
              pushImage: info.push_image || info.icon || null,
              appAnalytics: analyticsKey,
              facebookAppId: info.facebookId || "336873263368499",
              appId: info.id || null,
              appName: info.name || null,
              icon: info.icon || null,
              splash: info.splash || null,
              color: style.app[0] || null
            };
            awesome.row();
            awesome.info("loaded configs:");
            awesome.row();
            for (var item in object) {
              if (typeof object[item] === "object") {
                console.log("‣ " + item + " : ");
                for (var itemO in object[item]) {
                  console.log("     -" + object[item][itemO]);
                }
              } else {
                console.log("‣ " + item + " : " + object[item]);
              }
            }
            awesome.row();
            callback(object);
          }
        } catch (e) {
          console.log(e);
        }
      });
    });
  },
  images: {
    download: function(location, url) {
      return function(cb) {
        var plataformAndroidDir = location + "/platforms/android/";
        var pushImageDest = [
          location + "/platforms/android/res/drawable-xxxhdpi/push_image.png",
          location + "/platforms/android/res/drawable-xxhdpi/push_image.png",
          location + "/platforms/android/res/drawable-xhdpi/push_image.png",
          location + "/platforms/android/res/drawable-hdpi/push_image.png",
          location + "/platforms/android/res/drawable-mdpi/push_image.png",
          location + "/platforms/android/res/drawable-ldpi/push_image.png"
        ];

        fs.exists(plataformAndroidDir, function(exists) {
          if (exists) {
            var file = fs.createWriteStream(pushImageDest[0]);
            var httpOrHttps = utils.httpOrHttps(url);
            httpOrHttps.get(url, function(response) {
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
        awesome.success("⏬  downloaded file : push_image.png");
        cb();
      };
    }
  },
  moblets: {
    list: function(appDef, options) {
      var pages = appDef.pages;
      var newMoblets = [];
      for (var i = 0; i < pages.length; i++) {
        var moblets = pages[i].moblets;
        if (typeof pages[i].entries !== "undefined") {
          moblets = moblets.concat(pages[i].entries);
        }
        for (var ii = 0; ii < moblets.length; ii++) {
          var moblet = moblets[ii].type.superClass;
          if (moblet !== "ulist" &&
              moblet !== "ugallery" &&
              moblet !== "umap" &&
              moblet !== "usimple" &&
              moblet !== "uframe") {
            newMoblets.push(utils.moblets.bitbucketUrl(moblet, options));
          }
        }
      }
      return uniq(newMoblets);
    },
    download: function(location, url) {
      return function(callback) {
        utils.download(url, location + "/www/bundles/" + utils.fileName(url), function() {
          callback();
        });
      };
    },
    bitbucketUrl: function(moblet, options) {
      var url;

      var envLocation = "norma-bundle-prod";
      if (options.env === "dev") {
        envLocation = "norma-bundle-dev";
      }
      url = "https://s3.amazonaws.com/" + envLocation + "/" + moblet + "/" +
                  moblet + ".bundle.js";

      return url;
    }
  },
  loadTemplate: function(template, callback) {
    fs.readFile(template, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(data);
      }
    });
  }
};
module.exports = utils;
