module.exports = (grunt) ->
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    coffee:
      app:
        files:
          "calendar.js": "src/calendar.coffee"

    stylus:
      app:
        options:
          import: ["nib"]
        files:
          "calendar.css": "src/calendar.styl"

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
        files: "src/calendar.coffee"
        tasks: ["coffee:app"]
      css:
        files: "src/calendar.styl"
        tasks: ["stylus:app"]

    nodeunit:
      all: ["tests/**/*.coffee"]

    grunt.registerTask "dev", [
      "coffee"
      "connect:server"
      "watch"
    ]