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
		this.spaces = {};
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


	/*********** Util functions ***********/

	/* Add new event listener */
	function _addListener(elementEvent, event, spaces, handler) {

		var callbacksForEvent = elementEvent.event[event] = 
					elementEvent.event[event] ? elementEvent.event[event] : [];

		jQuery.each(spaces, function(index, spaceName) {
			callbacksForEvent.push({
				space: spaceName,
				callback: handler
			});
		});
	}

	/* Try to find event track object for specific node */
	function _getElementEvent(node) {
		
		var filterElement = $(ES._elements).filter(function(index, elementEvent) {
			return elementEvent.node === node;
		});
		
		return filterElement[0];
	}

	/* Create new space of events */
	function _createSpace(elementEvent, spaceName) {
		var newSpace = new Space(spaceName);

		elementEvent.spaces[spaceName] = newSpace;
		return newSpace;
	}

	/* Delete space of events */
	function _deleteSpace(elementEvent, spaceName) {
		delete elementEvent.spaces[spaceName];
	}

	/* Get space of events with that name */
	function _getSpace(elementEvent, spaceName) {
		return elementEvent.spaces[spaceName];
	}

	/* Just look if a space is active */
	function _isActive(elementEvent, spaceName) {
		var sp = _getSpace(elementEvent, spaceName);

		if (sp === undefined)
			return false;

		return sp.active;
	}

	/* Activate space of events with that name */
	function _set(node, spaces, keep) {
		
		var elementEvent = _getElementEvent(node);

		jQuery.each(spaces, function(index, spaceName) {
			
			var space = _getSpace(elementEvent, spaceName);

			if (typeof space === 'undefined') {
				space = _createSpace(elementEvent, spaceName)
			}

			space.Activate();
		});
	}

	/* Deactivate space of events with that name */
	function _unset(node, spaces) {
		
		var elementEvent = _getElementEvent(node);
			
		jQuery.each(spaces, function(index, spaceName) {
			
			var space = _getSpace(elementEvent, spaceName);

			if (typeof space !== 'undefined') {
				space.Deactivate();
			}
		});
	}

    function _son(event, spaces, handler, bubbling) {

    	var elementEvent = _getElementEvent(this);

		if (typeof elementEvent === 'undefined') {
			elementEvent = new ElementEvent(this);
			ES._elements.push(elementEvent);

			$(this).on(event, _handler, bubbling);
		}

		jQuery.each(spaces, function(index, spaceName) {
			if (_getSpace(elementEvent, spaceName) === undefined) {
				_createSpace(elementEvent, spaceName);
			}
		});

		_addListener(elementEvent, event, spaces, handler);
    };

    function _sun(event, spaces, handler) {

    	var elementEvent = _getElementEvent(this);

		if (typeof elementEvent === 'undefined')
			return

		/* In case spaces are not speceified, then all callbacks for that event are removed */
		if (typeof spaces === 'undefined') {
			elementEvent.event[event] = [];
			return;
		}

		jQuery.each(spaces, function(index, spaceName) {
			elementEvent.event[event] =
				jQuery.grep(elementEvent.event[event], function(callbackObject){
					if (callbackObject.space === spaceName) {
						return typeof handler === 'undefined' ? false : handler !== callbackObject.callback;
					}

					return true;
				});
		});
    }

	/* Handler function */
	function _handler() {
		var ee = _getElementEvent(this),
			event = (event) ? event : arguments[0];

		if (!ee)
			return;

		var cb = ee.event[event.type];

		for (var i = 0; i < cb.length; i++)
			if (_isActive(ee, cb[i].space)) {
				cb[i].callback.call(this, arguments[0]);
				return;
			}
	}

	/*********** Public functions ***********/


	/*
	 *	Activate an event space
	 *
	 *	Usage:
	 *	ES.set('intro') -> set intro state and deactivate other spaces
 	 *	ES.set(['intro', 'post intro', 'tech']) -> set 3 state active
 	 *	ES.set() -> unset all states
	 */
	$.fn.set = function(spaceName, keep) {

		/* In case of set() we call _set(this, [], undefined) so it will unset al active spaces */
		if (typeof spaceName === 'undefined')
			spaceName = [];

		if (spaceName.constructor !== String && spaceName.constructor !== Array)
			return;

		if (spaceName.constructor === String) 
			spaceName = [spaceName];

		jQuery.each(this, function(index, node) {
			_set(node, spaceName, keep);
		});
	};
	
	/*
	 *	Deactivate an event space
	 *
	 *	Usage:
	 *	ES.unset('intro') -> set intro state
 	 *	ES.unset(['intro', 'post intro', 'tech']) -> unset 3 state active
	 */
	$.fn.unset = function(spaceName) {
		if (spaceName.constructor !== String && spaceName.constructor !== Array)
			return;

		if (spaceName.constructor === String) 
			spaceName = [spaceName];

		jQuery.each(this, function(index, node) {
			_unset(node, spaceName);
		});
	};
	
	/*
	 *	Add new event handler for an existing event space
	 *
	 *	Usage:
	 *	$(selector).son('click', ['init', 'post'], 
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

		jQuery.each(this, function(index, node){
			_son.call(node, event, spaces, handler, bubbling)
		});		
    };
 
 	/*
	 *	Add new event handler for an existing event space
	 *
	 *	Usage:
	 *	$(selector).sun('click', ['init', 'post'], onClickHandler);
	 *	to remove onClickHandler from those spaces
	 *	
	 *	or
	 *	
	 *	$(selector).sun('click', ['init', 'post']);
	 *	to remove all handlers for click in those spaces
	 *
	 *	or
	 *	
	 *	$(selector).sun('click');
	 *	to remove all handlers for click in all spaces
	 */
    $.fn.sun = function(event, spaces, handler) {

		if (typeof event !== 'string' || 
			(typeof spaces !== 'undefined' && spaces.constructor !== Array && spaces.constructor !== String))
			return;

		if (spaces.constructor === String)
			spaces = [spaces];

		jQuery.each(this, function(index, node){
			_sun.call(node, event, spaces, handler)
		});	
    };
})($);