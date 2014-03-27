(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var States = function(){
    this.current  = "default";
    this.once     = false;
    this.switched = false;
    this.states   = { default : [] };
    this.tasks    = {};
}
States.prototype = {
    state: function (name, tasks) {
        this.states[name] = tasks;
    },
    task: function (name, fn) {
        this.tasks[name] = fn;
    },
    taskOnce: function(name, fn) {
        var self = this;
        this.tasks[name] = function() {
            self.once === false?fn(arguments):null;
        }
    },
    run: function() {
        this.switched = false;
        var tasks = this.states[this.current],
            Tasks = this.tasks;
        for (var i = 0, l = tasks.length; i < l; i++) {
            var task = tasks[i];
            if (typeof task === "string") {
                Tasks[task]();
            } else if (typeof task.args === 'function') {
                Tasks[task.name].apply(null, task.args() || []);
            } else {
                Tasks[task.name].apply(null, task.args || []);
            }
        }
        if (!this.switched) {
            this.once = true;
        }
    },
    switch: function(state, runNow){
        this.once = false;
        this.switched = true;
        this.current = state;
        if (runNow) this.run();
    }
}

module.exports = States;
},{}],2:[function(require,module,exports){
var States = require('./States'),
	director = new States();

module.exports = director;
},{"./States":1}],3:[function(require,module,exports){
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
            this.canvas.height = window.innerHeight;
            this.canvas.width  = this.canvas.height*(2/3);
            
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
            this.ctx.fillStyle="rgba("+R+", "+G+", "+B+", " + (A/255) + ")";
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
            this.ctx.font = fontSize+'px SourceSansPro'||'40px SourceSansPro';
            this.ctx.fillText(string, x, this.canvas.height-(y-fontSize/2));
            this.ctx.restore();
            return this;
        },
        circle:function( x, y, diameter){
            this.ctx.beginPath();
            // this.ctx.drawImage(this._circle,0,0,this._circle.width,this._circle.width,x - diameter,y - diameter,diameter*2,diameter*2);
            this.ctx.arc(x, y, diameter/2, 0, Math.PI*2,false);
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
            // console.log(this._strokeColor)
            this.ctx.stroke();
            this.ctx.closePath();

            return this;
        },
        lineCapMode:function(lineMode){
            this._linemode=lineMode;
            return this;
        },
        stroke:function(R, G, B, A){
            this._strokeColor="rgba("+R+", "+G+", "+B+", " + (A/255) + ")";
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
        if(_this.Codea){
            y=_this.HEIGHT-y;
        }
        return {x:x,y:y,number:e.identifier}
    }
    
    var addMouseTouchEvent= function(_this){
        
        _this.currentTouch={ state:"ENDED" ,isTouch:false};
        _this.canvas.addEventListener('touchstart', function(event) {
            var touchs=[];
            event.preventDefault();
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
                    _this.currentTouch.isTouch=true;
                    _this.currentTouch.x = e.x;
                    _this.currentTouch.y = e.y;
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
                // var touch = event.changedTouches[i];
                if(BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH) { 
                    var touch = event.changedTouches[i];
                    var e=checkMousePos(touch,_this);                  
                    _this.currentTouch.state="MOVING";
                    _this.currentTouch.x = e.x;
                    _this.currentTouch.y = e.y;
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
            event.preventDefault();
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
                    _this.currentTouch.isTouch=false;
                    var e=checkMousePos(touch,_this);
                    _this.currentTouch.x = e.x;
                    _this.currentTouch.y = e.y;
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
            _this.currentTouch.isTouch=true;
            _this.currentTouch.x = e.x;
            _this.currentTouch.y = e.y;
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
            

            if(_this._ismouseDown){
                var e=checkMousePos(event,_this);
                _this.currentTouch.state="MOVING";
                _this.currentTouch.x = e.x;
                _this.currentTouch.y = e.y;
                if(_this.states && _this.states._mouseDrag) _this.states._mouseDrag(e); else
                    if(_this._mouseDrag) _this._mouseDrag(e);
            }
            
        }, false);
        _this.canvas.addEventListener('mouseup', function(event) {
            var e=checkMousePos(event,_this);
            _this._ismouseDown=false;
            _this.currentTouch.x = e.x;
            _this.currentTouch.y = e.y;
            _this.currentTouch.state="ENDED";
            _this.currentTouch.isTouch=false;
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

},{}],4:[function(require,module,exports){
var set = {
	'IPAD'    : 768,
	'IPHONE'  : 320
};

var screenset = function(game, opt){
	for (var width in opt) {
		
		if (set[width] === game.WIDTH) {
			var result = opt[width];
			if ( typeof result === "function" ) {
				return result();
			} else return result;
			break;
		}		
	}
	return opt['DEFAULT'];
}

module.exports = screenset;
},{}],5:[function(require,module,exports){
/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var BKGM = require('./BKGM'),
	States = require('./BKGM/States'),
	random = require('./random');

console.log(require('should'));

module.exports = function(){

	require('./screenplay')();
	require('./commonTasks')();
   	require('./gameTasks')();

	require('./game').run();
}

},{"./BKGM":3,"./BKGM/States":1,"./commonTasks":7,"./game":11,"./gameTasks":12,"./random":14,"./screenplay":15,"should":39}],6:[function(require,module,exports){
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

},{"./BKGM/screenset":4,"./constants":8,"./game":11,"./random":14}],7:[function(require,module,exports){
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
},{"./BKGM/director":2,"./blocks":6,"./constants":8,"./drop":9,"./game":11,"./random":14}],8:[function(require,module,exports){
var game = require('./game');
var screenset=require('./BKGM/screenset');
var SCALE =(game.WIDTH/768);
var SQRT_SCALE = Math.sqrt(game.WIDTH/768);
var CONST = {

	SCALE 				: game.WIDTH/768,
	SQRT_SCALE 			: Math.sqrt(game.WIDTH/768),
	FLOOR_SCALE 		: Math.floor(game.WIDTH/768),
	FLOOR_SQRT_SCALE 	: Math.floor(Math.sqrt(game.WIDTH/768)),

	BLOCK_HEIGHT 		: Math.floor(50 * SQRT_SCALE),
	BLOCK_GAP			: Math.floor(150 * SQRT_SCALE),

	DROP_DIAMETER 		: Math.floor(30 * SQRT_SCALE),
	DROP_ACCEL 			: Math.floor(2 * SCALE + 0.5),
	DROP_GRAV			: game.WIDTH,
	DROP_Y 				: Math.floor(game.HEIGHT/2),
	SPEED 				: screenset(game,{
							'IPAD':3,
							'IPHONE':2,
							'DEFAULT':Math.floor(4*SQRT_SCALE)
						})
};

module.exports = CONST;
},{"./BKGM/screenset":4,"./game":11}],9:[function(require,module,exports){
var game = require('./game'),
    constants = require('./constants'),
    screenset = require('./BKGM/screenset'),
    blocks = require('./blocks'),
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
    maxTailLength = screenset(game, {
        'IPAD': 20,
        'IPHONE': 15,
        'DEFAULT': Math.floor(20 * SQRT_SCALE)
    });

var drop = {
    collideBearablePrecaled : {}
};

drop.reset = function(){
    this.top      = top;
    this.x        = WIDTH/2;
    this.radius   = radius;
    this.velx     = 0;
    this.tail     = [ WIDTH/2 ];
    this.rotate   = 0;
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
        this.collideBearablePrecaled[i] = this.collideBearable(i, i + blockHeight);
    }
};

drop.reset();
drop.collideBearablePrecal();

game.stroke(255, 255, 255, 61);

var collideBearablePrecaled = drop.collideBearablePrecaled;

drop.updateTail = function(){
    this.tail.unshift(this.x);
    if (this.tail.length >= maxTailLength) this.tail.pop();
    
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
        game.stroke(255, 255, 255, 61);   
        this.rotate = (tx - x) / 768;
        game.strokeWidth(4);
        game.line(x, y, tx, ty);
        // if(game.stroke)
        // game.strokeWidth(0);
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

drop.collide = function(){
    var block = blocks.now(),
        btop = block.y + blockHeight,
        bbot = block.y,
        x    = this.x;
    if (btop >= bot && bbot <= top) {
        var bearable = collideBearablePrecaled[bbot];
        return x - block.w <= bearable || block.wr - x <= bearable;
    } else return false;
};

drop.draw = function(){
    game.fill(255, 255, 255, 255);
    
    // Draw head
    game.circle(x, y, diameter);

    // Draw this.tail
    for (var i = 0, l = this.tail.length; i < l; i++) {
        game.circle(this.tail[i], y + i * speed, diameter - diameter*i/l);
    }

    var x = this.x;

    
    // Draw eyes
    game.fill(0, 0, 0, 255);
    game.circle(x - diameter/6 - 1, y-1, diameter/3);
    game.circle(x + diameter/6 + 1, y-1, diameter/3);
};

module.exports = drop;
},{"./BKGM/screenset":4,"./blocks":6,"./constants":8,"./game":11}],10:[function(require,module,exports){
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

explosion.draw = function() {
    
    game.fill(255, 255, 255, random(0, 250));
    game.rect(0,0,WIDTH,HEIGHT);
    
    this.time += 3 / (this.time * SCALE);

    game.lineCapMode('round');
    game.strokeWidth(random(5, Math.floor(30 * SCALE)));
    game.stroke(255,255,255, Math.max(this.opacity,0));

    var p = this.position;
    for (var i = 0, l = lines.length; i < l; i++) {
        var v = lines[i];
        var vt = p + v * this.time;
        game.line(p.x, p.y, vt.x, vt.y);
    }

    this.opacity = 255 * (1 - (this.time/30));
    
    game.lineCapMode('butt');
    game.strokeWidth(0);

}
module.exports = explosion;
},{"./BKGM/screenset":4,"./constants":8,"./game":11,"./random":14}],11:[function(require,module,exports){
var BKGM = require('./BKGM'),
	director = require('./BKGM/director'),
	game = new BKGM({
    	DeviceMotion: true,
    	Codea		: true,
	    setup: function(){
		    director.switch("menu");
	    },
	    draw: function(){
	        director.run();
	    }
	});

module.exports = game;
},{"./BKGM":3,"./BKGM/director":2}],12:[function(require,module,exports){
var director = require('./BKGM/director'),
	game = require('./game'),
	constants = require('./constants'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT,
    speed = constants.SPEED,
    blocks = require('./blocks'),
    drop = require('./drop'),
    DROP_Y = constants.DROP_Y,
    explosion = require('./explosion');

module.exports = function(){

	var score = 0,
		highscore = 0;

	director.taskOnce("setup", function(){
		highscore = 0;
        drop.reset();
        blocks.reset();
        blocks.spawn(0);
        score = 0;
    });

    director.task("score", function() {
        if (blocks.pass(drop)){
            console.log("pass")
            //sound(SOUND_PICKUP, 32947)
            score++;
        }
    });

    director.task("drop.tail", function(){
        drop.updateTail();
    });
    
    director.task("drop.update", function(){
        drop.updateByTouch();
    });

    director.task("drop.grav", function(){
        drop.updatePosition();
    });
    
    director.task("drop.draw", function(){
        drop.draw();
    });
    
    director.task("collide", function() {
        if ( drop.collide(blocks.now()) ) {
            //showAdFromTop()
            director.switch("explode");
        }
    });

    director.task("blocks.update", function(){
    	blocks.update();
    });

    director.task("blocks.draw", function(){
    	blocks.draw();
    });

    director.task("guide", function() {
        game.fill(255, 255, 255, 255);
        game.text("Choose your preferred method", WIDTH/2, DROP_Y - 80, 16);
        game.text("to control the white drop", WIDTH/2, DROP_Y - 100, 16);
    });

    director.taskOnce("createExplosion", function() {
        //sound(DATA, "ZgNACgBAK0RBGRII9Y/tPt6vyD6gjBA+KwB4b3pAQylFXB0C")
        explosion.reset(drop.x, DROP_Y);
    });
    
    director.task("explosion", function() {
        explosion.draw()
        if (explosion.isDone()) {
            director.switch("gameover");
        }
    });

    director.task("result", function() {
        game.fill(0, 0, 0, 230);
        game.rect(0, 0, WIDTH, HEIGHT);
        
        game.fill(255, 255, 255, 255);
        // game.fontSize(24);

        if (score <= highscore) {
            game.text("SCORE: "+score+"  -  BEST: "+highscore, WIDTH/2, HEIGHT/2 - 40,24)
        } else {
            game.text("NEW BEST SCORE: "+score, WIDTH/2, HEIGHT/2 - 40,24)
        }
    });

    director.task('displayScore', function(){
        game.fill(255,255,255,255);
        var tail = drop.tail;
        game.text(score+"",tail[tail.length-1],DROP_Y + tail.length*speed/ SCALE + 15 * SCALE,30);

    });
};
},{"./BKGM/director":2,"./blocks":6,"./constants":8,"./drop":9,"./explosion":10,"./game":11,"./random":14}],13:[function(require,module,exports){
/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var app = require('./app.js');

document.addEventListener("deviceready", app, false);
window.addEventListener("load", app, false);
},{"./app.js":5}],14:[function(require,module,exports){
module.exports = function(min, max){
	return Math.floor(min + Math.random()*(max-min));
}
},{}],15:[function(require,module,exports){
var director = require('./BKGM/director'),
    game = require('./game'),
    constants = require('./constants'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    drop = require('./drop'),
    DROP_Y = constants.DROP_Y,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT;

module.exports = function(){

    director.state('game', [
        'background',
        'setup',
        'drop.tail',
        'drop.update',
        'blocks.update',
        'collide',
        'score',
        'drop.draw',
        'displayScore',
        'blocks.draw'
    ]);

    director.state('gamegrav', [
        'background',
        'setup',
        'drop.tail',
        'drop.grav',
        'blocks.update',
        'collide',
        'score',
        'drop.draw',
        'displayScore',
        'blocks.draw'
    ]);
    
    director.state('menu', [
        'setup',
        'background',
        {
            name: 'logo',
            args: [WIDTH/2, HEIGHT/2 + 120],
        },
        'drop.tail',
        'drop.draw',
        'guide',
        {
            name: 'buttons',
            args: [{ 
                    x : WIDTH/2,
                    y : DROP_Y - 140,
                    w : 300 * SQRT_SCALE,
                    h : 50 * SQRT_SCALE,
                    s : 15 * SQRT_SCALE,
                    f : 30 * SQRT_SCALE,
                    list : [
                        "Touch and drag",
                        "Tilt your device"
                    ],
                    actions : [
                        "game",
                        "gamegrav"
                    ]
            }]
        }
    ]);
        
    director.state('explode', [
        'background',
        'blocks.draw',
        'createExplosion',
        'explosion'
    ]);
        
    director.state('gameover', [
        'background',
        'blocks.update',
        'blocks.draw',
        'result',
        {
            name: 'logo',
            args: [WIDTH/2, HEIGHT/2 + 50],
        },
        'guide',
        {
            name: 'buttons',
            args: [{ 
                x : WIDTH/2,
                y : DROP_Y - 140,
                w : 300 * SQRT_SCALE,
                h : 50 * SQRT_SCALE,
                s : 15 * SQRT_SCALE,
                f : 30 * SQRT_SCALE,
                list : [
                    "Touch and drag",
                    "Tilt your device"
                ],
                actions : [
                    "game",
                    "gamegrav"
                ]
            }]
        }
    ]);
};
},{"./BKGM/director":2,"./constants":8,"./drop":9,"./game":11,"./random":14}],16:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":18}],17:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],18:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("C:\\Users\\HoangAnh\\Documents\\GitHub\\SlippyDrop\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":17,"C:\\Users\\HoangAnh\\Documents\\GitHub\\SlippyDrop\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":20,"inherits":19}],19:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],20:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],21:[function(require,module,exports){
var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
   if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined')
      return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Relevant Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  switch (encoding) {
    case 'hex':
      return _hexWrite(this, string, offset, length)
    case 'utf8':
    case 'utf-8':
    case 'ucs2': // TODO: No support for ucs2 or utf16le encodings yet
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return _utf8Write(this, string, offset, length)
    case 'ascii':
      return _asciiWrite(this, string, offset, length)
    case 'binary':
      return _binaryWrite(this, string, offset, length)
    case 'base64':
      return _base64Write(this, string, offset, length)
    default:
      throw new Error('Unknown encoding')
  }
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  switch (encoding) {
    case 'hex':
      return _hexSlice(self, start, end)
    case 'utf8':
    case 'utf-8':
    case 'ucs2': // TODO: No support for ucs2 or utf16le encodings yet
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return _utf8Slice(self, start, end)
    case 'ascii':
      return _asciiSlice(self, start, end)
    case 'binary':
      return _binarySlice(self, start, end)
    case 'base64':
      return _base64Slice(self, start, end)
    default:
      throw new Error('Unknown encoding')
  }
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

// http://nodejs.org/api/buffer.html#buffer_buf_slice_start_end
Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value == 'number', 'cannot write a non-number as a number')
  assert(value >= 0,
      'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint(value, max, min) {
  assert(typeof value == 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754(value, max, min) {
  assert(typeof value == 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":22,"ieee754":23}],22:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],23:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],24:[function(require,module,exports){
module.exports=require(17)
},{}],25:[function(require,module,exports){
module.exports=require(18)
},{"./support/isBuffer":24,"C:\\Users\\HoangAnh\\Documents\\GitHub\\SlippyDrop\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":20,"inherits":19}],26:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

// Taken from node's assert module, because it sucks
// and exposes next to nothing useful.
var util = require('./util');

module.exports = _deepEqual;

var pSlice = Array.prototype.slice;

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}


function objEquiv (a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (util.isArguments(a)) {
    if (!util.isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try{
    var ka = Object.keys(a),
      kb = Object.keys(b),
      key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

},{"./util":41}],27:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var util = require('../util')
  , assert = require('assert')
  , AssertionError = assert.AssertionError;

module.exports = function(should) {
  var i = should.format;

  /**
   * Expose assert to should
   *
   * This allows you to do things like below
   * without require()ing the assert module.
   *
   *    should.equal(foo.bar, undefined);
   *
   */
  util.merge(should, assert);


  /**
   * Assert _obj_ exists, with optional message.
   *
   * @param {*} obj
   * @param {String} [msg]
   * @api public
   */
  should.exist = should.exists = function(obj, msg) {
    if(null == obj) {
      throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to exist'), stackStartFunction: should.exist
      });
    }
  };

  /**
   * Asserts _obj_ does not exist, with optional message.
   *
   * @param {*} obj
   * @param {String} [msg]
   * @api public
   */

  should.not = {};
  should.not.exist = should.not.exists = function(obj, msg) {
    if(null != obj) {
      throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to not exist'), stackStartFunction: should.not.exist
      });
    }
  };
};
},{"../util":41,"assert":16}],28:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = function(should, Assertion) {
  Assertion.add('true', function() {
    this.is.exactly(true)
  }, true);

  Assertion.add('false', function() {
    this.is.exactly(false)
  }, true);

  Assertion.add('ok', function() {
    this.params = { operator: 'to be truthy' };

    this.assert(this.obj);
  }, true);
};
},{}],29:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = function(should, Assertion) {

  function addLink(name) {
    Object.defineProperty(Assertion.prototype, name, {
      get: function() {
        return this;
      }
    });
  }

  ['an', 'of', 'a', 'and', 'be', 'have', 'with', 'is', 'which'].forEach(addLink);
};
},{}],30:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var util = require('../util'),
  eql = require('../eql');

module.exports = function(should, Assertion) {
  var i = should.format;

  Assertion.add('include', function(obj, description) {
    if(!Array.isArray(this.obj) && !util.isString(this.obj)) {
      this.params = { operator: 'to include an object equal to ' + i(obj), message: description };
      var cmp = {};
      for(var key in obj) cmp[key] = this.obj[key];
      this.assert(eql(cmp, obj));
    } else {
      this.params = { operator: 'to include ' + i(obj), message: description };

      this.assert(~this.obj.indexOf(obj));
    }
  });

  Assertion.add('includeEql', function(obj, description) {
    this.params = { operator: 'to include an object equal to ' + i(obj), message: description };

    this.assert(this.obj.some(function(item) {
      return eql(obj, item);
    }));
  });
};
},{"../eql":26,"../util":41}],31:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var eql = require('../eql');

module.exports = function(should, Assertion) {
  Assertion.add('eql', function(val, description) {
    this.params = { operator: 'to equal', expected: val, showDiff: true, message: description };

    this.assert(eql(val, this.obj));
  });

  Assertion.add('equal', function(val, description) {
    this.params = { operator: 'to be', expected: val, showDiff: true, message: description };

    this.assert(val === this.obj);
  });

  Assertion.alias('equal', 'exactly');
};
},{"../eql":26}],32:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = function(should, Assertion) {
  var i = should.format;

  Assertion.add('throw', function(message) {
    var fn = this.obj
      , err = {}
      , errorInfo = ''
      , ok = true;

    try {
      fn();
      ok = false;
    } catch(e) {
      err = e;
    }

    if(ok) {
      if('string' == typeof message) {
        ok = message == err.message;
      } else if(message instanceof RegExp) {
        ok = message.test(err.message);
      } else if('function' == typeof message) {
        ok = err instanceof message;
      }

      if(message && !ok) {
        if('string' == typeof message) {
          errorInfo = " with a message matching '" + message + "', but got '" + err.message + "'";
        } else if(message instanceof RegExp) {
          errorInfo = " with a message matching " + message + ", but got '" + err.message + "'";
        } else if('function' == typeof message) {
          errorInfo = " of type " + message.name + ", but got " + err.constructor.name;
        }
      } else {
        errorInfo = " (got " + i(err) + ")";
      }
    }

    this.params = { operator: 'to throw exception' + errorInfo };

    this.assert(ok);
  });

  Assertion.alias('throw', 'throwError');
};
},{}],33:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

