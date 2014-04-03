var game = require('./game'),
    constants = require('./constants'),
    screenset = require('./BKGM/screenset'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT,
    speed = constants.SPEED;

var blockHeight   = constants.BLOCK_HEIGHT,
    blockGap      = constants.BLOCK_GAP,
    maxLeftWidth  = WIDTH - blockGap,
    maxY          = HEIGHT + blockHeight / 2,
    blockDistance = screenset(game,{
        'IPAD': 210,
        'IPHONE': 100,
        'DEFAULT': Math.floor(210 * SCALE)
    }),
    fullAngle     = 2*Math.PI;

var explosion = {};

function rotate(v, theta){
    var xTemp = v.x,
        cs = Math.cos(theta),
        sn = Math.sin(theta);
    v.x = v.x*cs - v.y*sn;
    v.y = xTemp*sn + v.y*cs;
}

explosion.reset = function(x, y){
    this.position = {x: x, y: y};
    this.opacity = 255;
    this.time = 1;
    this.lines = [];

    for (var i = 0; i < 50; i++) {
        var dir = {x: 0, y: 1};
        
        rotate(dir, Math.random(fullAngle));
        dir.x *= random(0, Math.floor(70 * SCALE));
        
        this.lines.push(dir);
    }
};

explosion.reset();

var lines = explosion.lines;

explosion.isDone = function() {
    return this.opacity <= 0;
};
explosion.update = function() {
    this.opacity = 255 * (1 - (this.time/30));
    this.time += 3 / (this.time * SCALE);
};
explosion.draw = function() {
    
    game.fill(255, 255, 255, random(0, 250));
    game.rect(0,0,WIDTH,HEIGHT);
    

    game.lineCapMode('round');
    game.strokeWidth(random(5, Math.floor(30 * SCALE)));
    game.stroke(255,255,255, Math.max(this.opacity,0));

    var p = this.position;
    for (var i = 0, l = lines.length; i < l; i++) {
        var v = lines[i];
        var vt = p + v * this.time;
        game.line(p.x, p.y, vt.x, vt.y);
    }

    
    
    game.lineCapMode('butt');
    game.strokeWidth(0);

}
module.exports = explosion;