
/*
  SAPO Noticias toolkit - News Stand
 */

var sb = window.sb;
if ( !sb)
	sb = window.sb = {};


sb.buttons = {};

sb.buttons.playSound = function(ev){
    var button = Ink.Dom.Element.findUpwardsByClass(ev.target,'div.button');
    var a = Ink.s('audio', button);
    console.log('Playing button '+a.id);
	window.top.location.hash = a.id;
	a.play();
};

sb.buttons.playNext = function(){
    if(!ids || !ids.length) return;
    var item_id = ids.shift();
    item_id = item_id.replace(/^#/,'');
    var audio = Ink.i(item_id);
    if(audio){
        Ink.Dom.Event.observe(audio, 'ended', function(ev){ sb.buttons.playNext(ids); });
        console.log('Playing button sequence: '+audio.id+' (and waiting '+(1000*audio.duration+200)+'ms)');
    	//setInterval(function(){ sb.buttons.playNext(ids); },1000*audio.duration+200);
    	audio.play();
    }
};

sb.buttons.playSoundsByID = function(ids_string){
    ids = ids_string.split(',');
    sb.buttons.playNext(ids);
};


Ink.requireModules([
            'Ink.Dom.Loaded_1',
            'Ink.Dom.Element_1',
            'Ink.Dom.Event_1',
    ],function(Loaded, InkElement, InkEvent){

    Loaded.run(function() { // will run on DOMContentLoaded
        InkEvent.observeMulti(Ink.ss('div.button'), 'click', sb.buttons.playSound);
        var item_id = window.top.location.hash;
        if(item_id){
            sb.buttons.playSoundsByID(item_id);
        }
    });

});
