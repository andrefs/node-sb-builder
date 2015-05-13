#!/usr/bin/env node

var config = require('../config').config;
var fs     = require('fs.extra');
var mkdirp = require('mkdirp');
var async  = require('async');
var views  = require('./templates').load();

function render(manifest, folder, callback){
    async.waterfall([
        // Create folders and copy assets
        function(next){ _copy_assets(folder, next); },

        // Copy assets

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

            _copy_sounds(sounds, folder, function(err){
                if(err){ return next(err); }
                return next(null, sounds);
            });
        },

        // Render index.html
        function(sounds, next){
            var html = views.index({sounds: sounds});
            fs.writeFile(folder+'/index.html', html, next);
        }],
        function(err){
            if(err){
                console.log('Error rendering sound board:',err);
            }
            process.exit();
        }
    );
}

function _mk_dirs(folder, callback){
    var dirs = [
        folder+'/assets/css'    ,
        folder+'/assets/fonts'  ,
        folder+'/assets/imgs'   ,
        folder+'/assets/js'     ,
        folder+'/assets/sounds'
    ];
    async.each(dirs, mkdirp, callback);
}

function _copy_assets(folder, callback){
    async.parallel([
        // Create sounds folder
        function(cb){
            mkdirp(folder+'/assets/sounds', cb);
        },
        // Copy other assets
        function(cb){
            var dirs = [
                './assets/css',
                './assets/fonts',
                './assets/imgs',
                './assets/js',
            ];
            async.each(dirs, function(dir, cb){
                fs.copyRecursive(dir, folder+'/'+dir, cb);
            }, cb);
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
