/**
 *	mForge
 *  	developer by: @leualemax in 2/5/2016
 **/
/* eslint no-restricted-modules: [ "error", "fs", "cluster"]  */
var bundler = require('./src/bundler.js');
var proprieties = require('./src/proprieties.js');
var webserver = require('./src/webserver.js');
var develop = require('./src/develop.js');

/**
 * mForge Commands
 */
var mForge = {
  bundler: bundler,
  proprieties: proprieties,
  webserver: webserver,
  develop: develop
};

module.exports = mForge;
