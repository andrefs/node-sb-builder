'use strict';
var http = require('http');
var fs   = require('fs');
var url  = require('url');
var port = 10111;

http.createServer(function(req, res){
    var pathname = url.parse(req.url).pathname;
    pathname = pathname.replace(/^\//,'');
    pathname = pathname || 'index.html';
    //path = '../'+path;
    console.log('['+new Date().toISOString()+'][ACCESS]\t'+pathname);
    return serveFile(pathname, req, res);
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
        var headers = {
            'Content-Type'  : mime(path),
            'Cache-Control' : cache(path)
        };

        res.writeHead(200, headers);
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
        svg  : 'image/svg+xml',
        mp3  : 'audio/mpeg',
        ogg  : 'audio/ogg'
    };
    if(path.match(/\.(\w+)$/)){ ext = RegExp.$1; }
    return mimes[ext] || 'text/plain';
};

function cache(path){
    var ext;
    var caches = {
        html : 'public, max-age=60'      ,  // 1 min
        htm  : 'public, max-age=60'      ,  // 1 min
        js   : 'public, max-age=300'     ,  // 5 min
        css  : 'public, max-age=300'     ,  // 5 min
        gif  : 'public, max-age=1800'    ,  // 2 weeks
        jpg  : 'public, max-age=1800'    ,  // 2 weeks
        png  : 'public, max-age=1800'    ,  // 2 weeks
        svg  : 'public, max-age=1800'    ,  // 2 weeks
        mp3  : 'public, max-age=31536000',  // 1 year
        ogg  : 'public, max-age=31536000',  // 1 year
    };
    if(path.match(/\.(\w+)$/)){ ext = RegExp.$1; }
    return caches[ext] || 'public, max-age=60';
}
