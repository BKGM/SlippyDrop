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
    });

var Blocks = {};

Blocks.reset = function(){
    this.blocks  = [];
    this.current = 0;
    this.side    = 0;

};

Blocks.reset();


Blocks.get = function(i) {
    return this.blocks[i];
};

Blocks.head = function() {
    return this.blocks[0];
};

Blocks.last = function() {
    return this.blocks[this.blocks.length - 1];
};

Blocks.now = function() {
    return this.blocks[this.current];
}

Blocks.spawn = function(pos_y) {
    var y    = pos_y || 0,
        minw = 0,
        maxw = maxLeftWidth,
        sy   = y - blockHeight,
        sw   = random(minw, maxw),
        swr  = sw + blockGap;

    return this.blocks.push({y: sy, w: sw, wr: swr});
};

Blocks.unshift = function() {
    this.blocks.shift(1);
    this.current--;
};

Blocks.update = function() {

    for (var i = 0, l = this.blocks.length; i < l; i++){
        this.blocks[i].y += speed;
    }

    if (this.head().y >= maxY) this.unshift();

    var s = this.last().y - blockDistance;
    if (s >= 0) this.spawn(s);

};

Blocks.pass = function(drop) {
    var condition = this.now().y > drop.top;
    if (condition) this.current++;
    return condition
};

Blocks.draw = function() {
    game.rectMode('CORNER');
    for (var i = 0, l = this.blocks.length; i < l; i++) {
        var v = this.blocks[i];
        game.fill(200, 200, 200, 220);
        game.rect(0, v.y, v.w, blockHeight);
        game.rect(v.wr, v.y, WIDTH - v.wr, blockHeight);
    }
};

module.exports = Blocks;
