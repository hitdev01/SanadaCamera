var nodePath = require('path');
var fs = require('fs-extra');
var readdirp = require('readdirp');
var Q = require('q');
var ejs = require('ejs');
var xml2js = require('xml2js');
var pkg = require('../../package.json');

var build = (function() {
  var BASE_DIR = nodePath.join(__dirname, '..', '..');
  var OUTPUT_DIR = nodePath.join(BASE_DIR, 'dist');
  var ANDROID_DIR = nodePath.join(BASE_DIR, 'src', 'android');
  var ANDROID_SRC_DIR = nodePath.join(BASE_DIR, 'src', 'android', 'app', 'src', 'main', 'java');
  var PLUGINS_DIR = nodePath.join(BASE_DIR, 'src', 'www');

  function build() {
  }

  var clean = function() {
    var d = Q.defer();
    console.log('clean');
    fs.emptyDirSync(OUTPUT_DIR);
    d.resolve();
    return d.promise;
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
    return d.promise;
  };

  var copyiOS = function() {
    var d = Q.defer();
    console.log('copy iOS Src');


    d.resolve();
    return d.promise;
  };

  var copyPluginJs = function() {
    var d = Q.defer();
    console.log('copy cordova plugin JavaScript file');
    var outDir = nodePath.join(OUTPUT_DIR, 'www');
    readdirp({ root: PLUGINS_DIR, fileFilter: '*.js' })
    .on('data', function (entry) {
      var destPath = nodePath.join(outDir, entry.name);
      fs.copySync(entry.fullPath, destPath);
      d.resolve();
    });
    return d.promise;
  };


  var createPluginXml = function() {
    var d = Q.defer();
    console.log('create plugin.xml');
    var templateXml = nodePath.join(BASE_DIR, '.template', 'plugin.ejs');
    var destPath = nodePath.join(OUTPUT_DIR, 'plugin.xml');

    Q.when({COMMON: {}, ANDROID: {}})
    .then(getCommonConf)
    .then(getAndroidConf)
    .done(function(data) {
      var orgxml = fs.readFileSync(templateXml, 'utf8');
      var xml = ejs.render(orgxml, {COMMON: data.COMMON, ANDROID: data.ANDROID, IOS: data.IOS});
      fs.writeFileSync(destPath, xml);
      d.resolve();
    });
    return d.promise;
  };

  var getCommonConf = function(data) {
    var d = Q.defer();
    data.COMMON = {
      ID: pkg.name,
      VERSION: pkg.version,
      DESCRIPTION: (pkg.description) ? pkg.description : '',
      LICENSE: (pkg.license) ? pkg.license : 'ISC',
      KEYWORDS: (pkg.keywords) ? pkg.keywords.join(',') : 'cordova',
      NAME: pkg.name,
      JS_MODULE: {}
    };

    readdirp({ root: PLUGINS_DIR, fileFilter: '*.js' })
    .on('data', function (entry) {
      data.COMMON.JS_MODULE = { path: 'www/' + entry.name, name: entry.name.replace(/\.js$/i, ''), target: 'navigator.' + entry.name.replace(/\.js$/i, '') };
      d.resolve(data);
    });
    return d.promise;
  };

  var getAndroidConf = function(data) {
    var d = Q.defer();
    data.ANDROID = {
      NAME: '',
      ANDROID_PACKAGE: '',
      USERS_FEATURES: [],
      USERS_PERMISSIONS: [],
      SOURCE_FILES: [{src: '', targetdir: ''}]
    };

    var getMainClass = function(data) {
      var d = Q.defer();

      readdirp({ root: ANDROID_SRC_DIR, fileFilter: '*Plugin.java' })
      .on('data', function (entry) {
        data.ANDROID.NAME = entry.name.replace(/\.java$/i, '');
        data.ANDROID.ANDROID_PACKAGE = entry.fullPath.replace(ANDROID_SRC_DIR, '').replace(/\\/g, '/').replace(/\//g, '.').replace(/^\./, '').replace(/\.java$/i, '');
        d.resolve(data);
      });
      return d.promise;
    };

    var getAndroidManifest = function(data) {
      var d = Q.defer();
      var manifestpath = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'AndroidManifest.xml');
      var manifestdata = fs.readFileSync(manifestpath, 'utf8');
      xml2js.parseString(manifestdata, function (err, result) {
        if (result.manifest['uses-feature']) {
          data.ANDROID.USERS_FEATURES = [];
          for (var i = 0; i < result.manifest['uses-feature'].length; i++) {
            var userfeature = result.manifest['uses-feature'][i];
            data.ANDROID.USERS_FEATURES.push({name: userfeature.$['android:name']});
          }
        }
        if (result.manifest['uses-permission']) {
          data.ANDROID.USERS_PERMISSIONS = [];
          for (var i = 0; i < result.manifest['uses-permission'].length; i++) {
            var userpermission = result.manifest['uses-permission'][i];
            data.ANDROID.USERS_PERMISSIONS.push({name: userpermission.$['android:name']});
          }
        }

        d.resolve(data);
      });

      return d.promise;
    };

    var getSouceFiles = function(data) {
      var d = Q.defer();
      var layoutDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'layout');
      var drawableDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'drawable');
      var valuesDir = nodePath.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'values');
      var outDir = nodePath.join(OUTPUT_DIR, 'src', 'android');

      data.ANDROID.SOURCE_FILES = [];

      // java source
      var files = [];
      getFileSync(ANDROID_SRC_DIR, files);
      for (var i = 0; i < files.length; i++) {
        var filepath = files[i];
        var file = nodePath.basename(filepath);
        if (!file.match(/MainActivity\.java$/)) {
          var src = 'src/android/' + file;
          var targetdir = 'src' + filepath.replace(ANDROID_SRC_DIR, '').replace(file, '').replace(/\\/g, '/').replace(/\/$/, '');
          data.ANDROID.SOURCE_FILES.push({src: src, targetdir: targetdir});
        }
      }
      // layout source
      files = [];
      getFileSync(layoutDir, files);
      for (var i = 0; i < files.length; i++) {
        var filepath = files[i];
        var file = nodePath.basename(filepath);
        if (!file.match(/activity_main\.xml$/)) {
          var src = 'src/android/' + file;
          var targetdir = 'res/layout';
          data.ANDROID.SOURCE_FILES.push({src: src, targetdir: targetdir});
        }
      }
      // drawable source
      files = [];
      getFileSync(drawableDir, files);
      for (var i = 0; i < files.length; i++) {
        var filepath = files[i];
        var file = nodePath.basename(filepath);
        var src = 'src/android/' + file;
        var targetdir = 'res/drawable';
        data.ANDROID.SOURCE_FILES.push({src: src, targetdir: targetdir});
      }

      d.resolve(data);
      return d.promise;
    };

    Q.when(data)
    .then(getMainClass)
    .then(getAndroidManifest)
    .then(getSouceFiles)
    .done(function(data) {
      d.resolve(data);
    });
    return d.promise;
  };

  var getFileSync = function(path, files) {
      fs.readdirSync(path).forEach(function(file) {
          var subpath = nodePath.join(path, file);
          if(fs.lstatSync(subpath).isDirectory()) {
              getFileSync(subpath, files);
          } else {
              files.push(nodePath.join(path, file));
          }
      });
  };

  return {
    all: function() {
      Q.when()
      .then(clean)
      .then(copyAndroid)
      .then(copyiOS)
      .then(copyPluginJs)
      .then(createPluginXml)
      .done();
    },
    clean: function() {
      clean();
    },
    copyAndroid: function() {
      Q.when()
      .then(clean)
      .then(copyAndroid)
      .then(copyPluginJs)
      .then(createPluginXml)
      .done();
    },
    copyiOS: function() {
      Q.when()
      .then(clean)
      .then(copyiOS)
      .then(copyPluginJs)
      .then(createPluginXml)
      .done();
    }
  };
}());
module.exports = build;
