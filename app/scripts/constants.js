var game = require('./game'),
	screenset=require('./BKGM/screenset'),
	WIDTH = game.WIDTH;
	SCALE =(WIDTH/768),
	SQRT_SCALE = Math.sqrt(WIDTH/768),
	DROP_Y = Math.floor(game.HEIGHT/2),
	CONST = {

	SCALE 				: game.WIDTH/768,
	SQRT_SCALE 			: Math.sqrt(game.WIDTH/768),
	FLOOR_SCALE 		: Math.floor(game.WIDTH/768),
	FLOOR_SQRT_SCALE 	: Math.floor(Math.sqrt(game.WIDTH/768)),

	BLOCK_HEIGHT 		: Math.floor(50 * SQRT_SCALE),
	BLOCK_GAP			: Math.floor(150 * SQRT_SCALE),

	DROP_DIAMETER 		: Math.floor(30 * SQRT_SCALE),
	DROP_ACCEL 			: Math.floor(2 * SCALE + 0.5),
	DROP_GRAV			: game.WIDTH,
	DROP_Y 				: DROP_Y,
	SPEED 				: screenset(game,{
							'IPAD':3,
							'IPHONE':2,
							'DEFAULT':Math.floor(4*SQRT_SCALE)
						}),
	BUTTONS				: buttons = {
					        x : WIDTH/2,
					        y : DROP_Y - 140,
					        w : 300 * SQRT_SCALE,
					        h : 50 * SQRT_SCALE,
					        s : 15 * SQRT_SCALE,
					        f : 30 * SQRT_SCALE,
					        list : [
					            "Try again",
					            "Share your score",
					            "Show Leaderboard"
					        ],
					        actions : [
					            "game",
					            "share",
					            "leaderboard"
					        ]
					    }
};

module.exports = CONST;