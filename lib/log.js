"use strict";

var
    defaultConf = {
        levels: {
            info   : true,
            warn   : true,
            access : true,
            error  : true
        },
        components: {'sb-builder': true},
        extendedArgs: true
    },
    conf = require('./config').config.log || defaultConf,
    disabledMods = {};

// error
function error(){
    var level = 'error';

    var args = [];
    for (var i=0; i<arguments.length; i++){
        var x = arguments[i];
        if(x instanceof Error){
            args.push(x.message+"\n"+x.stack);
        } else { args.push(x); }
    }

    this._log(level, args);
}

// Access
function access(req,res,statusCode,noCount) {
    var level = 'access';
    var
        curDate   = new Date(),
        timeSpent = (curDate.getTime() - req.xConnectDate.getTime()),
        spentMem  = process.memoryUsage().rss - req.xStartMem;
    var msg = req.xRemoteAddr+(req.xDirectRemoteAddr?"/"+req.xDirectRemoteAddr:"")+" - "+req.xRequestID+" "+req.method+" "+req.url+" HTTP/"+req.httpVersionMajor+"."+req.httpVersionMajor+"\" "+statusCode+" "+(timeSpent/1000).toString()+" "+req.xStartMem+" "+spentMem;

    // Count it
    this._log(level,[msg]);
}



// Warn
function warn(){
    var level = 'warn';
    var args=[];
    for(var i=0; i<arguments.length; i++){
        args.push(arguments[i]);
    }
    return this._log(level, args);
}

// Info
function info(){
    var level = 'info';
    var args=[];
    for(var i=0; i<arguments.length; i++){
        args.push(arguments[i]);
    }
    return this._log(level, args);
}

// Check if this component and level is supposed to be logged;
// otherwise return
function _log(level, args){
    var comp = this._component;
    if(level in conf.levels     && conf.levels[level]    === false){ return; }
    if(comp  in conf.components && conf.components[comp] === false){ return; }

    return this._write(level.toUpperCase(), comp, args);
}


// Assemble all the parts of the log string and print
function _write(level, component, args){
    var limit = 1;
    if(conf.extendedArgs){ limit = args.length; }

    for(var i=0; i<limit; i++){
        var extra = '';
        if(i || level === 'ERROR'){ extra = '   '; }
        if(component){ console.log(level, '['+component+']', extra, args[i]); }
        else         { console.log(level, extra+args[i]);                     }
    }
}


function _init(component){
    return {
        _component : component ,
        _log       : _log      ,
        _write     : _write    ,
        conf       : conf      ,
        info       : info      ,
        warn       : warn      ,
        error      : error     ,
        access     : access
    };
}

// Self object
exports.log = _init;
