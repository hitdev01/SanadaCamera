var nodePath = require('path');
var fs = require('fs-extra');
var readdirp = require('readdirp');
var Q = require('q');

var build = (function() {
  var BASE_DIR = nodePath.join(__dirname, '..', '..');
  var OUTPUT_DIR = nodePath.join(BASE_DIR, 'dist');
  var ANDROID_DIR = nodePath.join(BASE_DIR, 'src', 'android');

  function build() {
  }

  var clean = function() {
    var d = Q.defer();
    console.log('clean');
    fs.emptyDirSync(OUTPUT_DIR);
    d.resolve();
  };

  var copyAndroid = function() {
    var d = Q.defer();
    console.log('copy Android Src');
    var srcDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'java');
    var layoutDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'layout');
    var drawableDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'drawable');
    var valuesDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'values');
    var outDir = nodePath.join(OUTPUT_DIR, 'src', 'android');
    // create android dir
    fs.ensureDirSync(outDir);
    // copy android source
    readdirp({ root: srcDir, fileFilter: '*.java' })
    .on('data', function (entry) {
      if (!entry.name.match(/MainActivity\.java$/)) {
        var destPath = nodePath.join(outDir, entry.name);
        fs.copySync(entry.fullPath, destPath);
      }
    });
    // copy layout
    readdirp({ root: layoutDir, fileFilter: '*.xml' })
    .on('data', function (entry) {
      if (!entry.name.match(/activity_main\.xml$/)) {
        var destPath = nodePath.join(outDir, entry.name);
        fs.copySync(entry.fullPath, destPath);
      }
    });
    // copy drawable
    readdirp({ root: drawableDir, fileFilter: ['*.png', '*.jpg', '*.gif'] })
    .on('data', function (entry) {
      var destPath = nodePath.join(outDir, entry.name);
      fs.copySync(entry.fullPath, destPath);
    });
    // copy values
    // readdirp({ root: valuesDir, fileFilter: ['*.png', '*.jpg', '*.gif'] })
    // .on('data', function (entry) {
    //   let destPath = nodePath.join(outDir, entry.name);
    //   fs.copySync(entry.fullPath, destPath);
    // });

    d.resolve();
  };

  var copyiOS = function() {
    var d = Q.defer();
    console.log('copy iOS Src');


    d.resolve();
  };

  var copyPluginXml = function() {
    var d = Q.defer();
    console.log('copy plugin.xml');
    var templateXml = nodePath.join(BASE_DIR, '.template', 'plugin.xml');
    var destPath = nodePath.join(OUTPUT_DIR, 'plugin.xml');
    fs.copySync(templateXml, destPath);
    d.resolve();
  };

  return {
    all: function() {
      Q.when()
      .then(clean)
      .then(copyAndroid)
      .then(copyiOS)
      .then(copyPluginXml)
      .done();
    },
    clean: function() {
      clean();
    },
    copyAndroid: function() {
      Q.when()
      .then(clean)
      .then(copyAndroid)
      .then(copyPluginXml)
      .done();
    },
    copyiOS: function() {
      Q.when()
      .then(clean)
      .then(copyiOS)
      .then(copyPluginXml)
      .done();
    }
  };
}());
module.exports = build;
