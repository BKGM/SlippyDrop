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
((typeof(cordova) == 'undefined') && (typeof(phonegap) == 'undefined')) ? BKGM._isCordova=false : BKGM._isCordova=true;
module.exports = game;