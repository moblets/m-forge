/**
*	Dister  - prepares the files to distribution
*  	developer by: @leualemax in 27/04/2016
**/
var gulp = require('gulp'),
    stripDebug = require('gulp-strip-debug'),
    strip = require('gulp-strip-comments'),
    rev = require('gulp-rev'),
    rename = require("gulp-rename"),
    revReplace = require('gulp-rev-replace'),
    minify = require('gulp-minify');


var dister = {

	js : function(location, destination){

        return gulp.src(location)
    		.pipe(stripDebug())
            .pipe(strip())
            .pipe(minify({noSource:true, mangle:false,  ext:{min:'.js'}}))
            .pipe(rev())
            .pipe(gulp.dest(destination))
            .pipe(rev.manifest())
            .pipe(gulp.dest(destination))
            .on('end', function(){dister.replace(destination);});

    },
    replace: function(destination){

        var manifest = gulp.src(destination + "rev-manifest.json");

         return gulp.src("./www/index.html")
           .pipe(revReplace({manifest: manifest}))
           .pipe(rename('index-dist.html'))
           .pipe(gulp.dest("./www/"));


    }



};

module.exports = dister;
