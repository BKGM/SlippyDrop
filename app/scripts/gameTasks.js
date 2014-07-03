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
    _fb.init({appId:"1416361488615336"});
    _fb.initLeaderboards(game,null,0,0,WIDTH,HEIGHT);
    _fb.hideLeaderboard();
    var token="";
    _fb.login(function(res){
        _fb.getAuthResponse(function(accessToken){
            // data = new FormData();
            // data.append("access_token",accessToken)
            data={access_token:accessToken};
            data=JSON.stringify(data);
            BKGM.ajax({
                url:'http://bkgmservices.herokuapp.com/authenticate',
                type:"POST",
                contentType:'application/json; charset=utf-8',
                data:data,
                complete:function(res){
                    var d =JSON.parse(res);
                    token=d.token;
                },
                error:function(res){
                    console.log(res)
                }
            })
            
        })
        _fb.hideLeaderboard();
    });
    // _fb.getScore(null, function(score){
    //     localscore.submitScore(score);
    // });

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
                            if (ty > y - (h + s) * i - h2 && ty < y - (h + s) * i + h2) {
                                switch(actions[i]){
                                    case 'game' : 
                                        director.switch("game"); 
                                        if(!window.admob) break;
                                        var success = function() { console.log("killAd Success"); };
                                        var error = function(message) { console.log("Oopsie! " + message); };
                                        admob.killAd(success,error);
                                        if(game.ads){
                                            game.SCALEX = game.WIDTH/window.innerWidth;
                                            game.SCALEY = game.HEIGHT/window.innerHeight;
                                            game._sy=0;
                                            game.ads=false;
                                        }                                        
                                         
                                        break;
                                    case 'share': _fb.postCanvas(game.canvas,score); break;
                                    case 'leaderboard':
                                    console.log('leaderboard')
                                    _fb.getAuthResponse(function(accessToken){
                                        // data = new FormData();
                                        // data.append("access_token",accessToken)
                                        data={access_token:accessToken};
                                        data=JSON.stringify(data);
                                        BKGM.ajax({
                                            url:'http://bkgmservices.herokuapp.com/api/test/leaderboard',
                                            type:"POST",
                                            contentType:'application/json; charset=utf-8',
                                            token:token,
                                            data:data,
                                            complete:function(res){
                                                var d =JSON.parse(res);
                                                console.log(d)
                                            },
                                            error:function(res){
                                                console.log(res)
                                            }
                                        })
                                        
                                    })
                                    // _fb.showLeaderboard();
                                    break;
                                };
                                break;
                            }
                            i++;
                        }
                    }
                break;
                case 'menu':director.switch("game",true);
                            if(!window.admob) break; 
                            var success = function() { console.log("killAd Success"); };
                            var error = function(message) { console.log("Oopsie! " + message); };
                            admob.killAd(success,error); 
                            
                            break;
            }
        };
    })();

    game.mouseDown=function(e){
        console.log(e)
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
        _fb.submitScore(score,token,function(){
            // _fb.showLeaderboard();
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
        director.switch("gameover",true);
        if(!window.admob) return;
        var successCreateBannerView = function() { admob.requestAd({'isTesting': false},success,error); };
        var success = function() { 
            // if(!game.ads){
                game.ads=true;
                game.SCALEX = game.WIDTH/window.innerWidth;
                game.SCALEY = game.HEIGHT/window.innerHeight;
                game._sy=-50;
                // game.canvas.style.top="50px";
            // }            
            console.log("requestAd Success"); 
        };
        var error = function(message) { console.log("Oopsie! " + message); };
        var options = {
            'publisherId': 'a1533bd81f37c40',
            'adSize': admob.AD_SIZE.BANNER,
            'positionAtTop': true
        }
        // alert("create");
        
        admob.createBannerView(options,successCreateBannerView,error);
        
        // explosion.reset(drop.x, DROP_Y);
        
    });
    
    director.update("explosion", function() {
        // explosion.update();
        // if (explosion.isDone()) {
            
        // }
        
    });

    director.draw("explosion", function() {
        explosion.draw();
        
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