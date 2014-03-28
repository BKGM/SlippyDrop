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
    explosion = require('./explosion');

module.exports = function(){

	var score = 0,
		highscore = 0,
        newbestscore=false;
    var localscore=new BKGM.ScoreLocal("whitedrop");
        _fb.init({appId:"296632137153437"});
        _fb.initLeaderboards(game,null,game.WIDTH,0,760-game.WIDTH,game.HEIGHT,true);
        _fb.login(_fb.showLeaderboard);

    var buttons = {
        x : WIDTH/2,
        y : DROP_Y - 140,
        w : 300 * SQRT_SCALE,
        h : 50 * SQRT_SCALE,
        s : 15 * SQRT_SCALE,
        f : 30 * SQRT_SCALE,
        list : [
            "Try again",
            "Share your score"
        ],
        actions : [
            "game",
            "share"
        ]
    };
    var _startgame=function(e){
        switch(director.current){
            case 'gameover':
                var x    = buttons.x,
                    y    = buttons.y,
                    w    = buttons.w,
                    h    = buttons.h,
                    s    = buttons.s,
                    f    = buttons.f,
                    list = buttons.list;
                var tx = e.x,
                    ty = e.y;
                if (tx > x - w/2 && tx < x + w/2) {
                    var i = 0,
                        actions = buttons.actions;
                    while (i <= actions.length) {
                        if (ty > y - h * i - h / 2 && ty < y - h * i + h / 2) {
                            director.switch(actions[i]);
                            break;
                        }
                        i++;
                    }
                }
            break;
            case 'menu':director.switch("game");break;
        }
    }
    game.mouseDown=function(e){
        _startgame(e);
    }
    game.touchStart=function(e){
        _startgame(e);
    }
	director.taskOnce("setup", function(){
		highscore = localscore.getScore().score||0;
        drop.reset();
        blocks.reset();
        blocks.spawn(0);
        score = 0;
        newbestscore=false;
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

    director.taskOnce("calscore", function(){
        if(highscore<score){

            localscore.submitScore(score);            
            highscore=score;
            newbestscore=true;
        }
        _fb.submitScore(score,null,function(){
            _fb.showLeaderboard();
        });
    });

    director.task("blocks.update", function(){
    	blocks.update();
    });

    director.task("blocks.draw", function(){
    	blocks.draw();
    });

    director.task("guide", function() {
        game.fill(255, 255, 255, 255);
        game.text("Click to start", WIDTH/2, DROP_Y - 80, 16);
        //game.text("to control the white drop", WIDTH/2, DROP_Y - 100, 16);
           
        
    });

    director.taskOnce("createExplosion", function() {
        //sound(DATA, "ZgNACgBAK0RBGRII9Y/tPt6vyD6gjBA+KwB4b3pAQylFXB0C")
        explosion.reset(drop.x, DROP_Y);
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
        // game.fontSize(24);

        if (!newbestscore) {
            game.text("SCORE: "+score+"  -  BEST: "+highscore, WIDTH/2, HEIGHT/2 - 40,24)
        } else {
            game.text("NEW BEST SCORE: "+score, WIDTH/2, HEIGHT/2 - 40,24)
        }
    });

    director.task('displayScore', function(){
        game.fill(255,255,255,255);
        var tail = drop.tail;
        game.text(score+"",tail[tail.length-1],DROP_Y + tail.length*speed/ SCALE + 15 * SCALE,30);

    });

    director.task('share', function(){
        director.switch('gameover');
    });
};