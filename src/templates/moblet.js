require("./<%moblet-style%>");
var path = require('path');
var fs = require('fs');
/* eslint no-undef: [0]*/



angular.module("uMoblets")
  .config(function($translateProvider) {
    var langs = {};
    <%moblet-langs%>
    for (var lang in langs) {
      $translateProvider.translations(lang, langs[lang]);
    }
  })
  .directive('<%moblet-title%>', function($mInjector) {
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, '<%moblet-template%>'), 'utf8'),
      link: <%moblet-link%>,
      controller: <%moblet-controller%>
    };
  });
