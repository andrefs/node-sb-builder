
/**************
 * sb-builder *
 **************/

var sb = window.sb;
if ( !sb)
	sb = window.sb = {};


sb.buttons = {};

sb.buttons.playSound = function(ev){
    var button = Ink.Dom.Element.findUpwardsBySelector(ev.target,'div.button');
    var a = Ink.s('audio', button);
    Ink.requireModules(['Ink.Dom.Event_1'], function(InkEvent){
        InkEvent.stopDefault(ev);
    });
    Ink.Dom.Event.observe(a, 'ended', function(ev){
        console.log('Ended sound '+a.id);
        sb.buttons.unHighlightButton(button);
    });
    console.log('Playing button '+a.id);
    sb.buttons.highlightButton(button);
	window.top.location.hash = a.id;
	a.play();
};

sb.buttons.highlightButton = function(button, scroll){
    Ink.Dom.Css.addClassName(Ink.s('div.face-image'), 'speaking');
    if(scroll){ Ink.Dom.Element.scrollTo(button); }
    Ink.Dom.Css.addClassName(button, 'playing');
};

sb.buttons.unHighlightButton = function(button){
    Ink.Dom.Css.removeClassName(Ink.s('div.face-image'), 'speaking');
    Ink.Dom.Css.removeClassName(button, 'playing');
};

sb.buttons.playNext = function(){
    if(!ids || !ids.length) return;
    var item_id = ids.shift();
    item_id = item_id.replace(/^#/,'');
    var audio = Ink.i(item_id);
    if(audio){
        var button = Ink.Dom.Element.findUpwardsBySelector(audio, 'div.button');
        Ink.Dom.Event.observe(audio, 'ended', function(ev){
            console.log('Ended sound '+audio.id);
            sb.buttons.unHighlightButton(button);
            sb.buttons.playNext(ids);
        });
        console.log('Playing button sequence: '+audio.id+')');
        sb.buttons.highlightButton(button, true);
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
        Ink.ss('div.button').forEach(function(button){
            var snipDate = new Date(button.getAttribute('data-date'));
            var weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate()-7);
            if(snipDate > weekAgo){
                var img = Ink.s('img.button', button);
                img.src = 'assets/imgs/button_new.svg';
                Ink.Dom.Css.addClassName(button, 'new');
            }
        });


        var item_id = window.top.location.hash;
        if(item_id){
            sb.buttons.playSoundsByID(item_id);
        }
    });

});
