var game = require('./game'),
    constants = require('./constants'),
    screenset = require('./BKGM/screenset'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    WIDTH = game.WIDTH,
    blockHeight = constants.BLOCK_HEIGHT,
    speed = constants.SPEED;

var diameter      = constants.DROP_DIAMETER,
    radius        = Math.floor(diameter / 2 + 0.5),
    radiusSquare  = radius * radius,
    accelCoef     = constants.DROP_ACCEL,
    vGravCoef     = constants.DROP_GRAV,
    maxX          = WIDTH - radius,
    minX          = radius,
    y             = constants.DROP_Y,
    top           = y + radius,
    bot           = y - radius,
    maxTailLength = screenset({
        'IPAD': 20,
        'IPHONE': 15,
        'DEFAULT': Math.floor(20 * SQRT_SCALE)
    });

var drop = {};

drop.reset = function(){
    this.top      = top;
    this.x        = WIDTH/2;
    this.radius   = radius;
    this.velx     = 0;
    this.tail     = [ WIDTH/2 ];
    this.rotate   = 0;
    this.collideBearablePrecaled = {};
    drop.collideBearablePrecal();
};

drop.collideBearable = function(btop, bbot){
    var hSquare = Math.min( Math.abs(bbot - y), Math.abs(btop - y) ),
        hSquare = hSquare*hSquare;
    if (radiusSquare > hSquare) {
        return Math.sqrt(radiusSquare - hSquare);
    } else return radius; // DONT KNOW WHAT TO RETURN AT ALL =.='
};

drop.collideBearablePrecal = function(){
    for (var i = y - radius - blockHeight - 5, l = y + radius + 5; i < l; i++) {
        collideBearablePrecaled[i] = this.collideBearable(i, i + blockHeight);
    }
};

drop.reset();

game.stroke(255, 255, 255, 61);

var tail = drop.tail,
    collideBearablePrecaled = drop.collideBearablePrecaled;

drop.updateTail = function(){
    tail.unshift(this.x);
    if (tail.length === maxTailLength) tail.pop();
}

drop.updatePosition = function(){
            this.velx += game.gravity.x * accelCoef;
    var x = this.x    += this.velx;
    
    if (x > maxX) {
        this.velx = 0;
        this.x = maxX;
    } else if (x < minX) {
        this.velx = 0;
        this.x = minX;
    }
};

drop.updateByTouch = function(){
    var x = this.x;

    if (game.currentTouch.state === 'MOVING') {
        var tx = game.currentTouch.x,
            ty = game.currentTouch.y;
        this.rotate = (tx - x) / 768;
        game.strokeWidth(4);
        game.line(x, y, tx, ty);
        game.strokeWidth(0);
        game.fill(255, 255, 255, 148);
        game.circle(tx, ty, 50);
    }
    
        this.velx += this.rotate;
    x = this.x    += this.velx;
    
    if (x > maxX) {
        this.velx = 0;
        this.x = maxX;
    } else if (x < minX) {
        this.velx = 0;
        this.x = minX;
    }
};

drop.collide = function(block){
    var btop = block.y + blockHeight,
        bbot = block.y,
        x    = this.x;
    if (btop >= bot && bbot <= top) {
        var bearable = collideBearablePrecaled[bbot];
        return x - block.w <= bearable || block.wr - x <= bearable;
    } else return false;
};

drop.draw = function(){
    game.fill(255, 255, 255, 255);

    // Draw tail
    for (var i = 0, l = tail.length; i < l; i++) {
        game.circle(tail[i], y + i * speed, diameter - diameter*i/l);
    }

    var x = this.x;

    // Draw head
    game.circle(x, y, diameter);

    // Draw eyes
    game.fill(0, 0, 0, 255);
    game.circle(x - diameter/6 - 1, y-1, diameter/3);
    game.circle(x + diameter/6 + 1, y-1, diameter/3);
};

module.exports = drop;