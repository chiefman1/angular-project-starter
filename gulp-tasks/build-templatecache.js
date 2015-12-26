/**
 * Create pluginstemplateCache from the html templates
 */
module.exports = function (gulp, plugins, config, args, browserSync) {
    'use strict';

    var log = require('./util/log');
    var gulpif = require('gulp-if');

    return function() {
         log('Creating an AngularJS pluginstemplateCache');

         var myPipe =  gulp
             .src(config.path.htmltemplates)
             .pipe(plugins.if(args.verbose, plugins.bytediff.start()))
             .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments:true}))
             .pipe(plugins.if(args.verbose, plugins.bytediff.stop(bytediffFormatter)))
             .pipe(plugins.angularTemplatecache(
                 config.path.templateCache.file,
                 config.path.templateCache.options
             ))
             .pipe(gulp.dest(config.path.temp));

         if (typeof browserSync !== 'undefined') {
             myPipe.on('end', browserSync.reload);
         }

         return myPipe;
     };

    /**
     * Formatter for bytediff to display the size changes after processing
     * @param  {Object} data - byte data
     * @return {String}      Difference in bytes, formatted
     */
    function bytediffFormatter(data) {
         var difference = data.savings > 0 ? ' smaller.' : ' larger.';
         return data.fileName + ' went from ' +
             (data.startSize / 1000).toFixed(2) + ' kB to ' +
             (data.endSize / 1000).toFixed(2) + ' kB and is ' +
             formatPercent(1 - data.percent, 2) + '%' + difference;
     }

    /**
     * Format a number as a percentage
     * @param  {Number} num       Number to format as a percent
     * @param  {Number} precision Precision of the decimal
     * @return {String}           Formatted perentage
     */
    function formatPercent(num, precision) {
         return (num * 100).toFixed(precision);
     }
};
