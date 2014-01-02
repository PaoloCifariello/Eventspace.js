# _eventspacejs_

_An event organizer for javascript_

##Documentation

_Create your spaces of event:_

    ES.add('init');
    ES.add('pre');
    ES.add('post');


_Set event for spaces:_


    ES.on({
        node: document.body,
        event: 'click',
        space: ['init', 'pre']
    }, function(){
        alert('Clicked in space init or pre');
    })

    ES.on({
        node: document.body,
        event: 'click',
        space: ['post']
    }, function(){
        alert('Clicked in space post');
    })

_Activate space init:_

`ES.set('init');`

_Deactivate, no active spaces:_

`ES.set()`
