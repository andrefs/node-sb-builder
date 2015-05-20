var fs  = require('fs');

var defaultConfs = {
    manifest : {
        version: 'v1',
        filePath: './',
        fileName: 'manifest.json'
    },
    sourcesPath       : './sources',
    soundsPath        : './sounds',
    tmpPath           : './tmp',
    defaultClipMargin : '2',
    soundEditCommand  : 'audacity'
};

var config;

// if(fs.existsSync('./config.js')){
//     config = require('./config.js').config;
//     config._source = 'local';
// }
// else
if(process.env.NODE_ENV === 'testing'){
    config = require('../tests/config.js').config;
    config._source = 'test';
}

if(!config){
    config = defaultConfs;
    config._source = 'default';
}

exports.config = config;


