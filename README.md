eventspacejs
============

An event organizer for javascript

Documentation:
============

Create your spaces of event:

ES.add('init'); 
ES.add('pre');
ES.add('post');

Set event for spaces

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
    space: ['init', 'pre']
}, function(){
    alert('Clicked in space post');
})

Activate space 'init'

ES.set('init');

Deactivate, no active spaces

ES.set()
