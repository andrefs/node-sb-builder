var config  = require('./config').config;
var fs      = require('fs.extra');
var log     = require('./log').log('sb-builder');
var Manifest = require('./lib/manifest');


function init(name, callback){
  var manifest = Manifest.create(name);

  var folders = [
      config.tmpPath,
      config.sourcesPath,
      config.soundsPath
  ];
  log.info('Creating folders ...');
  folders.forEach(function(folder){
      fs.mkdirSync(folder);
  });
  log.info('Finished!');
  return callback();
}

exports.init = init;
