'use strict';
var http = require('http');
var fs   = require('fs');
var url  = require('url');
var port = 10111;

http.createServer(function(req, res){
    var path = url.parse(req.url).path;
    path = path.replace(/^\//,'');
    path = path || 'index.html';
    //path = '../'+path;
    return serveFile(path, req, res);
}).listen(port);
console.log('Listening on http://localhost:'+port);

function serveFile(path, req, res){
    if(!fs.existsSync(path)){
        res.writeHead(404);
        res.end('File not found.');
    }
    fs.readFile(path, function(err, content){
        if(err){
            console.error('There was a problem serving your request:',err);
            res.writeHead(500);
            res.end('There was a problem serving your request.');
        }

        res.writeHead(200, {'Content-Type': mime(path) });
        res.end(content);
    });
}

function mime(path){
    var ext;
    var mimes = {
        html : 'text/html',
        htm  : 'text/html',
        js   : 'text/javascript',
        css  : 'text/css',
        gif  : 'image/gif',
        jpg  : 'image/jpeg',
        png  : 'image/png',
        mp3  : 'audio/mpeg',
        ogg  : 'audio/ogg'
    };
    if(path.match(/\.(\w+)$/)){ ext = RegExp.$1; }
    return mimes[ext] || 'text/plain';
};
