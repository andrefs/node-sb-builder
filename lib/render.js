'use strict';

var config  = require('./config').config;
var fs      = require('fs.extra');
var mkdirp  = require('mkdirp');
var async   = require('async');
var appRoot = require('app-root-path').toString();
var log     = require('./log').log('sb-builder');

function render(manifest, folder, opts, callback){
    async.waterfall([
        // Verify that folders exist
        function(next){
            verify_folders([opts.viewsFolder, opts.assetsFolder], next);
        },

        // Create folders and copy assets
        function(next){
            _copy_assets(folder, opts.assetsFolder, next);
        },

        // Copy sounds
        function(next){
            var sounds = [];

            Object.keys(manifest.sounds).forEach(function(soundID){
                var s = manifest.sounds[soundID];
                s.dateAdded = new Date(s.dateAdded);
                sounds.push(s);
            });

            sounds = sounds.sort(function(s1, s2){
                return s2.dateAdded -s1.dateAdded;
            });
            sounds = sounds.filter(function(s){ return !s.disabled; });

            _copy_sounds(sounds, folder, function(err){
                if(err){ return next(err); }
                return next(null, sounds);
            });
        },

        // Render index.html
        function(sounds, next){
            var views = require('./templates').load(opts.viewsFolder);
            var html = views.index({
                sounds   : sounds.filter(function(s){ return !s.disabled; }),
                project  : config.project  || {},
                partials : config.partials || {},
                toplinks : config.toplinks || {}
            });
            fs.writeFile(folder+'/index.html', html, next);
        }],
        function(err){
            if(err){
                log.error('Error rendering sound board:',err);
            }
            process.exit();
        }
    );
}

function verify_folders(folders, callback){
    return async.each(folders,
        function(folder, cb){
            if(!folder){ return cb(); }
            return fs.exists(folder, function(exists){
                if(!exists){
                    log.error("Can't continue: missing folder '"+folder+"'");
                    return cb(new Error("Can't continue: missing folder '"+folder+"'"));
                }
                return cb();
            });
        },
        callback
   );
}

function _copy_assets(folder, assetsFolder, callback){
    var assetsFolder = assetsFolder || appRoot+'/projects-skel/assets';
    async.parallel([
        // Create sounds folder
        function(cb){
            mkdirp(folder+'/assets/sounds', cb);
        },
        // Copy bin/ folder
        function(cb){
            fs.copyRecursive(appRoot+'/projects-skel/bin', folder+'/bin', cb);
        },
        // Copy other assets
        function(cb){
            var dirs = [
                'css',
                'fonts',
                'imgs',
                'js',
            ];
            async.each(
                dirs,
                function(dir, cb){
                    var srcFolder = assetsFolder+'/'+dir;
                    fs.exists(srcFolder, function(exists){
                        if(!exists){
                            log.warn('Missing folder:', srcFolder);
                            return cb();
                        }
                        fs.copyRecursive(srcFolder, folder+'/assets/'+dir, cb);
                    });
                },
                cb
            );
        }],
        function(err){
            return callback(err);
        }
    );
}


function _copy_sounds(sounds, folder, callback){
    async.each(sounds, function(sound, cb){
            return _copySound(sound.paths, folder, cb);
    }, callback);
}

function _copySound(paths, folder, callback){
    async.parallel([
        // Copy mp3
        function(cb){
            var srcPath = paths.mp3;
            var dstPath = folder+'/assets/'+srcPath;
            return fs.copy(srcPath, dstPath, cb);
        },
        // Copy ogg
        function(cb){
            var srcPath = paths.ogg;
            var dstPath = folder+'/assets/'+srcPath;
            return fs.copy(srcPath, dstPath, cb);
        }],
        callback
    );
}

exports.render = render;
