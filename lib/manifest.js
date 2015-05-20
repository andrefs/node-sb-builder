#!/usr/bin/env node


var config   = require('./config').config;
var manifest = {};
var fs       = require('fs');
var log      = require('./log').log('sb-builder');


var manifest = new function(){
    this.create = function(sbname){
        log.info("Creating manifest for project '"+sbname+"'...");
        this._new(sbname);
        this.save();
        return this;
    };

    this._new = function(sbname){
        this.sources  = {};
        this.sounds   = {};
        this.metadata = {
            name: sbname,
            manifest : {
                version : config.manifest.version
            }
        };
        this.save = save;
        return this;
    };

    this.read = function(){
        log.info("Reading manifest ...");
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

        this.save        = save;
        this.writeSource = writeSource;
        this.writeSound  = writeSound;
        this.sounds      = manif.sounds;
        this.sources     = manif.sources;
        this.metadata    = manif.metadata;

        return this;
    };
};


function save(){
    var mf = _save_build.apply(this);
    var path = (config.manifest.filePath || '.')+'/'+(config.manifest.fileName || 'manifest.json');
    log.info('Saving manifest ...');
    fs.writeFileSync(path, JSON.stringify(mf, {}, 4));
};

function _save_build(){
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
    return mf;
};



function writeSource(source){
    log.info("Writing data from source '"+source.id+"' in manifest ...");
    delete source['tmpPath'];
    this.sources[source.id] = source;
    this.save();
};

function writeSound(sound){
    log.info("Writing data from sound '"+sound.id+"' in manifest ...");
    this.sounds[sound.id] = sound;
    this.save();
};


exports.read   = manifest.read;
exports.create = manifest.create;
exports._new   = manifest._new;
