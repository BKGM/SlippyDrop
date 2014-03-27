var set = {
	'IPAD'    : 768,
	'IPHONE'  : 320
};

var screenset = function(game, opt){
	for (var width in opt) {
		
		if (set[width] === game.WIDTH) {
			var result = opt[width];
			if ( typeof result === "function" ) {
				return result();
			} else return result;
			break;
		}		
	}
	return opt['DEFAULT'];
}

module.exports = screenset;