//var statusCodes = require('http').STATUS_CODES;

module.exports = function(should, Assertion) {

  Assertion.add('header', function(field, val) {
    this.have.property('headers');
    if (val !== undefined) {
      this.have.property(field.toLowerCase(), val);
    } else {
      this.have.property(field.toLowerCase());
    }
  });

  Assertion.add('status', function(code) {
    //this.params = { operator: 'to have response code ' + code + ' ' + i(statusCodes[code])
    //    + ', but got ' + this.obj.statusCode + ' ' + i(statusCodes[this.obj.statusCode]) }

    this.have.property('statusCode', code);
  });

  Assertion.add('json', function() {
    this.have.property('headers')
      .and.have.property('content-type').include('application/json');
  }, true);

  Assertion.add('html', function() {
    this.have.property('headers')
      .and.have.property('content-type').include('text/html');
  }, true);
};
},{}],34:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var util = require('../util'),
  eql = require('../eql');

module.exports = function(should, Assertion) {
  var i = should.format;

  Assertion.add('match', function(other, description) {
    this.params = { operator: 'to match ' + i(other), message: description };

    if(!eql(this.obj, other)) {
      if(util.isRegExp(other)) { // something - regex

        if(util.isString(this.obj)) {

          this.assert(other.exec(this.obj));
        } else if(Array.isArray(this.obj)) {

          this.obj.forEach(function(item) {
            this.assert(other.exec(item));// should we try to convert to String and exec?
          }, this);
        } else if(util.isObject(this.obj)) {

          var notMatchedProps = [], matchedProps = [];
          util.forOwn(this.obj, function(value, name) {
            if(other.exec(value)) matchedProps.push(i(name));
            else notMatchedProps.push(i(name));
          }, this);

          if(notMatchedProps.length)
            this.params.operator += '\n\tnot matched properties: ' + notMatchedProps.join(', ');
          if(matchedProps.length)
            this.params.operator += '\n\tmatched properties: ' + matchedProps.join(', ');

          this.assert(notMatchedProps.length == 0);
        } // should we try to convert to String and exec?
      } else if(util.isFunction(other)) {
        var res;
        try {
          res = other(this.obj);
        } catch(e) {
          if(e instanceof should.AssertionError) {
            this.params.operator += '\n\t' + e.message;
          }
          throw e;
        }

        if(res instanceof Assertion) {
          this.params.operator += '\n\t' + res.getMessage();
        }

        //if we throw exception ok - it is used .should inside
        if(util.isBoolean(res)) {
          this.assert(res); // if it is just boolean function assert on it
        }
      } else if(util.isObject(other)) { // try to match properties (for Object and Array)
        notMatchedProps = []; matchedProps = [];

        util.forOwn(other, function(value, key) {
          try {
            this.obj[key].should.match(value);
            matchedProps.push(key);
          } catch(e) {
            if(e instanceof should.AssertionError) {
              notMatchedProps.push(key);
            } else {
              throw e;
            }
          }
        }, this);

        if(notMatchedProps.length)
          this.params.operator += '\n\tnot matched properties: ' + notMatchedProps.join(', ');
        if(matchedProps.length)
          this.params.operator += '\n\tmatched properties: ' + matchedProps.join(', ');

        this.assert(notMatchedProps.length == 0);
      } else {
        this.assert(false);
      }
    }
  });

  Assertion.add('matchEach', function(other, description) {
    this.params = { operator: 'to match each ' + i(other), message: description };

    var f = other;

    if(util.isRegExp(other))
      f = function(it) {
        return !!other.exec(it);
      };
    else if(!util.isFunction(other))
      f = function(it) {
        return eql(it, other);
      };

    util.forOwn(this.obj, function(value, key) {
      var res = f(value, key);

      //if we throw exception ok - it is used .should inside
      if(util.isBoolean(res)) {
        this.assert(res); // if it is just boolean function assert on it
      }
    }, this);
  });
};
},{"../eql":26,"../util":41}],35:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = function(should, Assertion) {
  Assertion.add('NaN', function() {
    this.params = { operator: 'to be NaN' };

    this.assert(this.obj !== this.obj);
  }, true);

  Assertion.add('Infinity', function() {
    this.params = { operator: 'to be Infinity' };

    this.is.a.Number
      .and.not.a.NaN
      .and.assert(!isFinite(this.obj));
  }, true);

  Assertion.add('within', function(start, finish, description) {
    this.params = { operator: 'to be within ' + start + '..' + finish, message: description };

    this.assert(this.obj >= start && this.obj <= finish);
  });

  Assertion.add('approximately', function(value, delta, description) {
    this.params = { operator: 'to be approximately ' + value + " ±" + delta, message: description };

    this.assert(Math.abs(this.obj - value) <= delta);
  });

  Assertion.add('above', function(n, description) {
    this.params = { operator: 'to be above ' + n, message: description };

    this.assert(this.obj > n);
  });

  Assertion.add('below', function(n, description) {
    this.params = { operator: 'to be below ' + n, message: description };

    this.assert(this.obj < n);
  });

  Assertion.alias('above', 'greaterThan');
  Assertion.alias('below', 'lessThan');

};

},{}],36:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var util = require('../util'),
  eql = require('../eql');

var aSlice = Array.prototype.slice;

module.exports = function(should, Assertion) {
  var i = should.format;

  Assertion.add('property', function(name, val) {
    if(arguments.length > 1) {
      var p = {};
      p[name] = val;
      this.have.properties(p);
    } else {
      this.have.properties(name);
    }
    this.obj = this.obj[name];
  });

  Assertion.add('properties', function(names) {
    var values = {};
    if(arguments.length > 1) {
      names = aSlice.call(arguments);
    } else if(!Array.isArray(names)) {
      if(util.isString(names)) {
        names = [names];
      } else {
        values = names;
        names = Object.keys(names);
      }
    }

    var obj = Object(this.obj), missingProperties = [];

    //just enumerate properties and check if they all present
    names.forEach(function(name) {
      if(!(name in obj)) missingProperties.push(i(name));
    });

    var props = missingProperties;
    if(props.length === 0) {
      props = names.map(i);
    }

    var operator = (props.length === 1 ?
      'to have property ' : 'to have properties ') + props.join(', ');

    this.params = { operator: operator };

    this.assert(missingProperties.length === 0);

    // check if values in object matched expected
    var valueCheckNames = Object.keys(values);
    if(valueCheckNames.length) {
      var wrongValues = [];
      props = [];

      // now check values, as there we have all properties
      valueCheckNames.forEach(function(name) {
        var value = values[name];
        if(!eql(obj[name], value)) {
          wrongValues.push(i(name) + ' of ' + i(value) + ' (got ' + i(obj[name]) + ')');
        } else {
          props.push(i(name) + ' of ' + i(value));
        }
      });

      if(wrongValues.length > 0) {
        props = wrongValues;
      }

      operator = (props.length === 1 ?
        'to have property ' : 'to have properties ') + props.join(', ');

      this.params = { operator: operator };

      this.assert(wrongValues.length === 0);
    }
  });

  Assertion.add('length', function(n, description) {
    this.have.property('length', n, description);
  });

  Assertion.alias('length', 'lengthOf');

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  Assertion.add('ownProperty', function(name, description) {
    this.params = { operator: 'to have own property ' + i(name), message: description };

    this.assert(hasOwnProperty.call(this.obj, name));

    this.obj = this.obj[name];
  });

  Assertion.alias('hasOwnProperty', 'ownProperty');

  Assertion.add('empty', function() {
    this.params = { operator: 'to be empty' };

    if(util.isString(this.obj) || Array.isArray(this.obj) || util.isArguments(this.obj)) {
      this.have.property('length', 0);
    } else {
      var obj = Object(this.obj); // wrap to reference for booleans and numbers
      for(var prop in obj) {
        this.have.not.ownProperty(prop);
      }
    }
  }, true);

  Assertion.add('keys', function(keys) {
    if(arguments.length > 1) keys = aSlice.call(arguments);
    else if(arguments.length === 1 && util.isString(keys)) keys = [ keys ];
    else if(arguments.length === 0) keys = [];

    var obj = Object(this.obj);

    // first check if some keys are missing
    var missingKeys = [];
    keys.forEach(function(key) {
      if(!hasOwnProperty.call(this.obj, key))
        missingKeys.push(i(key));
    }, this);

    // second check for extra keys
    var extraKeys = [];
    Object.keys(obj).forEach(function(key) {
      if(keys.indexOf(key) < 0) {
        extraKeys.push(i(key));
      }
    });

    var verb = keys.length === 0 ? 'to be empty' :
      'to have ' + (keys.length === 1 ? 'key ' : 'keys ');

    this.params = { operator: verb + keys.map(i).join(', ')};

    if(missingKeys.length > 0)
      this.params.operator += '\n\tmissing keys: ' + missingKeys.join(', ');

    if(extraKeys.length > 0)
      this.params.operator += '\n\textra keys: ' + extraKeys.join(', ');

    this.assert(missingKeys.length === 0 && extraKeys.length === 0);
  });

  Assertion.alias("keys", "key");

  Assertion.add('containEql', function(other) {
    this.params = { operator: 'to contain ' + i(other) };
    var obj = this.obj;
    if(Array.isArray(obj)) {
      this.assert(obj.some(function(item) {
        return eql(item, other);
      }));
    } else if(util.isString(obj)) {
      // expect obj to be string
      this.assert(obj.indexOf(String(other)) >= 0);
    } else if(util.isObject(obj)) {
      // object contains object case
      util.forOwn(other, function(value, key) {
        obj.should.have.property(key, value);
      });
    } else {
      //other uncovered cases
      this.assert(false);
    }
  });

  Assertion.add('containDeep', function(other) {
    this.params = { operator: 'to contain ' + i(other) };

    var obj = this.obj;
    if(Array.isArray(obj)) {
      if(Array.isArray(other)) {
        var otherIdx = 0;
        obj.forEach(function(item) {
          try {
            should(item).not.be.null.and.containDeep(other[otherIdx]);
            otherIdx++;
          } catch(e) {
            if(e instanceof should.AssertionError) {
              return;
            }
            throw e;
          }
        });
        this.assert(otherIdx == other.length);
        //search array contain other as sub sequence
      } else {
        this.assert(false);
      }
    } else if(util.isString(obj)) {// expect other to be string
      this.assert(obj.indexOf(String(other)) >= 0);
    } else if(util.isObject(obj)) {// object contains object case
      if(util.isObject(other)) {
        util.forOwn(other, function(value, key) {
          should(obj[key]).not.be.null.and.containDeep(value);
        });
      } else {//one of the properties contain value
        this.assert(false);
      }
    } else {
      this.eql(other);
    }
  });

};
},{"../eql":26,"../util":41}],37:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = function(should, Assertion) {
  Assertion.add('startWith', function(str, description) {
    this.params = { operator: 'to start with ' + should.format(str), message: description };

    this.assert(0 === this.obj.indexOf(str));
  });

  Assertion.add('endWith', function(str, description) {
    this.params = { operator: 'to end with ' + should.format(str), message: description };

    this.assert(this.obj.indexOf(str, this.obj.length - str.length) >= 0);
  });
};
},{}],38:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var util = require('../util');

module.exports = function(should, Assertion) {
  Assertion.add('Number', function() {
    this.params = { operator: 'to be a number' };

    this.assert(util.isNumber(this.obj));
  }, true);

  Assertion.add('arguments', function() {
    this.params = { operator: 'to be arguments' };

    this.assert(util.isArguments(this.obj));
  }, true);

  Assertion.add('type', function(type, description) {
    this.params = { operator: 'to have type ' + type, message: description };

    (typeof this.obj).should.be.exactly(type, description);
  });

  Assertion.add('instanceof', function(constructor, description) {
    this.params = { operator: 'to be an instance of ' + constructor.name, message: description };

    this.assert(Object(this.obj) instanceof constructor);
  });

  Assertion.add('Function', function() {
    this.params = { operator: 'to be a function' };

    this.assert(util.isFunction(this.obj));
  }, true);

  Assertion.add('Object', function() {
    this.params = { operator: 'to be an object' };

    this.assert(util.isObject(this.obj));
  }, true);

  Assertion.add('String', function() {
    this.params = { operator: 'to be a string' };

    this.assert(util.isString(this.obj));
  }, true);

  Assertion.add('Array', function() {
    this.params = { operator: 'to be an array' };

    this.assert(Array.isArray(this.obj));
  }, true);

  Assertion.add('Boolean', function() {
    this.params = { operator: 'to be a boolean' };

    this.assert(util.isBoolean(this.obj));
  }, true);

  Assertion.add('Error', function() {
    this.params = { operator: 'to be an error' };

    this.assert(util.isError(this.obj));
  }, true);

  Assertion.add('null', function() {
    this.params = { operator: 'to be null' };

    this.assert(this.obj === null);
  }, true);

  Assertion.alias('instanceof', 'instanceOf');
};
},{"../util":41}],39:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var should = require('./should');

