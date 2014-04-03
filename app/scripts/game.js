var BKGM = require('./BKGM'),
	director = require('./BKGM/director'),
	game = new BKGM({
    	DeviceMotion: false,
    	Codea		: true,
	    setup: function(){
		    director.switch("menu");
	    },
	    draw: function(){
	        director.run();
	    }
	});

module.exports = game;