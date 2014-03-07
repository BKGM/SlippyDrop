(function(){
    var blockHeight   = 50 * SCALE,
        blockGap      = 120 * SCALE,
        maxLeftWidth  = WIDTH - blockGap,
        blockDistance = 210 * SCALE,
        maxY          = HEIGHT + blockHeight / 2;

    Codea.Blocks = function(game){
        this.blocks  = [];
        this.current = 0;
        this.height  = blockHeight;
        this.game    = game;
    };

    Codea.Blocks.prototype = {
        get: function(i){
            return this.blocks[i];
        },

        head: function(){
            return this.blocks[0];
        },

        last: function(){
            var blocks = this.blocks;
            return blocks[blocks.length-1];
        },

        now: function(){
            return this.blocks[this.current];
        },

        spawn: function(pos_y){
            pos_y = pos_y || 0;
            var sy = pos_y - blockHeight;
            var sw = this.game.random(blockGap, maxLeftWidth);
            var swr = sw + blockGap
            return this.blocks.push({y : sy, w : sw, wr : swr});
        },

        unshift: function(){
            this.blocks.shift();
            this.current--;
        },

        update: function(){

            for (v in this.blocks) {
                this.blocks[v].y += this.game.speed;
            }

            if (this.get(0).y >= maxY) this.unshift();

            var s = this.last().y - blockDistance;
            if (s >= 0) this.spawn(s);

        },

        pass: function(drop){
            var condition = this.now().y > drop.top;
            if (condition) this.current++;
            return condition
        },

        draw: function(){
            var blocks = this.blocks;
            var game = this.game;
            for (var i = 0, l = blocks.length; i < l; i++) {
                var v = blocks[i];
                var r = game.random(0, 2);
                var k = game.random(5, 10);
                if (r < 1){
                    game.fill(255, 255, 255, Math.random());
                    game.rect(0, v.y-k, v.w, this.height+2*k);
                    game.rect(v.wr, v.y-k, WIDTH - v.wr, this.height+2*k);
                }
                game.fill(255, 255, 255, 1);
                game.rect(0, v.y, v.w, this.height);
                game.rect(v.wr, v.y, WIDTH - v.wr, this.height);
            }
        }
    }
})();
