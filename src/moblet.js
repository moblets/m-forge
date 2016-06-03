
/**
 *	Moblet  - functions to manipulate, build and storage moblets
 *  	developer by: @leualemax in 10/12/2015
 **/
/* eslint no-restricted-modules: ["error", "fs", "cluster"]  */
var transformTools = require('browserify-transform-tools');
var path = require('path');
var fs = require('fs');
var _eval = require('eval');

var options = {
  excludeExtensions: [".json"]
};

module.exports = transformTools.makeStringTransform("mobletfy", options,
  function(content, transformOptions, done) {
    var file = transformOptions.file;


    var mobletTemplatePath = path.join(__dirname, "./templates/moblet.js");
    var mobletTemplate = fs.readFileSync(mobletTemplatePath, 'utf8').toString();

    if (!transformOptions.config) {
      return done(new Error("Could not find unbluify configuration."));
    }
    try {
      var moblet = _eval(content);
      mobletTemplate =
                mobletTemplate.replace(/<%moblet-title%>/ig, moblet.title);
      mobletTemplate =
                mobletTemplate.replace(/<%moblet-style%>/ig, moblet.style);
      // console.log(moblet.controller.toString());
      mobletTemplate = mobletTemplate.replace(/<%moblet-controller%>/ig,
                                              moblet.controller.toString());
      mobletTemplate = mobletTemplate.replace(/<%moblet-link%>/ig,
                                              moblet.link.toString());
      mobletTemplate = mobletTemplate.replace(/<%moblet-template%>/ig,
                                              moblet.template);
      var langs = moblet.i18n;
      var stringLangs = "";
      for (var lang in langs) {
        stringLangs += "langs['" + lang +
        "'] = JSON.parse(fs.readFileSync(path.join(__dirname, '" +
         langs[lang] + "'), 'utf8')); \n";
      }
      mobletTemplate = mobletTemplate.replace(/<%moblet-langs%>/ig, stringLangs);
      return done(null, mobletTemplate);
    } catch (e) {
      // console.log("deu ruim", e);
      return done(null, content);
    }
  });
