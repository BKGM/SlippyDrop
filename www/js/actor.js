(function(States){
	BKGM.Actor = function(obj){
		var _this = this;
		if(obj){
			_this.setup = obj.setup || _this.setup;
			//_this.draw = obj.draw || _this.draw;
			//_this.update = obj.update || _this.update;
		}
		
		return this;
    }
	BKGM.Actor.prototype={
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		_strokeStyle: "black",
		_fillStyle: "black",
		_BKGMIsMouseDown: false,
		childrentList: [],
		parent: null,
		setup: function (){
			return this;
		},
		_update: function(time){
			this.update();
			if(this.sprite) sprite.update();
			for (var i = this.childrentList.length - 1; i >= 0; i--) {
				this.childrentList[i]._update();
			};
			return this;	
		},
		_draw: function(game){
			this.sprite ? this.sprite.draw(game) : this.draw(game);
			for (var i = this.childrentList.length - 1; i >= 0; i--) {
				this.childrentList[i]._draw(game);
			};
			return this;
		},
		update:function(){
			return this;
		},
		draw:function(game){
			var ctx=game.ctx;
			ctx.beginPath();
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.fillStyle=this._fillStyle;
			ctx.fill();
			ctx.strokeStyle = this._strokeStyle
			ctx.stroke();
			ctx.closePath();
			return this;
		},
		addChild: function(child){
			if(!child) return this;
			this.childrentList.push(child)
			child._id = this.childrentList.length;
			child.parent = this;
			return this;
		},
		removeChild:function (child) {
			var pos = this.findChild(child);
			var ret = this.removeChildAt(pos);
			return ret;
        },
		findChild:function (child) {
			var cl = this.childrenList;
			var i;
			var len = cl.length;
			for (i = 0; i < len; i++) {
				if (cl[i] === child) {
					return i;
				}
			}
			return -1;
        },
		removeChildAt:function (pos) {
			var cl = this.childrenList;
			var rm;
			if (-1 !== pos && pos>=0 && pos<this.childrenList.length) {
				cl[pos].setParent(null);
				rm = cl.splice(pos, 1);
				return rm[0];
			}
			return null;
		},
		setParent:function (parent) {
			if(!parent) return this;
			this.parent = parent;
			return this;
        },
		setBounds: function (x,y,w,h){
			this.x = x || this.x;
			this.y = y || this.y;
			this.width = w || this.width;
			this.height = h || this.height;
			return this;
		},
		setSize: function(w,h){
			this.width = w || this.width
			this.height = h || this.height;
			return this;
		},
		setPosition: function(x,y){
			this.x = x || this.x;
			this.y = y || this.y;
			return this;
		},
		getPosition: function(){
			return {
				x: this.x,
				y: this.y
			}
		},
		setFillStyle: function(fillStyle){
			this._fillStyle= fillStyle;
			return this;
		},
		setStrokeStyle: function(strokeStyle){
			this._strokeStyle= strokeStyle;
			return this;
		},
		addSprite:function(sprite){
			this.sprite=sprite;
			sprite.init(this);
			return this;
		},
		removeSprite:function(){
			this.sprite=null;
			return this;
		},
		mouseDown: function(e){
			return this;
		},
		mouseUp: function(e){
			return this;
		},
		mouseEnter: function(e){
			return this;
		},
		mouseExit: function(e){
			return this;
		},
		_mouseDownHandler:function(e){
			if(this._isMouseDown) this.mouseDown(e);
			return this;
		},
		_mouseDownHandler: function(e){
			if(this._isMouseUp) this.mouseUp(e);
			return this;
		},
	}
})();