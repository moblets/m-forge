/**
*	 webserver  - webserver in express for base ionic project
*  	developer by: @leualemax in 03/05/2016
**/
/* eslint no-restricted-modules: [0, "colors"] */
var express = require('express');
var mustacheExpress = require('mustache-express');
var request = require('request');
var awesome = require('awesome-logs');
var app = express();
var uniq = require('lodash.uniq');

var utils = {
  loadConfig: function(location, env, callback) {
    var config = location + "/env." + env + ".json";
    require('fs').readFile(config, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(JSON.parse(data).API_URL);
      }
    });
  },
  getNewMobletsList: function(appJson, env) {
    var pages = appJson.pages;
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
          newMoblets.push(utils.bitbucketUrl(moblet, env));
        }
      }
    }
    console.log(uniq(newMoblets));
    return uniq(newMoblets);
  },
  bitbucketUrl: function(moblet, env) {
    var envLocation = "norma-bundle-prod";
    if (env === "dev") {
      envLocation = "norma-bundle-dev";
    }
    return "https://s3.amazonaws.com/" + envLocation + "/" + moblet + "/" +
            moblet + ".bundle.js";
  },
  jsonParser: function(appJson, target, env) {
    var appData = JSON.parse(appJson);
    var info = appData.info || {};
    var style = appData.style || {};
    var newMoblets = utils.getNewMobletsList(appData, env);
    appData.google_analytics_id_web = appData.google_analytics_id_web ||
                                      "UA-30056146-11";
    appData.google_analytics_id_native = appData.google_analytics_id_native ||
                                      "UA-30056146-7";
    var analyticsKey = (target === "web") ? appData.google_analytics_id_web :
                                             appData.google_analytics_id_native;
    return {
      moblets: newMoblets || null,
      pushImage: info.push_image || info.icon || null,
      appAnalytics: analyticsKey,
      appId: info.id || null,
      appName: info.name || null,
      icon: info.icon || null,
      splash: info.splash || null,
      color: style.app[0] || null
    };
  },
  requestApp: function(url, appId, target, env, callback) {
    awesome.info("requestiong app: " + appId);
    request(url, function(error, response, body) {
      try {
        var bodyJson = JSON.parse(body);
        var appData = null;
        if (error || bodyJson.error) {
          awesome.row();
          awesome.error("erro requestin app " + appId);
          awesome.error(error || bodyJson.error.code);
          awesome.error(error || bodyJson.error.message);
          awesome.row();
        } else {
          appData = utils.jsonParser(body, target, env);
          awesome.info("app: " + appData.appName + " - " +
                          appData.appId + " requested");
          callback(appData);
        }
      } catch (e) {
        console.log(e);
      }
    });
  },
  requestAppAndRender: function(url, rev, req, res, requestParam, target, env) {
    utils.requestApp(url, requestParam, target, env, function(appData) {
      if (rev) {
        res.render('index-rev', appData);
      } else {
        res.render('index', appData);
      }
    });
  }
};

var webserver = function(location, port, env, rev, target) {
  utils.loadConfig(location, env, function(config) {
    app.engine('html', mustacheExpress());
    app.set('view engine', 'html');
    app.set('views', location + '/www');
    /*
     *  TODO : ORGANIZE STATICS OF PROJECT
     */
    app.use('/', express.static(location + "/www"));
    app.use('/id/i18n/languages/en.json',
      express.static(location + "/www/i18n/languages/en.json"));
    app.use('/id/i18n/languages/pt.json',
      express.static(location + "/www/i18n/languages/pt.json"));
    app.use('/id/i18n/languages/es.json',
    express.static(location + "/www/i18n/languages/es.json"));
    app.use('/lib', express.static(location + "/www/lib/"));
    app.use('/js', express.static(location + "/www/js/"));
    app.use('/universo', express.static(location + "/www/universo/"));
    app.use('/utils', express.static(location + "/www/utils/"));
    app.use('/moblets', express.static(location + "/www/moblets/"));
    app.use('/engine', express.static(location + "/www/engine/"));
    app.use('/views', express.static(location + "/www/views/"));
    app.use('/css', express.static(location + "/www/css/"));
    // ROUTES

    app.get('/:appName', function(req, res) {
      var url = config + "web_mobile/" + req.params.appName + ".json";
      utils.requestAppAndRender(url, rev, req, res, req.params.appName, target,
         env);
    });
    app.get('/id/:appId', function(req, res) {
      var url = config + req.params.appId + ".json";
      var qs = req.url.split("?")[1];
      utils.requestAppAndRender(url + "?" + qs, rev, req, res,
        req.params.appId, target, env);
    });
    app.listen(port || 3000, function() {
      awesome.success('preview server running on port: ' + (port || 3000));
      awesome.row();
    });
  });
};

module.exports = {
  server: webserver,
  utils: utils
};
