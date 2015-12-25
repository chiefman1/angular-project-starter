'use strict';
module.exports = function() {

    var config = {};

    function getConfig(file) {
        config = require('./gulp-tasks/config/' + file)(config);
    }

    getConfig('app.config');
    getConfig('path.config');
    getConfig('wiredep.config');
    getConfig('test.config');
    getConfig('dist.config');
    getConfig('env.config');
    getConfig('server.config');

    return config;

};
