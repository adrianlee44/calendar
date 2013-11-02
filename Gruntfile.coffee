module.exports = (grunt) ->
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    coffee:
      app:
        files:
          "calendar.js": "calendar.coffee"

    connect:
      server:
        options:
          port:      9001
          debug:     true
          hostname:  "*"

    watch:
      options:
        livereload: true
      app:
        files: "calendar.coffee"
        tasks: ["coffee:app"]

    nodeunit:
      all: ["tests/**/*.coffee"]

    grunt.registerTask "dev", [
      "coffee"
      "connect:server"
      "watch"
    ]