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

        // Render index.html
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

            var html = views.index({sounds: sounds});

            fs.writeFile(folder+'/index.html', html, next);
        },

        // 

            //async.map(sounds, function(sound, cb){
            //    _renderButton(sound, folder, cb);
            //}, next);
        ],
        function(err){
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
        callback
    );
}


function _renderButton(snipData, folder, callback){
console.log('rendering button ', snipData.id);
    return async.parallel([
        // Copy sound file to assets folder
        function(cb){
            return _copySound(snipData.paths, folder, cb);
        },
        // Generate button partial HTML
        function(cb){
            return cb(null, '<button></button>');
        }],
        function(err, results){
            if(err){
                console.log('Error rendering button for sound '+snipData.id+': ', err);
                return callback(err);
            }
            console.log('Rendered button for sound '+snipData.id);
            // Return partial HTML
            return callback(null, results[1]);
        }
   );
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
