#!/usr/bin/env node

var config = require('../config').config;
var manifest = {};
var fs = require('fs');

manifest.create = function(sbname){
    this.sources  = {};
    this.sounds   = {};
    this.metadata = {
        name: sbname,
        manifestVersion : config.manifestVersion
    };
    this.save = manifest.save;
    this.save();
    return this;
};

manifest.save = function(){
    var mf = {
        metadata : this.metadata,
        sources  : [],
        sounds   : []
    };

    for (srcID in this.sources){
        mf.sources.push(this.sources[srcID]);
    }

    var snds = [];
    for (sndID in this.sounds){
        snds.push(this.sounds[sndID]);
    }
    snds.sort(
        function(a,b){
            return a.dateAdded > b.dateAdded ? true : false;
        }).forEach(function(snd){
            mf.sounds.push(snd);
        });

    fs.writeFileSync('manifest.json', JSON.stringify(mf, {}, 4));
};

manifest.read = function(){
    if(!fs.existsSync('manifest.json')){
        throw 'manifest.json file is missing!';
    }
    var data = fs.readFileSync('manifest.json',{encoding:'utf8'});
    var mf   = JSON.parse(data);

    var manif = {
        sources : {},
        sounds: {},
        metadata: mf.metadata
    };
    mf.sources.forEach(function(src){
        manif.sources[src.id] = src;
    });
    mf.sounds.forEach(function(snd){
        manif.sounds[snd.id] = snd;
    });

    this.save        = manifest.save;
    this.writeSource = manifest.writeSource;
    this.sounds      = manif.sounds;
    this.sources     = manif.sources;
    this.metadata    = manif.metadata;

    return this;
};

manifest.writeSource = function(source){
    delete source['tmpPath'];
    this.sources[source.id] = source;
    this.save();
};

exports.read = manifest.read;
exports.create = manifest.create;
//exports.save   = manifest.save;
