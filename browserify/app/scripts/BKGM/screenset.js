_ = require('lodash');

var set = {
	'IPAD'    : 768,
	'IPHONE'  : 320,
	'DEFAULT' : 320
};

var screenset = function(game, opt){
	for (var width in opt) {
		if (set[width] === game.WIDTH) {
			var result = opt[width];
			if ( _.isFunction(result) ) {
				return result();
			} else return result;
			break;
		}
		return screenset.DEFAULT;
	}
}

module.exports = screenset;