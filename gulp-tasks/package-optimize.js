/**
 * Optimize all files, move to a build folder, and inject them into the new index.html
 */
module.exports = function (gulp, plugins, config, args, browserSync) {
    'use strict';

    var log = require('./util/log');
    var inject = require('./util/inject')(gulp, plugins);
    var gulpif = require('gulp-if');
    var print = require('gulp-print');

    var doUglify = args.uglify ? args.uglify : false;

    return function() {
        log('Optimizing the js, css, and html [uglify: ' + doUglify + ']');

        // We update the path so it is relative to src/client/[xxx.module]/index.html
        //var assets = plugins.useref.assets({
        //    searchPath: './src/client/' + config.app.module + '.module',
        //    transformPath:function(filePath) {
        //        var f = filePath.replace(config.app.module + '.module/','');
        //        f = f.replace('/lib','../../../lib');
        //        return f;
        //    }
        //});

        var assets = plugins.useref.assets({searchPath: './'});

        // Filters are named for the gulp-useref path
        var cssFilter   = plugins.filter('**/*.css', {restore: true});
        var jsAppFilter = plugins.filter('**/' + config.path.optimized.app, {restore: true});
        var jslibFilter = plugins.filter('**/' + config.path.optimized.lib, {restore: true});

        var templateCache = config.path.temp + config.path.templateCache.file;

        var myPipe = gulp
            .src(config.path.index)
            .pipe(plugins.plumber())
            .pipe(inject(templateCache, 'templates'))
            .pipe(assets) // Gather all assets from the html with useref
            // Get the css
            .pipe(cssFilter)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.cssnano())
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(cssFilter.restore())
            // Get the custom javascript
            .pipe(jsAppFilter)
            .pipe(plugins.ngAnnotate({add: true}))
            .pipe(gulpif(doUglify, plugins.uglify()))
            //.pipe(getHeader())
            .pipe(jsAppFilter.restore())
            // Get the vendor javascript
            .pipe(jslibFilter)
            .pipe(gulpif(doUglify, plugins.uglify())) // another option is to override wiredep to use min files
            .pipe(jslibFilter.restore())
            // Take inventory of the file names for future rev numbers
            .pipe(plugins.rev())
            // Apply the concat and file replacement with useref
            .pipe(assets.restore())
            .pipe(plugins.useref())
            .pipe(print())

            // Replace the file names in the html with rev numbers
            .pipe(plugins.revReplace())
            .pipe(gulp.dest(config.path.build))
            .on('end', function() {
                gulp.src(config.path.build + 'index.html')
                .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments:true, minifyCSS:true, minifyJS:true}))
                .pipe(gulp.dest(config.path.build));

                if (typeof browserSync !== 'undefined') {
                    browserSync.reload();
                }
            });
        return myPipe;
    };
};

// .on('end',function() {
//     require('./config-constants')(gulp, plugins, config, args)('js/**/*.js', 'js');
// });
