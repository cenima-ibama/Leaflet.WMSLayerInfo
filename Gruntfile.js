module.exports = function (grunt) {
    var banner = '/*! Version: <%= pkg.version %>\nDate: <%= grunt.template.today("yyyy-mm-dd") %> */\n';

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: banner,
                preserveComments: 'some',
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/Leaflet.WMSLayerInfo.min.js': 'src/Leaflet.WMSLayerInfo.js'
                }
            }
        },

        bump: {
            options: {
                files: ['bower.json', 'package.json'],
                commitFiles: ['bower.json', 'commit.json'],
                push: false
            }
        }
    });

    grunt.registerTask('default', ['uglify']);
};
