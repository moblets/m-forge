var express = require('express');
var mustacheExpress = require('mustache-express');
var request = require('request');
var colors = require('colors');
var app = express();

var argv = require('yargs').argv;

var serverUrl = "http://proxy.fabricadeaplicativos.com.br/applications/";

var getAppFlavorAndRender = function(url , req , res, requestParam){

  request(url, function (error, response, body) {
    var appData = null;
    try{
      appData = jsonParser(body);
      console.log(colors.green(new Date() + ' - app '+appData.appName),colors.yellow(' id '+appData.appId),' requested');
      res.render('index-dist', appData);
    }
    catch(e){
      console.log(colors.red(new Date() + " - erro requestin app - " , requestParam));
      console.log(colors.red("error :"), e);
    }

  });

};

var jsonParser = function(appJson){

  var appData = JSON.parse(appJson);
  var info = appData.info || {};
  var style = appData.style || {};

  return {
    appId: info.id || null,
    appName: info.name || null,
    icon:info.icon || null,
    splash:info.splash || null,
    color:style.app[0] || null
    };
};

var webserver = function(envioriment){

    serverUrl = "http://proxy.fabricadeaplicativos.com.br/applications/";

    if(envioriment === 'dev'){
        serverUrl = "http://proxy.dev.fabricadeaplicativos.com.br/applications/";
    }

    app.engine('html', mustacheExpress());
    app.set('view engine', 'html');

    app.set('views', './www');

    app.use('/' , express.static("./www"));
    app.use('/id/i18n/languages/en.json' , express.static("./www/i18n/languages/en.json"));
    app.use('/id/i18n/languages/pt.json' , express.static("./www/i18n/languages/pt.json"));
    app.use('/id/i18n/languages/es.json' , express.static("./www/i18n/languages/es.json"));
    app.use('/lib' , express.static("./www/lib/"));
    app.use('/js' , express.static("./www/js/"));
    app.use('/universo' , express.static("./www/universo/"));
    app.use('/utils' , express.static("./www/utils/"));
    app.use('/moblets' , express.static("./www/moblets/"));
    app.use('/engine' , express.static("./www/engine/"));
    app.use('/views' , express.static("./www/views/"));
    app.use('/css' , express.static("./www/css/"));

    app.get('/:appName', function (req, res) {
        var url = serverUrl + "web_mobile/" + req.params.appName+".json";
        getAppFlavorAndRender(url, req, res, req.params.appName);
    });

    app.get('/id/:appId', function (req, res) {
        var url = serverUrl + req.params.appId+".json";
        getAppFlavorAndRender(url, req, res, req.params.appId);
    });


    app.listen(argv.port || 3000, function () {
      console.log(colors.green('preview server running on port:'),colors.red(3000));
    });

};

module.exports = webserver;
