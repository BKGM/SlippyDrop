window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
             window.setTimeout(callback, 1000 / 60);
        };
})();


var BKGM = BKGM||{};

(function(){
    

    ((typeof(cordova) == 'undefined') && (typeof(phonegap) == 'undefined')) ? BKGM._isCordova=false : BKGM._isCordova=true;
    var lastTime=0;
    var t = 0;
    var sceneTime = 0;
    var frameTime=1000/60;
    var _statesLoop=[];
    var _count=[];
    
    var debug=document.createElement("div");
    debug.style.position="absolute";
    debug.style.color="red";
    var addLoop = function(_this){
        _statesLoop.push(_this);
    };
    var _loop = function(){
        var time=new Date();
        for (var i = _statesLoop.length - 1; i >= 0; i--) {
            var now =new Date();
            var dt =  now - lastTime;//Khoang thoi gian giua 2 lan cap nhat
            lastTime = now;
            t += dt ;//Thoi gian delay giua 2 lan cap nhat
            while (t >= frameTime) {//Chay chi khi thoi gian delay giua 2 lan lon hon 10ms
                t -= frameTime;//Dung de xac dinh so buoc' tinh toan
                sceneTime += frameTime;
                _statesLoop[i].update(_statesLoop[i], sceneTime);
                _statesLoop[i].time=sceneTime;
            }   
            _statesLoop[i].loop(_statesLoop[i]);
        };
        var _drawtime=(new Date()- time);
        var drawtime=0;
        _count.push(_drawtime);
        for (var i = _count.length - 1; i >= 0; i--) {
            drawtime+=_count[i];
        };
        
        if (_count.length>=100) {
            _count.unshift();

        }
        if(debug && BKGM.debug)debug.innerHTML="draw time: "+(drawtime/_count.length*100>>0)/100 +"</br> FPS: "+_statesLoop[0].FPS;  
        requestAnimFrame(function(){
            _loop();
        });
    };
    
    BKGM = function(obj){
        var _this=this;
        _this.gravity={x:0,y:0,z:0};
        BKGM.SINGLE_TOUCH=0;
        BKGM.MULTI_TOUCH=1;
        BKGM.TYPE_TOUCH=BKGM.SINGLE_TOUCH;

        _this.Codea = obj.Codea;
        
        if(obj.DeviceMotion)
        if ((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)) {
            window.addEventListener('devicemotion', function(eventData){
                        if(eventData.accelerationIncludingGravity)
                            _this.gravity = {x:eventData.accelerationIncludingGravity.y/3,y:eventData.accelerationIncludingGravity.x/3,z:eventData.accelerationIncludingGravity.z};

                    }, false);

        } else {
            if(navigator &&  navigator.accelerometer){
                 // The watch id references the current `watchAcceleration`
                var watchID = null;


                

                // Start watching the acceleration
                //
                function startWatch() {

                    // Update acceleration every 1000/60 seconds
                    var options = { frequency: 1000/60 };

                    watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
                }

                // Stop watching the acceleration
                //
                function stopWatch() {
                    if (watchID) {
                        navigator.accelerometer.clearWatch(watchID);
                        watchID = null;
                    }
                }


                function onSuccess(acceleration) {
                    _this.gravity = {x:acceleration.x/3,y:acceleration.y/3,z:acceleration.z};
                };

                function onError() {
                    alert('onError!');
                };
                startWatch();
                // navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);*/
            } else
                console.log("Not supported on your device or browser.  Sorry.")
        }
        
        
        if(obj){
            this.setup=obj.setup||this.setup;
            this.update=obj.update||this.update;
            this.draw=obj.draw||this.draw;
        }
        this.resource={};
        this.childrentList=[];

        if (document.getElementById("game"))
            this.canvas = document.getElementById("game");
        else {
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute("id", "game");
            this.canvas.width  = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
        }       
        this.width=this.canvas.width;
        this.height=this.canvas.height;
        this.WIDTH = this.canvas.width;
        this.HEIGHT  = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        // this.ctx.textAlign = "center";
        

        this.ctx.imageSmoothingEnabled= true;
        this.ctx.mozImageSmoothingEnabled= true;
        this.ctx.webkitImageSmoothingEnabled= true;
        // this._circle = document.createElement('canvas');
        // this._circle.width=200;
        // this._circle.height=200;
        // var _ctx = this._circle.getContext('2d');
        // _ctx.arc(100,100,100,0,Math.PI*2);
        // _ctx.fillStyle='#fff';
        // _ctx.fill();
       
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
        addMouseTouchEvent(this);
        addKeyEvent(this);
        return this;
    }
    BKGM.prototype = {
        time:0,
        loop:function(_this){            
            _this.FPS=_this._fps.getFPS();            
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this._staticDraw();
            _this.draw(_this);                  
            return _this;
        },
        run:function(){
            if(BKGM.debug)document.body.appendChild(debug);
            
            this.SCALE = Math.min(this.HEIGHT/400,this.WIDTH/400) ;
            this.setup();
            if(this.Codea){
                this.ctx.translate(0, this.canvas.height);
                this.ctx.scale(1,-1);
            }            
            lastTime=new Date();
            addLoop(this);
            _loop();
            return this;
        },
        setup:function(){
            return this;
        },
        update:function(){
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
            this.ctx.textAlign='center';
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
        stroke:function(R, G, B, A){
            this._strokeColor="rgba("+R+", "+G+", "+B+", " + A + ")";
            return this;
        },
        strokeWidth: function(width){
            this._strokeWidth=width;
            return this;
        },
        addRes:function(res){
            this.resource=res;
            return this;
        },
        addChild:function(child){
            this.childrentList.push(child);
            return this;
        },
        removeChild:function(child){
            this.childrentList.splice(this.childrentList.indexOf(child),1);
            return this;
        },
        addStates:function(states){
            this.states=states;
        },
        _swipe:function(e){
            var s=this._startWipe;
            var x_1=s.x,y_1=s.y;
            var x_2=e.x,y_2=e.y;
            var delta_x = x_2 - x_1,
            delta_y = y_2 - y_1;
            var threadsold=_THREADSOLD*this.SCALE;
            if ( (delta_x < threadsold && delta_x > -threadsold) || (delta_y < threadsold && delta_y > -threadsold) ) return false;

            var tan = Math.abs(delta_y / delta_x);
            
            switch( ( (delta_y > 0 ? 1 : 2) + (delta_x > 0 ? 0 : 2) ) * (tan > 1? 1 : -1) ){
                case  1: //position.TOP_RIGHT:
                case  3: //position.TOP_LEFT:
                    this.swipe('DOWN');
                break;
                case -1: //-position.TOP_RIGHT:
                case -2: //-position.BOTTOM_RIGHT:
                    this.swipe('RIGHT');
                break;
                case -3: //-position.TOP_LEFT:
                case -4: //-position.BOTTOM_LEFT:
                    this.swipe('LEFT');
                break;
                case  2: //position.BOTTOM_RIGHT:
                case  4: //position.BOTTOM_LEFT:
                    this.swipe('UP');
                break;
            }
        },
        _touchStart:function(e){
            if(this.swipe && BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH) this._startWipe=e;
            if(this.touchStart) this.touchStart(e);
        },
        _touchEnd:function(e){

            if(this.swipe && BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH) this._swipe(e);
            if(this.touchEnd) this.touchEnd(e);
        },
        _touchDrag:function(e){
            if(this.touchDrag) this.touchDrag(e);
        },
        _mouseDown:function(e){
            if(this.swipe && BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH) this._startWipe=e;
            if(this.mouseDown) this.mouseDown(e);
        },
        _mouseUp:function(e){
            if(this.swipe && BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH) this._swipe(e);
            if(this.mouseUp) this.mouseUp(e);
        },
        _mouseDrag:function(e){
            if(this.mouseDrag) this.mouseDrag(e);
        }

        
    }
    var _THREADSOLD = 2; //pixels
    var checkMousePos=function(e,_this){
        var x;
        var y;
        if (e.pageX || e.pageY) { 
          x = e.pageX;
          y = e.pageY;
        }
        else { 
          x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
          y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= _this.canvas.offsetLeft;
        y -= _this.canvas.offsetTop;
        return {x:x,y:y,number:e.identifier}
    }
    
    var addMouseTouchEvent= function(_this){
        
        _this.currentTouch={ state:"ENDED" };
        _this.canvas.addEventListener('touchstart', function(event) {
            var touchs=[];
            if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH)
                if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
                event.targetTouches > 1) {
                  return; // Ignore if touching with more than 1 finger
                }
            
            for (var i = 0; i < event.touches.length; i++) {
                
                if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH) {
                    var touch = event.touches[0];
                    var e=checkMousePos(touch,_this);
                    _this.currentTouch.state="START";
                    if(_this.states && _this.states._touchStart) _this.states._touchStart(e); else
                    if(_this._touchStart) _this._touchStart(e);
                    break;
                }
                var touch = event.touches[i];
                var e=checkMousePos(touch,_this);
                touchs.push(e);
            }
        
            if(BKGM.TYPE_TOUCH===BKGM.MULTI_TOUCH){
                if(_this.states && _this.states._touchStart) _this.states._touchStart(touchs); else
                if(_this._touchStart) _this._touchStart(touchs);  
            }
            // for (var j = _this.childrentList.length - 1; j >= 0; j--) {
            //     if(_this.childrentList[j]._eventenable &&checkEventActor( e,_this.childrentList[j])) {
            //         if(_this.childrentList[j].touchStart) _this.childrentList[j].touchStart(e)
            //         return;
            //     }
            // };
            // console.log(touch)
                 

            
            
            
           
        }, false);
        _this.canvas.addEventListener('touchmove', function(event) {
            var touchs=[];
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                if(BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH && touch.identifier==0) {                   
                    _this.currentTouch.state="MOVING";
                    if(_this._touchDrag) _this._touchDrag(checkMousePos(touch,_this));
                    break;
                }
                var touch = event.changedTouches[i];
                var e=checkMousePos(touch,_this);
                touchs.push(e);
                
            }
            if(BKGM.TYPE_TOUCH==BKGM.MULTI_TOUCH){
                if(_this._touchDrag) _this._touchDrag(touchs);  
            }
            
        }, false);
        _this.canvas.addEventListener('touchend', function(event) {
            var touchs=[];
            if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH)
                if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
                event.targetTouches > 0) {
              return; // Ignore if still touching with one or more fingers
            }
           
            for (var i = 0; i < event.changedTouches.length; i++) {
               
                if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH) {            
                    // console.log(touch)  
                     var touch = event.changedTouches[0]; 
                    _this.currentTouch.state="ENDED";
                    var e=checkMousePos(touch,_this);
                    if(_this.states && _this.states.touchEnd) _this.states._touchEnd(e); else
                    if(_this._touchEnd) _this._touchEnd(e); 
                    break;
                }
                var touch = event.changedTouches[i]; 
                // console.log(touch)  
                var e=checkMousePos(touch,_this);
                touchs.push(e)
                
                             
            }
            if(BKGM.TYPE_TOUCH===BKGM.MULTI_TOUCH){
                if(_this.states && _this.states.touchEnd) _this.states._touchEnd(touchs); else
                if(_this._touchEnd) _this._touchEnd(touchs);
            }
            
            
            
        }, false);
        _this.canvas.addEventListener('mousedown', function(event) {
            var e=checkMousePos(event,_this);
            _this._ismouseDown=true;
            _this.currentTouch.state="START";
            // for (var i = _this.childrentList.length - 1; i >= 0; i--) {
            //     if(_this.childrentList[i]._eventenable &&checkEventActor( e,_this.childrentList[i])) {
            //         _this.childrentList[i].mouseDown(e)
            //         return;
            //     }
            // };
            if(_this.states && _this.states._mouseDown) _this.states._mouseDown(e); else
                    if(_this._mouseDown) _this._mouseDown(e);
        }, false);
        _this.canvas.addEventListener('mousemove', function(event) {
            var e=checkMousePos(event,_this);
            if(_this._ismouseDown) _this.currentTouch.state="MOVING";
            if(this._ismouseDown){
                if(_this.states && _this.states._mouseDrag) _this.states._mouseDrag(e); else
                    if(_this._mouseDrag) _this._mouseDrag(e);
            }
            
        }, false);
        _this.canvas.addEventListener('mouseup', function(event) {
            var e=checkMousePos(event,_this);
            _this._ismouseDown=false;
            _this.currentTouch.state="ENDED";
            // for (var i = _this.childrentList.length - 1; i >= 0; i--) {
            //     if(_this.childrentList[i]._eventenable &&checkEventActor( e,_this.childrentList[i])) {
            //         _this.childrentList[i].mouseUp(e)
            //         return;
            //     }
            // };
            if(_this.states && _this.states._mouseUp) _this.states._mouseUp(e); else
                    if(_this._mouseUp) _this._mouseUp(e);
        }, false);
    }
    var addKeyEvent=function(_this){
        BKGM.KEYS = {

            /** @const */ ENTER:13,
            /** @const */ BACKSPACE:8,
            /** @const */ TAB:9,
            /** @const */ SHIFT:16,
            /** @const */ CTRL:17,
            /** @const */ ALT:18,
            /** @const */ PAUSE:19,
            /** @const */ CAPSLOCK:20,
            /** @const */ ESCAPE:27,
            /** @const */ PAGEUP:33,
            /** @const */ PAGEDOWN:34,
            /** @const */ END:35,
            /** @const */ HOME:36,
            /** @const */ LEFT:37,
            /** @const */ UP:38,
            /** @const */ RIGHT:39,
            /** @const */ DOWN:40,
            /** @const */ INSERT:45,
            /** @const */ DELETE:46,
            /** @const */ 0:48,
            /** @const */ 1:49,
            /** @const */ 2:50,
            /** @const */ 3:51,
            /** @const */ 4:52,
            /** @const */ 5:53,
            /** @const */ 6:54,
            /** @const */ 7:55,
            /** @const */ 8:56,
            /** @const */ 9:57,
            /** @const */ a:65,
            /** @const */ b:66,
            /** @const */ c:67,
            /** @const */ d:68,
            /** @const */ e:69,
            /** @const */ f:70,
            /** @const */ g:71,
            /** @const */ h:72,
            /** @const */ i:73,
            /** @const */ j:74,
            /** @const */ k:75,
            /** @const */ l:76,
            /** @const */ m:77,
            /** @const */ n:78,
            /** @const */ o:79,
            /** @const */ p:80,
            /** @const */ q:81,
            /** @const */ r:82,
            /** @const */ s:83,
            /** @const */ t:84,
            /** @const */ u:85,
            /** @const */ v:86,
            /** @const */ w:87,
            /** @const */ x:88,
            /** @const */ y:89,
            /** @const */ z:90,
            /** @const */ SELECT:93,
            /** @const */ NUMPAD0:96,
            /** @const */ NUMPAD1:97,
            /** @const */ NUMPAD2:98,
            /** @const */ NUMPAD3:99,
            /** @const */ NUMPAD4:100,
            /** @const */ NUMPAD5:101,
            /** @const */ NUMPAD6:102,
            /** @const */ NUMPAD7:103,
            /** @const */ NUMPAD8:104,
            /** @const */ NUMPAD9:105,
            /** @const */ MULTIPLY:106,
            /** @const */ ADD:107,
            /** @const */ SUBTRACT:109,
            /** @const */ DECIMALPOINT:110,
            /** @const */ DIVIDE:111,
            /** @const */ F1:112,
            /** @const */ F2:113,
            /** @const */ F3:114,
            /** @const */ F4:115,
            /** @const */ F5:116,
            /** @const */ F6:117,
            /** @const */ F7:118,
            /** @const */ F8:119,
            /** @const */ F9:120,
            /** @const */ F10:121,
            /** @const */ F11:122,
            /** @const */ F12:123,
            /** @const */ NUMLOCK:144,
            /** @const */ SCROLLLOCK:145,
            /** @const */ SEMICOLON:186,
            /** @const */ EQUALSIGN:187,
            /** @const */ COMMA:188,
            /** @const */ DASH:189,
            /** @const */ PERIOD:190,
            /** @const */ FORWARDSLASH:191,
            /** @const */ GRAVEACCENT:192,
            /** @const */ OPENBRACKET:219,
            /** @const */ BACKSLASH:220,
            /** @const */ CLOSEBRAKET:221,
            /** @const */ SINGLEQUOTE:222
        };

        /**
         * @deprecated
         * @type {Object}
         */
        BKGM.Keys= BKGM.KEYS;

        /**
         * Shift key code
         * @type {Number}
         */
        BKGM.SHIFT_KEY=    16;

        /**
         * Control key code
         * @type {Number}
         */
        BKGM.CONTROL_KEY=  17;

        /**
         * Alt key code
         * @type {Number}
         */
        BKGM.ALT_KEY=      18;

        /**
         * Enter key code
         * @type {Number}
         */
        BKGM.ENTER_KEY=    13;

        /**
         * Event modifiers.
         * @type enum
         */
        BKGM.KEY_MODIFIERS= {

            /** @const */ alt:        false,
            /** @const */ control:    false,
            /** @const */ shift:      false
        };
        window.addEventListener('keydown', function(event) {
            _this._keyDown=true;
            if(_this.keyDown) _this.keyDown(event);
        },false)
    }
})();
(function(){
    // var BKGM = BKGM||{};
    // var s1 = new BKGM.Audio().setAudio('1');
    function getPhoneGapPath() {

        var path = window.location.pathname;
        path = path.substr( path, path.length - 10 );
        return path;

    };
    BKGM.Audio = function(){
        return this;
    }
    BKGM.Audio.prototype= {

        audio   : null,

        setAudio : function( name ,callback) {
            var self=this;
            if(BKGM._isCordova){
                this.src = getPhoneGapPath() + "/" + name;
                if (callback && !self.call) {callback();self.call=1;}
               
            }else {
                this.audio= new Audio(name);
                this.audio.preload = 'auto';
              

                this.audio.load();
                
                this.audio.addEventListener('ended', function() { 
                        // this.currentTime=0;
                        if(self.ended) self.ended();
                    }, false);
                this.audio.addEventListener('canplaythrough', function() { 
                   self._onload();
                   if (callback && !self.call) {callback();self.call=1;}
                }, false);
            }
            return this;
        },

        loop : function( loop ) {
            this._loop=loop;
            return this;
        },
        forceplay:function(){
           
            if(BKGM._isCordova){
                var src=this.src;
                // var src='http://static.weareswoop.com/audio/charlestown/track_1.mp3';

                // Create Media object from src
                if(!this.audio)this.audio = new Media(src, function(){
                   self._onload();
                   
                 }, function(error){});
                // Play audio
                this.stop();
                this.audio.play();

                
            } else {
                 this.stop();
                 this.play();
            }
            
            return this;
        },
        play : function() {
            this.audio.play();
            return this;
        },

        pause : function() {
            //this.audio.pause();
            if (this.audio) {
                this.audio.pause();
            }
            return this;
        },
        stop : function(){
            if(BKGM._isCordova && this.audio) {
                this.audio.stop();
            } else {                
                this.audio.currentTime=0;
                this.audio.pause();
            }            
            return this;
        },
        ended:function(){
            return this;
        },
        _onload:function(){
            return this;
        }

    };
})();
(function(){
    BKGM.loadJS=function(url,callback){
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    };
    BKGM.checkMouseBox=function(e,obj){          
        return (e.x>obj.x&&e.y>obj.y&&e.x<(obj.x+obj.w)&&e.y<(obj.y+obj.h));
    };
    BKGM.checkEventActor=function(e,_actor){
        var originX=_actor.x,originY=_actor.y;
        var mouseX=e.x,mouseY=e.y;
        var dx = mouseX - originX, dy = mouseY - originY;
        // distance between the point and the center of the rectangle
        var h1 = Math.sqrt(dx*dx + dy*dy);
        var currA = Math.atan2(dy,dx);
        // Angle of point rotated around origin of rectangle in opposition
        var newA = currA - _actor.rotation;
        // New position of mouse point when rotated
        var x2 = Math.cos(newA) * h1;
        var y2 = Math.sin(newA) * h1;
        // Check relative to center of rectangle
        if (x2 > -0.5 * _actor.width && x2 < 0.5 * _actor.width && y2 > -0.5 * _actor.height && y2 < 0.5 * _actor.height){
            return true;
        }
    };
    BKGM.ajax = function(obj){
        var ajax = {
            url:obj.url ? obj.url :"", //url
            type:obj.type ? obj.type : "POST",// POST or GET
            data:obj.data ? obj.data : null,
            // processData:obj.processData ? obj.processData : false,
            // contentType:obj.contentType ? obj.contentType :false,
            // cache: obj.cache ? obj.cache : true,
            success: obj.success ? obj.success : null,
            error: obj.error ? obj.error : null,
            complete: obj.complete ? obj.complete : null
        }
        
        var xhr = new XMLHttpRequest();
        // xhr.upload.addEventListener('progress',function(ev){
        //     console.log((ev.loaded/ev.total)+'%');
        // }, false);
        xhr.onreadystatechange = function(ev){
            if (xhr.status==200) {
                if(ajax.success) ajax.success(xhr.responseText);
                if (xhr.readyState==4)
                    if (ajax.complete) ajax.complete(xhr.responseText)            
            } else {
                if (ajax.error) ajax.error(xhr.responseText);
            }            
        };
        xhr.open(ajax.type, ajax.url, true);
        xhr.send(ajax.data);
    }
})();
(function(){
    BKGM.preload=function(){
        this.audios={};
        this.images={};
        this._maxElementLoad=0;
        this._elementLoaded=0;
    };
    BKGM.preload.prototype.load=function(type,name,url,callback){
            var self=this;
            this._maxElementLoad++;
            if (type==="image"){
                var image=new Image();
                image.src=url;
                self.images[name]=image;
                image.onload=function(){
                        self._onload();
                        if (callback) callback();
                }
            } else
            if(type==="audio"){
                
                var audio=new BKGM.Audio();
                audio.setAudio(url,function(){self._onload()});
                self.audios[name]=audio;
                if (callback) callback();
            }
            return this;
        }
    BKGM.preload.prototype._onload=function(){

        this._elementLoaded++;
        if(this._maxElementLoad<=this._elementLoaded)
            this.onloadAll();
        return this;
    }
    BKGM.preload.prototype.onloadAll=function(){
        return this;
    }
})();

(function(){
    BKGM.Ads=function(adunit){
        this.adunit=adunit;
        mopub_ad_unit = adunit;
        mopub_ad_width = this.width; // optional
        mopub_ad_height = this.height; // optional
    }
    BKGM.Ads.prototype={
        width:320,
        height:50,
        init:function(adunit){
           
            return this;
        },
        setSize:function(w,h){
            this.width=w;
            this.height=h;
            mopub_ad_width = this.width; // optional
            mopub_ad_height = this.height; // optional
            return this;
        },
        setKeyword:function(arr){
            this.key=arr;
            mopub_keywords = arr; // optional
            return this;
        }

    }
       
})();

module.exports = BKGM;
