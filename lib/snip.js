#!/usr/bin/env node

var config  = require('./config').config;
var fs      = require('fs.extra');
var mkdirp  = require('mkdirp');
var avconv   = require('avconv');
var sprintf  = require("sprintf-js").sprintf;
var async   = require('async');
var spawn   = require('child_process').spawn;
var mp3info  = require('mp3info');
var views   = require('./templates').load();
var readline = require('readline');
var appRoot = require('app-root-path').toString();
var log     = require('./log').log('sb-builder');



function snip(sourceID, manifest, timeOpts, opts, handler){
    var snipData = opts.soundID ? manifest.sounds[opts.soundID] : {};
    snipData.id = opts.soundID ||
        sprintf("%06d",+Object.keys(manifest.sounds).length+1);
    snipData.sourceID = sourceID;
    snipData.paths = {
        tmp: config.tmpPath   +'/'+snipData.id+'.mp3',
        mp3: config.soundsPath+'/'+snipData.id+'.mp3',
        ogg: config.soundsPath+'/'+snipData.id+'.ogg'
    };
    var source = manifest.sources[sourceID];
    return async.waterfall([
        // Create sound snippet file
        function(next){
            if(typeof timeOpts.from === 'undefined' && typeof timeOpts.duration === 'undefined'){
                if(snipData.startsAt){ timeOpts.from     = snipData.startsAt; }
                if(snipData.length)  { timeOpts.duration = snipData.length;   }
            }
            snipData.startsAt = typeof timeOpts.from !== undefined ? timeOpts.from : snipData.startsAt;
            log.info("Extracting snippet from original source '"+snipData.sourceID+"' ...");
            roughCutSnippet(source.path, snipData.paths.tmp, timeOpts, next);
        },
        // Open in external sound editing app
        function(next){
            log.info('Opening sound snippet in external app ...');
            var soundEditApp = spawn(config.soundEditCommand, [snipData.paths.tmp]);
            soundEditApp.on('close', next);
        },
        // Get sound snippet metadata
        function(res, next){
            log.info('Getting snippet metadata ...');
            mp3info(snipData.paths.tmp, function(err, info){
                if(err){
                    log.error('Error extracting snippet info:',err);
                    return next(err);
                }
                return next(null, info.length);
            });
        },
        // Get snippet transcription/description
        function(length,next){
            snipData.length = length;
            var rl = readline.createInterface({
                input  : process.stdin,
                output : process.stdout
            });
            rl.question('Sound snippet transcription/description:\n> ', function(text){
                snipData.text = text;
                return next();
            });
        },
        // Generate .ogg version of snippet
        function(next){
            log.info('Generating OGG version ...');
            convertMP3toOGG(snipData.paths, {}, next);
        },
        // Move .mp3 from temp folder to final path
        function(next){
            log.info('Moving MP3 version to final path ...');
            var tmpPath = snipData.paths.tmp;
            var finalPath = snipData.paths.mp3;
            fs.rename(tmpPath, finalPath, next);
        }],
        function(err){
            if(err){
                log.error('Error getting sound snippet:', err);
                if(snipData.paths && snipData.paths.tmp && fs.existsSync(snipData.paths.tmp)){
                    log.warn('Removing temporary file '+snipData.paths.tmp+' ...');
                    fs.unlinkSync(snipData.paths.tmp);
                }
                return;
            }
            snipData.dateAdded = new Date().toISOString();
            delete snipData.paths.tmp;
            manifest.writeSound(snipData);
            log.info('Finished!');
            process.exit();
        }
    );
}

function convertMP3toOGG(paths, options, callback){
    var stream = avconv([
        '-i'     , 'pipe:0' , // read from stdin
        '-vn'    ,
        '-acodec', 'libvorbis',
        '-ac'    , 2        , // channels
        '-ab'    , '160k'   , // bitrate
        '-ar'    , 48000    , // dont even know
        '-f'     , 'ogg'    , // output format
        'pipe:1'              // write to stdout
    ]);

    stream.once('exit', function(exitCode) {
        return callback(exitCode?exitcode : null);
    });
    stream.on('error', function(err) {
        log.error('Error generating .ogg version of snippet', err.stack);
        throw err;
    });
    fs.createReadStream(paths.tmp).pipe(stream);
    stream.pipe(fs.createWriteStream(paths.ogg));
}

function roughCutSnippet(srcPath, dstPath, options, callback){
    if(typeof options.from !== 'undefined'){
        var from = options.from;
        var duration = options.duration || (options.to ? (+options.to-options.from) : null) || 30;
        var stream = avconv([
            '-i'     , 'pipe:0' , // read from stdin
            '-ss'    , from     , // start time
            '-t'     , duration , // duration
            '-ab'    , '160k'   , // bitrate
            '-ac'    , 2        , // channels
            '-ar'    , 44100    , // dont even know
            '-f'     , 'mp3'    , // output format
            'pipe:1'              // write to stdout
        ]);

        // Readable stream exits sooner than expecting due to
        // avconv -t param
        process.on('uncaughtException', function (err) {
            if(err.code !== 'ECONNRESET'){
                log.error(err);
                throw err;
            }
        });
        stream.once('exit', function(exitCode) {
            return callback(exitCode?exitcode : null);
        });
        stream.on('error', function(err) {
            log.error('Error cutting snippet', err.stack);
            throw err;
        });
        fs.createReadStream(srcPath).pipe(stream);
        stream.pipe(fs.createWriteStream(dstPath));
    } else { return fs.copy(srcPath, dstPath, callback); }
}


exports.snip = snip;

