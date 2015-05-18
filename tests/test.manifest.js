process.env.NODE_ENV = 'testing';

var assert = require("assert");
var config = require('../lib/config').config;
var fs   = require('fs');
var http = require("http");
var Manifest = require('../lib/manifest');

describe("A Manifest", function() {
    it("should be created with the default structure", function() {
        var project = 'testname';
        var mf = Manifest._new(project);

        assert(mf.hasOwnProperty('sources'),  'has sources');
        assert(mf.hasOwnProperty('sounds'),   'has sounds');
        assert(mf.hasOwnProperty('metadata'), 'has metadata');
        assert(mf.hasOwnProperty('read')   && typeof mf.read   === 'function', 'has read method');
        assert(mf.hasOwnProperty('create') && typeof mf.create === 'function', 'has create method');
        assert(mf.hasOwnProperty('save')   && typeof mf.save   === 'function', 'has save method');
        assert(mf.metadata.hasOwnProperty('manifest') && mf.metadata.manifest.hasOwnProperty('version') , 'has metadata.manifest.version');

        assert(mf.sources  !== null && typeof mf.sources  === 'object' && ! Array.isArray(mf.sources),  '.sources is an object' );
        assert(mf.sounds   !== null && typeof mf.sounds   === 'object' && ! Array.isArray(mf.sounds),   '.sounds is an object'  );
        assert(mf.metadata !== null && typeof mf.metadata === 'object' && ! Array.isArray(mf.metadata), '.metadata is an object');

        assert(mf.metadata.name === project, 'metadata.name contains project name');

    });

    it("should create manifest file when saved", function(){
        var project = 'testname';
        var mf = Manifest.create(project);
        assert(fs.existsSync('./tests/manifest.json'), 'manifest.json file exists');
        fs.unlinkSync('./tests/manifest.json');
    });

    //it("should be the same before saving and after reading", function(){
    //});




});

