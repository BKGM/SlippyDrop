window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
SCALE = WIDTH/768;
var BKGM = BKGM||{};
(function(){
    BKGM = function(obj){
        var _this=this;
        _this.gravity={x:0,y:0,z:0};
        
        if ((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)) {
            window.addEventListener('devicemotion', function(eventData){
                        if(eventData.accelerationIncludingGravity)
                            _this.gravity = {x:-eventData.accelerationIncludingGravity.x/3,y:eventData.accelerationIncludingGravity.y/3,z:eventData.accelerationIncludingGravity.z};
                    }, false);
        } else {
           console.log("Not supported on your device or browser.  Sorry.")
        }
        
        if(obj){
            this.setup=obj.setup||this.setup;
            this.draw=obj.draw||this.draw;
        }
        this.canvas = document.getElementById("game") || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = "center";


        this.ctx.imageSmoothingEnabled= true;
        this.ctx.mozImageSmoothingEnabled= true;
        this.ctx.webkitImageSmoothingEnabled= true;
        this._circle = document.createElement('canvas');
        this._circle.width=200;
        this._circle.height=200;
        var _ctx = this._circle.getContext('2d');
        _ctx.arc(100,100,100,0,Math.PI*2);
        _ctx.fillStyle='#fff';
        _ctx.fill();
       
        this._fps = {
            startTime : 0,
            frameNumber : 0,
            getFPS : function(){
                this.frameNumber++;
                var d = new Date().getTime(),
                    currentTime = ( d - this.startTime ) / 1000,
                    result = Math.floor( ( this.frameNumber / currentTime ) );

                if( currentTime > 1 ){
                    this.startTime = new Date().getTime();
                    this.frameNumber = 0;
                }
                return result;

            }

        };
        //this.ctx.globalCompositeOperation = 'source-atop';
            
        return this;
    }
    BKGM.prototype = {
        loop:function(_this){
            _this.FPS=_this._fps.getFPS();
            _this.WIDTH = window.innerWidth;
            _this.HEIGHT  = window.innerHeight;
            _this.SCALE = _this.WIDTH/768;
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this._staticDraw();
            _this.draw();        
            requestAnimationFrame(function(){
                _this.loop(_this);
            });
            return _this;
        },
        run:function(){
            this.setup();
            this.ctx.translate(0, this.canvas.height);
            this.ctx.scale(1,-1);
            this.loop(this);
            return this;
        },
        setup:function(){
            return this;
        },
        draw:function(){
            return this;
        },
        _staticDraw:function(){
            if (this._bg){       
                this.ctx.beginPath();
                this.ctx.rect(0, 0, this.canvas.width, this.canvas.height); 
                this.ctx.fillStyle = 'rgb('+this._bg.R+','+this._bg.G+','+this._bg.B+')';               
                this.ctx.fill();
            }
            return this;
        },
        background:function(R, G, B){
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height); 
            this.ctx.fillStyle = 'rgb('+R+','+G+','+B+')';               
            this.ctx.fill();
            return this;
        },
        fill:function(R, G, B, A){
            this.ctx.beginPath();
            this.ctx.fillStyle="rgba("+R+", "+G+", "+B+", " + A + ")";
            // this.ctx.fill();
            return this;
        },
        rect:function(x, y, width, height){
            if(this._rectMode==="CENTER"){
                this.ctx.rect(x-width/2, y-height/2, width, height);  
            } else 
            this.ctx.rect(x, y, width, height);
            this.ctx.fill();  
            return this;
        },
        rectMode:function(Input){
            this._rectMode=Input;
            return this;
        },
        text:function( string, x, y, fontSize){
            this.ctx.save();
            this.ctx.translate(0, this.canvas.height);
            this.ctx.scale(1,-1);  
            
            this.ctx.font = fontSize+'px Times New Roman'||'40px Times New Roman';
            this.ctx.fillText(string, x, this.canvas.height-(y-fontSize/2));
            this.ctx.restore();
            return this;
        },
        circle:function( x, y, diameter){
            this.ctx.beginPath();
            // this.ctx.drawImage(this._circle,0,0,this._circle.width,this._circle.width,x - diameter,y - diameter,diameter*2,diameter*2);
            this.ctx.arc(x, y, diameter, 0, Math.PI*2,false);
            this.ctx.fill(); 
            return this;
        },
        line:function(x1, y1, x2, y2){
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineCap = this._linemode||'butt';
            if (this._strokeWidth) this.ctx.lineWidth = this._strokeWidth;
            if (this._strokeColor) this.ctx.strokeStyle = this._strokeColor;
            this.ctx.stroke();
            this.ctx.closePath();
            return this;
        },
        lineCapMode:function(lineMode){
            this._linemode=lineMode;
            return this;
        },
        stroke:function(color, width){
            this._strokeColor=color;
            this._strokeWidth=width;
            return this;
        }
    }
    var addMouseTouchEvent= function(_this){
        _this.currentTouch={ state:"ENDED" };
        _this.canvas.addEventListener('touchstart', function(event) {
            for (var i = 0; i < event.touches.length; i++) {
                var touch = event.touches[i];                
            }
            _this.currentTouch.state="START";
            if(_this.touchStart) _this.touchStart();
        }, false);
        _this.canvas.addEventListener('touchmove', function(event) {
            for (var i = 0; i < event.touches.length; i++) {
                var touch = event.touches[i];
                
            }
            _this.currentTouch.state="MOVING";
            if(_this.touchDrag) _this.touchDrag();
        }, false);
        _this.canvas.addEventListener('touchend', function(event) {
            for (var i = 0; i < event.touches.length; i++) {
                var touch = event.touches[i];                
            }
            _this.currentTouch.state="ENDED";
            if(_this.touchEnd) _this.touchEnd();
        }, false);
        _this.canvas.addEventListener('mousedown', function(event) {
            _this._mouseDown=true;
            _this.currentTouch.state="START";
            if(_this.mouseDown) _this.mouseDown();
        }, false);
        _this.canvas.addEventListener('mousemove', function(event) {
            if(_this._mouseDown) _this.currentTouch.state="MOVING";
            if(_this.mouseDrag) _this.mouseDrag();
        }, false);
        _this.canvas.addEventListener('mouseup', function(event) {
            _this._mouseDown=false;
            _this.currentTouch.state="ENDED";
            if(_this.mouseUp) _this.mouseUp();
        }, false);
    }
})();
(function(){
    var BKGM = BKGM||{};
    // var s1 = new BKGM.Audio().setAudio('1');
    BKGM.Audio = function(){
        return this;
    }
    BKGM.Audio.prototype= {

        audio   : null,

        setAudio : function( name ) {
            var self=this;
            this.audio= new Audio();
            this.audio.preload = 'auto';
            var source = document.createElement('source');
            if (this.audio.canPlayType("audio/ogg; codecs=vorbis")) {
                source.type= 'audio/ogg';
                source.src= 'sounds/'+name+'.ogg';
            } else {
                source.type= 'audio/mpeg';
                source.src= 'sounds/'+name+'.mp3';
            }
            this.audio.appendChild(source);

            this.audio.load();
            myAudio.addEventListener('ended', function() { 
                    if(self.ended) self.ended()
                    if(self._loop) {
                        self.play();
                    }
                }, false);
            return this;
        },

        loop : function( loop ) {
            this._loop=loop;
            return this;
        },

        play : function() {
            this.audio.currentTime=0;
            this.audio.play();
            return this;
        },

        pause : function() {
            this.audio.pause();
            return this;
        },
        stop : function(){
            this.audio.currentTime=0;
            this.audio.pause();
            return this;
        },
        ended:function(){
            return this;
        }

    };
})();
(function(){
    var BKGM = BKGM||{};
    BKGM.loadImages = function(arr,callback){
        var self=this;
        var loaded=0;
        for (var i = arr.length - 1; i >= 0; i--) {
            var image=new Image();
            image.src=arr[i];
            image.onload=function(){
                loaded++;
                if (loaded==arr.length)
                    if (callback) callback();
                    else if(self.onloadImagesAll) self.onloadImagesAll();
            }
        };
        return this;
    };
    BKGM.Sprite = function(obj){
        if(obj){
            this.image=obj.image||this.image;
            this.rows=obj.rows||this.rows;
            this.columns=obj.columns||this.columns;
        }
        return this;
    }
    BKGM.Sprite.prototype= {
        rows:1,
        columns:1,
        image:null,
        changeFPS:200
    };
})();