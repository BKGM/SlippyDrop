(function(){
	// Wait for device API libraries to load
            //
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            //
            function onDeviceReady() {
                windowLoad();
            }
	// window.onload=function(){
        function windowLoad() {
   //      	if (navigator.isCocoonJS) {
			//     CocoonJS.App.setAntialias(true);
			// }
            var canvas = document.createElement('canvas');
            canvas.setAttribute("id", "game"); 
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            var ctx = canvas.getContext("2d");
            document.body.appendChild(canvas);

            var director;
            var _fb;
            var Game = new BKGM({
			    setup: function(){
			        director = new BKGM.States();
			        var Game = this;
			        if(BKGM.FBConnect)
			       	_fb = new BKGM.FBConnect();
			       	_fb.init({appId:"296632137153437"});
			       	Game.touchStart=function(){
			       			_fb.postCanvas("Test post diem");
			       	}
			       
			        Game.random = function(min, max){
			        	return Math.floor(min + Math.random()*(max-min));
			        };
    
				    director.state("ready", [	
				     	"background",
				     	"setup",
				     	"drop.tail",
				     	"drop.update",
				     	"drop.draw"
				    ]);
				    
				    director.state("menu", [
				    	"setup",
				    	"background",
				    	//"menu",
				    	//"logo",
				    	"drop.tail",
				    	"drop.update",
				    	"blocks.update",
				    	"drop.draw",
				    	"blocks.draw"
				    //	"guide"
				    ]);
				        
				    director.taskOnce("setup", function(){
				        Game.speed = 3 * SCALE;
				        Game.highscore = 0;
				        Game.drop  = new BKGM.Drop(Game);
				        Game.blocks = new BKGM.Blocks(Game);
				        Game.blocks.spawn(0);
				        
				        Game.score = 0;
				        //Game.highscore = readLocalData("highscore", 0);
				    });
				    
				    director.task("drop.tail", function(){
				        Game.drop.updateTail()
				    });
				    
				    director.task("drop.update", function(){
				        Game.drop.updatePosition()
				    });
				    
				    director.task("drop.draw", function(){
				        Game.drop.draw()
				        Game.fill(255, 255, 255, 1)
				        var tail = Game.drop.tail;
				        Game.text(Game.score, tail[tail.length - 1], Game.drop.y + tail.length*Game.speed + 20, 30 * SCALE);
				    });

				    director.task("blocks.update", function(){
				    	Game.blocks.update()
				        if (Game.blocks.pass(Game.drop)) {
				            //sound(SOUND_PICKUP, 32947)
				            Game.score++;
				        }

				        if (Game.drop.collide(Game.blocks.now())) {
				            director.switch("ready");
				        }
				    });

				    director.task("blocks.draw", function(){
				    	Game.blocks.draw();
				    });
				    
				    // director.task("guide", function(){
				    //     fill(255, 255, 255, 255)
				    //     fontSize(16)
				    //     text("Tilt your device to control the drop", WIDTH/2, drop.y - 50 * SCALE)
				    //     text("Avoid obstacles to score", WIDTH/2, drop.y - 80 * SCALE)
				    //     if CurrentTouch.state == ENDED then
				    //         director.switch("ready")
				    //     }
				    // });
				    
				    director.task("background", function(){
				        var c = Game.random(0, 30);
				        Game.background(c, c, c, 1);
				    });
				    
				    director.task("menu", function(){
				        return {
				            logo_x : WIDTH / 2,
				            logo_y : 2 * HEIGHT / 3,
				            buttons : [
				                { 
				                    x : WIDTH/2,
				                    y : HEIGHT/2,
				                    w : 300 * SCALE,
				                    h : 60 * SCALE,
				                    s : 20 * SCALE,
				                    f : 30 * SCALE,
				                    list : [
				                        "PLAY",
				                        "SPEED"
				                    ]
				                }
				            ]
				        };
				    });
				    
				    director.task("logo", function(pos){

				        var c = Game.random(0, 30);
				        var f = 25 * SCALE;
				                
				        Game.fill(255-c, 255-c, 255-c, 1);
				        
				        var d = Game.random(-1, 1);
				        var e = Game.random(-1, 1);
				        
				        Game.text("BKGameMaker", pos.logo_x + d, pos.logo_y + f + e, 20 * SCALE);
				        
				        Game.text("SLIPPY DROP", pos.logo_x + d, pos.logo_y - f + e, 50 * SCALE);
				        Game.fill(255-c, 255-c, 255-c, 1);
				    });
				    
				    director.task("buttons", function(opt){
				        var buttons = table.remove(opt.buttons, 1);
				        var x = buttons.x;
				        var y = buttons.y;
				        var w = buttons.w;
				        var h = buttons.h;
				        var s = buttons.s;
				        var f = buttons.f;
				        
				        var c = Game.random(0, 100);
				                
				        Game.rectMode(CENTER);
				        
				        var d = Game.random(-1, 1);
				        var e = Game.random(-1, 1);

				        var list = buttons.list;
				        for (var i = 0, l = list.length; i < l; i++) {
				            Game.fill(0, 0, 0, 255);
				            Game.rect(x + d, y - ( h + s ) * (i-1) + e, w, h, f);
				            Game.fill(255-c, 255-c, 255-c, 255);
				            Game.text(list[i], x + d, y - ( h + s ) * (i-1) + e, f);
				        }
				    });
				    
				    director.switch("menu");
			    },
			    draw: function(){
			        // Runs every interval
			        director.run();
			    }
			}).run();
        }
	// };
})()