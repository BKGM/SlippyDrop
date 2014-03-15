(function(){
	var diameter      = 10 * SCALE,
		radius        = diameter/2,
		radiusSquare  = Math.pow(radius,2),
		maxTailLength = Math.floor(20*SCALE),
		accelCoef     = 1,
		maxX          = WIDTH - radius,
		minX          = radius,
		y             = HEIGHT/2,
		top           = y + radius,
		bot           = y - radius
    
    BKGM.Drop = function(game){
    	this.top      = top;
	    this.x        = WIDTH/2;
	    this.y        = y;
	    this.radius   = radius;
	    this.velx     = 0;
	    this.tail     = [ this.x ];
	    this.orgGravx = 0;
	    this.game     = game;
	    this._canvas=document.createElement('canvas');
	    this._canvas.width=WIDTH;
	    this._canvas.height=HEIGHT;
	    this._ctx=this._canvas.getContext('2d');
    };

    BKGM.Drop.prototype = {
		left: function(){
    		return this.x - radius;
    	},
		right: function(){
		    return this.x + radius;
		},
		updateTail: function(){
		    var tail = this.tail;
		    tail.unshift(this.x);
		    if (tail.length == maxTailLength) tail.pop();
		},

		updatePosition: function(){
		    this.velx = this.velx + (this.game.gravity.x - this.orgGravx) * accelCoef;
		    this.x   = this.x + this.velx;
		    
		    if (this.x > maxX) {
		        this.velx = 0;
		        this.x = maxX;
		    } else if (this.x < minX) {
		        this.velx = 0;
		        this.x = minX;
		    }
		},

		collideBearable: function(btop, bbot){
		    var hSquare = Math.pow(Math.min( Math.abs(bbot - y), Math.abs(btop - y) ), 2);
		    if (radiusSquare > hSquare) return Math.sqrt(radiusSquare - hSquare);
		    else return radius;
		},

		collide: function(block){
		    var btop = block.y + block.height/2, bbot = block.y;

		    if (btop >= bot && bbot <= top) {
		        var bearable = this.collideBearable(btop, bbot);
		        if (this.x - block.w <= bearable || block.wr - this.x <= bearable) {
		            return true;
		        }
		    }
		    return false;
		},
		draw: function(){

			var game = this.game;
			this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			this._ctx.beginPath();
			// this.ctx.arc(this.x, y, diameter, 0, Math.PI*2,false);
            this._ctx.fillStyle='#fff';
		    // game.fill(255, 255, 255, 1);
		    var tail = this.tail;
		    // if(tail.length==21 && !this.first) {this.pre();this.first=true;console.log(this.imgs.length)}
		    // game.circle(this.x, y, diameter);
		    for (var i = tail.length - 1; i >= 0; i--) {
		    	// var d=(diameter - diameter * i/tail.length)*2;
		        // if(this.first)game.ctx.drawImage(this.imgs[i],tail[i]-this.imgs[i].width/2, y + i * 3-this.imgs[i].width/2);
		        this._ctx.arc(tail[i], y + i * 3, (diameter - diameter * i/tail.length), 0, Math.PI*2,false);
		        // game.circle(tail[i], y + i * 3, (diameter - diameter * i/tail.length));
		        // game.circle(this.x, y, diameter);
		    }
		    
		    this._ctx.fill();
		    this._ctx.closePath();
		    game.ctx.drawImage(this._canvas,0,0,game.canvas.width,game.canvas.height);
		    game.fill(0, 0, 0, 1);
		    game.circle(this.x - diameter/4 - 1, y-1, diameter/4);
		    game.circle(this.x + diameter/4 + 1, y-1, diameter/4);

			
		}
    }
})();