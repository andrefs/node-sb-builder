'use strict';

var config   = require('./lib/config').config;
var fs       = require('fs-extra');
var ytdl     = require('ytdl-core');
var async    = require('async');
var log      = require('./lib/log').log('sb-builder');


function download(manifest, videoURL, options, callback){
  async.waterfall([
      // Get source information
      function(next){
          log.info("Getting information for source '"+videoURL+"' ...");
          ytdl.getInfo(videoURL, next);
      },
      // Get video file
      function(info, next){
          var source = {};
          source.id = info.video_id;
          if(manifest.sources[source.id]){
              return next({error: 'already_downloaded', message: 'Video already downloaded!'});
          }
          source.tmpPath = config.tmpPath+'/'+source.id;
          source.title = info.title;
          source.length = +info.length_seconds;
          source.dateDownloaded = new Date().toISOString();

          var formats = info.formats.filter(function(f){ return f.type.match(/audio\/webm/) ? true:false; });
          if(formats.length){ info.formats = [formats[0]]; }
          log.info("Downloading source file ["+source.title+"] ...");
          var video = ytdl.downloadFromInfo(info, {filter: 'audioonly'});
          video.pipe(fs.createWriteStream(source.tmpPath));

          video.on('error', next);

          video.on('format', function(format){
              source.size = +format.size;
              source.path = config.sourcesPath+'/'+source.id+'.'+format.container;

              var pos = 0;
              video.on('data', function(data) {
                  pos += data.length;
                  if (source.size) {
                      var percent = (pos / source.size * 100).toFixed(2);
                      process.stdout.cursorTo(0);
                      process.stdout.clearLine(1);
                      process.stdout.write(percent + '%');
                  }
              });
          });
          video.on('end',function(err){
              if(err){ return next(err); }
              process.stdout.write("\n");
              log.info('    finished downloading!');
              return next(null, source);
          });
      },
      // Move source file to final path
      function(vData, next){
          log.info('Moving file from temp dir to final path ...');
          source = vData;
          var tmpPath = source.tmpPath;
          var finalPath = source.path;
          fs.rename(tmpPath, finalPath, next);
      }],
      function(err){
          if(err){ log.error(err);           }
          else { manifest.writeSource(source); }
          //manifest.save();
          return callback();
      }
  );
}


