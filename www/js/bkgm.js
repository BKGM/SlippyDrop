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

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
SCALE = WIDTH/768;
var BKGM = BKGM||{};
(function(){
    BKGM = function(obj){
        var _this=this;
        _this.gravity={x:0,y:0,z:0};
        
        ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined')) ? this.cordova=null : this.cordova=cordova;
        if ((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)) {
            window.addEventListener('devicemotion', function(eventData){
                        if(eventData.accelerationIncludingGravity)
                            _this.gravity = {x:eventData.accelerationIncludingGravity.y/3,y:eventData.accelerationIncludingGravity.x/3,z:eventData.accelerationIncludingGravity.z};
                    }, false);
        } else {
            if(cordova && navigator &&  navigator.accelerometer){
                 // The watch id references the current `watchAcceleration`
                var watchID = null;


                

                // Start watching the acceleration
                //
                function startWatch() {

                    // Update acceleration every 3 seconds
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

               /* // onSuccess: Get a snapshot of the current acceleration
                //
                function onSuccess(acceleration) {
                    var element = document.getElementById('accelerometer');

                    element.innerHTML = 'Acceleration X: ' + acceleration.x + '<br />' +
                                        'Acceleration Y: ' + acceleration.y + '<br />' +
                                        'Acceleration Z: ' + acceleration.z + '<br />' +
                                        'Timestamp: '      + acceleration.timestamp + '<br />';
                }

                // onError: Failed to get the acceleration
                //
                function onError() {
                    alert('onError!');
                }*/

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
            this.draw=obj.draw||this.draw;
        }
        if (document.getElementById("game"))
            this.canvas = document.getElementById("game");
        else {
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute("id", "game");
            this.canvas.width  = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.appendChild(this.canvas);
        }       
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
            
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            _this._staticDraw();
            _this.draw();        
            requestAnimFrame(function(){
                _this.loop(_this);
            });
            return _this;
        },
        run:function(){
            WIDTH = this.canvas.width;
            HEIGHT  = this.canvas.height;
            SCALE = HEIGHT/1152;
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
    }
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
alert("load FBConnect");
(function(){
    var BKGM = BKGM||{};
    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {
            type: 'image/png'
        });
    };
    BKGM.FBConnect = function(obj,callback){        
        var app_id="296632137153437";
        if (obj){
            app_id=obj.appId;
        }
        var loaded=0;
        function _onLoad(){
            loaded++;alert("load dc");
            if(loaded==2){

                try {
                    if (cordova) FB.init({ appId: app_id, nativeInterface: CDV.FB, useCachedDialogs: false });
                    else FB.init({ appId: app_id,status: true,xfbml: truecookie: true,frictionlessRequests: true,oauth: true});
                } catch (e) {
                    alert(e);
                }
                if (callback) callback();
            }       
                
        };
        if (BKGM.loadJS)  {
            alert("load loadJS");
            if (cordova){
                BKGM.loadJS('cdv-plugin-fb-connect.js',_onLoad);
                BKGM.loadJS('facebook-js-sdk.js',_onLoad);
            } else {
                _onLoad();
                BKGM.loadJS('//connect.facebook.net/en_US/all.js',_onLoad);
            }

           
        };
        return this;
    }
    BKGM.FBConnect.prototype= {
        logout:function(callback) {
            var self=this;
            FB.logout(function(response) {
                if(callback) callback(response);
            });
        },            
        login:function(callback) {
            var self=this;
            FB.login(
                function(response) {
                    if (response.session) {
                        if(callback) callback(response);
                    } else {
                        if(callback) callback(response);
                    }
                },
                { scope: "publish_actions" }
            );
        },
        getLoginStatus: function(callback) {
            var self=this;
            FB.getLoginStatus(function(response) {
                              if (response.status == 'connected') {
                                self.isLogin=true;
                                if (callback) callback(response);
                              } else {
                                self.isLogin=false;
                                if (callback) callback(false);
                              }
                              });
            return this;
        },
        getAuthResponse: function(callback){
            var self=this;
            var authResponse = {};
            this.getLoginStatus(function(response){
                if(response && response.authResponse) {authResponse=response.authResponse; if (callback) callback(authResponse);}
                else self.login(function(response){
                    if(response && response.authResponse) {authResponse=response.authResponse; if (callback) callback(authResponse);}
                })
            })
            return authResponse;
        },
        postCanvas:function(message, callback) {
            var authResponse = this.getAuthResponse();
            if (!this.isLogin) {
                alert('Error! Not login FB');
                return;
            }
            var uid = authResponse.userID;
            var access_token = authResponse.accessToken;
            var canvas = document.getElementById("game");
            var imageData = canvas.toDataURL("image/png");
            var mess =message || "http://fb.com/BKGameMaker.com";
            try {
                blob = dataURItoBlob(imageData);
            } catch (e) {
                console.log(e);
            }

            var fd = new FormData();
            fd.append("access_token", access_token);
            fd.append("source", blob);
            fd.append("message", mess);
            try {
                BKGM.ajax({
                    url: "https://graph.facebook.com/me/photos?access_token=" + access_token,
                    type: "POST",
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function (data) {
                        console.log("success " + data);
                        $("#poster").html("Posted Canvas Successfully");
                    },
                    error: function (shr, status, data) {
                        console.log("error " + data + " Status " + shr.status);
                    },
                    complete: function () {
                        console.log("Posted to facebook");
                    }
                });

            } catch (e) {
                console.log(e);
            }
        }
    };
   
})();
