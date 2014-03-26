var director = require('./BKGM/director'),
	game = require('./game'),
	constants = require('./constants'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT,
    speed = constants.SPEED,
    blocks = require('./blocks'),
    drop = require('./drop'),
    explosion = require('./explosion');

module.exports = function(){

	var score = 0,
		highscore = 0;

	director.taskOnce("setup", function(){
		highscore = 0;
        drop.reset();
        blocks.reset();
        blocks.spawn(0);
        score = 0;
    });

    director.task("score", function() {
        if (blocks.pass(drop)){
            //sound(SOUND_PICKUP, 32947)
            score++;
        }
    });

    director.task("drop.tail", function(){
        drop.updateTail();
    });
    
    director.task("drop.update", function(){
        drop.updateByTouch();
    });

    director.task("drop.grav", function(){
        drop.updatePosition();
    });
    
    director.task("drop.draw", function(){
        drop.draw();
    });
    
    director.task("collide", function() {
        if ( drop.collide(blocks.now()) ) {
            //showAdFromTop()
            director.switch("explode");
        }
    });

    director.task("blocks.update", function(){
    	blocks.update();
    });

    director.task("blocks.draw", function(){
    	blocks.draw();
    });

    director.task("guide", function() {
        game.fill(255, 255, 255, 255);
        game.text("Choose your preferred method", WIDTH/2, drop.y - 80, 16);
        game.text("to control the white drop", WIDTH/2, drop.y - 100, 16);
    });

    director.taskOnce("createExplosion", function() {
        //sound(DATA, "ZgNACgBAK0RBGRII9Y/tPt6vyD6gjBA+KwB4b3pAQylFXB0C")
        explosion.reset(drop.x, drop.y);
    });
    
    director.task("explosion", function() {
        explosion.draw()
        if (explosion.isDone()) {
            director.switch("gameover");
        }
    });

    director.task("result", function() {
        game.fill(0, 0, 0, 230);
        game.rect(0, 0, WIDTH, HEIGHT);
        
        game.fill(255, 255, 255, 255);
        game.fontSize(24);

        if (score <= highscore) {
            game.text("SCORE: "+score+"  -  BEST: "+highscore, WIDTH/2, HEIGHT/2 - 40)
        } else {
            game.text("NEW BEST SCORE: "+score, WIDTH/2, HEIGHT/2 - 40)
        }
    });
};