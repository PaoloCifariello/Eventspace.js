/*
 *	Author: Paolo Cifariello <paolocifa@gmail.com>
 *
 */

(function($){
	/* Inizializzazione */
	var ES = {
		/* Elements handled */
		_elements: []
	};

	/**
	 *	event tracker for dom nodes
	 *	
	 *	@node DOM node
	 */
	function ElementEvent(node) {
		this.node = node;
		this.event = {};

		this.spaces = [];
	}

	/**
	 *	Space of events
	 *	
	 *	@name is the identifier
	 */
	function Space(name) {
		this.name = name;
		this.active = false;

		this.Activate = function() {
			this.active = true;
		}

		this.Deactivate = function() {
			this.active = false;
		}
	}

	/* Add new event listener */
	function _addListener(elementEvent, event, spaces, handler) {

		var cb = elementEvent.event[event] = 
					elementEvent.event[event] ? elementEvent.event[event] : [];

		$(spaces).each(function(index, spaceName) {
			cb.push({
				space: spaceName,
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
	function _createSpace(elementEvent, spaceName) {
		var newSpace = new Space(spaceName);
		elementEvent.spaces.push(newSpace);

		return newSpace;
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
	function _getSpace(elementEvent, spaceName) {
		var spaceFilter = $(ElementEvent.spaces).filter(function(space) {
			return space.name === spaceName;
		});

		return spaceFilter[0];
	}

	/* Just look if a space is active */
	function _isActive(elementEvent, spaceName) {
		var sp = _getSpace(elementEvent, spaceName);

		if (sp === undefined)
			return false;

		return sp.active;
	}

	/* Activate space of events with that name */
	function _set(node, spaces) {
		
		var elementSpaces = _getElementEvent(this).spaces;
			
		$(spaces).each(function(index, space) {
			
			var currentElementSpace = $.grep(elementSpaces, function(elementSpace) {
				return elementSpace.name === space.name;
			})[0];
			
			/* If current setting space does not exists then it is created */
			if (typeof currentElementSpace === 'undefined') {
				currentElementSpace = new Space(space.name);

				elementSpaces.push(currentElementSpace);
			}

			currentElementSpace.Activate();
		});
	}

	/* Deactivate space of events with that name */
	function _unset(node, spaces) {
		
		var elementSpaces = _getElementEvent(this).spaces;
			
		$(spaces).each(function(index, space) {
			
			var currentElementSpace = $.grep(elementSpaces, function(elementSpace) {
				return elementSpace.name === space.name;
			})[0];
			
			/* If current setting space does not exists then it is created */
			if (typeof currentElementSpace !== 'undefined') {
				currentElementSpace.Deactivate();
			}
		});
	}

	/* Handler function */
	var _handler = function() {
		var ee = _getElementEvent(this),
			event = (event) ? event : arguments[0];

		if (!ee)
			return;

		var cb = ee.event[event.type];

		for (var i = 0; i < cb.length; i++)
			if (!_isActive(ee, cb[i].space)) {
				cb[i].callback.call(this, arguments[0]);
				return;
			}
	}

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
	$.fn.set = function(name, keep) {
		if (name.constructor !== String && name.constructor !== Array)
			return;

		if (name.constructor === String) 
			name = [name];

		_set(this, name)
	}
	
	/*
	 *	Deactivate an event space
	 *
	 *	Usage:
	 *	ES.unset('intro') -> set intro state
 	 *	ES.unset(['intro', 'post intro', 'tech']) -> unset 3 state active
	 */
	$.fn.unset = function(name, keep) {
		if (name.constructor !== String && name.constructor !== Array)
			return;

		if (name.constructor === String) 
			name = [name];

		_unset(this, name)
	}
	
	/*
	 *	Add new event handler for an existing event space
	 *
	 *	Usage:
	 *	ES.on('click', ['init', 'post'], 
	 *		function(){
	 *			alert('click!');	
	 *		},
	 *		false
	 *	);
	 */
	$.fn.son = function(event, spaces, handler, bubbling) {

		if (typeof event !== 'string' || 
			typeof handler !== 'function' ||
			(spaces.constructor !== String && spaces.constructor !== Array))
			return;


		if (spaces.constructor === String)
			spaces = [spaces];

		this.each(function(index, node){
			_son.call(node, event, spaces, handler, bubbling)
		});		
    }

    _son = function(event, spaces, handler, bubbling) {

    	var elementEvent = _getElementEvent(this);

		if (typeof elementEvent === 'undefined') {
			elementEvent = new ElementEvent(this);
			ES._elements.push(elementEvent);

			$(this).on(event, _handler, bubbling);
		}

		$(spaces).each(function(index, spaceName) {
			if (_getSpace(elementEvent, spaceName) === undefined) {
				_createSpace(elementEvent, spaceName);
			}
		});

		_addListener(elementEvent, event, spaces, handler);
    };
 
    $.fn.sun = function(properties, handler) {

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
})($);
