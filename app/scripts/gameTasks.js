var director = require('./BKGM/director'),
    BKGM = require('./BKGM'),
    _fb =   require('./BKGM/fbconnect'),
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
    DROP_Y = constants.DROP_Y,
    explosion = require('./explosion'),
    buttons = constants.BUTTONS;

module.exports = function(){

	var score = 0,
		highscore = 0,
        newbestscore = false,
        localscore = new BKGM.ScoreLocal("whitedrop");

    _fb.init({appId:"296632137153437"});
    _fb.initLeaderboards(game,null,WIDTH,0,760-WIDTH,HEIGHT,true);
    _fb.login(_fb.showLeaderboard);
    _fb.getScore(null, function(score){
        localscore.submitScore(score);
    });

    var _startgame=(function(){
        var x       = buttons.x,
            y       = buttons.y,
            w2      = buttons.w / 2,
            h       = buttons.h,
            h2      = h / 2,
            s       = buttons.s,
            f       = buttons.f,
            list    = buttons.list,
            actions = buttons.actions;
        
        return function(e){
            switch(director.current){
                case 'gameover':
                    var tx = e.x,
                        ty = e.y,
                        i  = 0, 
                        l  = actions.length;
                    if (tx > x - w2 && tx < x + w2) {
                        while (i <= l) {
                            if (ty > y - h * i - h2 && ty < y - h * i + h2) {
                                switch(actions[i]){
                                    case 'game' : director.switch('game'); break;
                                    case 'share': _fb.postCanvas(); break;
                                };
                                break;
                            }
                            i++;
                        }
                    }
                break;
                case 'menu': director.switch("game"); break;
            }
        };
    })();

    game.mouseDown=function(e){
        _startgame(e);
    };

    game.touchStart=function(e){
        _startgame(e);
    };

	director.taskOnce("setup", function(){
		highscore = localscore.getScore().score || 0;
        drop.reset();
        blocks.reset();
        blocks.spawn(0);
        score = 0;
        newbestscore = false;
    });

    director.draw("score", function() {
        if (blocks.pass(drop)){
            //sound(SOUND_PICKUP, 32947)
            score++;
        }
    });

    director.update("drop.tail", function(){
        drop.updateTail();
    });
    
    director.update("drop.update", function(){
        drop.updateByTouch();
    });

    director.draw("drop.drawTouch", function(){
        drop.drawTouch();
    });

    director.draw("drop.grav", function(){
        drop.updatePosition();
    });
    
    director.draw("drop.draw", function(){
        drop.draw();
    });
    
    director.draw("collide", function() {
        if ( drop.collide(blocks.now()) ) {
            //showAdFromTop()
            director.switch("explode");
        }
    });

    director.taskOnce("calscore", function(){
        _fb.submitScore(score,null,function(){
            _fb.showLeaderboard();
        });
        if(highscore<score){
            localscore.submitScore(score);
            highscore = score;
            newbestscore = true;
        }
    });

    director.update("blocks.update", function(){
    	blocks.update();
    });

    director.draw("blocks.draw", function(){
    	blocks.draw();
    });

    director.draw("guide", function() {
        game.fill(255, 255, 255, 255);
        game.fontSize(16);
        game.text("Click to start", WIDTH/2, DROP_Y - 80);
    });

    director.taskOnce("createExplosion", function() {
        //sound(DATA, "ZgNACgBAK0RBGRII9Y/tPt6vyD6gjBA+KwB4b3pAQylFXB0C")
        explosion.reset(drop.x, DROP_Y);
    });
    
    director.draw("explosion", function() {
        explosion.draw()
        if (explosion.isDone()) {
            director.switch("gameover");
        }
    });

    director.draw("result", function() {
        game.fill(0, 0, 0, 230);
        game.rect(0, 0, WIDTH, HEIGHT);
        
        game.fill(255, 255, 255, 255);
        
        game.fontSize(24);

        if (!newbestscore) {
            game.text("SCORE: "+score+"  -  BEST: "+highscore, WIDTH/2, HEIGHT/2 - 40)
        } else {
            game.text("NEW BEST SCORE: "+score, WIDTH/2, HEIGHT/2 - 40)
        }
    });

    director.draw('displayScore', function(){
        game.fill(255,255,255,255);
        var tail = drop.tail;
        game.fontSize(30);
        game.text(score+"",tail[tail.length-1],DROP_Y + tail.length*speed/ SCALE + 15 * SCALE);

    });
};