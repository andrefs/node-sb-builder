#!/usr/bin/env node

var hbs = require('handlebars');
var fs = require('fs');
var appRoot = require('app-root-path').toString();

var templates = {};

function load(folder){
    var folder = folder || appRoot+'/views';
    // Load partials
    var partialsDir = folder+'/partials/';
    var filenames = fs.readdirSync(partialsDir);
    filenames.forEach(function (filename) {
        var matches = /^([^.]+).hbs$/.exec(filename);
        if(!matches){ return; }
        var name = matches[1];
        var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
        hbs.registerPartial(name, template);
    });

    // Register helpers
    hbs.registerHelper('buttonImg', function(){
	    var color =
	    	this.length < 1 ? 'blue' :
	    	this.length < 2 ? 'green' :
	    	this.length < 3 ? 'yellow' :
	    	'red';
            return color+'.png';
    });

    // Compile views
    var viewsDir = folder;
    filenames = fs.readdirSync(viewsDir);
    filenames.forEach(function (filename) {
        var matches = /^([^.]+).hbs$/.exec(filename);
        if(!matches){ return; }
        var name = matches[1];
        var template = fs.readFileSync(viewsDir + '/' + filename, 'utf8');
        templates[name] = hbs.compile(template);
    });

    return templates;
};

exports.load = load;
