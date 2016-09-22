/**
*	_proprieties  - changes app id and other proprieties
*  	developer by: @leualemax in 07/12/2015
**/
/* eslint no-restricted-modules: [0, "colors"] */
var awesome = require('awesome-logs');
var htmlreplace = require('gulp-html-replace');
var path = require('path');
var gulp = require('gulp');
var prettify = require('gulp-html-prettify');
var replace = require('gulp-replace');
var fs = require('fs.extra');
var utils = require('./utils.js');

var RGX_APPID = /(.constant\('APP_ID',.[^\)]*\))/i;
var RGX_APPANALYTICS = /(.constant\('APP_ANALYTICS',.[^\)]*\))/i;
var RGX_FACEBOOKAPI = /(.constant\('FACEBOOK_APP_ID',.[^\)]*\))/i;
var RGX_APPURL = /(.constant\('API_URL',.[^\)]*\))/i;
var RGX_NAUVAURL = /(.constant\('NAUVA_URL',.[^\)]*\))/i;

var proprieties = {
  createConstant: function(constant, value, target) {
    var cons = "";
    if (target === "web") {
      cons = ".constant('" + constant + "'," + value + ")";
    } else {
      cons = ".constant('" + constant + "','" + value + "')";
    }
    return cons;
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
  loadTemplates: function(callback) {
    var mobile = path.join(__dirname, '/templates/mobile.html');
    var web = path.join(__dirname, '/templates/web.html');
    var moblets = path.join(__dirname, '/templates/moblets.html');
    var templates = {};
    utils.loadTemplate(mobile, function(mobileTemplate) {
      templates.mobile = mobileTemplate;
      utils.loadTemplate(web, function(webTemplate) {
        templates.web = webTemplate;
        utils.loadTemplate(moblets, function(mobletsTemplate) {
          templates.moblets = mobletsTemplate;
          callback(templates);
        });
      });
    });
  },

  change: {
    envs: function(file, data, callback) {
      var dest = utils.destination(file);
      gulp.src(file)
      .pipe(replace(RGX_APPURL, proprieties.createConstant('API_URL', data.API_URL)))
      .pipe(replace(RGX_NAUVAURL, proprieties.createConstant('NAUVA_URL', data.NAUVA_URL)))
      .pipe(gulp.dest(dest))
      .on("end", callback);
    },
    identifies: function(file, projectPath, data, target, callback) {
      var dest = utils.destination(file);
      gulp.src(file)
      .pipe(replace(RGX_APPID, proprieties.createConstant('APP_ID', data.APP_ID, target)))
      .pipe(replace(RGX_APPANALYTICS, proprieties.createConstant('APP_ANALYTICS', data.APP_ANALYTICS, target)))
      .pipe(replace(RGX_FACEBOOKAPI, proprieties.createConstant('FACEBOOK_APP_ID', data.FACEBOOK_APP_ID, target)))
      .pipe(gulp.dest(dest))
      .on("end", function() {
        try {
          var to = projectPath + '/platforms/android/res/values/facebookconnect.xml';
          fs.copy(projectPath + '/facebookconnect.xml', to, {replace: true}, function(err) {
            if (err) {
              throw err;
            } else {
              callback();
            }
          });
        } catch (e) {

        }
      });
    },
    tags: function(target, file, dev, moblets, callback) {
      var dest = utils.destination(file);
      var templateD = (dev) ? '<script src="bundles/' + dev + '"></script>' : "";
      proprieties.loadTemplates(function(templates) {
        var replaces = {
          dev: templateD,
          moblets: ""
        };

        replaces.moblets = (target === "web") ? templates.moblets : '';

        if (typeof moblets !== "undefined") {
          if (target === "mobile" && moblets.length > 0) {
            for (var i = 0; i < moblets.length; i++) {
              replaces.moblets += "<script src='bundles/" + moblets[i] + "'></script>\n";
            }
          }
        }

        replaces.tags = (target === "web") ? templates.web : templates.mobile;

        gulp.src(file)
        .pipe(htmlreplace(replaces, {
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
    },
    srcs: function(target, file, callback) {
      var REGEX_SRC_WEB = /(src="\/static\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
      var REGEX_SRC_MOBILE = /(src=")(?!\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
      var REGEX_HREF_WEB = /(href="\/static\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
      var REGEX_HREF_MOBILE = /(href=")(?!\/)(?!https:\/\/)(?!http:\/\/)(.*)/ig;
      var dest = utils.destination(file);
      var regSrcFrom;
      var regHrefFrom;
      var regSrcTo;
      var regHrefTo;
      if (target === "web") {
        regSrcFrom = REGEX_SRC_MOBILE;
        regHrefFrom = REGEX_HREF_MOBILE;
        regSrcTo = "src=\"/static/$2";
        regHrefTo = "href=\"/static/$2";
      } else {
        regSrcFrom = REGEX_SRC_WEB;
        regHrefFrom = REGEX_HREF_WEB;
        regSrcTo = "src=\"$2";
        regHrefTo = "href=\"$2";
      }
      return gulp.src(file)
        .pipe(replace(regSrcFrom, regSrcTo))
        .pipe(replace(regHrefFrom, regHrefTo))
        .pipe(gulp.dest(dest))
        .on('end', callback);
    }
  }
};

var _proprieties = {
  actions: proprieties.change,
  change: function(project, options, callback) {
    // show logs
    awesome.row();
    awesome.info("changing app properties:");
    awesome.row();
    console.log("‣ id : " + options.id);
    console.log("‣ target : " + options.target);
    console.log("‣ environment : " + options.env);
    console.log("‣ is revision : " + options.rev);
    awesome.row();
    // get config
    var configPath = project + "/env." + options.env + ".json";
    utils.loadJson(configPath, function(data) {
      var configFile = data;
      var targetAppFile = project + '/www/app.js';
      var targetIndexFile = (options.rev) ? project + '/www/index-rev.html' : project + '/www/index.html';

      var identifies = {
        APP_ID: (options.target === 'web') ? "window.appId" : options.appId,
        APP_ANALYTICS: (options.target === 'web') ? "window.appAnalytics" : options.appAnalytics,
        FACEBOOK_APP_ID: (options.target === 'web') ? "window.facebookAppId" : options.facebookAppId
      };
      proprieties.change.srcs(options.target, targetIndexFile, function() {
        proprieties.change.tags(options.target, targetIndexFile, options.dev, options.moblets, function() {
          proprieties.change.envs(targetAppFile, configFile, function() {
            proprieties.change.identifies(targetAppFile, project, identifies, options.target, function() {
              if (typeof callback === "function") {
                callback();
              }
            });
          });
        });
      });
    });
  }
};

module.exports = _proprieties;
