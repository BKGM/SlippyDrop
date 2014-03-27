var game = require('./game');
var SCALE =game.WIDTH/768;
var SQRT_SCALE = Math.sqrt(game.WIDTH/768);
var CONST = {

	SCALE 				: game.WIDTH/768,
	SQRT_SCALE 			: Math.sqrt(game.WIDTH/768),
	FLOOR_SCALE 		: Math.floor(game.WIDTH/768),
	FLOOR_SQRT_SCALE 	: Math.floor(Math.sqrt(game.WIDTH/768)),

	BLOCK_HEIGHT 		: Math.floor(50 * SQRT_SCALE),
	BLOCK_GAP			: Math.floor(150 * SQRT_SCALE),

	DROP_DIAMETER 		: Math.floor(30 * SQRT_SCALE),
	DROP_ACCEL 			: Math.floor(2 * SCALE + 0.5),
	DROP_GRAV			: game.WIDTH,
	DROP_Y 				: Math.floor(game.HEIGHT/2),
	SPEED 				: Math.floor(3 * SCALE),
};

module.exports = CONST;