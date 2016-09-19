/**
*	 webserver  - webserver in express for base ionic project
*  	developer by: @leualemax in 03/05/2016
**/
/* eslint no-restricted-modules: [0, "colors"] */
var express = require('express');
var mustacheExpress = require('mustache-express');
var awesome = require('awesome-logs');
var app = express();
var utils = require('./utils.js');

var requestAppAndRender = function(location, options, res, name, app) {
  if (typeof name === "undefined") {
    options.appId = app;
  } else {
    options.fromName = true;
    options.name = name;
  }

  utils.appDef(location, options, function(appDef) {
    console.log(appDef.appName);
    if (options.rev) {
      res.render('index-rev', appDef);
    } else {
      res.render('index', appDef);
    }
  });
};
var webserver = function(location, options) {
  app.engine('html', mustacheExpress());
  app.set('view engine', 'html');
  app.set('views', location + '/www');
    /*
     *  TODO : ORGANIZE STATICS OF PROJECT
     */
  app.use('/static', express.static(location + "/www"));
  // app.use('/id/i18n/languages/en.json',
  //     express.static(location + "/www/i18n/languages/en.json"));
  // app.use('/id/i18n/languages/pt.json',
  //     express.static(location + "/www/i18n/languages/pt.json"));
  // app.use('/id/i18n/languages/es.json',
  //   express.static(location + "/www/i18n/languages/es.json"));
  // app.use('/lib', express.static(location + "/www/lib/"));
  // app.use('/js', express.static(location + "/www/js/"));
  // app.use('/universo', express.static(location + "/www/universo/"));
  // app.use('/utils', express.static(location + "/www/utils/"));
  // app.use('/moblets', express.static(location + "/www/moblets/"));
  // app.use('/engine', express.static(location + "/www/engine/"));
  // app.use('/views', express.static(location + "/www/views/"));
  app.use('/favicon.ico', express.static(location + "/www/favicon.ico"));
    // ROUTES

  app.get('/:appName', function(req, res) {
    if (typeof req.params.appName !== "undefined" || req.params.appName !== "0" || req.params.appName !== "favicon.ico") {
      awesome.row();
      awesome.info("req app by appname: " + req.params.appName);
      requestAppAndRender(location, options, res, req.params.appName);
    }
  });
  app.get('/id/:appId', function(req, res) {
    if (typeof req.params.appId !== "undefined" || req.params.appId !== "0" || req.params.appName !== "favicon.ico") {
      awesome.row();
      awesome.info("req app by id: " + req.params.appId);
      requestAppAndRender(location, options, res, undefined, req.params.appId);
    }
  });
  app.listen(options.port || 3000, function() {
    awesome.success('preview server running on port: ' + (options.port || 3000));
    awesome.row();
  });
};

module.exports = {
  server: webserver,
  utils: utils
};
