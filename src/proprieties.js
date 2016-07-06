/**
*	_proprieties  - changes app id and other proprieties
*  	developer by: @leualemax in 07/12/2015
**/
/* eslint no-restricted-modules: [0, "colors"] */
var awesome = require('awesome-logs');
var htmlreplace = require('gulp-html-replace');
var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var prettify = require('gulp-html-prettify');
var replace = require('gulp-replace');

var RGX_APPID_DIGIT = /(.constant\('APP_ID',.[^\)]*\))/i;
var RGX_APPANALYTICS_DIGIT = /(.constant\('APP_ANALYTICS',.[^\)]*\))/i;
var RGX_APPURL_DIGIT = /(.constant\('API_URL',.[^\)]*\))/i;

var utils = {
  createApiConstant: function(server) {
    return ".constant('API_URL','" + server + "')";
  },
  loadConfig: function(configUrl, callback) {
    require('fs').readFile(configUrl, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(data);
      }
    });
  },
  loadTemplates: function(templateUrl, callback) {
    fs.readFile(templateUrl, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(data);
      }
    });
  },
  /*
   * FOR INDEX.HTML FILE
   */
  changeIndexHtml: function(target, file, dest, dev, callback, mobletsList) {
    utils.replaceSrcs(target, file, dest)
      .on("end", function() {
        utils.replaceTags(target, file, dest, dev, callback, mobletsList);
      });
  },
  replaceTags: function(target, file, dest, dev, callback, mobletsList) {
    var templateWeb;
    var templateMobile;
    var templateD = (dev) ? '<script src="bundles/' + dev + '"></script>' : "";
    utils.loadTemplates(path.join(__dirname, '/templates/mobile.html'),
      function(mobile) {
        templateMobile = mobile;
        utils.loadTemplates(path.join(__dirname, '/templates/web.html'),
          function(web) {
            utils.loadTemplates(path.join(__dirname, '/templates/moblets.html'),
            function(moblets) {
              templateWeb = web;
              var mobletsTo = (target === "web") ? moblets : '';
              if (typeof mobletsList !== "undefined") {
                if (target === "mobile" && mobletsList.length > 0) {
                  for (var i = 0; i < mobletsList.length; i++) {
                    mobletsTo += "<script src='bundles/" + mobletsList[i] +
                    "'></script>\n";
                  }
                }
              }
              var tempTo = (target === "web") ? templateWeb : templateMobile;
              gulp.src(file)
              .pipe(htmlreplace({
                tags: tempTo,
                dev: templateD,
                moblets: mobletsTo
              }, {
                keepBlockTags: true
              }))
              /* eslint camelcase: 0 */
              .pipe(prettify({
                indent_char: ' ',
                indent_size: 2
              }))
              .pipe(gulp.dest(dest))
              .on('end', callback);
            });
          });
      });
  },
  replaceSrcs: function(target, file, dest) {
    var REGEX_SRC_WEB = /(src="\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
    var REGEX_SRC_MOBILE = /(src=")(?!\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
    var REGEX_HREF_WEB = /(href="\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
    var REGEX_HREF_MOBILE = /(href=")(?!\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
    var regSrcFrom;
    var regHrefFrom;
    var regSrcTo;
    var regHrefTo;
    if (target === "web") {
      regSrcFrom = REGEX_SRC_MOBILE;
      regHrefFrom = REGEX_HREF_MOBILE;
      regSrcTo = "src=\"/$2";
      regHrefTo = "href=\"/$2";
    } else {
      regSrcFrom = REGEX_SRC_WEB;
      regHrefFrom = REGEX_HREF_WEB;
      regSrcTo = "src=\"$2";
      regHrefTo = "href=\"$2";
    }
    return gulp.src(file)
      .pipe(replace(regSrcFrom, regSrcTo))
      .pipe(replace(regHrefFrom, regHrefTo))
      .pipe(gulp.dest(dest));
  },
  addDevSrc: function(src, file, dest) {
    var template = (src) ? '<script src="bundles/' + src + '"></script>' : "";
    return gulp.src(file)
      .pipe(htmlreplace({
        dev: template
      }, {
        keepBlockTags: true
      }))
      .pipe(prettify({
        indent_char: ' ',
        indent_size: 2
      }))
      .pipe(gulp.dest(dest));
  },
  /*
   * FOR APP.JS FILE
   */
  changeAppJS: function(env, target, id, file, dest, config, callback) {
    utils.replaceEnvs(env, file, dest, config)
      .on("end", function() {
        utils.replaceIdentifier(target, id, file, dest)
          .on("end", function() {
            if (target === "mobile") {
              callback();
            } else {
              utils.replaceAnalytics(file, dest, target)
                .on("end", function() {
                  callback();
                });
            }
          });
      });
  },
  replaceEnvs: function(env, file, dest, config) {
    var regTo = utils.createApiConstant(config.API_URL);
    return gulp.src(file)
      .pipe(replace(RGX_APPURL_DIGIT, regTo))
      .pipe(gulp.dest(dest));
  },
  replaceAnalytics: function(file, dest, target, analytics) {
    var regTo;
    if (target === "web") {
      regTo = ".constant('APP_ANALYTICS', window.appAnalytics)";
    } else {
      regTo = ".constant('APP_ANALYTICS', '" + analytics + "')";
    }
    return gulp.src(file)
      .pipe(replace(RGX_APPANALYTICS_DIGIT, regTo))
      .pipe(gulp.dest(dest));
  },
  replaceIdentifier: function(target, id, file, dest) {
    var regTo;
    if (target === "web") {
      regTo = ".constant('APP_ID', window.appId)";
    } else {
      regTo = ".constant('APP_ID', '" + id + "')";
    }
    return gulp.src(file)
      .pipe(replace(RGX_APPID_DIGIT, regTo))
      .pipe(gulp.dest(dest));
  }

};

var _proprieties = {
  replaceAnalytics: utils.replaceAnalytics,
  change: function(location, target, env, rev, id, dev, callback, moblets) {
    awesome.row();
    awesome.info("changing app properties:");
    awesome.row();
    console.log("‣ id : " + id);
    console.log("‣ target : " + target);
    console.log("‣ environment : " + env);
    console.log("‣ is revision : " + rev);
    awesome.row();
    var config = location + "/env." + env + ".json";
    utils.loadConfig(config, function(data) {
      var configFile = JSON.parse(data);
      var targetAppFile = location + '/www/app.js';
      var targetIndexFile = (rev) ? location + '/www/index-rev.html' :
        location + '/www/index.html';
      utils.changeIndexHtml(target, targetIndexFile, location + "/www/", dev,
        function() {
          utils.changeAppJS(env, target, id, targetAppFile, location + "/www/",
            configFile, callback);
        }, moblets);
    });
  }
};

module.exports = _proprieties;
