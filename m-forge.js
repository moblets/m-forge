/**
 *	mForge
 *  	developer by: @leualemax in 2/5/2016
 **/
/* eslint no-restricted-modules: [ "error", "fs", "cluster"]  */
var bundler = require('./src/bundler.js');
var proprieties = require('./src/proprieties.js');
var webserver = require('./src/webserver.js');
var develop = require('./src/develop.js');
var moblet = require('./src/moblet.js');
var utils = require('./src/utils.js');

/**
 * mForge Commands
 */
var mForge = {
  bundler: bundler,
  moblet: moblet,
  proprieties: proprieties,
  webserver: webserver,
  develop: develop,
  utils: utils
};

module.exports = mForge;
