var fs = require('fs');
var awesome = require('awesome-logs');
var request = require('request');
var uniq = require('lodash.uniq');

var utils = {
  destination: function(file) {
    var pathSplit = file.split("/");
    var fileName = pathSplit[pathSplit.length - 1];
    return file.replace(fileName, "");
  },
  config: function(location, options, callback) {
    var config = location + "/env." + options.env + ".json";
    require('fs').readFile(config, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(JSON.parse(data));
      }
    });
  },
  appDef: function(location, options, callback) {
    utils.config(location, options, function(config) {
      var url;
      if (options.fromName) {
        url = config.API_URL + "web_mobile/" + options.name + ".json";
      } else {
        url = config.API_URL + options.app + ".json";
      }

      request(url, function(error, response, body) {
        try {
          var bodyJson = JSON.parse(body);
          if (error || bodyJson.error) {
            awesome.row();
            awesome.error("erro requestin app " + options.app);
            awesome.error(error || bodyJson.error.code);
            awesome.error(error || bodyJson.error.message);
            awesome.row();
          } else {
            var info = bodyJson.info || {};
            var style = bodyJson.style || {};
            var newMoblets = utils.moblets.list(bodyJson, options.env);
            bodyJson.google_analytics_id_web = bodyJson.google_analytics_id_web || "UA-30056146-11";
            bodyJson.google_analytics_id_native = bodyJson.google_analytics_id_native || "UA-30056146-7";
            var analyticsKey = (options.target === "web") ? bodyJson.google_analytics_id_web :
                                                            bodyJson.google_analytics_id_native;

            var response = {
              moblets: newMoblets || null,
              pushImage: info.push_image || info.icon || null,
              appAnalytics: analyticsKey,
              facebookAppId: info.facebookId,
              facebookAppName: info.facebookName,
              appId: info.id || null,
              appName: info.name || null,
              icon: info.icon || null,
              splash: info.splash || null,
              color: style.app[0] || null
            };
            callback(response);
          }
        } catch (e) {
          console.log(e);
        }
      });
    });
  },
  moblets: {
    list: function(appDef, env) {
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
            newMoblets.push(utils.moblets.bitbucketUrl(moblet, env));
          }
        }
      }
      return uniq(newMoblets);
    },
    bitbucketUrl: function(moblet, env) {
      var envLocation = "norma-bundle-prod";
      if (env === "dev") {
        envLocation = "norma-bundle-dev";
      }
      return "https://s3.amazonaws.com/" + envLocation + "/" + moblet + "/" +
                moblet + ".bundle.js";
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
