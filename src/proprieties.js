/**
*	_proprieties  - changes app id and other proprieties
*  	developer by: @leualemax in 07/12/2015
**/

var colors = require('colors');
var gulp   = require('gulp');
var replace  = require('gulp-replace');

var RGX_APPID_DIGIT = /(.constant\('APP_ID',.[^\)]*\))/i;




var _webOnly = [
	"<script type=\"text/javascript\"> window.appId = {{appId}}; </script>\n",
	"<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n",
    "<meta name=\"apple-mobile-web-app-title\" content=\"{{appName}}\">\n",
	"<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />\n",
    "<link rel=\"apple-touch-icon\" href=\"{{icon}}\">\n",
	"<link rel=\"icon\" type=\"image/png\" href=\"{{icon}}\" />\n",
	"<link rel=\"apple-touch-startup-image\" href=\"{{splash}}\">\n",
	"<script type=\"text/javascript\">document.addEventListener(\"DOMContentLoaded\",  function(){  var elemDiv = document.createElement('div');elemDiv.id = \"u-web-splash\";elemDiv.style.cssText = \"background-image:url({{{splash}}});\";elemDiv.innerHTML = '';window.document.body.insertBefore(elemDiv, window.document.body.firstChild); } , false);</script>\n",
    "<title>{{appName}}</title>\n"
].join("");

var _mobileOnly = "<script src=\"cordova.js\"></script><title>{{$root.appName}}</title>";


var _enviromentDev = ".constant('API_URL','http://proxy.dev.fabricadeaplicativos.com.br/applications/')";
var _enviromentProduction = ".constant('API_URL','http://proxy.fabricadeaplicativos.com.br/applications/')";

var _proprieties = {

	change:function(target , appId , callback , envioriment){

		var newIdentifier = "";
		var templateRegex  = null;
		var templateReplace = "";

		if(target === 'web'){
			console.log(colors.yellow("change app for web"));
		    newIdentifier =  ".constant('APP_ID', window.appId)";
		    templateRegex  = /templateUrl: '/ig;
		    templateReplace = "templateUrl: '/";
			_proprieties.webfier(envioriment);
		}
		else if(typeof appId !== "undefined" && target === 'mobile'){
			console.log(colors.yellow("change app for mobile with id: ") , appId);
			newIdentifier =  ".constant('APP_ID', '"+appId+"')";
			templateRegex  = /templateUrl: '\//ig;
		    templateReplace = "templateUrl: '";
			_proprieties.mobilefier(envioriment);
		}

		if(newIdentifier.trim() !== ""){
		    gulp.src('./www/app.js')
		        .pipe(replace(RGX_APPID_DIGIT,newIdentifier))
		        .pipe(replace(templateRegex,templateReplace))
		        .pipe(replace( /templateUrl: '\/\//ig,templateReplace))
		        .pipe(gulp.dest('./www/'))
				.on("end", function () {

					if(envioriment === "dev"){
						gulp.src('./www/app.js')
							.pipe(replace(_enviromentProduction , _enviromentDev))
							.pipe(gulp.dest('./www/'));

					} else {
						gulp.src('./www/app.js')
						    .pipe(replace(_enviromentDev,_enviromentProduction))
					        .pipe(gulp.dest('./www/'));

					}

					if(typeof callback === "function"){
						callback();
					}
				});
		 }

	},
	webfier:function(){
		console.log("set web as the default");
		var tags = ["src=\"l" ,"src=\"b","src=\"a","src=\"c","href=\"l","href=\"c"];
		var regexs = [];
		var replaces = [];
		for(var i = 0; i < tags.length ; i++){
			regexs.push(RegExp(tags[i] , "ig"));
			replaces.push(tags[i].split("\"")[0]+"\"/"+tags[i].split("\"")[1]);
		}



	    gulp.src('./www/index.html')
		    .pipe(replace(_mobileOnly,_webOnly))
	        .pipe(replace(regexs[0],replaces[0]))
			.pipe(replace(regexs[1],replaces[1]))
			.pipe(replace(regexs[2],replaces[2]))
			.pipe(replace(regexs[3],replaces[3]))
			.pipe(replace(regexs[4],replaces[4]))
			.pipe(replace(regexs[5],replaces[5]))
	        .pipe(gulp.dest('./www/'));

			gulp.src('./www/index-dist.html')
			    .pipe(replace(_mobileOnly,_webOnly))
		        .pipe(replace(regexs[0],replaces[0]))
				.pipe(replace(regexs[1],replaces[1]))
				.pipe(replace(regexs[2],replaces[2]))
				.pipe(replace(regexs[3],replaces[3]))
				.pipe(replace(regexs[4],replaces[4]))
				.pipe(replace(regexs[5],replaces[5]))
		        .pipe(gulp.dest('./www/'));

	},
	mobilefier:function(){
		console.log("set mobile as the default");
		var tags = ["src=\"\/" ,"href=\"\/"];
		var regexs = [];
		var replaces = [];
		for(var i = 0; i < tags.length ; i++){
			regexs.push(RegExp(tags[i] , "ig"));
			replaces.push(tags[i].split("\"")[0]+"\"");
		}

	    gulp.src('./www/index.html')
			.pipe(replace(_webOnly ,_mobileOnly))
	        .pipe(replace(regexs[0],replaces[0]))
			.pipe(replace(regexs[1],replaces[1]))
	        .pipe(gulp.dest('./www/'));

		gulp.src('./www/index-dist.html')
			.pipe(replace(_webOnly ,_mobileOnly))
	        .pipe(replace(regexs[0],replaces[0]))
			.pipe(replace(regexs[1],replaces[1]))
	        .pipe(gulp.dest('./www/'));

	}



};

module.exports = _proprieties;
