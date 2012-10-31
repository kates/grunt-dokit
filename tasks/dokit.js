/*
 * grunt-dokit
 * https://github.com/kates/grunt-dokit
 *
 * Copyright (c) 2012 kates
 * Licensed under the MIT license.
 */

var fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf'),
  docit = require('docit'),
  config = require("nconf"),
  markdown = require('github-flavored-markdown');

module.exports = function(grunt) {
  var RE_PATH = /(.*)?\/.*?\.js$/,
    RE_EXT = /\.js$/;

  var Settings = function(settings) {
    var settings = settings;
    this.get = function(prop) {
      return settings[prop];
    };

    this.set = function(prop, value) {
      settings[prop] = value;
    }
  };

  var findIndex = function(fPath) {
    var paths = fPath.split("/");
    paths.pop();
    var up = [];
    for (var i = 0; i < paths.length - 1; i++) {
      up.push("..");
    }
    return up.join(path.sep);
  }

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('dokit', 'Your task description goes here.', function() {
    var files = grunt.file.expandFiles(this.file.src),
      dest = this.file.dest,
      options = this.data.options || {},
      title = options.title || 'API',
      format = options.format || 'html',
      assetsPath = path.resolve(__dirname, '..', 'assets'),
      tpl = fs.readFileSync(path.resolve(assetsPath, format === 'html' ? 'html.tpl' : 'md.tpl'), 'utf-8'),
      pageTpl = fs.readFileSync(path.resolve(assetsPath, 'page.tpl'), 'utf-8'),
      indexTpl = fs.readFileSync(path.resolve(assetsPath, 'index.tpl'), 'utf-8'),
      cssFile = fs.readFileSync(path.resolve(assetsPath, 'bootstrap.css'), 'utf-8');

      console.log(this.file.codeHandler);
    // cleanup
    rimraf.sync(dest);
    var toc = [];

    grunt.utils.async.forEach(files, function(file, done) {
      var str = grunt.file.read(file, 'utf-8').toString(),
        filePath = dest + path.sep  + file.replace(RE_EXT, '.' + format),
        indexPath = findIndex(filePath),
        cssFilePath = indexPath + path.sep + 'bootstrap.css',
        indexFilePath = indexPath + path.sep + 'index.html';

      grunt.helper('dokit', file, str, options, function(data, funcs) {
        if (/md|html/.test(format)) {
          var out = grunt.template.process(tpl,{
            title: title,
            body: data,
            file: file,
            indexFile: indexFilePath,
            cssFile: cssFilePath
          });
          if (format === "html") {
            out = grunt.template.process(pageTpl, {
              content: markdown.parse(out),
              title: title,
              cssFile: cssFilePath
            });

            toc.push({
              path: file.replace(RE_EXT, "." + format),
              target: file,
              funcs: funcs || []
            });
          }
          grunt.file.write(filePath, out);
        } else {
          grunt.file.write(filePath, data);
        }
        done(null);
      });
    });
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('dokit', function(file, str, options, callback) {
    var settings = new Settings(docit.DEFAULT_SETTINGS);
    settings.set('includeHRBeforeMethod', 'false');
    settings.set('includeHRAfterMethod', 'true');
    
    var comments = docit.getComments(str, settings, file);
    var md = docit.getMarkdown(comments, file);
    callback(md);
  });

};