should
  .use(require('./ext/assert'))
  .use(require('./ext/chain'))
  .use(require('./ext/bool'))
  .use(require('./ext/number'))
  .use(require('./ext/eql'))
  .use(require('./ext/type'))
  .use(require('./ext/string'))
  .use(require('./ext/property'))
  .use(require('./ext/http'))
  .use(require('./ext/error'))
  .use(require('./ext/match'))
  .use(require('./ext/deprecated'));

 module.exports = should;
},{"./ext/assert":27,"./ext/bool":28,"./ext/chain":29,"./ext/deprecated":30,"./ext/eql":31,"./ext/error":32,"./ext/http":33,"./ext/match":34,"./ext/number":35,"./ext/property":36,"./ext/string":37,"./ext/type":38,"./should":40}],40:[function(require,module,exports){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */


var util = require('./util')
  , AssertionError = util.AssertionError
  , inspect = util.inspect;

/**
 * Our function should
 * @param obj
 * @returns {Assertion}
 */
var should = function(obj) {
  return new Assertion(util.isWrapperType(obj) ? obj.valueOf(): obj);
};

/**
 * Initialize a new `Assertion` with the given _obj_.
 *
 * @param {*} obj
 * @api private
 */

var Assertion = should.Assertion = function Assertion(obj) {
  this.obj = obj;
};


/**
  Way to extend Assertion function. It uses some logic 
  to define only positive assertions and itself rule with negative assertion.

  All actions happen in subcontext and this method take care about negation.
  Potentially we can add some more modifiers that does not depends from state of assertion.
*/
Assertion.add = function(name, f, isGetter) {
  var prop = {};
  prop[isGetter ? 'get' : 'value'] = function() {
    var context = new Assertion(this.obj);
    context.copy = context.copyIfMissing;

    try {
      f.apply(context, arguments);
    } catch(e) {
      //copy data from sub context to this
      this.copy(context);

      //check for fail
      if(e instanceof should.AssertionError) {
        //negative fail
        if(this.negate) {
          this.obj = context.obj;
          this.negate = false;
          return this;
        }
        this.assert(false);
      }
      // throw if it is another exception
      throw e;
    }
    //copy data from sub context to this
    this.copy(context);
    if(this.negate) {
      this.assert(false);
    }

    this.obj = context.obj;
    this.negate = false;
    return this;
  };

  Object.defineProperty(Assertion.prototype, name, prop);
};

Assertion.alias = function(from, to) {
  Assertion.prototype[to] = Assertion.prototype[from]
};

should.AssertionError = AssertionError;
var i = should.format = function i(value) {
  if(util.isDate(value) && typeof value.inspect !== 'function') return value.toISOString(); //show millis in dates
  return inspect(value, { depth: null });
};

should.use = function(f) {
  f(this, Assertion);
  return this;
};


/**
 * Expose should to external world.
 */
exports = module.exports = should;


/**
 * Expose api via `Object#should`.
 *
 * @api public
 */

Object.defineProperty(Object.prototype, 'should', {
  set: function(){},
  get: function(){
    return should(this);
  },
  configurable: true
});


Assertion.prototype = {
  constructor: Assertion,

  assert: function(expr) {
    if(expr) return;

    var params = this.params;

    var msg = params.message, generatedMessage = false;
    if(!msg) {
      msg = this.getMessage();
      generatedMessage = true;
    }

    var err = new AssertionError({
      message: msg
      , actual: this.obj
      , expected: params.expected
      , stackStartFunction: this.assert
    });

    err.showDiff = params.showDiff;
    err.operator = params.operator;
    err.generatedMessage = generatedMessage;

    throw err;
  },

  getMessage: function() {
    return 'expected ' + i(this.obj) + (this.negate ? ' not ': ' ') +
        this.params.operator + ('expected' in this.params  ? ' ' + i(this.params.expected) : '');
  },

  copy: function(other) {
    this.params = other.params;
  },

  copyIfMissing: function(other) {
    if(!this.params) this.params = other.params;
  },


  /**
   * Negation modifier.
   *
   * @api public
   */

  get not() {
    this.negate = !this.negate;
    return this;
  }
};


},{"./util":41}],41:[function(require,module,exports){
(function (Buffer){
/*!
 * Should
 * Copyright(c) 2010-2014 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Check if given obj just a primitive type wrapper
 * @param {Object} obj
 * @returns {boolean}
 * @api private
 */
exports.isWrapperType = function(obj) {
    return isNumber(obj) || isString(obj) || isBoolean(obj);
};

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

function isNumber(arg) {
  return typeof arg === 'number' || arg instanceof Number;
}

exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string' || arg instanceof String;
}

function isBoolean(arg) {
  return typeof arg === 'boolean' || arg instanceof Boolean;
}
exports.isBoolean = isBoolean;

exports.isString = isString;

function isBuffer(arg) {
  return typeof Buffer !== 'undefined' && arg instanceof Buffer;
}

exports.isBuffer = isBuffer;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

exports.isDate = isDate;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

exports.isObject = isObject;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

exports.isRegExp = isRegExp;

function isNullOrUndefined(arg) {
  return arg == null;
}

exports.isNullOrUndefined = isNullOrUndefined;

function isArguments(object) {
  return objectToString(object) === '[object Arguments]';
}

exports.isArguments = isArguments;

exports.isFunction = function(arg) {
  return typeof arg === 'function' || arg instanceof Function;
};

function isError(e) {
  return (isObject(e) && objectToString(e) === '[object Error]') || (e instanceof Error);
}
exports.isError = isError;

exports.inspect = require('util').inspect;

exports.AssertionError = require('assert').AssertionError;

var hasOwnProperty = Object.prototype.hasOwnProperty;

exports.forOwn = function(obj, f, context) {
  for(var prop in obj) {
    if(hasOwnProperty.call(obj, prop)) {
      f.call(context, obj[prop], prop);
    }
  }
};
}).call(this,require("buffer").Buffer)
},{"assert":16,"buffer":21,"util":25}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEhvYW5nQW5oXFxEb2N1bWVudHNcXEdpdEh1YlxcU2xpcHB5RHJvcFxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9TdGF0ZXMuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9kaXJlY3Rvci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9CS0dNL2luZGV4LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL0JLR00vc2NyZWVuc2V0LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2FwcC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9ibG9ja3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29tbW9uVGFza3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29uc3RhbnRzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2Ryb3AuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZXhwbG9zaW9uLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2dhbWUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZ2FtZVRhc2tzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL21haW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvcmFuZG9tLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL3NjcmVlbnBsYXkuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9uYXRpdmUtYnVmZmVyLWJyb3dzZXJpZnkvaW5kZXguanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9lcWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2Fzc2VydC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvYm9vbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvY2hhaW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2RlcHJlY2F0ZWQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2VxbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvZXJyb3IuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2h0dHAuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L21hdGNoLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9udW1iZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3Byb3BlcnR5LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9zdHJpbmcuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3R5cGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvbm9kZS5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9zaG91bGQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgU3RhdGVzID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuY3VycmVudCAgPSBcImRlZmF1bHRcIjtcclxuICAgIHRoaXMub25jZSAgICAgPSBmYWxzZTtcclxuICAgIHRoaXMuc3dpdGNoZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdGVzICAgPSB7IGRlZmF1bHQgOiBbXSB9O1xyXG4gICAgdGhpcy50YXNrcyAgICA9IHt9O1xyXG59XHJcblN0YXRlcy5wcm90b3R5cGUgPSB7XHJcbiAgICBzdGF0ZTogZnVuY3Rpb24gKG5hbWUsIHRhc2tzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZXNbbmFtZV0gPSB0YXNrcztcclxuICAgIH0sXHJcbiAgICB0YXNrOiBmdW5jdGlvbiAobmFtZSwgZm4pIHtcclxuICAgICAgICB0aGlzLnRhc2tzW25hbWVdID0gZm47XHJcbiAgICB9LFxyXG4gICAgdGFza09uY2U6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMudGFza3NbbmFtZV0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgc2VsZi5vbmNlID09PSBmYWxzZT9mbihhcmd1bWVudHMpOm51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJ1bjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zd2l0Y2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB0YXNrcyA9IHRoaXMuc3RhdGVzW3RoaXMuY3VycmVudF0sXHJcbiAgICAgICAgICAgIFRhc2tzID0gdGhpcy50YXNrcztcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRhc2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhc2sgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIFRhc2tzW3Rhc2tdKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhc2suYXJncyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgVGFza3NbdGFzay5uYW1lXS5hcHBseShudWxsLCB0YXNrLmFyZ3MoKSB8fCBbXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBUYXNrc1t0YXNrLm5hbWVdLmFwcGx5KG51bGwsIHRhc2suYXJncyB8fCBbXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnN3aXRjaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25jZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN3aXRjaDogZnVuY3Rpb24oc3RhdGUsIHJ1bk5vdyl7XHJcbiAgICAgICAgdGhpcy5vbmNlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zd2l0Y2hlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gc3RhdGU7XHJcbiAgICAgICAgaWYgKHJ1bk5vdykgdGhpcy5ydW4oKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZXM7IiwidmFyIFN0YXRlcyA9IHJlcXVpcmUoJy4vU3RhdGVzJyksXHJcblx0ZGlyZWN0b3IgPSBuZXcgU3RhdGVzKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yOyIsIndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gKGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICB8fCBcclxuICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxyXG4gICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHwgXHJcbiAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fCBcclxuICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8IFxyXG4gICAgICAgIGZ1bmN0aW9uKC8qIGZ1bmN0aW9uICovIGNhbGxiYWNrLCAvKiBET01FbGVtZW50ICovIGVsZW1lbnQpe1xyXG4gICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XHJcbiAgICAgICAgfTtcclxufSkoKTtcclxuXHJcblxyXG52YXIgQktHTSA9IEJLR018fHt9O1xyXG5cclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBcclxuXHJcbiAgICAoKHR5cGVvZihjb3Jkb3ZhKSA9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZihwaG9uZWdhcCkgPT0gJ3VuZGVmaW5lZCcpKSA/IEJLR00uX2lzQ29yZG92YT1mYWxzZSA6IEJLR00uX2lzQ29yZG92YT10cnVlO1xyXG4gICAgdmFyIGxhc3RUaW1lPTA7XHJcbiAgICB2YXIgdCA9IDA7XHJcbiAgICB2YXIgc2NlbmVUaW1lID0gMDtcclxuICAgIHZhciBmcmFtZVRpbWU9MTAwMC82MDtcclxuICAgIHZhciBfc3RhdGVzTG9vcD1bXTtcclxuICAgIHZhciBfY291bnQ9W107XHJcbiAgICBcclxuICAgIHZhciBkZWJ1Zz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZGVidWcuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiO1xyXG4gICAgZGVidWcuc3R5bGUuY29sb3I9XCJyZWRcIjtcclxuICAgIHZhciBhZGRMb29wID0gZnVuY3Rpb24oX3RoaXMpe1xyXG4gICAgICAgIF9zdGF0ZXNMb29wLnB1c2goX3RoaXMpO1xyXG4gICAgfTtcclxuICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHRpbWU9bmV3IERhdGUoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gX3N0YXRlc0xvb3AubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIG5vdyA9bmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdmFyIGR0ID0gIG5vdyAtIGxhc3RUaW1lOy8vS2hvYW5nIHRob2kgZ2lhbiBnaXVhIDIgbGFuIGNhcCBuaGF0XHJcbiAgICAgICAgICAgIGxhc3RUaW1lID0gbm93O1xyXG4gICAgICAgICAgICB0ICs9IGR0IDsvL1Rob2kgZ2lhbiBkZWxheSBnaXVhIDIgbGFuIGNhcCBuaGF0XHJcbiAgICAgICAgICAgIHdoaWxlICh0ID49IGZyYW1lVGltZSkgey8vQ2hheSBjaGkga2hpIHRob2kgZ2lhbiBkZWxheSBnaXVhIDIgbGFuIGxvbiBob24gMTBtc1xyXG4gICAgICAgICAgICAgICAgdCAtPSBmcmFtZVRpbWU7Ly9EdW5nIGRlIHhhYyBkaW5oIHNvIGJ1b2MnIHRpbmggdG9hblxyXG4gICAgICAgICAgICAgICAgc2NlbmVUaW1lICs9IGZyYW1lVGltZTtcclxuICAgICAgICAgICAgICAgIF9zdGF0ZXNMb29wW2ldLnVwZGF0ZShfc3RhdGVzTG9vcFtpXSwgc2NlbmVUaW1lKTtcclxuICAgICAgICAgICAgICAgIF9zdGF0ZXNMb29wW2ldLnRpbWU9c2NlbmVUaW1lO1xyXG4gICAgICAgICAgICB9ICAgXHJcbiAgICAgICAgICAgIF9zdGF0ZXNMb29wW2ldLmxvb3AoX3N0YXRlc0xvb3BbaV0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIF9kcmF3dGltZT0obmV3IERhdGUoKS0gdGltZSk7XHJcbiAgICAgICAgdmFyIGRyYXd0aW1lPTA7XHJcbiAgICAgICAgX2NvdW50LnB1c2goX2RyYXd0aW1lKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gX2NvdW50Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGRyYXd0aW1lKz1fY291bnRbaV07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoX2NvdW50Lmxlbmd0aD49MTAwKSB7XHJcbiAgICAgICAgICAgIF9jb3VudC51bnNoaWZ0KCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihkZWJ1ZyAmJiBCS0dNLmRlYnVnKWRlYnVnLmlubmVySFRNTD1cImRyYXcgdGltZTogXCIrKGRyYXd0aW1lL19jb3VudC5sZW5ndGgqMTAwPj4wKS8xMDAgK1wiPC9icj4gRlBTOiBcIitfc3RhdGVzTG9vcFswXS5GUFM7ICBcclxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF9sb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBCS0dNID0gZnVuY3Rpb24ob2JqKXtcclxuICAgICAgICB2YXIgX3RoaXM9dGhpcztcclxuICAgICAgICBfdGhpcy5ncmF2aXR5PXt4OjAseTowLHo6MH07XHJcbiAgICAgICAgQktHTS5TSU5HTEVfVE9VQ0g9MDtcclxuICAgICAgICBCS0dNLk1VTFRJX1RPVUNIPTE7XHJcbiAgICAgICAgQktHTS5UWVBFX1RPVUNIPUJLR00uU0lOR0xFX1RPVUNIO1xyXG5cclxuICAgICAgICBfdGhpcy5Db2RlYSA9IG9iai5Db2RlYTtcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmouRGV2aWNlTW90aW9uKVxyXG4gICAgICAgIGlmICgod2luZG93LkRldmljZU1vdGlvbkV2ZW50KSB8fCAoJ2xpc3RlbkZvckRldmljZU1vdmVtZW50JyBpbiB3aW5kb3cpKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCBmdW5jdGlvbihldmVudERhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55LzMseTpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54LzMsejpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihuYXZpZ2F0b3IgJiYgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyKXtcclxuICAgICAgICAgICAgICAgICAvLyBUaGUgd2F0Y2ggaWQgcmVmZXJlbmNlcyB0aGUgY3VycmVudCBgd2F0Y2hBY2NlbGVyYXRpb25gXHJcbiAgICAgICAgICAgICAgICB2YXIgd2F0Y2hJRCA9IG51bGw7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHdhdGNoaW5nIHRoZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdGFydFdhdGNoKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYWNjZWxlcmF0aW9uIGV2ZXJ5IDEwMDAvNjAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0geyBmcmVxdWVuY3k6IDEwMDAvNjAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2F0Y2hJRCA9IG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLndhdGNoQWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3RvcCB3YXRjaGluZyB0aGUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc3RvcFdhdGNoKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXRjaElEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLmNsZWFyV2F0Y2god2F0Y2hJRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoSUQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGFjY2VsZXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDphY2NlbGVyYXRpb24ueC8zLHk6YWNjZWxlcmF0aW9uLnkvMyx6OmFjY2VsZXJhdGlvbi56fTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnb25FcnJvciEnKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzdGFydFdhdGNoKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBuYXZpZ2F0b3IuYWNjZWxlcm9tZXRlci5nZXRDdXJyZW50QWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvcik7Ki9cclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5vdCBzdXBwb3J0ZWQgb24geW91ciBkZXZpY2Ugb3IgYnJvd3Nlci4gIFNvcnJ5LlwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmope1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwPW9iai5zZXR1cHx8dGhpcy5zZXR1cDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGU9b2JqLnVwZGF0ZXx8dGhpcy51cGRhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhdz1vYmouZHJhd3x8dGhpcy5kcmF3O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc291cmNlPXt9O1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdD1bXTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKSlcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVcIik7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiZ2FtZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCAgPSB0aGlzLmNhbnZhcy5oZWlnaHQqKDIvMyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgICAgICB9ICAgICAgIFxyXG4gICAgICAgIHRoaXMud2lkdGg9dGhpcy5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQ9dGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuV0lEVEggPSB0aGlzLmNhbnZhcy53aWR0aDtcclxuICAgICAgICB0aGlzLkhFSUdIVCAgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIC8vIHRoaXMuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZD0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN0eC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQ9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jdHgud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkPSB0cnVlO1xyXG4gICAgICAgIC8vIHRoaXMuX2NpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIC8vIHRoaXMuX2NpcmNsZS53aWR0aD0yMDA7XHJcbiAgICAgICAgLy8gdGhpcy5fY2lyY2xlLmhlaWdodD0yMDA7XHJcbiAgICAgICAgLy8gdmFyIF9jdHggPSB0aGlzLl9jaXJjbGUuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICAvLyBfY3R4LmFyYygxMDAsMTAwLDEwMCwwLE1hdGguUEkqMik7XHJcbiAgICAgICAgLy8gX2N0eC5maWxsU3R5bGU9JyNmZmYnO1xyXG4gICAgICAgIC8vIF9jdHguZmlsbCgpO1xyXG4gICAgICAgXHJcbiAgICAgICAgdGhpcy5fZnBzID0ge1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgOiAwLFxyXG4gICAgICAgICAgICBmcmFtZU51bWJlciA6IDAsXHJcbiAgICAgICAgICAgIGdldEZQUyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lTnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gKCBkIC0gdGhpcy5zdGFydFRpbWUgKSAvIDEwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gTWF0aC5mbG9vciggKCB0aGlzLmZyYW1lTnVtYmVyIC8gY3VycmVudFRpbWUgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBjdXJyZW50VGltZSA+IDEgKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL3RoaXMuY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtYXRvcCc7XHJcbiAgICAgICAgYWRkTW91c2VUb3VjaEV2ZW50KHRoaXMpO1xyXG4gICAgICAgIGFkZEtleUV2ZW50KHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgQktHTS5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgdGltZTowLFxyXG4gICAgICAgIGxvb3A6ZnVuY3Rpb24oX3RoaXMpeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5GUFM9X3RoaXMuX2Zwcy5nZXRGUFMoKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgX3RoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBfdGhpcy5jYW52YXMud2lkdGgsIF90aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3RhdGljRHJhdygpO1xyXG4gICAgICAgICAgICBfdGhpcy5kcmF3KF90aGlzKTsgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcnVuOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKEJLR00uZGVidWcpZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkZWJ1Zyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLlNDQUxFID0gTWF0aC5taW4odGhpcy5IRUlHSFQvNDAwLHRoaXMuV0lEVEgvNDAwKSA7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXAoKTtcclxuICAgICAgICAgICAgaWYodGhpcy5Db2RlYSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoMCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKDEsLTEpO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxhc3RUaW1lPW5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGFkZExvb3AodGhpcyk7XHJcbiAgICAgICAgICAgIF9sb29wKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0dXA6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3N0YXRpY0RyYXc6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2JnKXsgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3JnYignK3RoaXMuX2JnLlIrJywnK3RoaXMuX2JnLkcrJywnK3RoaXMuX2JnLkIrJyknOyAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmFja2dyb3VuZDpmdW5jdGlvbihSLCBHLCBCKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7IFxyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAncmdiKCcrUisnLCcrRysnLCcrQisnKSc7ICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmaWxsOmZ1bmN0aW9uKFIsIEcsIEIsIEEpe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlPVwicmdiYShcIitSK1wiLCBcIitHK1wiLCBcIitCK1wiLCBcIiArIChBLzI1NSkgKyBcIilcIjtcclxuICAgICAgICAgICAgLy8gdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlY3Q6ZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX3JlY3RNb2RlPT09XCJDRU5URVJcIil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5yZWN0KHgtd2lkdGgvMiwgeS1oZWlnaHQvMiwgd2lkdGgsIGhlaWdodCk7ICBcclxuICAgICAgICAgICAgfSBlbHNlIFxyXG4gICAgICAgICAgICB0aGlzLmN0eC5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7ICBcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWN0TW9kZTpmdW5jdGlvbihJbnB1dCl7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlY3RNb2RlPUlucHV0O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHQ6ZnVuY3Rpb24oIHN0cmluZywgeCwgeSwgZm9udFNpemUpe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSgwLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zY2FsZSgxLC0xKTsgIFxyXG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ249J2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZvbnQgPSBmb250U2l6ZSsncHggU291cmNlU2Fuc1Bybyd8fCc0MHB4IFNvdXJjZVNhbnNQcm8nO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHRoaXMuY2FudmFzLmhlaWdodC0oeS1mb250U2l6ZS8yKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaXJjbGU6ZnVuY3Rpb24oIHgsIHksIGRpYW1ldGVyKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLl9jaXJjbGUsMCwwLHRoaXMuX2NpcmNsZS53aWR0aCx0aGlzLl9jaXJjbGUud2lkdGgseCAtIGRpYW1ldGVyLHkgLSBkaWFtZXRlcixkaWFtZXRlcioyLGRpYW1ldGVyKjIpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoeCwgeSwgZGlhbWV0ZXIvMiwgMCwgTWF0aC5QSSoyLGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpOyBcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5lOmZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lQ2FwID0gdGhpcy5fbGluZW1vZGV8fCdidXR0JztcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0cm9rZVdpZHRoKSB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLl9zdHJva2VXaWR0aDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0cm9rZUNvbG9yKSB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuX3N0cm9rZUNvbG9yO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLl9zdHJva2VDb2xvcilcclxuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5lQ2FwTW9kZTpmdW5jdGlvbihsaW5lTW9kZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmVtb2RlPWxpbmVNb2RlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZTpmdW5jdGlvbihSLCBHLCBCLCBBKXtcclxuICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQ29sb3I9XCJyZ2JhKFwiK1IrXCIsIFwiK0crXCIsIFwiK0IrXCIsIFwiICsgKEEvMjU1KSArIFwiKVwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZVdpZHRoOiBmdW5jdGlvbih3aWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0cm9rZVdpZHRoPXdpZHRoO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFJlczpmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlPXJlcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5wdXNoKGNoaWxkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5zcGxpY2UodGhpcy5jaGlsZHJlbnRMaXN0LmluZGV4T2YoY2hpbGQpLDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFN0YXRlczpmdW5jdGlvbihzdGF0ZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlcz1zdGF0ZXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfc3dpcGU6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHZhciBzPXRoaXMuX3N0YXJ0V2lwZTtcclxuICAgICAgICAgICAgdmFyIHhfMT1zLngseV8xPXMueTtcclxuICAgICAgICAgICAgdmFyIHhfMj1lLngseV8yPWUueTtcclxuICAgICAgICAgICAgdmFyIGRlbHRhX3ggPSB4XzIgLSB4XzEsXHJcbiAgICAgICAgICAgIGRlbHRhX3kgPSB5XzIgLSB5XzE7XHJcbiAgICAgICAgICAgIHZhciB0aHJlYWRzb2xkPV9USFJFQURTT0xEKnRoaXMuU0NBTEU7XHJcbiAgICAgICAgICAgIGlmICggKGRlbHRhX3ggPCB0aHJlYWRzb2xkICYmIGRlbHRhX3ggPiAtdGhyZWFkc29sZCkgfHwgKGRlbHRhX3kgPCB0aHJlYWRzb2xkICYmIGRlbHRhX3kgPiAtdGhyZWFkc29sZCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFuID0gTWF0aC5hYnMoZGVsdGFfeSAvIGRlbHRhX3gpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCAoIChkZWx0YV95ID4gMCA/IDEgOiAyKSArIChkZWx0YV94ID4gMCA/IDAgOiAyKSApICogKHRhbiA+IDE/IDEgOiAtMSkgKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgIDE6IC8vcG9zaXRpb24uVE9QX1JJR0hUOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAgMzogLy9wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdET1dOJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgLTE6IC8vLXBvc2l0aW9uLlRPUF9SSUdIVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTI6IC8vLXBvc2l0aW9uLkJPVFRPTV9SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdSSUdIVCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC0zOiAvLy1wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTQ6IC8vLXBvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ0xFRlQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgMjogLy9wb3NpdGlvbi5CT1RUT01fUklHSFQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlICA0OiAvL3Bvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ1VQJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoU3RhcnQ6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hTdGFydCkgdGhpcy50b3VjaFN0YXJ0KGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoRW5kOmZ1bmN0aW9uKGUpe1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5zd2lwZSAmJiBCS0dNLlRZUEVfVE9VQ0g9PUJLR00uU0lOR0xFX1RPVUNIKSB0aGlzLl9zd2lwZShlKTtcclxuICAgICAgICAgICAgaWYodGhpcy50b3VjaEVuZCkgdGhpcy50b3VjaEVuZChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF90b3VjaERyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hEcmFnKSB0aGlzLnRvdWNoRHJhZyhlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURvd246ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEb3duKSB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZVVwOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBpZih0aGlzLnN3aXBlICYmIEJLR00uVFlQRV9UT1VDSD09QktHTS5TSU5HTEVfVE9VQ0gpIHRoaXMuX3N3aXBlKGUpO1xyXG4gICAgICAgICAgICBpZih0aGlzLm1vdXNlVXApIHRoaXMubW91c2VVcChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEcmFnKSB0aGlzLm1vdXNlRHJhZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgdmFyIF9USFJFQURTT0xEID0gMjsgLy9waXhlbHNcclxuICAgIHZhciBjaGVja01vdXNlUG9zPWZ1bmN0aW9uKGUsX3RoaXMpe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIHZhciB5O1xyXG4gICAgICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHsgXHJcbiAgICAgICAgICB4ID0gZS5wYWdlWDtcclxuICAgICAgICAgIHkgPSBlLnBhZ2VZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgXHJcbiAgICAgICAgICB4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0ICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7IFxyXG4gICAgICAgICAgeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDsgXHJcbiAgICAgICAgfSBcclxuICAgICAgICB4IC09IF90aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIHkgLT0gX3RoaXMuY2FudmFzLm9mZnNldFRvcDtcclxuICAgICAgICBpZihfdGhpcy5Db2RlYSl7XHJcbiAgICAgICAgICAgIHk9X3RoaXMuSEVJR0hULXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7eDp4LHk6eSxudW1iZXI6ZS5pZGVudGlmaWVyfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgYWRkTW91c2VUb3VjaEV2ZW50PSBmdW5jdGlvbihfdGhpcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoPXsgc3RhdGU6XCJFTkRFRFwiICxpc1RvdWNoOmZhbHNlfTtcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciB0b3VjaHM9W107XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uU0lOR0xFX1RPVUNIKVxyXG4gICAgICAgICAgICAgICAgaWYgKCghd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICYmIGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSkgfHxcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldFRvdWNoZXMgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gSWdub3JlIGlmIHRvdWNoaW5nIHdpdGggbW9yZSB0aGFuIDEgZmluZ2VyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIlNUQVJUXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLl90b3VjaFN0YXJ0KSBfdGhpcy5zdGF0ZXMuX3RvdWNoU3RhcnQoZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hTdGFydCkgX3RoaXMuX3RvdWNoU3RhcnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB0b3VjaHMucHVzaChlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PT1CS0dNLk1VTFRJX1RPVUNIKXtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX3RvdWNoU3RhcnQpIF90aGlzLnN0YXRlcy5fdG91Y2hTdGFydCh0b3VjaHMpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hTdGFydCkgX3RoaXMuX3RvdWNoU3RhcnQodG91Y2hzKTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZvciAodmFyIGogPSBfdGhpcy5jaGlsZHJlbnRMaXN0Lmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBpZihfdGhpcy5jaGlsZHJlbnRMaXN0W2pdLl9ldmVudGVuYWJsZSAmJmNoZWNrRXZlbnRBY3RvciggZSxfdGhpcy5jaGlsZHJlbnRMaXN0W2pdKSkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGlmKF90aGlzLmNoaWxkcmVudExpc3Rbal0udG91Y2hTdGFydCkgX3RoaXMuY2hpbGRyZW50TGlzdFtqXS50b3VjaFN0YXJ0KGUpXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9O1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b3VjaClcclxuICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdG91Y2hzPVtdO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09QktHTS5TSU5HTEVfVE9VQ0gpIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7ICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiTU9WSU5HXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0b3VjaHMucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09QktHTS5NVUxUSV9UT1VDSCl7XHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hEcmFnKSBfdGhpcy5fdG91Y2hEcmFnKHRvdWNocyk7ICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHRvdWNocz1bXTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpXHJcbiAgICAgICAgICAgICAgICBpZiAoKCF3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAwKSB8fFxyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0VG91Y2hlcyA+IDApIHtcclxuICAgICAgICAgICAgICByZXR1cm47IC8vIElnbm9yZSBpZiBzdGlsbCB0b3VjaGluZyB3aXRoIG9uZSBvciBtb3JlIGZpbmdlcnNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpIHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b3VjaCkgIFxyXG4gICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTsgXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiRU5ERURcIjtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2guaXNUb3VjaD1mYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKHRvdWNoLF90aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLnRvdWNoRW5kKSBfdGhpcy5zdGF0ZXMuX3RvdWNoRW5kKGUpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuX3RvdWNoRW5kKSBfdGhpcy5fdG91Y2hFbmQoZSk7IFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07IFxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codG91Y2gpICBcclxuICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgdG91Y2hzLnB1c2goZSlcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uTVVMVElfVE9VQ0gpe1xyXG4gICAgICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy50b3VjaEVuZCkgX3RoaXMuc3RhdGVzLl90b3VjaEVuZCh0b3VjaHMpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hFbmQpIF90aGlzLl90b3VjaEVuZCh0b3VjaHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKGV2ZW50LF90aGlzKTtcclxuICAgICAgICAgICAgX3RoaXMuX2lzbW91c2VEb3duPXRydWU7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIlNUQVJUXCI7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5pc1RvdWNoPXRydWU7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC54ID0gZS54O1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgLy8gZm9yICh2YXIgaSA9IF90aGlzLmNoaWxkcmVudExpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgLy8gICAgIGlmKF90aGlzLmNoaWxkcmVudExpc3RbaV0uX2V2ZW50ZW5hYmxlICYmY2hlY2tFdmVudEFjdG9yKCBlLF90aGlzLmNoaWxkcmVudExpc3RbaV0pKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgX3RoaXMuY2hpbGRyZW50TGlzdFtpXS5tb3VzZURvd24oZSlcclxuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX21vdXNlRG93bikgX3RoaXMuc3RhdGVzLl9tb3VzZURvd24oZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fbW91c2VEb3duKSBfdGhpcy5fbW91c2VEb3duKGUpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICBpZihfdGhpcy5faXNtb3VzZURvd24pe1xyXG4gICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyhldmVudCxfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2guc3RhdGU9XCJNT1ZJTkdcIjtcclxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC54ID0gZS54O1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLl9tb3VzZURyYWcpIF90aGlzLnN0YXRlcy5fbW91c2VEcmFnKGUpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuX21vdXNlRHJhZykgX3RoaXMuX21vdXNlRHJhZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKGV2ZW50LF90aGlzKTtcclxuICAgICAgICAgICAgX3RoaXMuX2lzbW91c2VEb3duPWZhbHNlO1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIkVOREVEXCI7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5pc1RvdWNoPWZhbHNlO1xyXG4gICAgICAgICAgICAvLyBmb3IgKHZhciBpID0gX3RoaXMuY2hpbGRyZW50TGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAvLyAgICAgaWYoX3RoaXMuY2hpbGRyZW50TGlzdFtpXS5fZXZlbnRlbmFibGUgJiZjaGVja0V2ZW50QWN0b3IoIGUsX3RoaXMuY2hpbGRyZW50TGlzdFtpXSkpIHtcclxuICAgICAgICAgICAgLy8gICAgICAgICBfdGhpcy5jaGlsZHJlbnRMaXN0W2ldLm1vdXNlVXAoZSlcclxuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX21vdXNlVXApIF90aGlzLnN0YXRlcy5fbW91c2VVcChlKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF90aGlzLl9tb3VzZVVwKSBfdGhpcy5fbW91c2VVcChlKTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICB2YXIgYWRkS2V5RXZlbnQ9ZnVuY3Rpb24oX3RoaXMpe1xyXG4gICAgICAgIEJLR00uS0VZUyA9IHtcclxuXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRU5URVI6MTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQkFDS1NQQUNFOjgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gVEFCOjksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0hJRlQ6MTYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQ1RSTDoxNyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBBTFQ6MTgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUEFVU0U6MTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQ0FQU0xPQ0s6MjAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRVNDQVBFOjI3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFBBR0VVUDozMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBQQUdFRE9XTjozNCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBFTkQ6MzUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gSE9NRTozNixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBMRUZUOjM3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFVQOjM4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFJJR0hUOjM5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIERPV046NDAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gSU5TRVJUOjQ1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIERFTEVURTo0NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyAwOjQ4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDE6NDksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gMjo1MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyAzOjUxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDQ6NTIsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gNTo1MyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA2OjU0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDc6NTUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gODo1NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA5OjU3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGE6NjUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gYjo2NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBjOjY3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGQ6NjgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gZTo2OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBmOjcwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGc6NzEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gaDo3MixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBpOjczLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGo6NzQsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gazo3NSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBsOjc2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIG06NzcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gbjo3OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBvOjc5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHA6ODAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gcTo4MSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyByOjgyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHM6ODMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gdDo4NCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB1Ojg1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHY6ODYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gdzo4NyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB4Ojg4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHk6ODksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gejo5MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTRUxFQ1Q6OTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNUEFEMDo5NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQxOjk3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDI6OTgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNUEFEMzo5OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ0OjEwMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ1OjEwMSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ2OjEwMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ3OjEwMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ4OjEwNCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ5OjEwNSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBNVUxUSVBMWToxMDYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQUREOjEwNyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTVUJUUkFDVDoxMDksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gREVDSU1BTFBPSU5UOjExMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBESVZJREU6MTExLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYxOjExMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMjoxMTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjM6MTE0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY0OjExNSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGNToxMTYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjY6MTE3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY3OjExOCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGODoxMTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjk6MTIwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYxMDoxMjEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjExOjEyMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMTI6MTIzLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTUxPQ0s6MTQ0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNDUk9MTExPQ0s6MTQ1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNFTUlDT0xPTjoxODYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRVFVQUxTSUdOOjE4NyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDT01NQToxODgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gREFTSDoxODksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUEVSSU9EOjE5MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGT1JXQVJEU0xBU0g6MTkxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEdSQVZFQUNDRU5UOjE5MixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBPUEVOQlJBQ0tFVDoyMTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQkFDS1NMQVNIOjIyMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDTE9TRUJSQUtFVDoyMjEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0lOR0xFUVVPVEU6MjIyXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQGRlcHJlY2F0ZWRcclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJLR00uS2V5cz0gQktHTS5LRVlTO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTaGlmdCBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5TSElGVF9LRVk9ICAgIDE2O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb250cm9sIGtleSBjb2RlXHJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCS0dNLkNPTlRST0xfS0VZPSAgMTc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsdCBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5BTFRfS0VZPSAgICAgIDE4O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbnRlciBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5FTlRFUl9LRVk9ICAgIDEzO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFdmVudCBtb2RpZmllcnMuXHJcbiAgICAgICAgICogQHR5cGUgZW51bVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJLR00uS0VZX01PRElGSUVSUz0ge1xyXG5cclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBhbHQ6ICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBjb250cm9sOiAgICBmYWxzZSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBzaGlmdDogICAgICBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBfdGhpcy5fa2V5RG93bj10cnVlO1xyXG4gICAgICAgICAgICBpZihfdGhpcy5rZXlEb3duKSBfdGhpcy5rZXlEb3duKGV2ZW50KTtcclxuICAgICAgICB9LGZhbHNlKVxyXG4gICAgfVxyXG59KSgpO1xyXG4oZnVuY3Rpb24oKXtcclxuICAgIC8vIHZhciBCS0dNID0gQktHTXx8e307XHJcbiAgICAvLyB2YXIgczEgPSBuZXcgQktHTS5BdWRpbygpLnNldEF1ZGlvKCcxJyk7XHJcbiAgICBmdW5jdGlvbiBnZXRQaG9uZUdhcFBhdGgoKSB7XHJcblxyXG4gICAgICAgIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnN0ciggcGF0aCwgcGF0aC5sZW5ndGggLSAxMCApO1xyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG5cclxuICAgIH07XHJcbiAgICBCS0dNLkF1ZGlvID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIEJLR00uQXVkaW8ucHJvdG90eXBlPSB7XHJcblxyXG4gICAgICAgIGF1ZGlvICAgOiBudWxsLFxyXG5cclxuICAgICAgICBzZXRBdWRpbyA6IGZ1bmN0aW9uKCBuYW1lICxjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBpZihCS0dNLl9pc0NvcmRvdmEpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcmMgPSBnZXRQaG9uZUdhcFBhdGgoKSArIFwiL1wiICsgbmFtZTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayAmJiAhc2VsZi5jYWxsKSB7Y2FsbGJhY2soKTtzZWxmLmNhbGw9MTt9XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvPSBuZXcgQXVkaW8obmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLnByZWxvYWQgPSAnYXV0byc7XHJcbiAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBmdW5jdGlvbigpIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudFRpbWU9MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5lbmRlZCkgc2VsZi5lbmRlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBmdW5jdGlvbigpIHsgXHJcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9vbmxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayAmJiAhc2VsZi5jYWxsKSB7Y2FsbGJhY2soKTtzZWxmLmNhbGw9MTt9XHJcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbG9vcCA6IGZ1bmN0aW9uKCBsb29wICkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb29wPWxvb3A7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yY2VwbGF5OmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKEJLR00uX2lzQ29yZG92YSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3JjPXRoaXMuc3JjO1xyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHNyYz0naHR0cDovL3N0YXRpYy53ZWFyZXN3b29wLmNvbS9hdWRpby9jaGFybGVzdG93bi90cmFja18xLm1wMyc7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIE1lZGlhIG9iamVjdCBmcm9tIHNyY1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuYXVkaW8pdGhpcy5hdWRpbyA9IG5ldyBNZWRpYShzcmMsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9vbmxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKXt9KTtcclxuICAgICAgICAgICAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGxheSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGF1c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy90aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmF1ZGlvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdG9wIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoQktHTS5faXNDb3Jkb3ZhICYmIHRoaXMuYXVkaW8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uc3RvcCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uY3VycmVudFRpbWU9MDtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZGVkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX29ubG9hZDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBCS0dNLmxvYWRKUz1mdW5jdGlvbih1cmwsY2FsbGJhY2spe1xyXG4gICAgICAgIC8vIEFkZGluZyB0aGUgc2NyaXB0IHRhZyB0byB0aGUgaGVhZCBhcyBzdWdnZXN0ZWQgYmVmb3JlXHJcbiAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xyXG4gICAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xyXG4gICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XHJcblxyXG4gICAgICAgIC8vIFRoZW4gYmluZCB0aGUgZXZlbnQgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gICAgICAgIC8vIFRoZXJlIGFyZSBzZXZlcmFsIGV2ZW50cyBmb3IgY3Jvc3MgYnJvd3NlciBjb21wYXRpYmlsaXR5LlxyXG4gICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBjYWxsYmFjaztcclxuICAgICAgICBzY3JpcHQub25sb2FkID0gY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgdGhlIGxvYWRpbmdcclxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICB9O1xyXG4gICAgQktHTS5jaGVja01vdXNlQm94PWZ1bmN0aW9uKGUsb2JqKXsgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIChlLng+b2JqLngmJmUueT5vYmoueSYmZS54PChvYmoueCtvYmoudykmJmUueTwob2JqLnkrb2JqLmgpKTtcclxuICAgIH07XHJcbiAgICBCS0dNLmNoZWNrRXZlbnRBY3Rvcj1mdW5jdGlvbihlLF9hY3Rvcil7XHJcbiAgICAgICAgdmFyIG9yaWdpblg9X2FjdG9yLngsb3JpZ2luWT1fYWN0b3IueTtcclxuICAgICAgICB2YXIgbW91c2VYPWUueCxtb3VzZVk9ZS55O1xyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlWCAtIG9yaWdpblgsIGR5ID0gbW91c2VZIC0gb3JpZ2luWTtcclxuICAgICAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBwb2ludCBhbmQgdGhlIGNlbnRlciBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAgICAgICAgdmFyIGgxID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpO1xyXG4gICAgICAgIHZhciBjdXJyQSA9IE1hdGguYXRhbjIoZHksZHgpO1xyXG4gICAgICAgIC8vIEFuZ2xlIG9mIHBvaW50IHJvdGF0ZWQgYXJvdW5kIG9yaWdpbiBvZiByZWN0YW5nbGUgaW4gb3Bwb3NpdGlvblxyXG4gICAgICAgIHZhciBuZXdBID0gY3VyckEgLSBfYWN0b3Iucm90YXRpb247XHJcbiAgICAgICAgLy8gTmV3IHBvc2l0aW9uIG9mIG1vdXNlIHBvaW50IHdoZW4gcm90YXRlZFxyXG4gICAgICAgIHZhciB4MiA9IE1hdGguY29zKG5ld0EpICogaDE7XHJcbiAgICAgICAgdmFyIHkyID0gTWF0aC5zaW4obmV3QSkgKiBoMTtcclxuICAgICAgICAvLyBDaGVjayByZWxhdGl2ZSB0byBjZW50ZXIgb2YgcmVjdGFuZ2xlXHJcbiAgICAgICAgaWYgKHgyID4gLTAuNSAqIF9hY3Rvci53aWR0aCAmJiB4MiA8IDAuNSAqIF9hY3Rvci53aWR0aCAmJiB5MiA+IC0wLjUgKiBfYWN0b3IuaGVpZ2h0ICYmIHkyIDwgMC41ICogX2FjdG9yLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBCS0dNLmFqYXggPSBmdW5jdGlvbihvYmope1xyXG4gICAgICAgIHZhciBhamF4ID0ge1xyXG4gICAgICAgICAgICB1cmw6b2JqLnVybCA/IG9iai51cmwgOlwiXCIsIC8vdXJsXHJcbiAgICAgICAgICAgIHR5cGU6b2JqLnR5cGUgPyBvYmoudHlwZSA6IFwiUE9TVFwiLC8vIFBPU1Qgb3IgR0VUXHJcbiAgICAgICAgICAgIGRhdGE6b2JqLmRhdGEgPyBvYmouZGF0YSA6IG51bGwsXHJcbiAgICAgICAgICAgIC8vIHByb2Nlc3NEYXRhOm9iai5wcm9jZXNzRGF0YSA/IG9iai5wcm9jZXNzRGF0YSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAvLyBjb250ZW50VHlwZTpvYmouY29udGVudFR5cGUgPyBvYmouY29udGVudFR5cGUgOmZhbHNlLFxyXG4gICAgICAgICAgICAvLyBjYWNoZTogb2JqLmNhY2hlID8gb2JqLmNhY2hlIDogdHJ1ZSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb2JqLnN1Y2Nlc3MgPyBvYmouc3VjY2VzcyA6IG51bGwsXHJcbiAgICAgICAgICAgIGVycm9yOiBvYmouZXJyb3IgPyBvYmouZXJyb3IgOiBudWxsLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogb2JqLmNvbXBsZXRlID8gb2JqLmNvbXBsZXRlIDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgLy8geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygoZXYubG9hZGVkL2V2LnRvdGFsKSsnJScpO1xyXG4gICAgICAgIC8vIH0sIGZhbHNlKTtcclxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cz09MjAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZihhamF4LnN1Y2Nlc3MpIGFqYXguc3VjY2Vzcyh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZT09NClcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWpheC5jb21wbGV0ZSkgYWpheC5jb21wbGV0ZSh4aHIucmVzcG9uc2VUZXh0KSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFqYXguZXJyb3IpIGFqYXguZXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICB9O1xyXG4gICAgICAgIHhoci5vcGVuKGFqYXgudHlwZSwgYWpheC51cmwsIHRydWUpO1xyXG4gICAgICAgIHhoci5zZW5kKGFqYXguZGF0YSk7XHJcbiAgICB9XHJcbn0pKCk7XHJcbihmdW5jdGlvbigpe1xyXG4gICAgQktHTS5wcmVsb2FkPWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5hdWRpb3M9e307XHJcbiAgICAgICAgdGhpcy5pbWFnZXM9e307XHJcbiAgICAgICAgdGhpcy5fbWF4RWxlbWVudExvYWQ9MDtcclxuICAgICAgICB0aGlzLl9lbGVtZW50TG9hZGVkPTA7XHJcbiAgICB9O1xyXG4gICAgQktHTS5wcmVsb2FkLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKHR5cGUsbmFtZSx1cmwsY2FsbGJhY2spe1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXhFbGVtZW50TG9hZCsrO1xyXG4gICAgICAgICAgICBpZiAodHlwZT09PVwiaW1hZ2VcIil7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2U9bmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmM9dXJsO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbWFnZXNbbmFtZV09aW1hZ2U7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQ9ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fb25sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIGlmKHR5cGU9PT1cImF1ZGlvXCIpe1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgYXVkaW89bmV3IEJLR00uQXVkaW8oKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLnNldEF1ZGlvKHVybCxmdW5jdGlvbigpe3NlbGYuX29ubG9hZCgpfSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmF1ZGlvc1tuYW1lXT1hdWRpbztcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICBCS0dNLnByZWxvYWQucHJvdG90eXBlLl9vbmxvYWQ9ZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdGhpcy5fZWxlbWVudExvYWRlZCsrO1xyXG4gICAgICAgIGlmKHRoaXMuX21heEVsZW1lbnRMb2FkPD10aGlzLl9lbGVtZW50TG9hZGVkKVxyXG4gICAgICAgICAgICB0aGlzLm9ubG9hZEFsbCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgQktHTS5wcmVsb2FkLnByb3RvdHlwZS5vbmxvYWRBbGw9ZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSkoKTtcclxuXHJcbihmdW5jdGlvbigpe1xyXG4gICAgQktHTS5BZHM9ZnVuY3Rpb24oYWR1bml0KXtcclxuICAgICAgICB0aGlzLmFkdW5pdD1hZHVuaXQ7XHJcbiAgICAgICAgbW9wdWJfYWRfdW5pdCA9IGFkdW5pdDtcclxuICAgICAgICBtb3B1Yl9hZF93aWR0aCA9IHRoaXMud2lkdGg7IC8vIG9wdGlvbmFsXHJcbiAgICAgICAgbW9wdWJfYWRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7IC8vIG9wdGlvbmFsXHJcbiAgICB9XHJcbiAgICBCS0dNLkFkcy5wcm90b3R5cGU9e1xyXG4gICAgICAgIHdpZHRoOjMyMCxcclxuICAgICAgICBoZWlnaHQ6NTAsXHJcbiAgICAgICAgaW5pdDpmdW5jdGlvbihhZHVuaXQpe1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNpemU6ZnVuY3Rpb24odyxoKXtcclxuICAgICAgICAgICAgdGhpcy53aWR0aD13O1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodD1oO1xyXG4gICAgICAgICAgICBtb3B1Yl9hZF93aWR0aCA9IHRoaXMud2lkdGg7IC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgIG1vcHViX2FkX2hlaWdodCA9IHRoaXMuaGVpZ2h0OyAvLyBvcHRpb25hbFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEtleXdvcmQ6ZnVuY3Rpb24oYXJyKXtcclxuICAgICAgICAgICAgdGhpcy5rZXk9YXJyO1xyXG4gICAgICAgICAgICBtb3B1Yl9rZXl3b3JkcyA9IGFycjsgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgICAgIFxyXG59KSgpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCS0dNO1xyXG4iLCJ2YXIgc2V0ID0ge1xyXG5cdCdJUEFEJyAgICA6IDc2OCxcclxuXHQnSVBIT05FJyAgOiAzMjBcclxufTtcclxuXHJcbnZhciBzY3JlZW5zZXQgPSBmdW5jdGlvbihnYW1lLCBvcHQpe1xyXG5cdGZvciAodmFyIHdpZHRoIGluIG9wdCkge1xyXG5cdFx0XHJcblx0XHRpZiAoc2V0W3dpZHRoXSA9PT0gZ2FtZS5XSURUSCkge1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gb3B0W3dpZHRoXTtcclxuXHRcdFx0aWYgKCB0eXBlb2YgcmVzdWx0ID09PSBcImZ1bmN0aW9uXCIgKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3VsdCgpO1xyXG5cdFx0XHR9IGVsc2UgcmV0dXJuIHJlc3VsdDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHRcdFxyXG5cdH1cclxuXHRyZXR1cm4gb3B0WydERUZBVUxUJ107XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2NyZWVuc2V0OyIsIi8qKlxyXG4gKiBzY3JpcHRzL2FwcC5qc1xyXG4gKlxyXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cclxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIEJLR00gPSByZXF1aXJlKCcuL0JLR00nKSxcclxuXHRTdGF0ZXMgPSByZXF1aXJlKCcuL0JLR00vU3RhdGVzJyksXHJcblx0cmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKTtcclxuXHJcbmNvbnNvbGUubG9nKHJlcXVpcmUoJ3Nob3VsZCcpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcblx0cmVxdWlyZSgnLi9zY3JlZW5wbGF5JykoKTtcclxuXHRyZXF1aXJlKCcuL2NvbW1vblRhc2tzJykoKTtcclxuICAgXHRyZXF1aXJlKCcuL2dhbWVUYXNrcycpKCk7XHJcblxyXG5cdHJlcXVpcmUoJy4vZ2FtZScpLnJ1bigpO1xyXG59XHJcbiIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgc2NyZWVuc2V0ID0gcmVxdWlyZSgnLi9CS0dNL3NjcmVlbnNldCcpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRDtcclxuXHJcbnZhciBibG9ja0hlaWdodCAgID0gY29uc3RhbnRzLkJMT0NLX0hFSUdIVCxcclxuICAgIGJsb2NrR2FwICAgICAgPSBjb25zdGFudHMuQkxPQ0tfR0FQLFxyXG4gICAgbWF4TGVmdFdpZHRoICA9IFdJRFRIIC0gYmxvY2tHYXAsXHJcbiAgICBtYXhZICAgICAgICAgID0gSEVJR0hUICsgYmxvY2tIZWlnaHQgLyAyLFxyXG4gICAgYmxvY2tEaXN0YW5jZSA9IHNjcmVlbnNldChnYW1lLHtcclxuICAgICAgICAnSVBBRCc6IDIxMCxcclxuICAgICAgICAnSVBIT05FJzogMTAwLFxyXG4gICAgICAgICdERUZBVUxUJzogTWF0aC5mbG9vcigyMTAgKiBTQ0FMRSlcclxuICAgIH0pO1xyXG5cclxudmFyIEJsb2NrcyA9IHt9O1xyXG5cclxuQmxvY2tzLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuYmxvY2tzICA9IFtdO1xyXG4gICAgdGhpcy5jdXJyZW50ID0gMDtcclxuICAgIHRoaXMuc2lkZSAgICA9IDA7XHJcblxyXG59O1xyXG5cclxuQmxvY2tzLnJlc2V0KCk7XHJcblxyXG5cclxuQmxvY2tzLmdldCA9IGZ1bmN0aW9uKGkpIHtcclxuICAgIHJldHVybiB0aGlzLmJsb2Nrc1tpXTtcclxufTtcclxuXHJcbkJsb2Nrcy5oZWFkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbMF07XHJcbn07XHJcblxyXG5CbG9ja3MubGFzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tzLmxlbmd0aCAtIDFdO1xyXG59O1xyXG5cclxuQmxvY2tzLm5vdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW3RoaXMuY3VycmVudF07XHJcbn1cclxuXHJcbkJsb2Nrcy5zcGF3biA9IGZ1bmN0aW9uKHBvc195KSB7XHJcbiAgICB2YXIgeSAgICA9IHBvc195IHx8IDAsXHJcbiAgICAgICAgbWludyA9IDAsXHJcbiAgICAgICAgbWF4dyA9IG1heExlZnRXaWR0aCxcclxuICAgICAgICBzeSAgID0geSAtIGJsb2NrSGVpZ2h0LFxyXG4gICAgICAgIHN3ICAgPSByYW5kb20obWludywgbWF4dyksXHJcbiAgICAgICAgc3dyICA9IHN3ICsgYmxvY2tHYXA7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLnB1c2goe3k6IHN5LCB3OiBzdywgd3I6IHN3cn0pO1xyXG59O1xyXG5cclxuQmxvY2tzLnVuc2hpZnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYmxvY2tzLnNoaWZ0KDEpO1xyXG4gICAgdGhpcy5jdXJyZW50LS07XHJcbn07XHJcblxyXG5CbG9ja3MudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkgPCBsOyBpKyspe1xyXG4gICAgICAgIHRoaXMuYmxvY2tzW2ldLnkgKz0gc3BlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaGVhZCgpLnkgPj0gbWF4WSkgdGhpcy51bnNoaWZ0KCk7XHJcblxyXG4gICAgdmFyIHMgPSB0aGlzLmxhc3QoKS55IC0gYmxvY2tEaXN0YW5jZTtcclxuICAgIGlmIChzID49IDApIHRoaXMuc3Bhd24ocyk7XHJcblxyXG59O1xyXG5cclxuQmxvY2tzLnBhc3MgPSBmdW5jdGlvbihkcm9wKSB7XHJcbiAgICB2YXIgY29uZGl0aW9uID0gdGhpcy5ub3coKS55ID4gZHJvcC50b3A7XHJcbiAgICBpZiAoY29uZGl0aW9uKSB0aGlzLmN1cnJlbnQrKztcclxuICAgIHJldHVybiBjb25kaXRpb25cclxufTtcclxuXHJcbkJsb2Nrcy5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBnYW1lLnJlY3RNb2RlKCdDT1JORVInKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5ibG9ja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSB0aGlzLmJsb2Nrc1tpXTtcclxuICAgICAgICBnYW1lLmZpbGwoMjAwLCAyMDAsIDIwMCwgMjIwKTtcclxuICAgICAgICBnYW1lLnJlY3QoMCwgdi55LCB2LncsIGJsb2NrSGVpZ2h0KTtcclxuICAgICAgICBnYW1lLnJlY3Qodi53ciwgdi55LCBXSURUSCAtIHYud3IsIGJsb2NrSGVpZ2h0KTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvY2tzO1xyXG4iLCJ2YXIgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuXHRkaXJlY3RvciA9IHJlcXVpcmUoJy4vQktHTS9kaXJlY3RvcicpLFxyXG5cdGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuXHRjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRCxcclxuICAgIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyksXHJcbiAgICBkcm9wID0gcmVxdWlyZSgnLi9kcm9wJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG5cdHZhciBiYWNrZ3JvdW5kX2MgPSBbXTtcclxuXHJcblx0ZGlyZWN0b3IudGFzaygnYmFja2dyb3VuZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGMgPSByYW5kb20oMCwgMzApO1xyXG4gICAgICAgIGdhbWUuYmFja2dyb3VuZChjLCBjLCBjLCAyNTUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjIDwgMyAmJiBiYWNrZ3JvdW5kX2MubGVuZ3RoIDwgMzApIHtcclxuICAgICAgICAgICAgdmFyIHJhID0gcmFuZG9tKDAsIFdJRFRILzgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYmFja2dyb3VuZF9jLnB1c2goe1xyXG4gICAgICAgICAgICBcdHI6IHJhLFxyXG4gICAgICAgICAgICBcdHg6IHJhbmRvbShyYSwgV0lEVEggLSByYSksXHJcbiAgICAgICAgICAgIFx0eTogLXJhLFxyXG4gICAgICAgICAgICBcdHM6IHJhbmRvbShzcGVlZCowLjgsIHNwZWVkKjEuMilcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnYW1lLmZpbGwoMjU1LWMsIDI1NS1jLCAyNTUtYywgODApO1xyXG4gICAgICAgIHZhciBpbmN4ID0gZHJvcC5yb3RhdGUgKiAyMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGJhY2tncm91bmRfYy5sZW5ndGg7IGkgPCBsOyBpKyspe1xyXG4gICAgICAgIFx0dmFyIHYgPSBiYWNrZ3JvdW5kX2NbaV07XHJcbiAgICAgICAgICAgIHYueCA9IHYueCArIGluY3g7XHJcbiAgICAgICAgICAgIHYueSA9IHYueSArIHYucyArIDE7XHJcbiAgICAgICAgICAgIGlmICh2LnkgPiBIRUlHSFQgKyB2LnIgfHwgdi54ID4gV0lEVEggKyB2LnIgfHwgdi54IDwgLXYucikge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZF9jLnNsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBnYW1lLmNpcmNsZSh2LngsIHYueSwgdi5yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBnYW1lLmJhY2tncm91bmQoMTAwLCAxMDAsIDEwMCwgMjU1KTtcclxuXHJcbiAgICB9LCB0cnVlKTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IudGFzaygnbG9nbycsIGZ1bmN0aW9uKGxvZ29feCwgbG9nb195KXtcclxuXHJcbiAgICAgICAgdmFyIGMgPSByYW5kb20oMCwgMzApO1xyXG4gICAgICAgIHZhciBmID0gMjU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LWMsIDI1NS1jLCAyNTUtYywgMjU1KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZCA9IHJhbmRvbSgtMSwgMSk7XHJcbiAgICAgICAgdmFyIGUgPSByYW5kb20oLTEsIDEpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGdhbWUudGV4dCgnQktnYW1lTWFrZXInLCBsb2dvX3ggKyBkLCBsb2dvX3kgKyBmICsgZSwgMjApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGdhbWUudGV4dCgnV0hJVEUgRFJPUCcsIGxvZ29feCArIGQsIGxvZ29feSAtIGYgKyBlLCA1MCk7XHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NS1jLCAyNTUtYywgMjU1LWMsIDI1NSk7XHJcbiAgICB9LCB0cnVlKTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IudGFzayhcImJ1dHRvbnNcIiwgZnVuY3Rpb24oYnV0dG9ucykge1xyXG4gICAgICAgIHZhciB4IFx0XHQ9IGJ1dHRvbnMueCxcclxuICAgICAgICBcdHkgXHRcdD0gYnV0dG9ucy55LFxyXG4gICAgICAgIFx0dyBcdFx0PSBidXR0b25zLncsXHJcbiAgICAgICAgXHRoIFx0XHQ9IGJ1dHRvbnMuaCxcclxuICAgICAgICBcdHMgXHRcdD0gYnV0dG9ucy5zLFxyXG4gICAgICAgIFx0ZiBcdFx0PSBidXR0b25zLmYsXHJcbiAgICAgICAgXHRsaXN0XHQ9IGJ1dHRvbnMubGlzdDtcclxuICAgICAgICBcclxuICAgICAgICBnYW1lLnJlY3RNb2RlKCdDRU5URVInKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZCA9IHJhbmRvbSgwLCAxKSxcclxuICAgICAgICBcdGUgPSByYW5kb20oLTEsIDApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgZ2FtZS5maWxsKDI0MCwgMjQwLCAyNDAsIDE4MCk7XHJcbiAgICAgICAgICAgIGdhbWUucmVjdCh4ICsgZCwgeSAtICggaCArIHMgKSAqIGkgKyBlLCB3LCBoKTtcclxuICAgICAgICAgICAgZ2FtZS5maWxsKDAsIDAsIDAsIDIyMCk7XHJcbiAgICAgICAgICAgIGdhbWUudGV4dChsaXN0W2ldLCB4ICsgZCwgeSAtICggaCArIHMgKSAqIGkgKyBlLCBmKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGdhbWUuY3VycmVudFRvdWNoLmlzVG91Y2gpIHtcclxuICAgICAgICBcdHZhciB0eCA9IGdhbWUuY3VycmVudFRvdWNoLngsXHJcbiAgICAgICAgXHRcdHR5ID0gZ2FtZS5jdXJyZW50VG91Y2gueTtcclxuICAgICAgICAgICAgaWYgKHR4ID4geCAtIHcvMiAmJiB0eCA8IHggKyB3LzIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpID0gMCxcclxuICAgICAgICAgICAgICAgIFx0YWN0aW9ucyA9IGJ1dHRvbnMuYWN0aW9ucztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDw9IGFjdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5ID4geSAtIGggKiBpIC0gaCAvIDIgJiYgdHkgPCB5IC0gaCAqIGkgKyBoIC8gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvci5zd2l0Y2goYWN0aW9uc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LCB0cnVlKTtcclxufTsiLCJ2YXIgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpO1xyXG52YXIgc2NyZWVuc2V0PXJlcXVpcmUoJy4vQktHTS9zY3JlZW5zZXQnKTtcclxudmFyIFNDQUxFID0oZ2FtZS5XSURUSC83NjgpO1xyXG52YXIgU1FSVF9TQ0FMRSA9IE1hdGguc3FydChnYW1lLldJRFRILzc2OCk7XHJcbnZhciBDT05TVCA9IHtcclxuXHJcblx0U0NBTEUgXHRcdFx0XHQ6IGdhbWUuV0lEVEgvNzY4LFxyXG5cdFNRUlRfU0NBTEUgXHRcdFx0OiBNYXRoLnNxcnQoZ2FtZS5XSURUSC83NjgpLFxyXG5cdEZMT09SX1NDQUxFIFx0XHQ6IE1hdGguZmxvb3IoZ2FtZS5XSURUSC83NjgpLFxyXG5cdEZMT09SX1NRUlRfU0NBTEUgXHQ6IE1hdGguZmxvb3IoTWF0aC5zcXJ0KGdhbWUuV0lEVEgvNzY4KSksXHJcblxyXG5cdEJMT0NLX0hFSUdIVCBcdFx0OiBNYXRoLmZsb29yKDUwICogU1FSVF9TQ0FMRSksXHJcblx0QkxPQ0tfR0FQXHRcdFx0OiBNYXRoLmZsb29yKDE1MCAqIFNRUlRfU0NBTEUpLFxyXG5cclxuXHREUk9QX0RJQU1FVEVSIFx0XHQ6IE1hdGguZmxvb3IoMzAgKiBTUVJUX1NDQUxFKSxcclxuXHREUk9QX0FDQ0VMIFx0XHRcdDogTWF0aC5mbG9vcigyICogU0NBTEUgKyAwLjUpLFxyXG5cdERST1BfR1JBVlx0XHRcdDogZ2FtZS5XSURUSCxcclxuXHREUk9QX1kgXHRcdFx0XHQ6IE1hdGguZmxvb3IoZ2FtZS5IRUlHSFQvMiksXHJcblx0U1BFRUQgXHRcdFx0XHQ6IHNjcmVlbnNldChnYW1lLHtcclxuXHRcdFx0XHRcdFx0XHQnSVBBRCc6MyxcclxuXHRcdFx0XHRcdFx0XHQnSVBIT05FJzoyLFxyXG5cdFx0XHRcdFx0XHRcdCdERUZBVUxUJzpNYXRoLmZsb29yKDQqU1FSVF9TQ0FMRSlcclxuXHRcdFx0XHRcdFx0fSlcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ09OU1Q7IiwidmFyIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICBzY3JlZW5zZXQgPSByZXF1aXJlKCcuL0JLR00vc2NyZWVuc2V0JyksXHJcbiAgICBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBibG9ja0hlaWdodCA9IGNvbnN0YW50cy5CTE9DS19IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRDtcclxuXHJcbnZhciBkaWFtZXRlciAgICAgID0gY29uc3RhbnRzLkRST1BfRElBTUVURVIsXHJcbiAgICByYWRpdXMgICAgICAgID0gTWF0aC5mbG9vcihkaWFtZXRlciAvIDIgKyAwLjUpLFxyXG4gICAgcmFkaXVzU3F1YXJlICA9IHJhZGl1cyAqIHJhZGl1cyxcclxuICAgIGFjY2VsQ29lZiAgICAgPSBjb25zdGFudHMuRFJPUF9BQ0NFTCxcclxuICAgIHZHcmF2Q29lZiAgICAgPSBjb25zdGFudHMuRFJPUF9HUkFWLFxyXG4gICAgbWF4WCAgICAgICAgICA9IFdJRFRIIC0gcmFkaXVzLFxyXG4gICAgbWluWCAgICAgICAgICA9IHJhZGl1cyxcclxuICAgIHkgICAgICAgICAgICAgPSBjb25zdGFudHMuRFJPUF9ZLFxyXG4gICAgdG9wICAgICAgICAgICA9IHkgKyByYWRpdXMsXHJcbiAgICBib3QgICAgICAgICAgID0geSAtIHJhZGl1cyxcclxuICAgIG1heFRhaWxMZW5ndGggPSBzY3JlZW5zZXQoZ2FtZSwge1xyXG4gICAgICAgICdJUEFEJzogMjAsXHJcbiAgICAgICAgJ0lQSE9ORSc6IDE1LFxyXG4gICAgICAgICdERUZBVUxUJzogTWF0aC5mbG9vcigyMCAqIFNRUlRfU0NBTEUpXHJcbiAgICB9KTtcclxuXHJcbnZhciBkcm9wID0ge1xyXG4gICAgY29sbGlkZUJlYXJhYmxlUHJlY2FsZWQgOiB7fVxyXG59O1xyXG5cclxuZHJvcC5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLnRvcCAgICAgID0gdG9wO1xyXG4gICAgdGhpcy54ICAgICAgICA9IFdJRFRILzI7XHJcbiAgICB0aGlzLnJhZGl1cyAgID0gcmFkaXVzO1xyXG4gICAgdGhpcy52ZWx4ICAgICA9IDA7XHJcbiAgICB0aGlzLnRhaWwgICAgID0gWyBXSURUSC8yIF07XHJcbiAgICB0aGlzLnJvdGF0ZSAgID0gMDtcclxufTtcclxuXHJcbmRyb3AuY29sbGlkZUJlYXJhYmxlID0gZnVuY3Rpb24oYnRvcCwgYmJvdCl7XHJcbiAgICB2YXIgaFNxdWFyZSA9IE1hdGgubWluKCBNYXRoLmFicyhiYm90IC0geSksIE1hdGguYWJzKGJ0b3AgLSB5KSApLFxyXG4gICAgICAgIGhTcXVhcmUgPSBoU3F1YXJlKmhTcXVhcmU7XHJcbiAgICBpZiAocmFkaXVzU3F1YXJlID4gaFNxdWFyZSkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQocmFkaXVzU3F1YXJlIC0gaFNxdWFyZSk7XHJcbiAgICB9IGVsc2UgcmV0dXJuIHJhZGl1czsgLy8gRE9OVCBLTk9XIFdIQVQgVE8gUkVUVVJOIEFUIEFMTCA9Lj0nXHJcbn07XHJcblxyXG5kcm9wLmNvbGxpZGVCZWFyYWJsZVByZWNhbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBmb3IgKHZhciBpID0geSAtIHJhZGl1cyAtIGJsb2NrSGVpZ2h0IC0gNSwgbCA9IHkgKyByYWRpdXMgKyA1OyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5jb2xsaWRlQmVhcmFibGVQcmVjYWxlZFtpXSA9IHRoaXMuY29sbGlkZUJlYXJhYmxlKGksIGkgKyBibG9ja0hlaWdodCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kcm9wLnJlc2V0KCk7XHJcbmRyb3AuY29sbGlkZUJlYXJhYmxlUHJlY2FsKCk7XHJcblxyXG5nYW1lLnN0cm9rZSgyNTUsIDI1NSwgMjU1LCA2MSk7XHJcblxyXG52YXIgY29sbGlkZUJlYXJhYmxlUHJlY2FsZWQgPSBkcm9wLmNvbGxpZGVCZWFyYWJsZVByZWNhbGVkO1xyXG5cclxuZHJvcC51cGRhdGVUYWlsID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMudGFpbC51bnNoaWZ0KHRoaXMueCk7XHJcbiAgICBpZiAodGhpcy50YWlsLmxlbmd0aCA+PSBtYXhUYWlsTGVuZ3RoKSB0aGlzLnRhaWwucG9wKCk7XHJcbiAgICBcclxufVxyXG5cclxuZHJvcC51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMudmVseCArPSBnYW1lLmdyYXZpdHkueCAqIGFjY2VsQ29lZjtcclxuICAgIHZhciB4ID0gdGhpcy54ICAgICs9IHRoaXMudmVseDtcclxuICAgIFxyXG4gICAgaWYgKHggPiBtYXhYKSB7XHJcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcclxuICAgICAgICB0aGlzLnggPSBtYXhYO1xyXG4gICAgfSBlbHNlIGlmICh4IDwgbWluWCkge1xyXG4gICAgICAgIHRoaXMudmVseCA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0gbWluWDtcclxuICAgIH1cclxufTtcclxuXHJcbmRyb3AudXBkYXRlQnlUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgeCA9IHRoaXMueDtcclxuICAgIGlmIChnYW1lLmN1cnJlbnRUb3VjaC5zdGF0ZSA9PT0gJ01PVklORycpIHtcclxuICAgICAgICB2YXIgdHggPSBnYW1lLmN1cnJlbnRUb3VjaC54LFxyXG4gICAgICAgICAgICB0eSA9IGdhbWUuY3VycmVudFRvdWNoLnk7XHJcbiAgICAgICAgZ2FtZS5zdHJva2UoMjU1LCAyNTUsIDI1NSwgNjEpOyAgIFxyXG4gICAgICAgIHRoaXMucm90YXRlID0gKHR4IC0geCkgLyA3Njg7XHJcbiAgICAgICAgZ2FtZS5zdHJva2VXaWR0aCg0KTtcclxuICAgICAgICBnYW1lLmxpbmUoeCwgeSwgdHgsIHR5KTtcclxuICAgICAgICAvLyBpZihnYW1lLnN0cm9rZSlcclxuICAgICAgICAvLyBnYW1lLnN0cm9rZVdpZHRoKDApO1xyXG4gICAgICAgIGdhbWUuZmlsbCgyNTUsIDI1NSwgMjU1LCAxNDgpO1xyXG4gICAgICAgIGdhbWUuY2lyY2xlKHR4LCB0eSwgNTApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgICAgdGhpcy52ZWx4ICs9IHRoaXMucm90YXRlO1xyXG4gICAgeCA9IHRoaXMueCAgICArPSB0aGlzLnZlbHg7XHJcbiAgICBcclxuICAgIGlmICh4ID4gbWF4WCkge1xyXG4gICAgICAgIHRoaXMudmVseCA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0gbWF4WDtcclxuICAgIH0gZWxzZSBpZiAoeCA8IG1pblgpIHtcclxuICAgICAgICB0aGlzLnZlbHggPSAwO1xyXG4gICAgICAgIHRoaXMueCA9IG1pblg7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kcm9wLmNvbGxpZGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGJsb2NrID0gYmxvY2tzLm5vdygpLFxyXG4gICAgICAgIGJ0b3AgPSBibG9jay55ICsgYmxvY2tIZWlnaHQsXHJcbiAgICAgICAgYmJvdCA9IGJsb2NrLnksXHJcbiAgICAgICAgeCAgICA9IHRoaXMueDtcclxuICAgIGlmIChidG9wID49IGJvdCAmJiBiYm90IDw9IHRvcCkge1xyXG4gICAgICAgIHZhciBiZWFyYWJsZSA9IGNvbGxpZGVCZWFyYWJsZVByZWNhbGVkW2Jib3RdO1xyXG4gICAgICAgIHJldHVybiB4IC0gYmxvY2sudyA8PSBiZWFyYWJsZSB8fCBibG9jay53ciAtIHggPD0gYmVhcmFibGU7XHJcbiAgICB9IGVsc2UgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuZHJvcC5kcmF3ID0gZnVuY3Rpb24oKXtcclxuICAgIGdhbWUuZmlsbCgyNTUsIDI1NSwgMjU1LCAyNTUpO1xyXG4gICAgXHJcbiAgICAvLyBEcmF3IGhlYWRcclxuICAgIGdhbWUuY2lyY2xlKHgsIHksIGRpYW1ldGVyKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoaXMudGFpbFxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnRhaWwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgZ2FtZS5jaXJjbGUodGhpcy50YWlsW2ldLCB5ICsgaSAqIHNwZWVkLCBkaWFtZXRlciAtIGRpYW1ldGVyKmkvbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHggPSB0aGlzLng7XHJcblxyXG4gICAgXHJcbiAgICAvLyBEcmF3IGV5ZXNcclxuICAgIGdhbWUuZmlsbCgwLCAwLCAwLCAyNTUpO1xyXG4gICAgZ2FtZS5jaXJjbGUoeCAtIGRpYW1ldGVyLzYgLSAxLCB5LTEsIGRpYW1ldGVyLzMpO1xyXG4gICAgZ2FtZS5jaXJjbGUoeCArIGRpYW1ldGVyLzYgKyAxLCB5LTEsIGRpYW1ldGVyLzMpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkcm9wOyIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgc2NyZWVuc2V0ID0gcmVxdWlyZSgnLi9CS0dNL3NjcmVlbnNldCcpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRDtcclxuXHJcbnZhciBibG9ja0hlaWdodCAgID0gY29uc3RhbnRzLkJMT0NLX0hFSUdIVCxcclxuICAgIGJsb2NrR2FwICAgICAgPSBjb25zdGFudHMuQkxPQ0tfR0FQLFxyXG4gICAgbWF4TGVmdFdpZHRoICA9IFdJRFRIIC0gYmxvY2tHYXAsXHJcbiAgICBtYXhZICAgICAgICAgID0gSEVJR0hUICsgYmxvY2tIZWlnaHQgLyAyLFxyXG4gICAgYmxvY2tEaXN0YW5jZSA9IHNjcmVlbnNldChnYW1lLHtcclxuICAgICAgICAnSVBBRCc6IDIxMCxcclxuICAgICAgICAnSVBIT05FJzogMTAwLFxyXG4gICAgICAgICdERUZBVUxUJzogTWF0aC5mbG9vcigyMTAgKiBTQ0FMRSlcclxuICAgIH0pLFxyXG4gICAgZnVsbEFuZ2xlICAgICA9IDIqTWF0aC5QSTtcclxuXHJcbnZhciBleHBsb3Npb24gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIHJvdGF0ZSh2LCB0aGV0YSl7XHJcbiAgICB2YXIgeFRlbXAgPSB2LngsXHJcbiAgICAgICAgY3MgPSBNYXRoLmNvcyh0aGV0YSksXHJcbiAgICAgICAgc24gPSBNYXRoLnNpbih0aGV0YSk7XHJcbiAgICB2LnggPSB2LngqY3MgLSB2Lnkqc247XHJcbiAgICB2LnkgPSB4VGVtcCpzbiArIHYueSpjcztcclxufVxyXG5cclxuZXhwbG9zaW9uLnJlc2V0ID0gZnVuY3Rpb24oeCwgeSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0ge3g6IHgsIHk6IHl9O1xyXG4gICAgdGhpcy5vcGFjaXR5ID0gMjU1O1xyXG4gICAgdGhpcy50aW1lID0gMTtcclxuICAgIHRoaXMubGluZXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUwOyBpKyspIHtcclxuICAgICAgICB2YXIgZGlyID0ge3g6IDAsIHk6IDF9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJvdGF0ZShkaXIsIE1hdGgucmFuZG9tKGZ1bGxBbmdsZSkpO1xyXG4gICAgICAgIGRpci54ICo9IHJhbmRvbSgwLCBNYXRoLmZsb29yKDcwICogU0NBTEUpKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxpbmVzLnB1c2goZGlyKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cGxvc2lvbi5yZXNldCgpO1xyXG5cclxudmFyIGxpbmVzID0gZXhwbG9zaW9uLmxpbmVzO1xyXG5cclxuZXhwbG9zaW9uLmlzRG9uZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eSA8PSAwO1xyXG59O1xyXG5cclxuZXhwbG9zaW9uLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICAgIFxyXG4gICAgZ2FtZS5maWxsKDI1NSwgMjU1LCAyNTUsIHJhbmRvbSgwLCAyNTApKTtcclxuICAgIGdhbWUucmVjdCgwLDAsV0lEVEgsSEVJR0hUKTtcclxuICAgIFxyXG4gICAgdGhpcy50aW1lICs9IDMgLyAodGhpcy50aW1lICogU0NBTEUpO1xyXG5cclxuICAgIGdhbWUubGluZUNhcE1vZGUoJ3JvdW5kJyk7XHJcbiAgICBnYW1lLnN0cm9rZVdpZHRoKHJhbmRvbSg1LCBNYXRoLmZsb29yKDMwICogU0NBTEUpKSk7XHJcbiAgICBnYW1lLnN0cm9rZSgyNTUsMjU1LDI1NSwgTWF0aC5tYXgodGhpcy5vcGFjaXR5LDApKTtcclxuXHJcbiAgICB2YXIgcCA9IHRoaXMucG9zaXRpb247XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciB2ID0gbGluZXNbaV07XHJcbiAgICAgICAgdmFyIHZ0ID0gcCArIHYgKiB0aGlzLnRpbWU7XHJcbiAgICAgICAgZ2FtZS5saW5lKHAueCwgcC55LCB2dC54LCB2dC55KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9wYWNpdHkgPSAyNTUgKiAoMSAtICh0aGlzLnRpbWUvMzApKTtcclxuICAgIFxyXG4gICAgZ2FtZS5saW5lQ2FwTW9kZSgnYnV0dCcpO1xyXG4gICAgZ2FtZS5zdHJva2VXaWR0aCgwKTtcclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBleHBsb3Npb247IiwidmFyIEJLR00gPSByZXF1aXJlKCcuL0JLR00nKSxcclxuXHRkaXJlY3RvciA9IHJlcXVpcmUoJy4vQktHTS9kaXJlY3RvcicpLFxyXG5cdGdhbWUgPSBuZXcgQktHTSh7XHJcbiAgICBcdERldmljZU1vdGlvbjogdHJ1ZSxcclxuICAgIFx0Q29kZWFcdFx0OiB0cnVlLFxyXG5cdCAgICBzZXR1cDogZnVuY3Rpb24oKXtcclxuXHRcdCAgICBkaXJlY3Rvci5zd2l0Y2goXCJtZW51XCIpO1xyXG5cdCAgICB9LFxyXG5cdCAgICBkcmF3OiBmdW5jdGlvbigpe1xyXG5cdCAgICAgICAgZGlyZWN0b3IucnVuKCk7XHJcblx0ICAgIH1cclxuXHR9KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZTsiLCJ2YXIgZGlyZWN0b3IgPSByZXF1aXJlKCcuL0JLR00vZGlyZWN0b3InKSxcclxuXHRnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcblx0Y29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcclxuICAgIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyksXHJcbiAgICBTQ0FMRSA9IGNvbnN0YW50cy5TQ0FMRSxcclxuICAgIFNRUlRfU0NBTEUgPSBjb25zdGFudHMuU1FSVF9TQ0FMRSxcclxuICAgIFdJRFRIID0gZ2FtZS5XSURUSCxcclxuICAgIEhFSUdIVCA9IGdhbWUuSEVJR0hULFxyXG4gICAgc3BlZWQgPSBjb25zdGFudHMuU1BFRUQsXHJcbiAgICBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpLFxyXG4gICAgZHJvcCA9IHJlcXVpcmUoJy4vZHJvcCcpLFxyXG4gICAgRFJPUF9ZID0gY29uc3RhbnRzLkRST1BfWSxcclxuICAgIGV4cGxvc2lvbiA9IHJlcXVpcmUoJy4vZXhwbG9zaW9uJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG5cdHZhciBzY29yZSA9IDAsXHJcblx0XHRoaWdoc2NvcmUgPSAwO1xyXG5cclxuXHRkaXJlY3Rvci50YXNrT25jZShcInNldHVwXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRoaWdoc2NvcmUgPSAwO1xyXG4gICAgICAgIGRyb3AucmVzZXQoKTtcclxuICAgICAgICBibG9ja3MucmVzZXQoKTtcclxuICAgICAgICBibG9ja3Muc3Bhd24oMCk7XHJcbiAgICAgICAgc2NvcmUgPSAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFzayhcInNjb3JlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChibG9ja3MucGFzcyhkcm9wKSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicGFzc1wiKVxyXG4gICAgICAgICAgICAvL3NvdW5kKFNPVU5EX1BJQ0tVUCwgMzI5NDcpXHJcbiAgICAgICAgICAgIHNjb3JlKys7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFzayhcImRyb3AudGFpbFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AudXBkYXRlVGFpbCgpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLnRhc2soXCJkcm9wLnVwZGF0ZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AudXBkYXRlQnlUb3VjaCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFzayhcImRyb3AuZ3JhdlwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci50YXNrKFwiZHJvcC5kcmF3XCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZHJvcC5kcmF3KCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IudGFzayhcImNvbGxpZGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCBkcm9wLmNvbGxpZGUoYmxvY2tzLm5vdygpKSApIHtcclxuICAgICAgICAgICAgLy9zaG93QWRGcm9tVG9wKClcclxuICAgICAgICAgICAgZGlyZWN0b3Iuc3dpdGNoKFwiZXhwbG9kZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci50YXNrKFwiYmxvY2tzLnVwZGF0ZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgXHRibG9ja3MudXBkYXRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci50YXNrKFwiYmxvY2tzLmRyYXdcIiwgZnVuY3Rpb24oKXtcclxuICAgIFx0YmxvY2tzLmRyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnRhc2soXCJndWlkZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgMjU1KTtcclxuICAgICAgICBnYW1lLnRleHQoXCJDaG9vc2UgeW91ciBwcmVmZXJyZWQgbWV0aG9kXCIsIFdJRFRILzIsIERST1BfWSAtIDgwLCAxNik7XHJcbiAgICAgICAgZ2FtZS50ZXh0KFwidG8gY29udHJvbCB0aGUgd2hpdGUgZHJvcFwiLCBXSURUSC8yLCBEUk9QX1kgLSAxMDAsIDE2KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnRhc2tPbmNlKFwiY3JlYXRlRXhwbG9zaW9uXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vc291bmQoREFUQSwgXCJaZ05BQ2dCQUswUkJHUklJOVkvdFB0NnZ5RDZnakJBK0t3QjRiM3BBUXlsRlhCMENcIilcclxuICAgICAgICBleHBsb3Npb24ucmVzZXQoZHJvcC54LCBEUk9QX1kpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLnRhc2soXCJleHBsb3Npb25cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZXhwbG9zaW9uLmRyYXcoKVxyXG4gICAgICAgIGlmIChleHBsb3Npb24uaXNEb25lKCkpIHtcclxuICAgICAgICAgICAgZGlyZWN0b3Iuc3dpdGNoKFwiZ2FtZW92ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFzayhcInJlc3VsdFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLmZpbGwoMCwgMCwgMCwgMjMwKTtcclxuICAgICAgICBnYW1lLnJlY3QoMCwgMCwgV0lEVEgsIEhFSUdIVCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NSwgMjU1LCAyNTUsIDI1NSk7XHJcbiAgICAgICAgLy8gZ2FtZS5mb250U2l6ZSgyNCk7XHJcblxyXG4gICAgICAgIGlmIChzY29yZSA8PSBoaWdoc2NvcmUpIHtcclxuICAgICAgICAgICAgZ2FtZS50ZXh0KFwiU0NPUkU6IFwiK3Njb3JlK1wiICAtICBCRVNUOiBcIitoaWdoc2NvcmUsIFdJRFRILzIsIEhFSUdIVC8yIC0gNDAsMjQpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZS50ZXh0KFwiTkVXIEJFU1QgU0NPUkU6IFwiK3Njb3JlLCBXSURUSC8yLCBIRUlHSFQvMiAtIDQwLDI0KVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnRhc2soJ2Rpc3BsYXlTY29yZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NSwyNTUsMjU1LDI1NSk7XHJcbiAgICAgICAgdmFyIHRhaWwgPSBkcm9wLnRhaWw7XHJcbiAgICAgICAgZ2FtZS50ZXh0KHNjb3JlK1wiXCIsdGFpbFt0YWlsLmxlbmd0aC0xXSxEUk9QX1kgKyB0YWlsLmxlbmd0aCpzcGVlZC8gU0NBTEUgKyAxNSAqIFNDQUxFLDMwKTtcclxuXHJcbiAgICB9KTtcclxufTsiLCIvKipcclxuICogc2NyaXB0cy9tYWluLmpzXHJcbiAqXHJcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxyXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgYXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2VyZWFkeVwiLCBhcHAsIGZhbHNlKTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFwcCwgZmFsc2UpOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWluLCBtYXgpe1xyXG5cdHJldHVybiBNYXRoLmZsb29yKG1pbiArIE1hdGgucmFuZG9tKCkqKG1heC1taW4pKTtcclxufSIsInZhciBkaXJlY3RvciA9IHJlcXVpcmUoJy4vQktHTS9kaXJlY3RvcicpLFxyXG4gICAgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLFxyXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcclxuICAgIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyksXHJcbiAgICBTQ0FMRSA9IGNvbnN0YW50cy5TQ0FMRSxcclxuICAgIFNRUlRfU0NBTEUgPSBjb25zdGFudHMuU1FSVF9TQ0FMRSxcclxuICAgIGRyb3AgPSByZXF1aXJlKCcuL2Ryb3AnKSxcclxuICAgIERST1BfWSA9IGNvbnN0YW50cy5EUk9QX1ksXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBIRUlHSFQgPSBnYW1lLkhFSUdIVDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZ2FtZScsIFtcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3NldHVwJyxcclxuICAgICAgICAnZHJvcC50YWlsJyxcclxuICAgICAgICAnZHJvcC51cGRhdGUnLFxyXG4gICAgICAgICdibG9ja3MudXBkYXRlJyxcclxuICAgICAgICAnY29sbGlkZScsXHJcbiAgICAgICAgJ3Njb3JlJyxcclxuICAgICAgICAnZHJvcC5kcmF3JyxcclxuICAgICAgICAnZGlzcGxheVNjb3JlJyxcclxuICAgICAgICAnYmxvY2tzLmRyYXcnXHJcbiAgICBdKTtcclxuXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZ2FtZWdyYXYnLCBbXHJcbiAgICAgICAgJ2JhY2tncm91bmQnLFxyXG4gICAgICAgICdzZXR1cCcsXHJcbiAgICAgICAgJ2Ryb3AudGFpbCcsXHJcbiAgICAgICAgJ2Ryb3AuZ3JhdicsXHJcbiAgICAgICAgJ2Jsb2Nrcy51cGRhdGUnLFxyXG4gICAgICAgICdjb2xsaWRlJyxcclxuICAgICAgICAnc2NvcmUnLFxyXG4gICAgICAgICdkcm9wLmRyYXcnLFxyXG4gICAgICAgICdkaXNwbGF5U2NvcmUnLFxyXG4gICAgICAgICdibG9ja3MuZHJhdydcclxuICAgIF0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnbWVudScsIFtcclxuICAgICAgICAnc2V0dXAnLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdsb2dvJyxcclxuICAgICAgICAgICAgYXJnczogW1dJRFRILzIsIEhFSUdIVC8yICsgMTIwXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICdkcm9wLnRhaWwnLFxyXG4gICAgICAgICdkcm9wLmRyYXcnLFxyXG4gICAgICAgICdndWlkZScsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnYnV0dG9ucycsXHJcbiAgICAgICAgICAgIGFyZ3M6IFt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHggOiBXSURUSC8yLFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiBEUk9QX1kgLSAxNDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdyA6IDMwMCAqIFNRUlRfU0NBTEUsXHJcbiAgICAgICAgICAgICAgICAgICAgaCA6IDUwICogU1FSVF9TQ0FMRSxcclxuICAgICAgICAgICAgICAgICAgICBzIDogMTUgKiBTUVJUX1NDQUxFLFxyXG4gICAgICAgICAgICAgICAgICAgIGYgOiAzMCAqIFNRUlRfU0NBTEUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdCA6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUb3VjaCBhbmQgZHJhZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRpbHQgeW91ciBkZXZpY2VcIlxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9ucyA6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJnYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2FtZWdyYXZcIlxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICBdKTtcclxuICAgICAgICBcclxuICAgIGRpcmVjdG9yLnN0YXRlKCdleHBsb2RlJywgW1xyXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICAnYmxvY2tzLmRyYXcnLFxyXG4gICAgICAgICdjcmVhdGVFeHBsb3Npb24nLFxyXG4gICAgICAgICdleHBsb3Npb24nXHJcbiAgICBdKTtcclxuICAgICAgICBcclxuICAgIGRpcmVjdG9yLnN0YXRlKCdnYW1lb3ZlcicsIFtcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ2Jsb2Nrcy51cGRhdGUnLFxyXG4gICAgICAgICdibG9ja3MuZHJhdycsXHJcbiAgICAgICAgJ3Jlc3VsdCcsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnbG9nbycsXHJcbiAgICAgICAgICAgIGFyZ3M6IFtXSURUSC8yLCBIRUlHSFQvMiArIDUwXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICdndWlkZScsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnYnV0dG9ucycsXHJcbiAgICAgICAgICAgIGFyZ3M6IFt7IFxyXG4gICAgICAgICAgICAgICAgeCA6IFdJRFRILzIsXHJcbiAgICAgICAgICAgICAgICB5IDogRFJPUF9ZIC0gMTQwLFxyXG4gICAgICAgICAgICAgICAgdyA6IDMwMCAqIFNRUlRfU0NBTEUsXHJcbiAgICAgICAgICAgICAgICBoIDogNTAgKiBTUVJUX1NDQUxFLFxyXG4gICAgICAgICAgICAgICAgcyA6IDE1ICogU1FSVF9TQ0FMRSxcclxuICAgICAgICAgICAgICAgIGYgOiAzMCAqIFNRUlRfU0NBTEUsXHJcbiAgICAgICAgICAgICAgICBsaXN0IDogW1xyXG4gICAgICAgICAgICAgICAgICAgIFwiVG91Y2ggYW5kIGRyYWdcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlRpbHQgeW91ciBkZXZpY2VcIlxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbnMgOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgXCJnYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJnYW1lZ3JhdlwiXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgXSk7XHJcbn07IiwiLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHdoZW4gdXNlZCBpbiBub2RlLCB0aGlzIHdpbGwgYWN0dWFsbHkgbG9hZCB0aGUgdXRpbCBtb2R1bGUgd2UgZGVwZW5kIG9uXG4vLyB2ZXJzdXMgbG9hZGluZyB0aGUgYnVpbHRpbiB1dGlsIG1vZHVsZSBhcyBoYXBwZW5zIG90aGVyd2lzZVxuLy8gdGhpcyBpcyBhIGJ1ZyBpbiBub2RlIG1vZHVsZSBsb2FkaW5nIGFzIGZhciBhcyBJIGFtIGNvbmNlcm5lZFxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IHN0YWNrU3RhcnRGdW5jdGlvbi5uYW1lO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiBrZXlzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJDOlxcXFxVc2Vyc1xcXFxIb2FuZ0FuaFxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXFNsaXBweURyb3BcXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGluc2VydC1tb2R1bGUtZ2xvYmFsc1xcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1xcXFxicm93c2VyLmpzXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsInZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLFxuICAgLy8gRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICAgaWYgKHR5cGVvZiBVaW50OEFycmF5ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgLy8gRG9lcyB0aGUgYnJvd3NlciBzdXBwb3J0IGFkZGluZyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXM/IElmXG4gIC8vIG5vdCwgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnQuIFdlIG5lZWQgdG8gYmUgYWJsZSB0b1xuICAvLyBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy5cbiAgLy8gUmVsZXZhbnQgRmlyZWZveCBidWc6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgwKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBBc3N1bWUgb2JqZWN0IGlzIGFuIGFycmF5XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IGF1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBVaW50OEFycmF5ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICBzdWJqZWN0IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIFVpbnQ4QXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICd1Y3MyJzogLy8gVE9ETzogTm8gc3VwcG9ydCBmb3IgdWNzMiBvciB1dGYxNmxlIGVuY29kaW5ncyB5ZXRcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXR1cm4gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0dXJuIF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXR1cm4gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAndWNzMic6IC8vIFRPRE86IE5vIHN1cHBvcnQgZm9yIHVjczIgb3IgdXRmMTZsZSBlbmNvZGluZ3MgeWV0XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0dXJuIF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldHVybiBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0dXJuIF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICAvLyBjb3B5IVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyBpKyspXG4gICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8vIGh0dHA6Ly9ub2RlanMub3JnL2FwaS9idWZmZXIuaHRtbCNidWZmZXJfYnVmX3NsaWNlX3N0YXJ0X2VuZFxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCB0aGUgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5mdW5jdGlvbiBhdWdtZW50IChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsXG4gICAgICAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuIiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBaRVJPICAgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0bW9kdWxlLmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0oKSlcbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0xFID8gLTEgOiAxLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXTtcblxuICBpICs9IGQ7XG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIHMgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBlTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgZSA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IG1MZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhcztcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpO1xuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbik7XG4gICAgZSA9IGUgLSBlQmlhcztcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKTtcbn07XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgYyxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMCksXG4gICAgICBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNMRSA/IDEgOiAtMSxcbiAgICAgIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDA7XG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSk7XG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDA7XG4gICAgZSA9IGVNYXg7XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpO1xuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLTtcbiAgICAgIGMgKj0gMjtcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKys7XG4gICAgICBjIC89IDI7XG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMDtcbiAgICAgIGUgPSBlTWF4O1xuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSBlICsgZUJpYXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICAgIGUgPSAwO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpO1xuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG07XG4gIGVMZW4gKz0gbUxlbjtcbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KTtcblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjg7XG59O1xuIiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8vIFRha2VuIGZyb20gbm9kZSdzIGFzc2VydCBtb2R1bGUsIGJlY2F1c2UgaXQgc3Vja3Ncbi8vIGFuZCBleHBvc2VzIG5leHQgdG8gbm90aGluZyB1c2VmdWwuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWVwRXF1YWw7XG5cbnZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIG9iakVxdWl2IChhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmICh1dGlsLmlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCF1dGlsLmlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYik7XG4gIH1cbiAgdHJ5e1xuICAgIHZhciBrYSA9IE9iamVjdC5rZXlzKGEpLFxuICAgICAga2IgPSBPYmplY3Qua2V5cyhiKSxcbiAgICAgIGtleSwgaTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghX2RlZXBFcXVhbChhW2tleV0sIGJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuICAsIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG4gICwgQXNzZXJ0aW9uRXJyb3IgPSBhc3NlcnQuQXNzZXJ0aW9uRXJyb3I7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkKSB7XG4gIHZhciBpID0gc2hvdWxkLmZvcm1hdDtcblxuICAvKipcbiAgICogRXhwb3NlIGFzc2VydCB0byBzaG91bGRcbiAgICpcbiAgICogVGhpcyBhbGxvd3MgeW91IHRvIGRvIHRoaW5ncyBsaWtlIGJlbG93XG4gICAqIHdpdGhvdXQgcmVxdWlyZSgpaW5nIHRoZSBhc3NlcnQgbW9kdWxlLlxuICAgKlxuICAgKiAgICBzaG91bGQuZXF1YWwoZm9vLmJhciwgdW5kZWZpbmVkKTtcbiAgICpcbiAgICovXG4gIHV0aWwubWVyZ2Uoc2hvdWxkLCBhc3NlcnQpO1xuXG5cbiAgLyoqXG4gICAqIEFzc2VydCBfb2JqXyBleGlzdHMsIHdpdGggb3B0aW9uYWwgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBvYmpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBzaG91bGQuZXhpc3QgPSBzaG91bGQuZXhpc3RzID0gZnVuY3Rpb24ob2JqLCBtc2cpIHtcbiAgICBpZihudWxsID09IG9iaikge1xuICAgICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKHtcbiAgICAgICAgbWVzc2FnZTogbXNnIHx8ICgnZXhwZWN0ZWQgJyArIGkob2JqKSArICcgdG8gZXhpc3QnKSwgc3RhY2tTdGFydEZ1bmN0aW9uOiBzaG91bGQuZXhpc3RcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQXNzZXJ0cyBfb2JqXyBkb2VzIG5vdCBleGlzdCwgd2l0aCBvcHRpb25hbCBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IG9ialxuICAgKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgc2hvdWxkLm5vdCA9IHt9O1xuICBzaG91bGQubm90LmV4aXN0ID0gc2hvdWxkLm5vdC5leGlzdHMgPSBmdW5jdGlvbihvYmosIG1zZykge1xuICAgIGlmKG51bGwgIT0gb2JqKSB7XG4gICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgICBtZXNzYWdlOiBtc2cgfHwgKCdleHBlY3RlZCAnICsgaShvYmopICsgJyB0byBub3QgZXhpc3QnKSwgc3RhY2tTdGFydEZ1bmN0aW9uOiBzaG91bGQubm90LmV4aXN0XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIEFzc2VydGlvbi5hZGQoJ3RydWUnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzLmV4YWN0bHkodHJ1ZSlcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnZmFsc2UnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzLmV4YWN0bHkoZmFsc2UpXG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ29rJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgdHJ1dGh5JyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmopO1xuICB9LCB0cnVlKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcblxuICBmdW5jdGlvbiBhZGRMaW5rKG5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXNzZXJ0aW9uLnByb3RvdHlwZSwgbmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBbJ2FuJywgJ29mJywgJ2EnLCAnYW5kJywgJ2JlJywgJ2hhdmUnLCAnd2l0aCcsICdpcycsICd3aGljaCddLmZvckVhY2goYWRkTGluayk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgZXFsID0gcmVxdWlyZSgnLi4vZXFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgdmFyIGkgPSBzaG91bGQuZm9ybWF0O1xuXG4gIEFzc2VydGlvbi5hZGQoJ2luY2x1ZGUnLCBmdW5jdGlvbihvYmosIGRlc2NyaXB0aW9uKSB7XG4gICAgaWYoIUFycmF5LmlzQXJyYXkodGhpcy5vYmopICYmICF1dGlsLmlzU3RyaW5nKHRoaXMub2JqKSkge1xuICAgICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaW5jbHVkZSBhbiBvYmplY3QgZXF1YWwgdG8gJyArIGkob2JqKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcbiAgICAgIHZhciBjbXAgPSB7fTtcbiAgICAgIGZvcih2YXIga2V5IGluIG9iaikgY21wW2tleV0gPSB0aGlzLm9ialtrZXldO1xuICAgICAgdGhpcy5hc3NlcnQoZXFsKGNtcCwgb2JqKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGluY2x1ZGUgJyArIGkob2JqKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgICAgdGhpcy5hc3NlcnQofnRoaXMub2JqLmluZGV4T2Yob2JqKSk7XG4gICAgfVxuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdpbmNsdWRlRXFsJywgZnVuY3Rpb24ob2JqLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGluY2x1ZGUgYW4gb2JqZWN0IGVxdWFsIHRvICcgKyBpKG9iaiksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iai5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBlcWwob2JqLCBpdGVtKTtcbiAgICB9KSk7XG4gIH0pO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIGVxbCA9IHJlcXVpcmUoJy4uL2VxbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIEFzc2VydGlvbi5hZGQoJ2VxbCcsIGZ1bmN0aW9uKHZhbCwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBlcXVhbCcsIGV4cGVjdGVkOiB2YWwsIHNob3dEaWZmOiB0cnVlLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQoZXFsKHZhbCwgdGhpcy5vYmopKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnZXF1YWwnLCBmdW5jdGlvbih2YWwsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUnLCBleHBlY3RlZDogdmFsLCBzaG93RGlmZjogdHJ1ZSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHZhbCA9PT0gdGhpcy5vYmopO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ2VxdWFsJywgJ2V4YWN0bHknKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgdmFyIGkgPSBzaG91bGQuZm9ybWF0O1xuXG4gIEFzc2VydGlvbi5hZGQoJ3Rocm93JywgZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIHZhciBmbiA9IHRoaXMub2JqXG4gICAgICAsIGVyciA9IHt9XG4gICAgICAsIGVycm9ySW5mbyA9ICcnXG4gICAgICAsIG9rID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBmbigpO1xuICAgICAgb2sgPSBmYWxzZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGVyciA9IGU7XG4gICAgfVxuXG4gICAgaWYob2spIHtcbiAgICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBtZXNzYWdlKSB7XG4gICAgICAgIG9rID0gbWVzc2FnZSA9PSBlcnIubWVzc2FnZTtcbiAgICAgIH0gZWxzZSBpZihtZXNzYWdlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIG9rID0gbWVzc2FnZS50ZXN0KGVyci5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSBpZignZnVuY3Rpb24nID09IHR5cGVvZiBtZXNzYWdlKSB7XG4gICAgICAgIG9rID0gZXJyIGluc3RhbmNlb2YgbWVzc2FnZTtcbiAgICAgIH1cblxuICAgICAgaWYobWVzc2FnZSAmJiAhb2spIHtcbiAgICAgICAgaWYoJ3N0cmluZycgPT0gdHlwZW9mIG1lc3NhZ2UpIHtcbiAgICAgICAgICBlcnJvckluZm8gPSBcIiB3aXRoIGEgbWVzc2FnZSBtYXRjaGluZyAnXCIgKyBtZXNzYWdlICsgXCInLCBidXQgZ290ICdcIiArIGVyci5tZXNzYWdlICsgXCInXCI7XG4gICAgICAgIH0gZWxzZSBpZihtZXNzYWdlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgZXJyb3JJbmZvID0gXCIgd2l0aCBhIG1lc3NhZ2UgbWF0Y2hpbmcgXCIgKyBtZXNzYWdlICsgXCIsIGJ1dCBnb3QgJ1wiICsgZXJyLm1lc3NhZ2UgKyBcIidcIjtcbiAgICAgICAgfSBlbHNlIGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIG1lc3NhZ2UpIHtcbiAgICAgICAgICBlcnJvckluZm8gPSBcIiBvZiB0eXBlIFwiICsgbWVzc2FnZS5uYW1lICsgXCIsIGJ1dCBnb3QgXCIgKyBlcnIuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3JJbmZvID0gXCIgKGdvdCBcIiArIGkoZXJyKSArIFwiKVwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIHRocm93IGV4Y2VwdGlvbicgKyBlcnJvckluZm8gfTtcblxuICAgIHRoaXMuYXNzZXJ0KG9rKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCd0aHJvdycsICd0aHJvd0Vycm9yJyk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vL3ZhciBzdGF0dXNDb2RlcyA9IHJlcXVpcmUoJ2h0dHAnKS5TVEFUVVNfQ09ERVM7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcblxuICBBc3NlcnRpb24uYWRkKCdoZWFkZXInLCBmdW5jdGlvbihmaWVsZCwgdmFsKSB7XG4gICAgdGhpcy5oYXZlLnByb3BlcnR5KCdoZWFkZXJzJyk7XG4gICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmhhdmUucHJvcGVydHkoZmllbGQudG9Mb3dlckNhc2UoKSwgdmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYXZlLnByb3BlcnR5KGZpZWxkLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnc3RhdHVzJywgZnVuY3Rpb24oY29kZSkge1xuICAgIC8vdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaGF2ZSByZXNwb25zZSBjb2RlICcgKyBjb2RlICsgJyAnICsgaShzdGF0dXNDb2Rlc1tjb2RlXSlcbiAgICAvLyAgICArICcsIGJ1dCBnb3QgJyArIHRoaXMub2JqLnN0YXR1c0NvZGUgKyAnICcgKyBpKHN0YXR1c0NvZGVzW3RoaXMub2JqLnN0YXR1c0NvZGVdKSB9XG5cbiAgICB0aGlzLmhhdmUucHJvcGVydHkoJ3N0YXR1c0NvZGUnLCBjb2RlKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnanNvbicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnaGVhZGVycycpXG4gICAgICAuYW5kLmhhdmUucHJvcGVydHkoJ2NvbnRlbnQtdHlwZScpLmluY2x1ZGUoJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnaHRtbCcsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnaGVhZGVycycpXG4gICAgICAuYW5kLmhhdmUucHJvcGVydHkoJ2NvbnRlbnQtdHlwZScpLmluY2x1ZGUoJ3RleHQvaHRtbCcpO1xuICB9LCB0cnVlKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBlcWwgPSByZXF1aXJlKCcuLi9lcWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICB2YXIgaSA9IHNob3VsZC5mb3JtYXQ7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnbWF0Y2gnLCBmdW5jdGlvbihvdGhlciwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBtYXRjaCAnICsgaShvdGhlciksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICBpZighZXFsKHRoaXMub2JqLCBvdGhlcikpIHtcbiAgICAgIGlmKHV0aWwuaXNSZWdFeHAob3RoZXIpKSB7IC8vIHNvbWV0aGluZyAtIHJlZ2V4XG5cbiAgICAgICAgaWYodXRpbC5pc1N0cmluZyh0aGlzLm9iaikpIHtcblxuICAgICAgICAgIHRoaXMuYXNzZXJ0KG90aGVyLmV4ZWModGhpcy5vYmopKTtcbiAgICAgICAgfSBlbHNlIGlmKEFycmF5LmlzQXJyYXkodGhpcy5vYmopKSB7XG5cbiAgICAgICAgICB0aGlzLm9iai5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuYXNzZXJ0KG90aGVyLmV4ZWMoaXRlbSkpOy8vIHNob3VsZCB3ZSB0cnkgdG8gY29udmVydCB0byBTdHJpbmcgYW5kIGV4ZWM/XG4gICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSBpZih1dGlsLmlzT2JqZWN0KHRoaXMub2JqKSkge1xuXG4gICAgICAgICAgdmFyIG5vdE1hdGNoZWRQcm9wcyA9IFtdLCBtYXRjaGVkUHJvcHMgPSBbXTtcbiAgICAgICAgICB1dGlsLmZvck93bih0aGlzLm9iaiwgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgIGlmKG90aGVyLmV4ZWModmFsdWUpKSBtYXRjaGVkUHJvcHMucHVzaChpKG5hbWUpKTtcbiAgICAgICAgICAgIGVsc2Ugbm90TWF0Y2hlZFByb3BzLnB1c2goaShuYW1lKSk7XG4gICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICBpZihub3RNYXRjaGVkUHJvcHMubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdG5vdCBtYXRjaGVkIHByb3BlcnRpZXM6ICcgKyBub3RNYXRjaGVkUHJvcHMuam9pbignLCAnKTtcbiAgICAgICAgICBpZihtYXRjaGVkUHJvcHMubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdG1hdGNoZWQgcHJvcGVydGllczogJyArIG1hdGNoZWRQcm9wcy5qb2luKCcsICcpO1xuXG4gICAgICAgICAgdGhpcy5hc3NlcnQobm90TWF0Y2hlZFByb3BzLmxlbmd0aCA9PSAwKTtcbiAgICAgICAgfSAvLyBzaG91bGQgd2UgdHJ5IHRvIGNvbnZlcnQgdG8gU3RyaW5nIGFuZCBleGVjP1xuICAgICAgfSBlbHNlIGlmKHV0aWwuaXNGdW5jdGlvbihvdGhlcikpIHtcbiAgICAgICAgdmFyIHJlcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXMgPSBvdGhlcih0aGlzLm9iaik7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgIGlmKGUgaW5zdGFuY2VvZiBzaG91bGQuQXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHQnICsgZS5tZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocmVzIGluc3RhbmNlb2YgQXNzZXJ0aW9uKSB7XG4gICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdCcgKyByZXMuZ2V0TWVzc2FnZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiB3ZSB0aHJvdyBleGNlcHRpb24gb2sgLSBpdCBpcyB1c2VkIC5zaG91bGQgaW5zaWRlXG4gICAgICAgIGlmKHV0aWwuaXNCb29sZWFuKHJlcykpIHtcbiAgICAgICAgICB0aGlzLmFzc2VydChyZXMpOyAvLyBpZiBpdCBpcyBqdXN0IGJvb2xlYW4gZnVuY3Rpb24gYXNzZXJ0IG9uIGl0XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZih1dGlsLmlzT2JqZWN0KG90aGVyKSkgeyAvLyB0cnkgdG8gbWF0Y2ggcHJvcGVydGllcyAoZm9yIE9iamVjdCBhbmQgQXJyYXkpXG4gICAgICAgIG5vdE1hdGNoZWRQcm9wcyA9IFtdOyBtYXRjaGVkUHJvcHMgPSBbXTtcblxuICAgICAgICB1dGlsLmZvck93bihvdGhlciwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLm9ialtrZXldLnNob3VsZC5tYXRjaCh2YWx1ZSk7XG4gICAgICAgICAgICBtYXRjaGVkUHJvcHMucHVzaChrZXkpO1xuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgaWYoZSBpbnN0YW5jZW9mIHNob3VsZC5Bc3NlcnRpb25FcnJvcikge1xuICAgICAgICAgICAgICBub3RNYXRjaGVkUHJvcHMucHVzaChrZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmKG5vdE1hdGNoZWRQcm9wcy5sZW5ndGgpXG4gICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdG5vdCBtYXRjaGVkIHByb3BlcnRpZXM6ICcgKyBub3RNYXRjaGVkUHJvcHMuam9pbignLCAnKTtcbiAgICAgICAgaWYobWF0Y2hlZFByb3BzLmxlbmd0aClcbiAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0bWF0Y2hlZCBwcm9wZXJ0aWVzOiAnICsgbWF0Y2hlZFByb3BzLmpvaW4oJywgJyk7XG5cbiAgICAgICAgdGhpcy5hc3NlcnQobm90TWF0Y2hlZFByb3BzLmxlbmd0aCA9PSAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ21hdGNoRWFjaCcsIGZ1bmN0aW9uKG90aGVyLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIG1hdGNoIGVhY2ggJyArIGkob3RoZXIpLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdmFyIGYgPSBvdGhlcjtcblxuICAgIGlmKHV0aWwuaXNSZWdFeHAob3RoZXIpKVxuICAgICAgZiA9IGZ1bmN0aW9uKGl0KSB7XG4gICAgICAgIHJldHVybiAhIW90aGVyLmV4ZWMoaXQpO1xuICAgICAgfTtcbiAgICBlbHNlIGlmKCF1dGlsLmlzRnVuY3Rpb24ob3RoZXIpKVxuICAgICAgZiA9IGZ1bmN0aW9uKGl0KSB7XG4gICAgICAgIHJldHVybiBlcWwoaXQsIG90aGVyKTtcbiAgICAgIH07XG5cbiAgICB1dGlsLmZvck93bih0aGlzLm9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgdmFyIHJlcyA9IGYodmFsdWUsIGtleSk7XG5cbiAgICAgIC8vaWYgd2UgdGhyb3cgZXhjZXB0aW9uIG9rIC0gaXQgaXMgdXNlZCAuc2hvdWxkIGluc2lkZVxuICAgICAgaWYodXRpbC5pc0Jvb2xlYW4ocmVzKSkge1xuICAgICAgICB0aGlzLmFzc2VydChyZXMpOyAvLyBpZiBpdCBpcyBqdXN0IGJvb2xlYW4gZnVuY3Rpb24gYXNzZXJ0IG9uIGl0XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH0pO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICBBc3NlcnRpb24uYWRkKCdOYU4nLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBOYU4nIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaiAhPT0gdGhpcy5vYmopO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdJbmZpbml0eScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIEluZmluaXR5JyB9O1xuXG4gICAgdGhpcy5pcy5hLk51bWJlclxuICAgICAgLmFuZC5ub3QuYS5OYU5cbiAgICAgIC5hbmQuYXNzZXJ0KCFpc0Zpbml0ZSh0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCd3aXRoaW4nLCBmdW5jdGlvbihzdGFydCwgZmluaXNoLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIHdpdGhpbiAnICsgc3RhcnQgKyAnLi4nICsgZmluaXNoLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmogPj0gc3RhcnQgJiYgdGhpcy5vYmogPD0gZmluaXNoKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnYXBwcm94aW1hdGVseScsIGZ1bmN0aW9uKHZhbHVlLCBkZWx0YSwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhcHByb3hpbWF0ZWx5ICcgKyB2YWx1ZSArIFwiIMKxXCIgKyBkZWx0YSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KE1hdGguYWJzKHRoaXMub2JqIC0gdmFsdWUpIDw9IGRlbHRhKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnYWJvdmUnLCBmdW5jdGlvbihuLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFib3ZlICcgKyBuLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmogPiBuKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnYmVsb3cnLCBmdW5jdGlvbihuLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGJlbG93ICcgKyBuLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmogPCBuKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCdhYm92ZScsICdncmVhdGVyVGhhbicpO1xuICBBc3NlcnRpb24uYWxpYXMoJ2JlbG93JywgJ2xlc3NUaGFuJyk7XG5cbn07XG4iLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGVxbCA9IHJlcXVpcmUoJy4uL2VxbCcpO1xuXG52YXIgYVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIHZhciBpID0gc2hvdWxkLmZvcm1hdDtcblxuICBBc3NlcnRpb24uYWRkKCdwcm9wZXJ0eScsIGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgcCA9IHt9O1xuICAgICAgcFtuYW1lXSA9IHZhbDtcbiAgICAgIHRoaXMuaGF2ZS5wcm9wZXJ0aWVzKHApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhdmUucHJvcGVydGllcyhuYW1lKTtcbiAgICB9XG4gICAgdGhpcy5vYmogPSB0aGlzLm9ialtuYW1lXTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgncHJvcGVydGllcycsIGZ1bmN0aW9uKG5hbWVzKSB7XG4gICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBuYW1lcyA9IGFTbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIGlmKCFBcnJheS5pc0FycmF5KG5hbWVzKSkge1xuICAgICAgaWYodXRpbC5pc1N0cmluZyhuYW1lcykpIHtcbiAgICAgICAgbmFtZXMgPSBbbmFtZXNdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzID0gbmFtZXM7XG4gICAgICAgIG5hbWVzID0gT2JqZWN0LmtleXMobmFtZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBvYmogPSBPYmplY3QodGhpcy5vYmopLCBtaXNzaW5nUHJvcGVydGllcyA9IFtdO1xuXG4gICAgLy9qdXN0IGVudW1lcmF0ZSBwcm9wZXJ0aWVzIGFuZCBjaGVjayBpZiB0aGV5IGFsbCBwcmVzZW50XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZighKG5hbWUgaW4gb2JqKSkgbWlzc2luZ1Byb3BlcnRpZXMucHVzaChpKG5hbWUpKTtcbiAgICB9KTtcblxuICAgIHZhciBwcm9wcyA9IG1pc3NpbmdQcm9wZXJ0aWVzO1xuICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcHJvcHMgPSBuYW1lcy5tYXAoaSk7XG4gICAgfVxuXG4gICAgdmFyIG9wZXJhdG9yID0gKHByb3BzLmxlbmd0aCA9PT0gMSA/XG4gICAgICAndG8gaGF2ZSBwcm9wZXJ0eSAnIDogJ3RvIGhhdmUgcHJvcGVydGllcyAnKSArIHByb3BzLmpvaW4oJywgJyk7XG5cbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6IG9wZXJhdG9yIH07XG5cbiAgICB0aGlzLmFzc2VydChtaXNzaW5nUHJvcGVydGllcy5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gY2hlY2sgaWYgdmFsdWVzIGluIG9iamVjdCBtYXRjaGVkIGV4cGVjdGVkXG4gICAgdmFyIHZhbHVlQ2hlY2tOYW1lcyA9IE9iamVjdC5rZXlzKHZhbHVlcyk7XG4gICAgaWYodmFsdWVDaGVja05hbWVzLmxlbmd0aCkge1xuICAgICAgdmFyIHdyb25nVmFsdWVzID0gW107XG4gICAgICBwcm9wcyA9IFtdO1xuXG4gICAgICAvLyBub3cgY2hlY2sgdmFsdWVzLCBhcyB0aGVyZSB3ZSBoYXZlIGFsbCBwcm9wZXJ0aWVzXG4gICAgICB2YWx1ZUNoZWNrTmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlc1tuYW1lXTtcbiAgICAgICAgaWYoIWVxbChvYmpbbmFtZV0sIHZhbHVlKSkge1xuICAgICAgICAgIHdyb25nVmFsdWVzLnB1c2goaShuYW1lKSArICcgb2YgJyArIGkodmFsdWUpICsgJyAoZ290ICcgKyBpKG9ialtuYW1lXSkgKyAnKScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3BzLnB1c2goaShuYW1lKSArICcgb2YgJyArIGkodmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmKHdyb25nVmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcHJvcHMgPSB3cm9uZ1ZhbHVlcztcbiAgICAgIH1cblxuICAgICAgb3BlcmF0b3IgPSAocHJvcHMubGVuZ3RoID09PSAxID9cbiAgICAgICAgJ3RvIGhhdmUgcHJvcGVydHkgJyA6ICd0byBoYXZlIHByb3BlcnRpZXMgJykgKyBwcm9wcy5qb2luKCcsICcpO1xuXG4gICAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6IG9wZXJhdG9yIH07XG5cbiAgICAgIHRoaXMuYXNzZXJ0KHdyb25nVmFsdWVzLmxlbmd0aCA9PT0gMCk7XG4gICAgfVxuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdsZW5ndGgnLCBmdW5jdGlvbihuLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnbGVuZ3RoJywgbiwgZGVzY3JpcHRpb24pO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ2xlbmd0aCcsICdsZW5ndGhPZicpO1xuXG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnb3duUHJvcGVydHknLCBmdW5jdGlvbihuYW1lLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGhhdmUgb3duIHByb3BlcnR5ICcgKyBpKG5hbWUpLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQoaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLm9iaiwgbmFtZSkpO1xuXG4gICAgdGhpcy5vYmogPSB0aGlzLm9ialtuYW1lXTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCdoYXNPd25Qcm9wZXJ0eScsICdvd25Qcm9wZXJ0eScpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2VtcHR5JywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgZW1wdHknIH07XG5cbiAgICBpZih1dGlsLmlzU3RyaW5nKHRoaXMub2JqKSB8fCBBcnJheS5pc0FycmF5KHRoaXMub2JqKSB8fCB1dGlsLmlzQXJndW1lbnRzKHRoaXMub2JqKSkge1xuICAgICAgdGhpcy5oYXZlLnByb3BlcnR5KCdsZW5ndGgnLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9iaiA9IE9iamVjdCh0aGlzLm9iaik7IC8vIHdyYXAgdG8gcmVmZXJlbmNlIGZvciBib29sZWFucyBhbmQgbnVtYmVyc1xuICAgICAgZm9yKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICB0aGlzLmhhdmUubm90Lm93blByb3BlcnR5KHByb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgna2V5cycsIGZ1bmN0aW9uKGtleXMpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSkga2V5cyA9IGFTbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHV0aWwuaXNTdHJpbmcoa2V5cykpIGtleXMgPSBbIGtleXMgXTtcbiAgICBlbHNlIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIGtleXMgPSBbXTtcblxuICAgIHZhciBvYmogPSBPYmplY3QodGhpcy5vYmopO1xuXG4gICAgLy8gZmlyc3QgY2hlY2sgaWYgc29tZSBrZXlzIGFyZSBtaXNzaW5nXG4gICAgdmFyIG1pc3NpbmdLZXlzID0gW107XG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYoIWhhc093blByb3BlcnR5LmNhbGwodGhpcy5vYmosIGtleSkpXG4gICAgICAgIG1pc3NpbmdLZXlzLnB1c2goaShrZXkpKTtcbiAgICB9LCB0aGlzKTtcblxuICAgIC8vIHNlY29uZCBjaGVjayBmb3IgZXh0cmEga2V5c1xuICAgIHZhciBleHRyYUtleXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZihrZXlzLmluZGV4T2Yoa2V5KSA8IDApIHtcbiAgICAgICAgZXh0cmFLZXlzLnB1c2goaShrZXkpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciB2ZXJiID0ga2V5cy5sZW5ndGggPT09IDAgPyAndG8gYmUgZW1wdHknIDpcbiAgICAgICd0byBoYXZlICcgKyAoa2V5cy5sZW5ndGggPT09IDEgPyAna2V5ICcgOiAna2V5cyAnKTtcblxuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogdmVyYiArIGtleXMubWFwKGkpLmpvaW4oJywgJyl9O1xuXG4gICAgaWYobWlzc2luZ0tleXMubGVuZ3RoID4gMClcbiAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRtaXNzaW5nIGtleXM6ICcgKyBtaXNzaW5nS2V5cy5qb2luKCcsICcpO1xuXG4gICAgaWYoZXh0cmFLZXlzLmxlbmd0aCA+IDApXG4gICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0ZXh0cmEga2V5czogJyArIGV4dHJhS2V5cy5qb2luKCcsICcpO1xuXG4gICAgdGhpcy5hc3NlcnQobWlzc2luZ0tleXMubGVuZ3RoID09PSAwICYmIGV4dHJhS2V5cy5sZW5ndGggPT09IDApO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoXCJrZXlzXCIsIFwia2V5XCIpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2NvbnRhaW5FcWwnLCBmdW5jdGlvbihvdGhlcikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGNvbnRhaW4gJyArIGkob3RoZXIpIH07XG4gICAgdmFyIG9iaiA9IHRoaXMub2JqO1xuICAgIGlmKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgdGhpcy5hc3NlcnQob2JqLnNvbWUoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gZXFsKGl0ZW0sIG90aGVyKTtcbiAgICAgIH0pKTtcbiAgICB9IGVsc2UgaWYodXRpbC5pc1N0cmluZyhvYmopKSB7XG4gICAgICAvLyBleHBlY3Qgb2JqIHRvIGJlIHN0cmluZ1xuICAgICAgdGhpcy5hc3NlcnQob2JqLmluZGV4T2YoU3RyaW5nKG90aGVyKSkgPj0gMCk7XG4gICAgfSBlbHNlIGlmKHV0aWwuaXNPYmplY3Qob2JqKSkge1xuICAgICAgLy8gb2JqZWN0IGNvbnRhaW5zIG9iamVjdCBjYXNlXG4gICAgICB1dGlsLmZvck93bihvdGhlciwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBvYmouc2hvdWxkLmhhdmUucHJvcGVydHkoa2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9vdGhlciB1bmNvdmVyZWQgY2FzZXNcbiAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2NvbnRhaW5EZWVwJywgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBjb250YWluICcgKyBpKG90aGVyKSB9O1xuXG4gICAgdmFyIG9iaiA9IHRoaXMub2JqO1xuICAgIGlmKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgaWYoQXJyYXkuaXNBcnJheShvdGhlcikpIHtcbiAgICAgICAgdmFyIG90aGVySWR4ID0gMDtcbiAgICAgICAgb2JqLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzaG91bGQoaXRlbSkubm90LmJlLm51bGwuYW5kLmNvbnRhaW5EZWVwKG90aGVyW290aGVySWR4XSk7XG4gICAgICAgICAgICBvdGhlcklkeCsrO1xuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgaWYoZSBpbnN0YW5jZW9mIHNob3VsZC5Bc3NlcnRpb25FcnJvcikge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXNzZXJ0KG90aGVySWR4ID09IG90aGVyLmxlbmd0aCk7XG4gICAgICAgIC8vc2VhcmNoIGFycmF5IGNvbnRhaW4gb3RoZXIgYXMgc3ViIHNlcXVlbmNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmKHV0aWwuaXNTdHJpbmcob2JqKSkgey8vIGV4cGVjdCBvdGhlciB0byBiZSBzdHJpbmdcbiAgICAgIHRoaXMuYXNzZXJ0KG9iai5pbmRleE9mKFN0cmluZyhvdGhlcikpID49IDApO1xuICAgIH0gZWxzZSBpZih1dGlsLmlzT2JqZWN0KG9iaikpIHsvLyBvYmplY3QgY29udGFpbnMgb2JqZWN0IGNhc2VcbiAgICAgIGlmKHV0aWwuaXNPYmplY3Qob3RoZXIpKSB7XG4gICAgICAgIHV0aWwuZm9yT3duKG90aGVyLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgc2hvdWxkKG9ialtrZXldKS5ub3QuYmUubnVsbC5hbmQuY29udGFpbkRlZXAodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7Ly9vbmUgb2YgdGhlIHByb3BlcnRpZXMgY29udGFpbiB2YWx1ZVxuICAgICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXFsKG90aGVyKTtcbiAgICB9XG4gIH0pO1xuXG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIEFzc2VydGlvbi5hZGQoJ3N0YXJ0V2l0aCcsIGZ1bmN0aW9uKHN0ciwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBzdGFydCB3aXRoICcgKyBzaG91bGQuZm9ybWF0KHN0ciksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCgwID09PSB0aGlzLm9iai5pbmRleE9mKHN0cikpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdlbmRXaXRoJywgZnVuY3Rpb24oc3RyLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGVuZCB3aXRoICcgKyBzaG91bGQuZm9ybWF0KHN0ciksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iai5pbmRleE9mKHN0ciwgdGhpcy5vYmoubGVuZ3RoIC0gc3RyLmxlbmd0aCkgPj0gMCk7XG4gIH0pO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgQXNzZXJ0aW9uLmFkZCgnTnVtYmVyJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYSBudW1iZXInIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzTnVtYmVyKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2FyZ3VtZW50cycsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFyZ3VtZW50cycgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNBcmd1bWVudHModGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgndHlwZScsIGZ1bmN0aW9uKHR5cGUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaGF2ZSB0eXBlICcgKyB0eXBlLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgKHR5cGVvZiB0aGlzLm9iaikuc2hvdWxkLmJlLmV4YWN0bHkodHlwZSwgZGVzY3JpcHRpb24pO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdpbnN0YW5jZW9mJywgZnVuY3Rpb24oY29uc3RydWN0b3IsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYW4gaW5zdGFuY2Ugb2YgJyArIGNvbnN0cnVjdG9yLm5hbWUsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydChPYmplY3QodGhpcy5vYmopIGluc3RhbmNlb2YgY29uc3RydWN0b3IpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdGdW5jdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGEgZnVuY3Rpb24nIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzRnVuY3Rpb24odGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnT2JqZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYW4gb2JqZWN0JyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc09iamVjdCh0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdTdHJpbmcnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhIHN0cmluZycgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNTdHJpbmcodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnQXJyYXknLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhbiBhcnJheScgfTtcblxuICAgIHRoaXMuYXNzZXJ0KEFycmF5LmlzQXJyYXkodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnQm9vbGVhbicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGEgYm9vbGVhbicgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNCb29sZWFuKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ0Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYW4gZXJyb3InIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzRXJyb3IodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnbnVsbCcsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIG51bGwnIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaiA9PT0gbnVsbCk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hbGlhcygnaW5zdGFuY2VvZicsICdpbnN0YW5jZU9mJyk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgc2hvdWxkID0gcmVxdWlyZSgnLi9zaG91bGQnKTtcblxuc2hvdWxkXG4gIC51c2UocmVxdWlyZSgnLi9leHQvYXNzZXJ0JykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvY2hhaW4nKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9ib29sJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvbnVtYmVyJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvZXFsJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvdHlwZScpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L3N0cmluZycpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L3Byb3BlcnR5JykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvaHR0cCcpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2Vycm9yJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvbWF0Y2gnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9kZXByZWNhdGVkJykpO1xuXG4gbW9kdWxlLmV4cG9ydHMgPSBzaG91bGQ7IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxuICAsIEFzc2VydGlvbkVycm9yID0gdXRpbC5Bc3NlcnRpb25FcnJvclxuICAsIGluc3BlY3QgPSB1dGlsLmluc3BlY3Q7XG5cbi8qKlxuICogT3VyIGZ1bmN0aW9uIHNob3VsZFxuICogQHBhcmFtIG9ialxuICogQHJldHVybnMge0Fzc2VydGlvbn1cbiAqL1xudmFyIHNob3VsZCA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gbmV3IEFzc2VydGlvbih1dGlsLmlzV3JhcHBlclR5cGUob2JqKSA/IG9iai52YWx1ZU9mKCk6IG9iaik7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEFzc2VydGlvbmAgd2l0aCB0aGUgZ2l2ZW4gX29ial8uXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBBc3NlcnRpb24gPSBzaG91bGQuQXNzZXJ0aW9uID0gZnVuY3Rpb24gQXNzZXJ0aW9uKG9iaikge1xuICB0aGlzLm9iaiA9IG9iajtcbn07XG5cblxuLyoqXG4gIFdheSB0byBleHRlbmQgQXNzZXJ0aW9uIGZ1bmN0aW9uLiBJdCB1c2VzIHNvbWUgbG9naWMgXG4gIHRvIGRlZmluZSBvbmx5IHBvc2l0aXZlIGFzc2VydGlvbnMgYW5kIGl0c2VsZiBydWxlIHdpdGggbmVnYXRpdmUgYXNzZXJ0aW9uLlxuXG4gIEFsbCBhY3Rpb25zIGhhcHBlbiBpbiBzdWJjb250ZXh0IGFuZCB0aGlzIG1ldGhvZCB0YWtlIGNhcmUgYWJvdXQgbmVnYXRpb24uXG4gIFBvdGVudGlhbGx5IHdlIGNhbiBhZGQgc29tZSBtb3JlIG1vZGlmaWVycyB0aGF0IGRvZXMgbm90IGRlcGVuZHMgZnJvbSBzdGF0ZSBvZiBhc3NlcnRpb24uXG4qL1xuQXNzZXJ0aW9uLmFkZCA9IGZ1bmN0aW9uKG5hbWUsIGYsIGlzR2V0dGVyKSB7XG4gIHZhciBwcm9wID0ge307XG4gIHByb3BbaXNHZXR0ZXIgPyAnZ2V0JyA6ICd2YWx1ZSddID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQXNzZXJ0aW9uKHRoaXMub2JqKTtcbiAgICBjb250ZXh0LmNvcHkgPSBjb250ZXh0LmNvcHlJZk1pc3Npbmc7XG5cbiAgICB0cnkge1xuICAgICAgZi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy9jb3B5IGRhdGEgZnJvbSBzdWIgY29udGV4dCB0byB0aGlzXG4gICAgICB0aGlzLmNvcHkoY29udGV4dCk7XG5cbiAgICAgIC8vY2hlY2sgZm9yIGZhaWxcbiAgICAgIGlmKGUgaW5zdGFuY2VvZiBzaG91bGQuQXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgICAgLy9uZWdhdGl2ZSBmYWlsXG4gICAgICAgIGlmKHRoaXMubmVnYXRlKSB7XG4gICAgICAgICAgdGhpcy5vYmogPSBjb250ZXh0Lm9iajtcbiAgICAgICAgICB0aGlzLm5lZ2F0ZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIC8vIHRocm93IGlmIGl0IGlzIGFub3RoZXIgZXhjZXB0aW9uXG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICAvL2NvcHkgZGF0YSBmcm9tIHN1YiBjb250ZXh0IHRvIHRoaXNcbiAgICB0aGlzLmNvcHkoY29udGV4dCk7XG4gICAgaWYodGhpcy5uZWdhdGUpIHtcbiAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLm9iaiA9IGNvbnRleHQub2JqO1xuICAgIHRoaXMubmVnYXRlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFzc2VydGlvbi5wcm90b3R5cGUsIG5hbWUsIHByb3ApO1xufTtcblxuQXNzZXJ0aW9uLmFsaWFzID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgQXNzZXJ0aW9uLnByb3RvdHlwZVt0b10gPSBBc3NlcnRpb24ucHJvdG90eXBlW2Zyb21dXG59O1xuXG5zaG91bGQuQXNzZXJ0aW9uRXJyb3IgPSBBc3NlcnRpb25FcnJvcjtcbnZhciBpID0gc2hvdWxkLmZvcm1hdCA9IGZ1bmN0aW9uIGkodmFsdWUpIHtcbiAgaWYodXRpbC5pc0RhdGUodmFsdWUpICYmIHR5cGVvZiB2YWx1ZS5pbnNwZWN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsdWUudG9JU09TdHJpbmcoKTsgLy9zaG93IG1pbGxpcyBpbiBkYXRlc1xuICByZXR1cm4gaW5zcGVjdCh2YWx1ZSwgeyBkZXB0aDogbnVsbCB9KTtcbn07XG5cbnNob3VsZC51c2UgPSBmdW5jdGlvbihmKSB7XG4gIGYodGhpcywgQXNzZXJ0aW9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHNob3VsZCB0byBleHRlcm5hbCB3b3JsZC5cbiAqL1xuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc2hvdWxkO1xuXG5cbi8qKlxuICogRXhwb3NlIGFwaSB2aWEgYE9iamVjdCNzaG91bGRgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdzaG91bGQnLCB7XG4gIHNldDogZnVuY3Rpb24oKXt9LFxuICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHNob3VsZCh0aGlzKTtcbiAgfSxcbiAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5Bc3NlcnRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogQXNzZXJ0aW9uLFxuXG4gIGFzc2VydDogZnVuY3Rpb24oZXhwcikge1xuICAgIGlmKGV4cHIpIHJldHVybjtcblxuICAgIHZhciBwYXJhbXMgPSB0aGlzLnBhcmFtcztcblxuICAgIHZhciBtc2cgPSBwYXJhbXMubWVzc2FnZSwgZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICAgIGlmKCFtc2cpIHtcbiAgICAgIG1zZyA9IHRoaXMuZ2V0TWVzc2FnZSgpO1xuICAgICAgZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGVyciA9IG5ldyBBc3NlcnRpb25FcnJvcih7XG4gICAgICBtZXNzYWdlOiBtc2dcbiAgICAgICwgYWN0dWFsOiB0aGlzLm9ialxuICAgICAgLCBleHBlY3RlZDogcGFyYW1zLmV4cGVjdGVkXG4gICAgICAsIHN0YWNrU3RhcnRGdW5jdGlvbjogdGhpcy5hc3NlcnRcbiAgICB9KTtcblxuICAgIGVyci5zaG93RGlmZiA9IHBhcmFtcy5zaG93RGlmZjtcbiAgICBlcnIub3BlcmF0b3IgPSBwYXJhbXMub3BlcmF0b3I7XG4gICAgZXJyLmdlbmVyYXRlZE1lc3NhZ2UgPSBnZW5lcmF0ZWRNZXNzYWdlO1xuXG4gICAgdGhyb3cgZXJyO1xuICB9LFxuXG4gIGdldE1lc3NhZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnZXhwZWN0ZWQgJyArIGkodGhpcy5vYmopICsgKHRoaXMubmVnYXRlID8gJyBub3QgJzogJyAnKSArXG4gICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICsgKCdleHBlY3RlZCcgaW4gdGhpcy5wYXJhbXMgID8gJyAnICsgaSh0aGlzLnBhcmFtcy5leHBlY3RlZCkgOiAnJyk7XG4gIH0sXG5cbiAgY29weTogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICB0aGlzLnBhcmFtcyA9IG90aGVyLnBhcmFtcztcbiAgfSxcblxuICBjb3B5SWZNaXNzaW5nOiBmdW5jdGlvbihvdGhlcikge1xuICAgIGlmKCF0aGlzLnBhcmFtcykgdGhpcy5wYXJhbXMgPSBvdGhlci5wYXJhbXM7XG4gIH0sXG5cblxuICAvKipcbiAgICogTmVnYXRpb24gbW9kaWZpZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGdldCBub3QoKSB7XG4gICAgdGhpcy5uZWdhdGUgPSAhdGhpcy5uZWdhdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbiIsIihmdW5jdGlvbiAoQnVmZmVyKXtcbi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqIENoZWNrIGlmIGdpdmVuIG9iaiBqdXN0IGEgcHJpbWl0aXZlIHR5cGUgd3JhcHBlclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0cy5pc1dyYXBwZXJUeXBlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzTnVtYmVyKG9iaikgfHwgaXNTdHJpbmcob2JqKSB8fCBpc0Jvb2xlYW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWVyZ2Ugb2JqZWN0IGIgd2l0aCBvYmplY3QgYS5cbiAqXG4gKiAgICAgdmFyIGEgPSB7IGZvbzogJ2JhcicgfVxuICogICAgICAgLCBiID0geyBiYXI6ICdiYXonIH07XG4gKlxuICogICAgIHV0aWxzLm1lcmdlKGEsIGIpO1xuICogICAgIC8vID0+IHsgZm9vOiAnYmFyJywgYmFyOiAnYmF6JyB9XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24oYSwgYil7XG4gIGlmIChhICYmIGIpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHwgYXJnIGluc3RhbmNlb2YgTnVtYmVyO1xufVxuXG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHwgYXJnIGluc3RhbmNlb2YgU3RyaW5nO1xufVxuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHwgYXJnIGluc3RhbmNlb2YgQm9vbGVhbjtcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIEJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgYXJnIGluc3RhbmNlb2YgQnVmZmVyO1xufVxuXG5leHBvcnRzLmlzQnVmZmVyID0gaXNCdWZmZXI7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cblxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIG9iamVjdFRvU3RyaW5nKG9iamVjdCkgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5leHBvcnRzLmlzQXJndW1lbnRzID0gaXNBcmd1bWVudHM7XG5cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJyB8fCBhcmcgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbn07XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gKGlzT2JqZWN0KGUpICYmIG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nKSB8fCAoZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmV4cG9ydHMuaW5zcGVjdCA9IHJlcXVpcmUoJ3V0aWwnKS5pbnNwZWN0O1xuXG5leHBvcnRzLkFzc2VydGlvbkVycm9yID0gcmVxdWlyZSgnYXNzZXJ0JykuQXNzZXJ0aW9uRXJyb3I7XG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmV4cG9ydHMuZm9yT3duID0gZnVuY3Rpb24ob2JqLCBmLCBjb250ZXh0KSB7XG4gIGZvcih2YXIgcHJvcCBpbiBvYmopIHtcbiAgICBpZihoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcbiAgICAgIGYuY2FsbChjb250ZXh0LCBvYmpbcHJvcF0sIHByb3ApO1xuICAgIH1cbiAgfVxufTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcikiXX0=
