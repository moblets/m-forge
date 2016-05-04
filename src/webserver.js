/**
*	 webserver  - webserver in express for base ionic project
*  	developer by: @leualemax in 03/05/2016
**/
/* eslint no-restricted-modules: [0, "colors"] */
var express = require('express');
var mustacheExpress = require('mustache-express');
var request = require('request');
var colors = require('colors');
var app = express();

var utils = {
  loadConfig: function(location, env, callback) {
    var config = location + "/env." + env + ".json";
    require('fs').readFile(config, 'utf8', function(err, data) {
      if (err) {
        console.log(err);
      } else {
        callback(JSON.parse(data).API_URL);
      }
    });
  },
  jsonParser: function(appJson) {
    var appData = JSON.parse(appJson);
    var info = appData.info || {};
    var style = appData.style || {};
    return {
      appId: info.id || null,
      appName: info.name || null,
      icon: info.icon || null,
      splash: info.splash || null,
      color: style.app[0] || null
    };
  },
  requestAppAndRender: function(url, rev, req, res, requestParam) {
    request(url, function(error, response, body) {
      var appData = null;
      try {
        appData = utils.jsonParser(body);
        console.log(
          colors.green(new Date() + ' - app ' + appData.appName),
          colors.yellow(' id ' + appData.appId), ' requested');
        if (rev) {
          res.render('index-rev', appData);
        } else {
          res.render('index', appData);
        }
      } catch (e) {
        console.log(colors.red(new Date() + " - erro requestin app - ",
                    requestParam));
        console.log(colors.red("error :"), e);
      }
    });
  }
};

var webserver = function(location, port, env, rev) {
  console.log(location + "/www");
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
      utils.requestAppAndRender(url, rev, req, res, req.params.appName);
    });
    app.get('/id/:appId', function(req, res) {
      var url = config + req.params.appId + ".json";
      utils.requestAppAndRender(url, rev, req, res, req.params.appId);
    });
    app.listen(port || 3000, function() {
      console.log(colors.green('preview server running on port:'),
                  colors.red(port || 3000));
    });
  });
};

module.exports = webserver;
