/*jslint vars: true, nomen: true, devel: false*/
/*global module, $*/

module.exports = function (grunt) {
    "use strict";

    var jsFiles = [
        '*.js',
        'nls/**/*.js',
        'node/**/*.js',
        'src/**/*.js'
    ];

    // Project configuration.
    grunt.initConfig({
        jshint: {
            files: jsFiles
        },
        eslint: {
            src: jsFiles,
            options: {
                configFile: ".eslint.json",
                maxWarnings: 0
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("gruntify-eslint");
    
    //Default task.
    grunt.registerTask('default', ['jshint', 'eslint']);

    // Travis CI task.
    grunt.registerTask('travis', ['jshint', 'eslint']);
};