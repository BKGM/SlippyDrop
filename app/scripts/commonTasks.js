var random = require('./random'),
	director = require('./BKGM/director'),
	game = require('./game'),
	constants = require('./constants'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT,
    speed = constants.SPEED,
    blocks = require('./blocks'),
    drop = require('./drop');

module.exports = function(){

	var background_c = [];

	director.task('background', function(){
        var c = random(0, 30);
        game.background(c, c, c, 255);
        
        if (c < 3 && background_c.length < 30) {
            var ra = random(0, WIDTH/8);
            
            background_c.push({
            	r: ra,
            	x: random(ra, WIDTH - ra),
            	y: -ra,
            	s: random(speed*0.8, speed*1.2)
            });
        }

        game.fill(255-c, 255-c, 255-c, 80);
        var incx = drop.rotate * 20;
        for (var i = 0, l = background_c.length; i < l; i++){
        	var v = background_c[i];
            v.x = v.x + incx;
            v.y = v.y + v.s + 1;
            if (v.y > HEIGHT + v.r || v.x > WIDTH + v.r || v.x < -v.r) {
                background_c.slice(i, 1);
            } else {
                
                game.circle(v.x, v.y, v.r);
            }
        }
        // game.background(100, 100, 100, 255);

    }, true);
    
    director.task('logo', function(logo_x, logo_y){

        var c = random(0, 30);
        var f = 25;
                
        game.fill(255-c, 255-c, 255-c, 255);
        
        var d = random(-1, 1);
        var e = random(-1, 1);
        
        game.text('BKgameMaker', logo_x + d, logo_y + f + e, 20);
        
        game.text('WHITE DROP', logo_x + d, logo_y - f + e, 50);
        game.fill(255-c, 255-c, 255-c, 255);
    }, true);
    
    director.task("buttons", function(buttons) {
        var x 		= buttons.x,
        	y 		= buttons.y,
        	w 		= buttons.w,
        	h 		= buttons.h,
        	s 		= buttons.s,
        	f 		= buttons.f,
        	list	= buttons.list;
        
        game.rectMode('CENTER');
        
        var d = random(0, 1),
        	e = random(-1, 0);
        
        for (var i = 0, l = list.length; i < l; i++) {
            game.fill(240, 240, 240, 180);
            game.rect(x + d, y - ( h + s ) * i + e, w, h);
            game.fill(0, 0, 0, 220);
            game.text(list[i], x + d, y - ( h + s ) * i + e, f);
        }
        
        if (game.currentTouch.isTouch) {
        	var tx = game.currentTouch.x,
        		ty = game.currentTouch.y;
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
        }
    }, true);
};