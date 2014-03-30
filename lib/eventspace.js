/*
 *	Author: Paolo Cifariello <paolocifa@gmail.com>
 *
 */

(function(){
	/* Inizializzazione */
	ES = typeof ES === 'undefined' ? {} : ES;

	/**
	 *	event tracker for dom nodes
	 *	
	 *	@node DOM node
	 */
	function ElementEvent(node) {
		this.node = node;
		this.event = {};
	}

	/**
	 *	Space of events
	 *	
	 *	@name is the identifier
	 */
	function Space(name) {
		this.name = name;
		this.active = false;
	}

	/* Add new event listener */
	function _addListener(node, event, spaces, handler) {
		var el = _getElementEvent(node);
		if (!el) 
			return;

		if (!el.event[event])
			el.event[event] = new Array();
		 
		var cb = el.event[event];

		spaces.forEach(function(space) {
			cb.push({
				space: space,
				callback: handler
			});
		});
	}

	/* Try to find event track object for specific node */
	function _getElementEvent(node) {
		for (var i = 0; i < ES._elements.length; i++)
			if (ES._elements[i].node === node)
				return ES._elements[i];
	}

	/* Create new space of events */
	function _createSpace(name, overwrite) {
		var index = _getSpaceIndex(name);

		if (index === -1)
			ES._spaces.push(new Space(name));
		else if (overwrite) {
			_deleteSpace(name);
			ES._spaces.push(new Space(name));
		}
	}

	/* Delete space of events */
	function _deleteSpace(name) {
		var index = _getSpaceIndex(name);
		if (index != -1)
			ES._spaces.splice(index,1);
	}

	/* Try to find a space of events with that name */
	function _getSpaceIndex(name) {
		for (var i = 0; i < ES._spaces.length; i++)
			if (ES._spaces[i].name === name)
				return i;
		return -1;
	}

	/* Get space of events with that name */
	function _getSpace(name) {
		for (var i = 0; i < ES._spaces.length; i++)
			if (ES._spaces[i].name === name)
				return ES._spaces[i];
	}

	/* Activate space of events with that name */
	function _set(name) {
		ES._spaces.forEach(function(el){
			if (el.name === name)
				el.active = true;
			else
				el.active = false;
		});
	}

	/* Deactivate space of events with that name */
	function _unset() {
		ES._spaces.forEach(function(el){
			el.active = false;
		})
	}

	/* Just look if a space is active */
	function _isActive(space) {
		var sp = _getSpace(space);
		if (sp === undefined)
			return false;

		return sp.active;
	}

	/* Handler function */
	var _handler = function() {
		var ee = _getElementEvent(this);
		if (!ee)
			return;

        var event = (event) ? event : arguments[0];
        
		var cb = ee.event[event.type];
		for (var i = 0; i < cb.length; i++)
			if (_isActive(cb[i].space)) {
				cb[i].callback.call(this, arguments[0]);
			}
	}

	/* Spaces of events */
	ES._spaces = new Array();
	/* Elements handled */
	ES._elements = new Array();

	/* Public functions */

	/*
	 *	Add new event space
	 *
	 *	Usage:
	 *	ES.add('intro', true) -> adds intro event space and overwrite old space with same name if exists
	 *	ES.add(['intro', 'post intro']) -> adds intro and post intro spaces if they do not exist
	 */
	ES.add = function(name, overwrite) {
		if (name.constructor === String) _createSpace(name, overwrite);
		else if (name.constructor === Array) 
			name.forEach(function(el){
				_createSpace(el, overwrite);
			});
		else console.error('Invalid space name');
	}

	/*
	 *	Remove an already existing event space
	 *
	 *	Usage:
	 *	ES.remove('intro') -> remove intro space
	 *	ES.remove(['intro','post intro']) -> remove intro and post intro spaces
	 *
	 */
	ES.remove = function(name) {
		if (name.constructor === String) _deleteSpace(name);
		else if (name.constructor === Array) name.forEach(_deleteSpace);
		else console.error('Invalid space name');		
	}

	/*
	 *	Activate an event space
	 *
	 *	Usage:
	 *	ES.set('intro') -> set intro state
 	 *	ES.set(['intro', 'post intro', 'tech']) -> set 3 state active
 	 *	ES.set() -> unset all states
	 */
	ES.set = function(name) {
		if (name.constructor === String) _set(name);
		else if (name.constructor === Array) name.forEach(_set);
		else if (typeof name === undefined) _unset();
		else console.error('Invalid space name');	
	}
	
	/*
	 *	Add new event handler for an existing event space
	 *
	 *	Usage:
	 *	ES.on({
	 *		node: document.body,
	 *		event: 'click',
	 *		space: ['init', 'post'],
	 *		[ bubble: true ]
	 *	}, function(){
	 *		alert('click!');	
	 *	})
	 */
	ES.on = function(properties, handler) {

		if (!properties || !properties.node || !properties.event || 
			!properties.space || !handler || typeof(handler) !== 'function') 
				return;

		for (var i = 0; i < ES._elements.length; i++)
			if (ES._elements[i].node === properties.node)
				break;

		if (i === ES._elements.length)
			ES._elements.push(new ElementEvent(properties.node));

        properties.node.addEventListener(properties.event, _handler, properties.bubble);
		
		// takes only spaces that already exists
		var spaces = properties.space.filter(function(el){
			return (_getSpace(el) !== undefined);
		});

		_addListener(properties.node, properties.event, spaces, handler);
    }
})();
