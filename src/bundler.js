/**
*	Bundler  - bundle the browserify dependece and turn it on a angular module.
*  	developer by: @leualemax in 10/12/2015
**/
var path        = require('path'),
    fs          = require('fs'),
    gulp        = require('gulp'),
    browserify  = require('browserify'),
    colors      = require('colors'),
    gutil       = require('gulp-util'),
    brfs        = require('brfs'),
    gulpSize    = require('gulp-size'),
    gulpHeader  = require('gulp-header'),
    ngAnnotate = require('gulp-ng-annotate'),
    vinylSource = require('vinyl-source-stream'),
    obfuscate = require('gulp-obfuscate'),
    vinylBuffer = require('vinyl-buffer');


var bundle = {

	compile : function(location, title, destination , callback){

		console.log(colors.yellow("compile javascript libs of components: " , title));

		var message = [
		  '/*-----------------------------------------------------',
		  ' | !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! |',
		  ' | This file was generated by Browserify for fabapp.  |',
		  ' | All modifications to it will be lost, mercilessly! |',
		  ' | !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! |',
		  ' -----------------------------------------------------*/\n\n'
		].join('\n');

		var entry = path.join(location, title);
		// One config for each browserify task
		var entryConfig = {
			// Set the entry option so that it browserifies
			// only one file
			entries: [entry],
			// transforms
			transform: [brfs]
		};

		// Create a gulp stream for the single browserify task
		return browserify(entryConfig).bundle()
		    // log errors if they happen
		    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
		    // transform browserify file stream into a vinyl file object stream
		    // and modify the file name
		    .pipe(vinylSource(title + ".bundle.js"))
		    .pipe(vinylBuffer())
		    // calculate size before writing source maps
		    .pipe(gulpSize({
		      title: 'javascript',
		      showFiles: true
		    }))
		    .pipe(gulpHeader(message))
            // .pipe(ngAnnotate({add: true}))
            // .pipe(obfuscate())
		    .pipe(gulp.dest(destination))
            .on('end', function(){
                if(typeof callback === 'function'){
                    callback();
                }
            });

	}

};

module.exports = bundle;
