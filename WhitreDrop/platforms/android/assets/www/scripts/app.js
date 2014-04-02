/*!
 * browserify-0.0.0
 * 
 * 2014-04-02
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BKGM = require('./');

var States = function(){
    this.current  = "default";
    this.once     = false;
    this.switched = false;
    this.states   = { default : [] };
    this.updates  = {};
    this.draws    = {};
    this.lastTime = 0;
    this.steps    = 0;
    this.time     = 0;
}

var frameTime = 1000/60;

States.prototype = {
    state: function (name, tasks) {
        this.states[name] = tasks;
    },
    draw: function (name, fn) {
        this.draws[name] = fn;
    },
    update: function(name, fn) {
        this.updates[name] = fn;
    },
    taskOnce: function(name, fn) {
        var self = this;
        this.draws[name] = function() {
            self.once === false?fn(arguments):null;
        };
    },
    run: function() {
        this.time += +new Date() - this.lastTime;
        var time = this.time;
        this.lastTime = +new Date();

        this.switched = false;
        var tasks = this.states[this.current],
            updates = this.updates,
            draws = this.draws;

        while (time >= frameTime){
            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];
                if (updates[task]) {
                    if (typeof task === "string") {
                        if (updates[task]) updates[task]();
                    } else if (typeof task.args === 'function') {
                        if (updates[task.name]) updates[task.name].apply(null, task.args() || []);
                    } else {
                        if (updates[task.name]) updates[task.name].apply(null, task.args || []);
                    }
                }
            }
            time -= frameTime;
        }
        this.time = time;

        for (var i = 0, l = tasks.length; i < l; i++) {
            var task = tasks[i];
            if (typeof task === "string") {
                if (draws[task]) draws[task]();
            } else if (typeof task.args === 'function') {
                if (draws[task.name]) draws[task.name].apply(null, task.args() || []);
            } else {
                if (draws[task.name]) draws[task.name].apply(null, task.args || []);
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
        this.lastTime = +new Date();
        this.step = 0;
        this.time = 0;
        if (runNow) this.run();
    }
}

module.exports = States;
},{"./":4}],2:[function(require,module,exports){
var States = require('./States'),
	director = new States();

module.exports = director;
},{"./States":1}],3:[function(require,module,exports){
var BKGM=require('./');
(function(FBConnect){
    /*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Uses the new array typed in javascript to binary base64 encode/decode
 * at the moment just decodes a binary base64 encoded
 * into either an ArrayBuffer (decodeArrayBuffer)
 * or into an Uint8Array (decode)
 * 
 * References:
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/ArrayBuffer
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/Uint8Array
 */

window.Base64Binary = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    
    /* will return a  Uint8Array type */
    decodeArrayBuffer: function(input) {
        var bytes = (input.length/4) * 3;
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);
        
        return ab;
    },
    
    decode: function(input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));      
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));      
    
        var bytes = (input.length/4) * 3;
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip
        
        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;
        
        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);
        
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        
        for (i=0; i<bytes; i+=3) {  
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));
    
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
    
            uarray[i] = chr1;           
            if (enc3 != 64) uarray[i+1] = chr2;
            if (enc4 != 64) uarray[i+2] = chr3;
        }
    
        return uarray;  
    }
}


    // var BKGM = BKGM||{}; 
    
    if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
        XMLHttpRequest.prototype.sendAsBinary = function(string) {
            var bytes = Array.prototype.map.call(string, function(c) {
                return c.charCodeAt(0) & 0xff;
            });
            this.send(new Uint8Array(bytes).buffer);
        };
    }
    function PostImageToFacebook(authToken, filename, mimeType, imageData, obj)
    {
        if (imageData != null)
        {
            //Prompt the user to enter a message
            //If the user clicks on OK button the window method prompt() will return entered value from the text box. 
            //If the user clicks on the Cancel button the window method prompt() returns null.
            var message = prompt('Facebook', 'Enter a message');

            if (message != null)
            {   
                var ajax = {
                    success: (obj && obj.success) ? obj.success : null,
                    error: (obj && obj.error) ? obj.error : null,
                    complete: (obj && obj.complete) ? obj.complete : null
                }
                // this is the mult
                // let's encode ouripart/form-data boundary we'll use
                var boundary = '----ThisIsTheBoundary1234567890';
                var formData = '--' + boundary + '\r\n'
                formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
                formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
                for (var i = 0; i < imageData.length; ++i)
                {
                    formData += String.fromCharCode(imageData[ i ] & 0xff);
                }
                formData += '\r\n';
                formData += '--' + boundary + '\r\n';
                formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
                formData += message + '\r\n'
                formData += '--' + boundary + '--\r\n';

                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true);
                xhr.onreadystatechange = function(ev){
                    if (xhr.status==200) {
                        if(ajax.success) ajax.success(xhr.responseText);
                        if (xhr.readyState==4)
                            if (ajax.complete) ajax.complete(xhr.responseText)            
                    } else {
                        if (ajax.error) ajax.error(xhr.responseText);
                    }            
                };
                xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
                xhr.sendAsBinary(formData);
            }
        }
    };
    function toBKGMScore(fbResponse, requestScoreParams) {
        var result = new BKGM.Score(fbResponse.user.id, fbResponse.score, fbResponse.user.name);
        if (requestScoreParams) {
            result.leaderboardID = requestScoreParams.leaderboardID;
        }
        result.imageURL = 'https://graph.facebook.com/' + fbResponse.user.id + '/picture';
        return result;
    };
    BKGM.FBConnect = function(){        
        // return this;
    }
    BKGM.FBConnect.prototype= {
        init:function(obj,callback){
            var self=this;
            var app_id="296632137153437";
            if (obj){
                app_id=obj.appId;
            }
            try {
                BKGM._isCordova ? FB.init({ appId: app_id, nativeInterface: CDV.FB, useCachedDialogs: false }) : FB.init({ appId: app_id,status: true,xfbml: true,cookie: true,frictionlessRequests: true,oauth: true});
                
            } catch (e) {
                alert(e);
            }
            this.app_id=app_id;
        },
        initLeaderboards : function(Game,link,x,y,width,height,isClose){
            var self=this;
            this.iframe=document.createElement('iframe');
            
            // this.iframe.style.backgroundcolor= "#fff";
            document.body.appendChild(this.iframe);
            this.iframe.src=link||"leaderboards.html";
            this.iframe.width=width||Game.WIDTH;
            this.iframe.height=height|| Game.HEIGHT;
            this.iframe.style.position="absolute";
            this.iframe.style.display="inherit";
            this.iframe.style.top=(y||0)+"px";
            this.iframe.style.left=(x||0)+"px";
            this.iframe.style.border="none";
            if(isClose) return;
            this.closeButton=document.createElement('div');
            document.body.appendChild(this.closeButton);
            this.closeButton.style.display="none";
            this.closeButton.style.position="fixed";
            this.closeButton.style.width="30px";
            this.closeButton.style.height="30px";
            this.closeButton.style.lineHeight="30px";
            this.closeButton.style.borderRadius="45px";
            this.closeButton.style.top='10px';
            this.closeButton.style.backgroundColor="#444750";
            this.closeButton.style.color="#fafafa";
            this.closeButton.style.left=(Game.WIDTH-50)+'px';
            this.closeButton.style.textAlign="center";
            this.closeButton.style.fontWeight="bold";
            this.closeButton.style.fontSize="30px";
            this.closeButton.style.textDecoration= "none";      
            this.closeButton.style.cursor= "pointer";
            this.closeButton.innerHTML="X";
            this.closeButton.style.opacity= .8; 
            this.closeButton.onmouseover=function(){
                self.closeButton.style.opacity= 1;
            }
            this.closeButton.onmouseout=function(){
                self.closeButton.style.opacity= 0.8;            
            }
            this.closeButton.onmousedown=function(){
                self.closeButton.style.opacity= 0.8; 
            }
            this.closeButton.onmouseup=function(){
                self.closeButton.style.opacity= 1;
                if(self.hideLeaderboard) self.hideLeaderboard();
            }
        },
        handleStatusChange:function(session) {
            if (session.authResponse) {
                 var str="";
                    for (var x in session.authResponse){
                        str+=x;
                    }
                    alert(str);
            }
        },
        logout:function(callback) {
            var self=this;
            FB.logout(function(response) {
                if(callback) callback(response);
            });
        },            
        login:function(callback) {
            var self=this;
            this.getLoginStatus(function(response) {                
                if (!response) {
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
                }
                FB.api('/me', function(response) {
                   self.id=response.id; 
                });
            });
            
            
            
        },
        getLoginStatus: function(callback) {
            var self=this;
            FB.getLoginStatus(function(response) {
                              if (response.status == 'connected') {
                                self.isLogin=true;
                                if (response.authResponse && callback) 
                                    callback(response.authResponse);
                              } else {
                                self.isLogin=false;
                                if (callback) callback(false);
                              }
                              });
            return this;
        },
        getAuthResponse: function(callback1){
            var self=this;
            FB.getLoginStatus(function(response) {
                  if (response.status == 'connected') {
                    if (response.authResponse && callback1) 
                        {
                            callback1(response.authResponse.accessToken,response.authResponse.userId);
                        }
                  } else {
                    self.login(function(response){
                        if(response && response.authResponse) {authResponse=response.authResponse; if (callback1) callback1(authResponse.accessToken,authResponse.userId);}
                    })
                  }
                  });
        },
        postCanvas:function(message, callback) {
            this.getAuthResponse(function(access_token,uid){
                // var uid = authResponse.userID;
                // var access_token = authResponse.accessToken;
                var canvas = document.getElementById("game");
                var imageData = canvas.toDataURL("image/png");
                var mess =message || "http://fb.com/BKGameMaker.com";
                var encodedPng = imageData.substring(imageData.indexOf(',')+1,imageData.length);
                var decodedPng = Base64Binary.decode(encodedPng);
                PostImageToFacebook(access_token, "filename.png", 'image/png', decodedPng);
              
            });

            

        },
        submitScore:function(score,params,callback){
            this.getScore(params,function(currentScore, error) {
                if (error) {                    
                    if (callback)
                        callback(error);
                   return;
                }
                var topScore = currentScore ? currentScore.score : 0;
                if (score <= topScore) {
                    //don't submit the new score because a better score is already submitted
                    if (callback)
                        callback(null);
                    return;
                }
                var apiCall = "/" + ((params && params.userID) ? params.userID : "me") + "/scores";
                FB.api(apiCall, 'POST', {score:score}, function (response) {
                     if (callback)
                        callback(response.error);
                });
            })
            
        },
        getScore: function(params,callback) {

            var apiCall = ((params && params.userID) ? params.userID : "me") + "/scores";
            FB.api(apiCall, function(response) {
                if (response.error) {
                    callback(null, response.error);
                    return new BKGM.Score("me",0);
                }
                else if (response.data && response.data.length > 0) {
                    var score = toBKGMScore(response.data[0]);
                    callback(score,null);
                    return score;
                }
                else {
                    //No score has been submitted yet for the user
                    callback(null,null);
                    return new BKGM.Score("me",0);
                }

            });
        },
        hideLeaderboard : function(){
            this.iframe.style.display="none";
            if(this.closeButton)this.closeButton.style.display="none";
        },
        showLeaderboard : function(callback, params) {
           
            var self=this;
            self.iframe.style.display="inherit";
            if(self.closeButton)self.closeButton.style.display="inherit";
            
            this.getAuthResponse(function(access_token,uid){
                BKGM.ajax({
                    url:"https://graph.facebook.com/"+self.app_id + "/scores/?access_token=" + access_token,
                    type:'GET',
                    complete:function(response) {
                        // if (dialog.closed)
                        //     return;
                        response = JSON.parse(response);
                        if (response.error) {
                            if (callback) {
                                // callbackSent = true;
                                callback(response.error);
                                // dialog.close();
                            }
                            return;
                        }
                        
                        var scores = [];
                        if (response.data && response.data.length) {

                            for (var i = 0; i< response.data.length; ++i) {
                                var score = toBKGMScore(response.data[i]);
                                score.position = i;
                                score.imageURL = "https://graph.facebook.com/" + score.userID + "/picture";
                                score.me=score.userID==self.id ? score.userID : null;
                                // score.me = score.userID === me.fb._currentSession.authResponse.userID;
                                scores.push(score);

                        
                            }
                        }
                        // var js = "addScores(" +  + ")";
                        self.iframe.contentWindow.initializeView();
                        self.iframe.contentWindow.addScores(scores);
                        
                        // dialog.eval(js);
                    }
                })
            });           
        }
    };
   
})();
module.exports = new BKGM.FBConnect();
},{"./":4}],4:[function(require,module,exports){
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
    var _BKGMLoop;
    var addLoop = function(_this){
        _BKGMLoop=_this;
    };

    var _loop = function(){
        // var time=new Date();
        // for (var i = _statesLoop.length - 1; i >= 0; i--) {
        //     var now =new Date();
        //     var dt =  now - lastTime;//Khoang thoi gian giua 2 lan cap nhat
        //     lastTime = now;
        //     t += dt ;//Thoi gian delay giua 2 lan cap nhat
        //     while (t >= frameTime) {//Chay chi khi thoi gian delay giua 2 lan lon hon 10ms
        //         t -= frameTime;//Dung de xac dinh so buoc' tinh toan
        //         sceneTime += frameTime;
        //         _statesLoop[i].update(_statesLoop[i], sceneTime);
        //         _statesLoop[i].time=sceneTime;
        //     }   
        //     _statesLoop[i].loop(_statesLoop[i]);
        // };
        // var _drawtime=(new Date()- time);
        // var drawtime=0;
        // _count.push(_drawtime);
        // for (var i = _count.length - 1; i >= 0; i--) {
        //     drawtime+=_count[i];
        // };
        
        // if (_count.length>=100) {
        //     _count.unshift();

        // }
        // if(debug && BKGM.debug)debug.innerHTML="draw time: "+(drawtime/_count.length*100>>0)/100 +"</br> FPS: "+_statesLoop[0].FPS;
        BKGM.time = +new Date();
        if(_BKGMLoop) _BKGMLoop.loop(_BKGMLoop);
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
            this.canvas.width  = 320;
            
            document.body.appendChild(this.canvas);
        }       
        this.width=this.canvas.width;
        this.height=this.canvas.height;
        this.WIDTH = this.canvas.width;
        this.HEIGHT  = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = "center";
        this.ctx.font = '40px SourceSansPro';
        this.ctx.lineCap = 'butt';
        this._fontSize = 40;

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
            } else this.ctx.rect(x, y, width, height);
            this.ctx.fill();  
            return this;
        },
        rectMode:function(Input){
            this._rectMode=Input;
            return this;
        },
        fontSize: function(size){
            this.ctx.font = size+'px SourceSansPro';
            this._fontSize = size;
            return this;
        },
        textAlgin: function(align) {
            this.ctx.textAlign = align;
            return this;
        },
        text:function( string, x, y, fontSize){
            this.ctx.save();
            this.ctx.translate(0, this.canvas.height);
            this.ctx.scale(1,-1);
            this.ctx.fillText(string, x, this.canvas.height-(y-this._fontSize/2));
            this.ctx.restore();
            return this;
        },
        circle:function( x, y, diameter){
            this.ctx.beginPath();
            this.ctx.arc(x, y, diameter/2, 0, Math.PI*2,false);
            this.ctx.fill();
            return this;
        },
        line:function(x1, y1, x2, y2){

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.closePath();

            return this;
        },
        lineCapMode:function(lineMode){
            this.ctx.lineCap = lineMode;
            return this;
        },
        stroke:function(R, G, B, A){
            this.ctx.strokeStyle="rgba("+R+", "+G+", "+B+", " + (A/255) + ")";
            return this;
        },
        strokeWidth: function(width){
            this.ctx.lineWidth = width;
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
            _this._istouch=true;
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
            if (_this._istouch) return;
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
            if (_this._istouch) return;
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
    BKGM.Score = function(userID, score, userName, imageURL, leaderboardID){
        this.userID = userID;
        this.score = score || 0;
        this.userName = userName;
        this.imageURL = imageURL;
        this.leaderboardID = leaderboardID;

        return this;
    }

})();
(function(){

    BKGM.ScoreLocal=function(name){
        this.name=name;
    }
    BKGM.ScoreLocal.prototype={
        submitScore:function(score,userID){
            if(!localStorage) return 0;
            

            var name = this.name;
            var scoreItem = localStorage.getItem("BKGM."+name+".score");
            var topScore = parseInt(scoreItem) || 0;
            if(score>topScore)
                localStorage.setItem("BKGM."+name+".score",score);

        },
        getScore:function(){
            if(localStorage){
                var name = this.name;
                var scoreItem = localStorage.getItem("BKGM."+name+".score");
                var score = parseInt(scoreItem) || 0;

                return new BKGM.Score("me", score);
            } else {
                return new BKGM.Score("me", 0);;
            }
            
        }
       

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

},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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

},{"./BKGM":4,"./BKGM/States":1,"./commonTasks":8,"./game":12,"./gameTasks":13,"./random":15,"./screenplay":16,"should":40}],7:[function(require,module,exports){
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

},{"./BKGM/screenset":5,"./constants":9,"./game":12,"./random":15}],8:[function(require,module,exports){
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

	director.draw('background', function(){
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
        for (var i = background_c.length - 1; i >=0; i--){
        	var v = background_c[i];
            v.x = v.x + incx;
            v.y = v.y + v.s + 1;
            if (v.y > HEIGHT + v.r || v.x > WIDTH + v.r || v.x < -v.r) {
                background_c.splice(i, 1);
            } else {
                
                game.circle(v.x, v.y, v.r);
            }
        }
        // game.background(100, 100, 100, 255);

    }, true);
    
    director.draw('logo', function(logo_x, logo_y){

        var c = random(0, 30);
        var f = 25;
                
        game.fill(255-c, 255-c, 255-c, 255);
        
        var d = random(-1, 1);
        var e = random(-1, 1);
        game.fontSize(20);
        game.text('BKgameMaker', logo_x + d, logo_y + f + e);
        game.fontSize(50);
        game.text('WHITE DROP', logo_x + d, logo_y - f + e);
        game.fill(255-c, 255-c, 255-c, 255);
    }, true);
    
    director.draw("buttons", function(buttons) {
        var x 		= buttons.x,
        	y 		= buttons.y,
        	w 		= buttons.w,
        	h 		= buttons.h,
        	s 		= buttons.s,
        	f 		= 20,//buttons.f,
        	list	= buttons.list;
        
        game.rectMode('CENTER');
        
        var d = random(0, 1),
        	e = random(-1, 0);

        game.fontSize(f);
        
        for (var i = 0, l = list.length; i < l; i++) {
            game.fill(240, 240, 240, 180);
            game.rect(x + d, y - ( h + s ) * i + e, w, h);
            game.fill(0, 0, 0, 220);
            game.text(list[i], x + d, y - ( h + s ) * i + e + 4);
        }
        
    }, true);
};
},{"./BKGM/director":2,"./blocks":7,"./constants":9,"./drop":10,"./game":12,"./random":15}],9:[function(require,module,exports){
var game = require('./game'),
	screenset=require('./BKGM/screenset'),
	WIDTH = game.WIDTH;
	SCALE =(WIDTH/768),
	SQRT_SCALE = Math.sqrt(WIDTH/768),
	DROP_Y = Math.floor(game.HEIGHT/2),
	CONST = {

	SCALE 				: game.WIDTH/768,
	SQRT_SCALE 			: Math.sqrt(game.WIDTH/768),
	FLOOR_SCALE 		: Math.floor(game.WIDTH/768),
	FLOOR_SQRT_SCALE 	: Math.floor(Math.sqrt(game.WIDTH/768)),

	BLOCK_HEIGHT 		: Math.floor(50 * SQRT_SCALE),
	BLOCK_GAP			: Math.floor(150 * SQRT_SCALE),

	DROP_DIAMETER 		: Math.floor(30 * SQRT_SCALE),
	DROP_ACCEL 			: Math.floor(2 * SCALE + 0.5),
	DROP_GRAV			: game.WIDTH,
	DROP_Y 				: DROP_Y,
	SPEED 				: screenset(game,{
							'IPAD':3,
							'IPHONE':2,
							'DEFAULT':Math.floor(4*SQRT_SCALE)
						}),
	BUTTONS				: buttons = {
					        x : WIDTH/2,
					        y : DROP_Y - 140,
					        w : 300 * SQRT_SCALE,
					        h : 50 * SQRT_SCALE,
					        s : 15 * SQRT_SCALE,
					        f : 30 * SQRT_SCALE,
					        list : [
					            "Try again",
					            "Share your score",
					            "Show Leaderboard"
					        ],
					        actions : [
					            "game",
					            "share",
					            "leaderboard"
					        ]
					    }
};

module.exports = CONST;
},{"./BKGM/screenset":5,"./game":12}],10:[function(require,module,exports){
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

drop.drawTouch = function(){
    var x = this.x;
    if (game.currentTouch.state === 'MOVING') {
        var tx = game.currentTouch.x,
            ty = game.currentTouch.y;
        game.strokeWidth(4);
        game.stroke(255, 255, 255, 61);
        game.line(x, y, tx, ty);
        game.strokeWidth(0);
        game.fill(255, 255, 255, 148);
        game.circle(tx, ty, 50);
    }
};

drop.updateByTouch = function(){
    var x = this.x;
    if (game.currentTouch.state === 'MOVING') {
        var tx = game.currentTouch.x,
            ty = game.currentTouch.y;
        this.rotate = (tx - x) / 768;
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
},{"./BKGM/screenset":5,"./blocks":7,"./constants":9,"./game":12}],11:[function(require,module,exports){
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
},{"./BKGM/screenset":5,"./constants":9,"./game":12,"./random":15}],12:[function(require,module,exports){
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
},{"./BKGM":4,"./BKGM/director":2}],13:[function(require,module,exports){
var director = require('./BKGM/director'),
    BKGM = require('./BKGM'),
    _fb =   require('./BKGM/fbconnect'),
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
    explosion = require('./explosion'),
    buttons = constants.BUTTONS;

module.exports = function(){

	var score = 0,
		highscore = 0,
        newbestscore = false,
        localscore = new BKGM.ScoreLocal("whitedrop");

    _fb.init({appId:"296632137153437"});
    _fb.initLeaderboards(game,null,0,0,WIDTH,HEIGHT);
    _fb.hideLeaderboard();
    _fb.login(_fb.hideLeaderboard);
    _fb.getScore(null, function(score){
        localscore.submitScore(score);
    });

    var _startgame=(function(){
        var x       = buttons.x,
            y       = buttons.y,
            w2      = buttons.w / 2,
            h       = buttons.h,
            h2      = h / 2,
            s       = buttons.s,
            f       = buttons.f,
            list    = buttons.list,
            actions = buttons.actions;
        
        return function(e){
            switch(director.current){
                case 'gameover':
                    var tx = e.x,
                        ty = e.y,
                        i  = 0, 
                        l  = actions.length;
                    if (tx > x - w2 && tx < x + w2) {
                        while (i <= l) {
                            if (ty > y - (h + s) * i - h2 && ty < y - (h + s) * i + h2) {
                                switch(actions[i]){
                                    case 'game' : director.switch('game'); break;
                                    case 'share': _fb.postCanvas(); break;
                                    case 'leaderboard':_fb.showLeaderboard();break;
                                };
                                break;
                            }
                            i++;
                        }
                    }
                break;
                case 'menu': director.switch("game"); break;
            }
        };
    })();

    game.mouseDown=function(e){
        _startgame(e);
    };

    game.touchStart=function(e){
        _startgame(e);
    };

	director.taskOnce("setup", function(){
		highscore = localscore.getScore().score || 0;
        drop.reset();
        blocks.reset();
        blocks.spawn(0);
        score = 0;
        newbestscore = false;
    });

    director.draw("score", function() {
        if (blocks.pass(drop)){
            //sound(SOUND_PICKUP, 32947)
            score++;
        }
    });

    director.update("drop.tail", function(){
        drop.updateTail();
    });
    
    director.update("drop.update", function(){
        drop.updateByTouch();
    });

    director.draw("drop.drawTouch", function(){
        drop.drawTouch();
    });

    director.draw("drop.grav", function(){
        drop.updatePosition();
    });
    
    director.draw("drop.draw", function(){
        drop.draw();
    });
    
    director.draw("collide", function() {
        if ( drop.collide(blocks.now()) ) {
            //showAdFromTop()
            director.switch("explode");
        }
    });

    director.taskOnce("calscore", function(){
        _fb.submitScore(score,null,function(){
            // _fb.showLeaderboard();
        });
        if(highscore<score){
            localscore.submitScore(score);
            highscore = score;
            newbestscore = true;
        }
    });

    director.update("blocks.update", function(){
    	blocks.update();
    });

    director.draw("blocks.draw", function(){
    	blocks.draw();
    });

    director.draw("guide", function() {
        game.fill(255, 255, 255, 255);
        game.fontSize(16);
        game.text("Click to start", WIDTH/2, DROP_Y - 80);
    });

    director.taskOnce("createExplosion", function() {
        //sound(DATA, "ZgNACgBAK0RBGRII9Y/tPt6vyD6gjBA+KwB4b3pAQylFXB0C")
        explosion.reset(drop.x, DROP_Y);
    });
    
    director.draw("explosion", function() {
        explosion.draw()
        if (explosion.isDone()) {
            director.switch("gameover");
        }
    });

    director.draw("result", function() {
        game.fill(0, 0, 0, 230);
        game.rect(0, 0, WIDTH, HEIGHT);
        
        game.fill(255, 255, 255, 255);
        
        game.fontSize(24);

        if (!newbestscore) {
            game.text("SCORE: "+score+"  -  BEST: "+highscore, WIDTH/2, HEIGHT/2 - 40)
        } else {
            game.text("NEW BEST SCORE: "+score, WIDTH/2, HEIGHT/2 - 40)
        }
    });

    director.draw('displayScore', function(){
        game.fill(255,255,255,255);
        var tail = drop.tail;
        game.fontSize(30);
        game.text(score+"",tail[tail.length-1],DROP_Y + tail.length*speed/ SCALE + 15 * SCALE);

    });
};
},{"./BKGM":4,"./BKGM/director":2,"./BKGM/fbconnect":3,"./blocks":7,"./constants":9,"./drop":10,"./explosion":11,"./game":12,"./random":15}],14:[function(require,module,exports){
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
},{"./app.js":6}],15:[function(require,module,exports){
module.exports = function(min, max){
	return Math.floor(min + Math.random()*(max-min));
}
},{}],16:[function(require,module,exports){
var director = require('./BKGM/director'),
    game = require('./game'),
    constants = require('./constants'),
    random = require('./random'),
    SCALE = constants.SCALE,
    SQRT_SCALE = constants.SQRT_SCALE,
    drop = require('./drop'),
    DROP_Y = constants.DROP_Y,
    WIDTH = game.WIDTH,
    HEIGHT = game.HEIGHT,
    buttons = constants.BUTTONS;

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
        'drop.drawTouch',
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
        'guide'        
    ]);
        
    director.state('explode', [
        'background',
        'blocks.draw',
        'createExplosion',
        'explosion'
    ]);
        
    director.state('gameover', [
        'calscore',
        'background',
        'blocks.update',
        'blocks.draw',
        'result',
        {
            name: 'logo',
            args: [WIDTH/2, HEIGHT/2 + 50],
        },
        //'guide',
        {
            name: "buttons",
            args: [buttons]
        }
    ]);
};
},{"./BKGM/director":2,"./constants":9,"./drop":10,"./game":12,"./random":15}],17:[function(require,module,exports){
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

},{"util/":19}],18:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],19:[function(require,module,exports){
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
},{"./support/isBuffer":18,"C:\\Users\\HoangAnh\\Documents\\GitHub\\SlippyDrop\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":21,"inherits":20}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{"base64-js":23,"ieee754":24}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
module.exports=require(18)
},{}],26:[function(require,module,exports){
module.exports=require(19)
},{"./support/isBuffer":25,"C:\\Users\\HoangAnh\\Documents\\GitHub\\SlippyDrop\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":21,"inherits":20}],27:[function(require,module,exports){
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

},{"./util":42}],28:[function(require,module,exports){
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
},{"../util":42,"assert":17}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{"../eql":27,"../util":42}],32:[function(require,module,exports){
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
},{"../eql":27}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{"../eql":27,"../util":42}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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
},{"../eql":27,"../util":42}],38:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{"../util":42}],40:[function(require,module,exports){
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
},{"./ext/assert":28,"./ext/bool":29,"./ext/chain":30,"./ext/deprecated":31,"./ext/eql":32,"./ext/error":33,"./ext/http":34,"./ext/match":35,"./ext/number":36,"./ext/property":37,"./ext/string":38,"./ext/type":39,"./should":41}],41:[function(require,module,exports){
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


},{"./util":42}],42:[function(require,module,exports){
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
},{"assert":17,"buffer":22,"util":26}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEhvYW5nQW5oXFxEb2N1bWVudHNcXEdpdEh1YlxcU2xpcHB5RHJvcFxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9TdGF0ZXMuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9kaXJlY3Rvci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9CS0dNL2ZiY29ubmVjdC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9CS0dNL2luZGV4LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL0JLR00vc2NyZWVuc2V0LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2FwcC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9ibG9ja3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29tbW9uVGFza3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29uc3RhbnRzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2Ryb3AuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZXhwbG9zaW9uLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2dhbWUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZ2FtZVRhc2tzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL21haW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvcmFuZG9tLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL3NjcmVlbnBsYXkuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9uYXRpdmUtYnVmZmVyLWJyb3dzZXJpZnkvaW5kZXguanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9lcWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2Fzc2VydC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvYm9vbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvY2hhaW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2RlcHJlY2F0ZWQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2VxbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvZXJyb3IuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2h0dHAuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L21hdGNoLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9udW1iZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3Byb3BlcnR5LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9zdHJpbmcuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3R5cGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvbm9kZS5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9zaG91bGQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ245QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoaUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBCS0dNID0gcmVxdWlyZSgnLi8nKTtcclxuXHJcbnZhciBTdGF0ZXMgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5jdXJyZW50ICA9IFwiZGVmYXVsdFwiO1xyXG4gICAgdGhpcy5vbmNlICAgICA9IGZhbHNlO1xyXG4gICAgdGhpcy5zd2l0Y2hlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGF0ZXMgICA9IHsgZGVmYXVsdCA6IFtdIH07XHJcbiAgICB0aGlzLnVwZGF0ZXMgID0ge307XHJcbiAgICB0aGlzLmRyYXdzICAgID0ge307XHJcbiAgICB0aGlzLmxhc3RUaW1lID0gMDtcclxuICAgIHRoaXMuc3RlcHMgICAgPSAwO1xyXG4gICAgdGhpcy50aW1lICAgICA9IDA7XHJcbn1cclxuXHJcbnZhciBmcmFtZVRpbWUgPSAxMDAwLzYwO1xyXG5cclxuU3RhdGVzLnByb3RvdHlwZSA9IHtcclxuICAgIHN0YXRlOiBmdW5jdGlvbiAobmFtZSwgdGFza3MpIHtcclxuICAgICAgICB0aGlzLnN0YXRlc1tuYW1lXSA9IHRhc2tzO1xyXG4gICAgfSxcclxuICAgIGRyYXc6IGZ1bmN0aW9uIChuYW1lLCBmbikge1xyXG4gICAgICAgIHRoaXMuZHJhd3NbbmFtZV0gPSBmbjtcclxuICAgIH0sXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVzW25hbWVdID0gZm47XHJcbiAgICB9LFxyXG4gICAgdGFza09uY2U6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZHJhd3NbbmFtZV0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgc2VsZi5vbmNlID09PSBmYWxzZT9mbihhcmd1bWVudHMpOm51bGw7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBydW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMudGltZSArPSArbmV3IERhdGUoKSAtIHRoaXMubGFzdFRpbWU7XHJcbiAgICAgICAgdmFyIHRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9ICtuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnN3aXRjaGVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHRhc2tzID0gdGhpcy5zdGF0ZXNbdGhpcy5jdXJyZW50XSxcclxuICAgICAgICAgICAgdXBkYXRlcyA9IHRoaXMudXBkYXRlcyxcclxuICAgICAgICAgICAgZHJhd3MgPSB0aGlzLmRyYXdzO1xyXG5cclxuICAgICAgICB3aGlsZSAodGltZSA+PSBmcmFtZVRpbWUpe1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRhc2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVzW3Rhc2tdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXNrID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVzW3Rhc2tdKSB1cGRhdGVzW3Rhc2tdKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGFzay5hcmdzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVzW3Rhc2submFtZV0pIHVwZGF0ZXNbdGFzay5uYW1lXS5hcHBseShudWxsLCB0YXNrLmFyZ3MoKSB8fCBbXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZXNbdGFzay5uYW1lXSkgdXBkYXRlc1t0YXNrLm5hbWVdLmFwcGx5KG51bGwsIHRhc2suYXJncyB8fCBbXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRpbWUgLT0gZnJhbWVUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRpbWUgPSB0aW1lO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRhc2tzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhc2sgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmF3c1t0YXNrXSkgZHJhd3NbdGFza10oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGFzay5hcmdzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhd3NbdGFzay5uYW1lXSkgZHJhd3NbdGFzay5uYW1lXS5hcHBseShudWxsLCB0YXNrLmFyZ3MoKSB8fCBbXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhd3NbdGFzay5uYW1lXSkgZHJhd3NbdGFzay5uYW1lXS5hcHBseShudWxsLCB0YXNrLmFyZ3MgfHwgW10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5zd2l0Y2hlZCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uY2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzd2l0Y2g6IGZ1bmN0aW9uKHN0YXRlLCBydW5Ob3cpe1xyXG4gICAgICAgIHRoaXMub25jZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3dpdGNoZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IHN0YXRlO1xyXG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSArbmV3IERhdGUoKTtcclxuICAgICAgICB0aGlzLnN0ZXAgPSAwO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgaWYgKHJ1bk5vdykgdGhpcy5ydW4oKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZXM7IiwidmFyIFN0YXRlcyA9IHJlcXVpcmUoJy4vU3RhdGVzJyksXHJcblx0ZGlyZWN0b3IgPSBuZXcgU3RhdGVzKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRpcmVjdG9yOyIsInZhciBCS0dNPXJlcXVpcmUoJy4vJyk7XHJcbihmdW5jdGlvbihGQkNvbm5lY3Qpe1xyXG4gICAgLypcclxuQ29weXJpZ2h0IChjKSAyMDExLCBEYW5pZWwgR3VlcnJlcm9cclxuQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxyXG5tb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcclxuICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG4gICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxyXG4gICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXHJcbiAgICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXHJcblxyXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcclxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcclxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxyXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBEQU5JRUwgR1VFUlJFUk8gQkUgTElBQkxFIEZPUiBBTllcclxuRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcclxuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xyXG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcclxuT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcclxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcclxuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFVzZXMgdGhlIG5ldyBhcnJheSB0eXBlZCBpbiBqYXZhc2NyaXB0IHRvIGJpbmFyeSBiYXNlNjQgZW5jb2RlL2RlY29kZVxyXG4gKiBhdCB0aGUgbW9tZW50IGp1c3QgZGVjb2RlcyBhIGJpbmFyeSBiYXNlNjQgZW5jb2RlZFxyXG4gKiBpbnRvIGVpdGhlciBhbiBBcnJheUJ1ZmZlciAoZGVjb2RlQXJyYXlCdWZmZXIpXHJcbiAqIG9yIGludG8gYW4gVWludDhBcnJheSAoZGVjb2RlKVxyXG4gKiBcclxuICogUmVmZXJlbmNlczpcclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdF90eXBlZF9hcnJheXMvQXJyYXlCdWZmZXJcclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdF90eXBlZF9hcnJheXMvVWludDhBcnJheVxyXG4gKi9cclxuXHJcbndpbmRvdy5CYXNlNjRCaW5hcnkgPSB7XHJcbiAgICBfa2V5U3RyIDogXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiLFxyXG4gICAgXHJcbiAgICAvKiB3aWxsIHJldHVybiBhICBVaW50OEFycmF5IHR5cGUgKi9cclxuICAgIGRlY29kZUFycmF5QnVmZmVyOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBieXRlcyA9IChpbnB1dC5sZW5ndGgvNCkgKiAzO1xyXG4gICAgICAgIHZhciBhYiA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XHJcbiAgICAgICAgdGhpcy5kZWNvZGUoaW5wdXQsIGFiKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gYWI7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBkZWNvZGU6IGZ1bmN0aW9uKGlucHV0LCBhcnJheUJ1ZmZlcikge1xyXG4gICAgICAgIC8vZ2V0IGxhc3QgY2hhcnMgdG8gc2VlIGlmIGFyZSB2YWxpZFxyXG4gICAgICAgIHZhciBsa2V5MSA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGgtMSkpOyAgICAgIFxyXG4gICAgICAgIHZhciBsa2V5MiA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGgtMikpOyAgICAgIFxyXG4gICAgXHJcbiAgICAgICAgdmFyIGJ5dGVzID0gKGlucHV0Lmxlbmd0aC80KSAqIDM7XHJcbiAgICAgICAgaWYgKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcclxuICAgICAgICBpZiAobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB1YXJyYXk7XHJcbiAgICAgICAgdmFyIGNocjEsIGNocjIsIGNocjM7XHJcbiAgICAgICAgdmFyIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQ7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIHZhciBqID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoYXJyYXlCdWZmZXIpXHJcbiAgICAgICAgICAgIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ5dGVzKTtcclxuICAgICAgICBcclxuICAgICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCBcIlwiKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGk9MDsgaTxieXRlczsgaSs9MykgeyAgXHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xyXG4gICAgICAgICAgICBlbmMxID0gdGhpcy5fa2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xyXG4gICAgICAgICAgICBlbmMyID0gdGhpcy5fa2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xyXG4gICAgICAgICAgICBlbmMzID0gdGhpcy5fa2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xyXG4gICAgICAgICAgICBlbmM0ID0gdGhpcy5fa2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xyXG4gICAgXHJcbiAgICAgICAgICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xyXG4gICAgICAgICAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XHJcbiAgICAgICAgICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XHJcbiAgICBcclxuICAgICAgICAgICAgdWFycmF5W2ldID0gY2hyMTsgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xyXG4gICAgICAgICAgICBpZiAoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIHJldHVybiB1YXJyYXk7ICBcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiAgICAvLyB2YXIgQktHTSA9IEJLR018fHt9OyBcclxuICAgIFxyXG4gICAgaWYgKCBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSA9IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgYnl0ZXMgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoc3RyaW5nLCBmdW5jdGlvbihjKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApICYgMHhmZjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZChuZXcgVWludDhBcnJheShieXRlcykuYnVmZmVyKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gUG9zdEltYWdlVG9GYWNlYm9vayhhdXRoVG9rZW4sIGZpbGVuYW1lLCBtaW1lVHlwZSwgaW1hZ2VEYXRhLCBvYmopXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGltYWdlRGF0YSAhPSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9Qcm9tcHQgdGhlIHVzZXIgdG8gZW50ZXIgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgIC8vSWYgdGhlIHVzZXIgY2xpY2tzIG9uIE9LIGJ1dHRvbiB0aGUgd2luZG93IG1ldGhvZCBwcm9tcHQoKSB3aWxsIHJldHVybiBlbnRlcmVkIHZhbHVlIGZyb20gdGhlIHRleHQgYm94LiBcclxuICAgICAgICAgICAgLy9JZiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIENhbmNlbCBidXR0b24gdGhlIHdpbmRvdyBtZXRob2QgcHJvbXB0KCkgcmV0dXJucyBudWxsLlxyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHByb21wdCgnRmFjZWJvb2snLCAnRW50ZXIgYSBtZXNzYWdlJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZSAhPSBudWxsKVxyXG4gICAgICAgICAgICB7ICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgYWpheCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAob2JqICYmIG9iai5zdWNjZXNzKSA/IG9iai5zdWNjZXNzIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogKG9iaiAmJiBvYmouZXJyb3IpID8gb2JqLmVycm9yIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogKG9iaiAmJiBvYmouY29tcGxldGUpID8gb2JqLmNvbXBsZXRlIDogbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyB0aGUgbXVsdFxyXG4gICAgICAgICAgICAgICAgLy8gbGV0J3MgZW5jb2RlIG91cmlwYXJ0L2Zvcm0tZGF0YSBib3VuZGFyeSB3ZSdsbCB1c2VcclxuICAgICAgICAgICAgICAgIHZhciBib3VuZGFyeSA9ICctLS0tVGhpc0lzVGhlQm91bmRhcnkxMjM0NTY3ODkwJztcclxuICAgICAgICAgICAgICAgIHZhciBmb3JtRGF0YSA9ICctLScgKyBib3VuZGFyeSArICdcXHJcXG4nXHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSArPSAnQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVwic291cmNlXCI7IGZpbGVuYW1lPVwiJyArIGZpbGVuYW1lICsgJ1wiXFxyXFxuJztcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhICs9ICdDb250ZW50LVR5cGU6ICcgKyBtaW1lVHlwZSArICdcXHJcXG5cXHJcXG4nO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZURhdGEubGVuZ3RoOyArK2kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShpbWFnZURhdGFbIGkgXSAmIDB4ZmYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gJ1xcclxcbic7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSArPSAnLS0nICsgYm91bmRhcnkgKyAnXFxyXFxuJztcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhICs9ICdDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9XCJtZXNzYWdlXCJcXHJcXG5cXHJcXG4nO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gbWVzc2FnZSArICdcXHJcXG4nXHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSArPSAnLS0nICsgYm91bmRhcnkgKyAnLS1cXHJcXG4nO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgJ2h0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL21lL3Bob3Rvcz9hY2Nlc3NfdG9rZW49JyArIGF1dGhUb2tlbiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzPT0yMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYWpheC5zdWNjZXNzKSBhamF4LnN1Y2Nlc3MoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZT09NClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhamF4LmNvbXBsZXRlKSBhamF4LmNvbXBsZXRlKHhoci5yZXNwb25zZVRleHQpICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFqYXguZXJyb3IpIGFqYXguZXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YTsgYm91bmRhcnk9XCIgKyBib3VuZGFyeSk7XHJcbiAgICAgICAgICAgICAgICB4aHIuc2VuZEFzQmluYXJ5KGZvcm1EYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiB0b0JLR01TY29yZShmYlJlc3BvbnNlLCByZXF1ZXN0U2NvcmVQYXJhbXMpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IEJLR00uU2NvcmUoZmJSZXNwb25zZS51c2VyLmlkLCBmYlJlc3BvbnNlLnNjb3JlLCBmYlJlc3BvbnNlLnVzZXIubmFtZSk7XHJcbiAgICAgICAgaWYgKHJlcXVlc3RTY29yZVBhcmFtcykge1xyXG4gICAgICAgICAgICByZXN1bHQubGVhZGVyYm9hcmRJRCA9IHJlcXVlc3RTY29yZVBhcmFtcy5sZWFkZXJib2FyZElEO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuaW1hZ2VVUkwgPSAnaHR0cHM6Ly9ncmFwaC5mYWNlYm9vay5jb20vJyArIGZiUmVzcG9uc2UudXNlci5pZCArICcvcGljdHVyZSc7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBCS0dNLkZCQ29ubmVjdCA9IGZ1bmN0aW9uKCl7ICAgICAgICBcclxuICAgICAgICAvLyByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIEJLR00uRkJDb25uZWN0LnByb3RvdHlwZT0ge1xyXG4gICAgICAgIGluaXQ6ZnVuY3Rpb24ob2JqLGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgdmFyIHNlbGY9dGhpcztcclxuICAgICAgICAgICAgdmFyIGFwcF9pZD1cIjI5NjYzMjEzNzE1MzQzN1wiO1xyXG4gICAgICAgICAgICBpZiAob2JqKXtcclxuICAgICAgICAgICAgICAgIGFwcF9pZD1vYmouYXBwSWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIEJLR00uX2lzQ29yZG92YSA/IEZCLmluaXQoeyBhcHBJZDogYXBwX2lkLCBuYXRpdmVJbnRlcmZhY2U6IENEVi5GQiwgdXNlQ2FjaGVkRGlhbG9nczogZmFsc2UgfSkgOiBGQi5pbml0KHsgYXBwSWQ6IGFwcF9pZCxzdGF0dXM6IHRydWUseGZibWw6IHRydWUsY29va2llOiB0cnVlLGZyaWN0aW9ubGVzc1JlcXVlc3RzOiB0cnVlLG9hdXRoOiB0cnVlfSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBfaWQ9YXBwX2lkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdExlYWRlcmJvYXJkcyA6IGZ1bmN0aW9uKEdhbWUsbGluayx4LHksd2lkdGgsaGVpZ2h0LGlzQ2xvc2Upe1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuaWZyYW1lLnN0eWxlLmJhY2tncm91bmRjb2xvcj0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5pZnJhbWUpO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zcmM9bGlua3x8XCJsZWFkZXJib2FyZHMuaHRtbFwiO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS53aWR0aD13aWR0aHx8R2FtZS5XSURUSDtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuaGVpZ2h0PWhlaWdodHx8IEdhbWUuSEVJR0hUO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLmRpc3BsYXk9XCJpbmhlcml0XCI7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLnRvcD0oeXx8MCkrXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5sZWZ0PSh4fHwwKStcInB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLmJvcmRlcj1cIm5vbmVcIjtcclxuICAgICAgICAgICAgaWYoaXNDbG9zZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2xvc2VCdXR0b24pO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUucG9zaXRpb249XCJmaXhlZFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLndpZHRoPVwiMzBweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmhlaWdodD1cIjMwcHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5saW5lSGVpZ2h0PVwiMzBweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmJvcmRlclJhZGl1cz1cIjQ1cHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS50b3A9JzEwcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvcj1cIiM0NDQ3NTBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5jb2xvcj1cIiNmYWZhZmFcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5sZWZ0PShHYW1lLldJRFRILTUwKSsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLnRleHRBbGlnbj1cImNlbnRlclwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmZvbnRXZWlnaHQ9XCJib2xkXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUuZm9udFNpemU9XCIzMHB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUudGV4dERlY29yYXRpb249IFwibm9uZVwiOyAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmN1cnNvcj0gXCJwb2ludGVyXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uaW5uZXJIVE1MPVwiWFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLm9wYWNpdHk9IC44OyBcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5vbm1vdXNlb3Zlcj1mdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZUJ1dHRvbi5zdHlsZS5vcGFjaXR5PSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24ub25tb3VzZW91dD1mdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZUJ1dHRvbi5zdHlsZS5vcGFjaXR5PSAwLjg7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5vbm1vdXNlZG93bj1mdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZUJ1dHRvbi5zdHlsZS5vcGFjaXR5PSAwLjg7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24ub25tb3VzZXVwPWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlQnV0dG9uLnN0eWxlLm9wYWNpdHk9IDE7XHJcbiAgICAgICAgICAgICAgICBpZihzZWxmLmhpZGVMZWFkZXJib2FyZCkgc2VsZi5oaWRlTGVhZGVyYm9hcmQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGFuZGxlU3RhdHVzQ2hhbmdlOmZ1bmN0aW9uKHNlc3Npb24pIHtcclxuICAgICAgICAgICAgaWYgKHNlc3Npb24uYXV0aFJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgdmFyIHN0cj1cIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHggaW4gc2Vzc2lvbi5hdXRoUmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIrPXg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KHN0cik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxvZ291dDpmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBGQi5sb2dvdXQoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sICAgICAgICAgICAgXHJcbiAgICAgICAgbG9naW46ZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdmFyIHNlbGY9dGhpcztcclxuICAgICAgICAgICAgdGhpcy5nZXRMb2dpblN0YXR1cyhmdW5jdGlvbihyZXNwb25zZSkgeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBGQi5sb2dpbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc2Vzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgc2NvcGU6IFwicHVibGlzaF9hY3Rpb25zXCIgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIEZCLmFwaSgnL21lJywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgIHNlbGYuaWQ9cmVzcG9uc2UuaWQ7IFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TG9naW5TdGF0dXM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gJ2Nvbm5lY3RlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9naW49dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuYXV0aFJlc3BvbnNlICYmIGNhbGxiYWNrKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2socmVzcG9uc2UuYXV0aFJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9naW49ZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QXV0aFJlc3BvbnNlOiBmdW5jdGlvbihjYWxsYmFjazEpe1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBGQi5nZXRMb2dpblN0YXR1cyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09ICdjb25uZWN0ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmF1dGhSZXNwb25zZSAmJiBjYWxsYmFjazEpIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazEocmVzcG9uc2UuYXV0aFJlc3BvbnNlLmFjY2Vzc1Rva2VuLHJlc3BvbnNlLmF1dGhSZXNwb25zZS51c2VySWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2dpbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlICYmIHJlc3BvbnNlLmF1dGhSZXNwb25zZSkge2F1dGhSZXNwb25zZT1yZXNwb25zZS5hdXRoUmVzcG9uc2U7IGlmIChjYWxsYmFjazEpIGNhbGxiYWNrMShhdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW4sYXV0aFJlc3BvbnNlLnVzZXJJZCk7fVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwb3N0Q2FudmFzOmZ1bmN0aW9uKG1lc3NhZ2UsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QXV0aFJlc3BvbnNlKGZ1bmN0aW9uKGFjY2Vzc190b2tlbix1aWQpe1xyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHVpZCA9IGF1dGhSZXNwb25zZS51c2VySUQ7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgYWNjZXNzX3Rva2VuID0gYXV0aFJlc3BvbnNlLmFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWFnZURhdGEgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3MgPW1lc3NhZ2UgfHwgXCJodHRwOi8vZmIuY29tL0JLR2FtZU1ha2VyLmNvbVwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuY29kZWRQbmcgPSBpbWFnZURhdGEuc3Vic3RyaW5nKGltYWdlRGF0YS5pbmRleE9mKCcsJykrMSxpbWFnZURhdGEubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWNvZGVkUG5nID0gQmFzZTY0QmluYXJ5LmRlY29kZShlbmNvZGVkUG5nKTtcclxuICAgICAgICAgICAgICAgIFBvc3RJbWFnZVRvRmFjZWJvb2soYWNjZXNzX3Rva2VuLCBcImZpbGVuYW1lLnBuZ1wiLCAnaW1hZ2UvcG5nJywgZGVjb2RlZFBuZyk7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgXHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0U2NvcmU6ZnVuY3Rpb24oc2NvcmUscGFyYW1zLGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgdGhpcy5nZXRTY29yZShwYXJhbXMsZnVuY3Rpb24oY3VycmVudFNjb3JlLCBlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB0b3BTY29yZSA9IGN1cnJlbnRTY29yZSA/IGN1cnJlbnRTY29yZS5zY29yZSA6IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPD0gdG9wU2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2Rvbid0IHN1Ym1pdCB0aGUgbmV3IHNjb3JlIGJlY2F1c2UgYSBiZXR0ZXIgc2NvcmUgaXMgYWxyZWFkeSBzdWJtaXR0ZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBhcGlDYWxsID0gXCIvXCIgKyAoKHBhcmFtcyAmJiBwYXJhbXMudXNlcklEKSA/IHBhcmFtcy51c2VySUQgOiBcIm1lXCIpICsgXCIvc2NvcmVzXCI7XHJcbiAgICAgICAgICAgICAgICBGQi5hcGkoYXBpQ2FsbCwgJ1BPU1QnLCB7c2NvcmU6c2NvcmV9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXNwb25zZS5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTY29yZTogZnVuY3Rpb24ocGFyYW1zLGNhbGxiYWNrKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgYXBpQ2FsbCA9ICgocGFyYW1zICYmIHBhcmFtcy51c2VySUQpID8gcGFyYW1zLnVzZXJJRCA6IFwibWVcIikgKyBcIi9zY29yZXNcIjtcclxuICAgICAgICAgICAgRkIuYXBpKGFwaUNhbGwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZS5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCS0dNLlNjb3JlKFwibWVcIiwwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlID0gdG9CS0dNU2NvcmUocmVzcG9uc2UuZGF0YVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcmUsbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ObyBzY29yZSBoYXMgYmVlbiBzdWJtaXR0ZWQgeWV0IGZvciB0aGUgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCS0dNLlNjb3JlKFwibWVcIiwwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZUxlYWRlcmJvYXJkIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjtcclxuICAgICAgICAgICAgaWYodGhpcy5jbG9zZUJ1dHRvbil0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93TGVhZGVyYm9hcmQgOiBmdW5jdGlvbihjYWxsYmFjaywgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIHNlbGYuaWZyYW1lLnN0eWxlLmRpc3BsYXk9XCJpbmhlcml0XCI7XHJcbiAgICAgICAgICAgIGlmKHNlbGYuY2xvc2VCdXR0b24pc2VsZi5jbG9zZUJ1dHRvbi5zdHlsZS5kaXNwbGF5PVwiaW5oZXJpdFwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5nZXRBdXRoUmVzcG9uc2UoZnVuY3Rpb24oYWNjZXNzX3Rva2VuLHVpZCl7XHJcbiAgICAgICAgICAgICAgICBCS0dNLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDpcImh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL1wiK3NlbGYuYXBwX2lkICsgXCIvc2NvcmVzLz9hY2Nlc3NfdG9rZW49XCIgKyBhY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTonR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTpmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGlhbG9nLmNsb3NlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsYmFja1NlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlLmVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWFsb2cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSAmJiByZXNwb25zZS5kYXRhLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpPCByZXNwb25zZS5kYXRhLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlID0gdG9CS0dNU2NvcmUocmVzcG9uc2UuZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUucG9zaXRpb24gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmltYWdlVVJMID0gXCJodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbS9cIiArIHNjb3JlLnVzZXJJRCArIFwiL3BpY3R1cmVcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZS5tZT1zY29yZS51c2VySUQ9PXNlbGYuaWQgPyBzY29yZS51c2VySUQgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjb3JlLm1lID0gc2NvcmUudXNlcklEID09PSBtZS5mYi5fY3VycmVudFNlc3Npb24uYXV0aFJlc3BvbnNlLnVzZXJJRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZXMucHVzaChzY29yZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YXIganMgPSBcImFkZFNjb3JlcyhcIiArICArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlmcmFtZS5jb250ZW50V2luZG93LmluaXRpYWxpemVWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaWZyYW1lLmNvbnRlbnRXaW5kb3cuYWRkU2NvcmVzKHNjb3Jlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWFsb2cuZXZhbChqcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7ICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICBcclxufSkoKTtcclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQktHTS5GQkNvbm5lY3QoKTsiLCJ3aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgfHwgXHJcbiAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcclxuICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8IFxyXG4gICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHwgXHJcbiAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCBcclxuICAgICAgICBmdW5jdGlvbigvKiBmdW5jdGlvbiAqLyBjYWxsYmFjaywgLyogRE9NRWxlbWVudCAqLyBlbGVtZW50KXtcclxuICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xyXG4gICAgICAgIH07XHJcbn0pKCk7XHJcblxyXG5cclxudmFyIEJLR00gPSBCS0dNfHx7fTtcclxuXHJcbihmdW5jdGlvbigpe1xyXG4gICAgXHJcblxyXG4gICAgKCh0eXBlb2YoY29yZG92YSkgPT0gJ3VuZGVmaW5lZCcpICYmICh0eXBlb2YocGhvbmVnYXApID09ICd1bmRlZmluZWQnKSkgPyBCS0dNLl9pc0NvcmRvdmE9ZmFsc2UgOiBCS0dNLl9pc0NvcmRvdmE9dHJ1ZTtcclxuICAgIHZhciBsYXN0VGltZT0wO1xyXG4gICAgdmFyIHQgPSAwO1xyXG4gICAgdmFyIHNjZW5lVGltZSA9IDA7XHJcbiAgICB2YXIgZnJhbWVUaW1lPTEwMDAvNjA7XHJcbiAgICB2YXIgX3N0YXRlc0xvb3A9W107XHJcbiAgICB2YXIgX2NvdW50PVtdO1xyXG4gICAgXHJcbiAgICB2YXIgZGVidWc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGRlYnVnLnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIjtcclxuICAgIGRlYnVnLnN0eWxlLmNvbG9yPVwicmVkXCI7XHJcbiAgICB2YXIgX0JLR01Mb29wO1xyXG4gICAgdmFyIGFkZExvb3AgPSBmdW5jdGlvbihfdGhpcyl7XHJcbiAgICAgICAgX0JLR01Mb29wPV90aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIHZhciB0aW1lPW5ldyBEYXRlKCk7XHJcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IF9zdGF0ZXNMb29wLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgLy8gICAgIHZhciBub3cgPW5ldyBEYXRlKCk7XHJcbiAgICAgICAgLy8gICAgIHZhciBkdCA9ICBub3cgLSBsYXN0VGltZTsvL0tob2FuZyB0aG9pIGdpYW4gZ2l1YSAyIGxhbiBjYXAgbmhhdFxyXG4gICAgICAgIC8vICAgICBsYXN0VGltZSA9IG5vdztcclxuICAgICAgICAvLyAgICAgdCArPSBkdCA7Ly9UaG9pIGdpYW4gZGVsYXkgZ2l1YSAyIGxhbiBjYXAgbmhhdFxyXG4gICAgICAgIC8vICAgICB3aGlsZSAodCA+PSBmcmFtZVRpbWUpIHsvL0NoYXkgY2hpIGtoaSB0aG9pIGdpYW4gZGVsYXkgZ2l1YSAyIGxhbiBsb24gaG9uIDEwbXNcclxuICAgICAgICAvLyAgICAgICAgIHQgLT0gZnJhbWVUaW1lOy8vRHVuZyBkZSB4YWMgZGluaCBzbyBidW9jJyB0aW5oIHRvYW5cclxuICAgICAgICAvLyAgICAgICAgIHNjZW5lVGltZSArPSBmcmFtZVRpbWU7XHJcbiAgICAgICAgLy8gICAgICAgICBfc3RhdGVzTG9vcFtpXS51cGRhdGUoX3N0YXRlc0xvb3BbaV0sIHNjZW5lVGltZSk7XHJcbiAgICAgICAgLy8gICAgICAgICBfc3RhdGVzTG9vcFtpXS50aW1lPXNjZW5lVGltZTtcclxuICAgICAgICAvLyAgICAgfSAgIFxyXG4gICAgICAgIC8vICAgICBfc3RhdGVzTG9vcFtpXS5sb29wKF9zdGF0ZXNMb29wW2ldKTtcclxuICAgICAgICAvLyB9O1xyXG4gICAgICAgIC8vIHZhciBfZHJhd3RpbWU9KG5ldyBEYXRlKCktIHRpbWUpO1xyXG4gICAgICAgIC8vIHZhciBkcmF3dGltZT0wO1xyXG4gICAgICAgIC8vIF9jb3VudC5wdXNoKF9kcmF3dGltZSk7XHJcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IF9jb3VudC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIC8vICAgICBkcmF3dGltZSs9X2NvdW50W2ldO1xyXG4gICAgICAgIC8vIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gaWYgKF9jb3VudC5sZW5ndGg+PTEwMCkge1xyXG4gICAgICAgIC8vICAgICBfY291bnQudW5zaGlmdCgpO1xyXG5cclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gaWYoZGVidWcgJiYgQktHTS5kZWJ1ZylkZWJ1Zy5pbm5lckhUTUw9XCJkcmF3IHRpbWU6IFwiKyhkcmF3dGltZS9fY291bnQubGVuZ3RoKjEwMD4+MCkvMTAwICtcIjwvYnI+IEZQUzogXCIrX3N0YXRlc0xvb3BbMF0uRlBTO1xyXG4gICAgICAgIEJLR00udGltZSA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGlmKF9CS0dNTG9vcCkgX0JLR01Mb29wLmxvb3AoX0JLR01Mb29wKTtcclxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF9sb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBCS0dNID0gZnVuY3Rpb24ob2JqKXtcclxuICAgICAgICB2YXIgX3RoaXM9dGhpcztcclxuICAgICAgICBfdGhpcy5ncmF2aXR5PXt4OjAseTowLHo6MH07XHJcbiAgICAgICAgQktHTS5TSU5HTEVfVE9VQ0g9MDtcclxuICAgICAgICBCS0dNLk1VTFRJX1RPVUNIPTE7XHJcbiAgICAgICAgQktHTS5UWVBFX1RPVUNIPUJLR00uU0lOR0xFX1RPVUNIO1xyXG5cclxuICAgICAgICBfdGhpcy5Db2RlYSA9IG9iai5Db2RlYTtcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmouRGV2aWNlTW90aW9uKVxyXG4gICAgICAgIGlmICgod2luZG93LkRldmljZU1vdGlvbkV2ZW50KSB8fCAoJ2xpc3RlbkZvckRldmljZU1vdmVtZW50JyBpbiB3aW5kb3cpKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCBmdW5jdGlvbihldmVudERhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55LzMseTpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54LzMsejpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihuYXZpZ2F0b3IgJiYgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyKXtcclxuICAgICAgICAgICAgICAgICAvLyBUaGUgd2F0Y2ggaWQgcmVmZXJlbmNlcyB0aGUgY3VycmVudCBgd2F0Y2hBY2NlbGVyYXRpb25gXHJcbiAgICAgICAgICAgICAgICB2YXIgd2F0Y2hJRCA9IG51bGw7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHdhdGNoaW5nIHRoZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdGFydFdhdGNoKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYWNjZWxlcmF0aW9uIGV2ZXJ5IDEwMDAvNjAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0geyBmcmVxdWVuY3k6IDEwMDAvNjAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2F0Y2hJRCA9IG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLndhdGNoQWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3RvcCB3YXRjaGluZyB0aGUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc3RvcFdhdGNoKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXRjaElEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLmNsZWFyV2F0Y2god2F0Y2hJRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoSUQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGFjY2VsZXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDphY2NlbGVyYXRpb24ueC8zLHk6YWNjZWxlcmF0aW9uLnkvMyx6OmFjY2VsZXJhdGlvbi56fTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnb25FcnJvciEnKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzdGFydFdhdGNoKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBuYXZpZ2F0b3IuYWNjZWxlcm9tZXRlci5nZXRDdXJyZW50QWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvcik7Ki9cclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5vdCBzdXBwb3J0ZWQgb24geW91ciBkZXZpY2Ugb3IgYnJvd3Nlci4gIFNvcnJ5LlwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmope1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwPW9iai5zZXR1cHx8dGhpcy5zZXR1cDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGU9b2JqLnVwZGF0ZXx8dGhpcy51cGRhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhdz1vYmouZHJhd3x8dGhpcy5kcmF3O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc291cmNlPXt9O1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdD1bXTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKSlcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVcIik7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiZ2FtZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCAgPSAzMjA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgICAgICB9ICAgICAgIFxyXG4gICAgICAgIHRoaXMud2lkdGg9dGhpcy5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQ9dGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuV0lEVEggPSB0aGlzLmNhbnZhcy53aWR0aDtcclxuICAgICAgICB0aGlzLkhFSUdIVCAgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICc0MHB4IFNvdXJjZVNhbnNQcm8nO1xyXG4gICAgICAgIHRoaXMuY3R4LmxpbmVDYXAgPSAnYnV0dCc7XHJcbiAgICAgICAgdGhpcy5fZm9udFNpemUgPSA0MDtcclxuXHJcbiAgICAgICAgdGhpcy5jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3R4Lm1vekltYWdlU21vb3RoaW5nRW5hYmxlZD0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN0eC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQ9IHRydWU7XHJcbiAgICAgICAgLy8gdGhpcy5fY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgLy8gdGhpcy5fY2lyY2xlLndpZHRoPTIwMDtcclxuICAgICAgICAvLyB0aGlzLl9jaXJjbGUuaGVpZ2h0PTIwMDtcclxuICAgICAgICAvLyB2YXIgX2N0eCA9IHRoaXMuX2NpcmNsZS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIC8vIF9jdHguYXJjKDEwMCwxMDAsMTAwLDAsTWF0aC5QSSoyKTtcclxuICAgICAgICAvLyBfY3R4LmZpbGxTdHlsZT0nI2ZmZic7XHJcbiAgICAgICAgLy8gX2N0eC5maWxsKCk7XHJcbiAgICAgICBcclxuICAgICAgICB0aGlzLl9mcHMgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA6IDAsXHJcbiAgICAgICAgICAgIGZyYW1lTnVtYmVyIDogMCxcclxuICAgICAgICAgICAgZ2V0RlBTIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVOdW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRpbWUgPSAoIGQgLSB0aGlzLnN0YXJ0VGltZSApIC8gMTAwMCxcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBNYXRoLmZsb29yKCAoIHRoaXMuZnJhbWVOdW1iZXIgLyBjdXJyZW50VGltZSApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIGN1cnJlbnRUaW1lID4gMSApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZU51bWJlciA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vdGhpcy5jdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJztcclxuICAgICAgICBhZGRNb3VzZVRvdWNoRXZlbnQodGhpcyk7XHJcbiAgICAgICAgYWRkS2V5RXZlbnQodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBCS0dNLnByb3RvdHlwZSA9IHtcclxuICAgICAgICB0aW1lOjAsXHJcbiAgICAgICAgbG9vcDpmdW5jdGlvbihfdGhpcyl7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIF90aGlzLkZQUz1fdGhpcy5fZnBzLmdldEZQUygpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIF90aGlzLmNhbnZhcy53aWR0aCwgX3RoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9zdGF0aWNEcmF3KCk7XHJcbiAgICAgICAgICAgIF90aGlzLmRyYXcoX3RoaXMpOyAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBydW46ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoQktHTS5kZWJ1Zylkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRlYnVnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuU0NBTEUgPSBNYXRoLm1pbih0aGlzLkhFSUdIVC80MDAsdGhpcy5XSURUSC80MDApIDtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cCgpO1xyXG4gICAgICAgICAgICBpZih0aGlzLkNvZGVhKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSgwLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc2NhbGUoMSwtMSk7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGFzdFRpbWU9bmV3IERhdGUoKTtcclxuICAgICAgICAgICAgYWRkTG9vcCh0aGlzKTtcclxuICAgICAgICAgICAgX2xvb3AoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXR1cDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYXc6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfc3RhdGljRHJhdzpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmcpeyAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAncmdiKCcrdGhpcy5fYmcuUisnLCcrdGhpcy5fYmcuRysnLCcrdGhpcy5fYmcuQisnKSc7ICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYWNrZ3JvdW5kOmZ1bmN0aW9uKFIsIEcsIEIpe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdyZ2IoJytSKycsJytHKycsJytCKycpJzsgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZpbGw6ZnVuY3Rpb24oUiwgRywgQiwgQSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGU9XCJyZ2JhKFwiK1IrXCIsIFwiK0crXCIsIFwiK0IrXCIsIFwiICsgKEEvMjU1KSArIFwiKVwiO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjdDpmdW5jdGlvbih4LCB5LCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgICAgICAgICAgaWYodGhpcy5fcmVjdE1vZGU9PT1cIkNFTlRFUlwiKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlY3QoeC13aWR0aC8yLCB5LWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0KTsgIFxyXG4gICAgICAgICAgICB9IGVsc2UgdGhpcy5jdHgucmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpOyAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjdE1vZGU6ZnVuY3Rpb24oSW5wdXQpe1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN0TW9kZT1JbnB1dDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb250U2l6ZTogZnVuY3Rpb24oc2l6ZSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZvbnQgPSBzaXplKydweCBTb3VyY2VTYW5zUHJvJztcclxuICAgICAgICAgICAgdGhpcy5fZm9udFNpemUgPSBzaXplO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHRBbGdpbjogZnVuY3Rpb24oYWxpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gYWxpZ247XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dDpmdW5jdGlvbiggc3RyaW5nLCB4LCB5LCBmb250U2l6ZSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKDAsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKDEsLTEpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHRoaXMuY2FudmFzLmhlaWdodC0oeS10aGlzLl9mb250U2l6ZS8yKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaXJjbGU6ZnVuY3Rpb24oIHgsIHksIGRpYW1ldGVyKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyh4LCB5LCBkaWFtZXRlci8yLCAwLCBNYXRoLlBJKjIsZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluZTpmdW5jdGlvbih4MSwgeTEsIHgyLCB5Mil7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbmVDYXBNb2RlOmZ1bmN0aW9uKGxpbmVNb2RlKXtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZUNhcCA9IGxpbmVNb2RlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZTpmdW5jdGlvbihSLCBHLCBCLCBBKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGU9XCJyZ2JhKFwiK1IrXCIsIFwiK0crXCIsIFwiK0IrXCIsIFwiICsgKEEvMjU1KSArIFwiKVwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZVdpZHRoOiBmdW5jdGlvbih3aWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFJlczpmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlPXJlcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5wdXNoKGNoaWxkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5zcGxpY2UodGhpcy5jaGlsZHJlbnRMaXN0LmluZGV4T2YoY2hpbGQpLDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFN0YXRlczpmdW5jdGlvbihzdGF0ZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlcz1zdGF0ZXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfc3dpcGU6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHZhciBzPXRoaXMuX3N0YXJ0V2lwZTtcclxuICAgICAgICAgICAgdmFyIHhfMT1zLngseV8xPXMueTtcclxuICAgICAgICAgICAgdmFyIHhfMj1lLngseV8yPWUueTtcclxuICAgICAgICAgICAgdmFyIGRlbHRhX3ggPSB4XzIgLSB4XzEsXHJcbiAgICAgICAgICAgIGRlbHRhX3kgPSB5XzIgLSB5XzE7XHJcbiAgICAgICAgICAgIHZhciB0aHJlYWRzb2xkPV9USFJFQURTT0xEKnRoaXMuU0NBTEU7XHJcbiAgICAgICAgICAgIGlmICggKGRlbHRhX3ggPCB0aHJlYWRzb2xkICYmIGRlbHRhX3ggPiAtdGhyZWFkc29sZCkgfHwgKGRlbHRhX3kgPCB0aHJlYWRzb2xkICYmIGRlbHRhX3kgPiAtdGhyZWFkc29sZCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFuID0gTWF0aC5hYnMoZGVsdGFfeSAvIGRlbHRhX3gpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCAoIChkZWx0YV95ID4gMCA/IDEgOiAyKSArIChkZWx0YV94ID4gMCA/IDAgOiAyKSApICogKHRhbiA+IDE/IDEgOiAtMSkgKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgIDE6IC8vcG9zaXRpb24uVE9QX1JJR0hUOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAgMzogLy9wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdET1dOJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgLTE6IC8vLXBvc2l0aW9uLlRPUF9SSUdIVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTI6IC8vLXBvc2l0aW9uLkJPVFRPTV9SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdSSUdIVCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC0zOiAvLy1wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTQ6IC8vLXBvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ0xFRlQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgMjogLy9wb3NpdGlvbi5CT1RUT01fUklHSFQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlICA0OiAvL3Bvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ1VQJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoU3RhcnQ6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hTdGFydCkgdGhpcy50b3VjaFN0YXJ0KGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoRW5kOmZ1bmN0aW9uKGUpe1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5zd2lwZSAmJiBCS0dNLlRZUEVfVE9VQ0g9PUJLR00uU0lOR0xFX1RPVUNIKSB0aGlzLl9zd2lwZShlKTtcclxuICAgICAgICAgICAgaWYodGhpcy50b3VjaEVuZCkgdGhpcy50b3VjaEVuZChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF90b3VjaERyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hEcmFnKSB0aGlzLnRvdWNoRHJhZyhlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURvd246ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEb3duKSB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZVVwOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBpZih0aGlzLnN3aXBlICYmIEJLR00uVFlQRV9UT1VDSD09QktHTS5TSU5HTEVfVE9VQ0gpIHRoaXMuX3N3aXBlKGUpO1xyXG4gICAgICAgICAgICBpZih0aGlzLm1vdXNlVXApIHRoaXMubW91c2VVcChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEcmFnKSB0aGlzLm1vdXNlRHJhZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgdmFyIF9USFJFQURTT0xEID0gMjsgLy9waXhlbHNcclxuICAgIHZhciBjaGVja01vdXNlUG9zPWZ1bmN0aW9uKGUsX3RoaXMpe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIHZhciB5O1xyXG4gICAgICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHsgXHJcbiAgICAgICAgICB4ID0gZS5wYWdlWDtcclxuICAgICAgICAgIHkgPSBlLnBhZ2VZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgXHJcbiAgICAgICAgICB4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0ICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7IFxyXG4gICAgICAgICAgeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDsgXHJcbiAgICAgICAgfSBcclxuICAgICAgICB4IC09IF90aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIHkgLT0gX3RoaXMuY2FudmFzLm9mZnNldFRvcDtcclxuICAgICAgICBpZihfdGhpcy5Db2RlYSl7XHJcbiAgICAgICAgICAgIHk9X3RoaXMuSEVJR0hULXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7eDp4LHk6eSxudW1iZXI6ZS5pZGVudGlmaWVyfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB2YXIgYWRkTW91c2VUb3VjaEV2ZW50PSBmdW5jdGlvbihfdGhpcyl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoPXsgc3RhdGU6XCJFTkRFRFwiICxpc1RvdWNoOmZhbHNlfTtcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciB0b3VjaHM9W107XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIF90aGlzLl9pc3RvdWNoPXRydWU7XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uU0lOR0xFX1RPVUNIKVxyXG4gICAgICAgICAgICAgICAgaWYgKCghd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICYmIGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSkgfHxcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldFRvdWNoZXMgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gSWdub3JlIGlmIHRvdWNoaW5nIHdpdGggbW9yZSB0aGFuIDEgZmluZ2VyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIlNUQVJUXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLl90b3VjaFN0YXJ0KSBfdGhpcy5zdGF0ZXMuX3RvdWNoU3RhcnQoZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hTdGFydCkgX3RoaXMuX3RvdWNoU3RhcnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB0b3VjaHMucHVzaChlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PT1CS0dNLk1VTFRJX1RPVUNIKXtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX3RvdWNoU3RhcnQpIF90aGlzLnN0YXRlcy5fdG91Y2hTdGFydCh0b3VjaHMpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hTdGFydCkgX3RoaXMuX3RvdWNoU3RhcnQodG91Y2hzKTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZvciAodmFyIGogPSBfdGhpcy5jaGlsZHJlbnRMaXN0Lmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBpZihfdGhpcy5jaGlsZHJlbnRMaXN0W2pdLl9ldmVudGVuYWJsZSAmJmNoZWNrRXZlbnRBY3RvciggZSxfdGhpcy5jaGlsZHJlbnRMaXN0W2pdKSkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGlmKF90aGlzLmNoaWxkcmVudExpc3Rbal0udG91Y2hTdGFydCkgX3RoaXMuY2hpbGRyZW50TGlzdFtqXS50b3VjaFN0YXJ0KGUpXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9O1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b3VjaClcclxuICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdG91Y2hzPVtdO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09QktHTS5TSU5HTEVfVE9VQ0gpIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7ICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiTU9WSU5HXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0b3VjaHMucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09QktHTS5NVUxUSV9UT1VDSCl7XHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hEcmFnKSBfdGhpcy5fdG91Y2hEcmFnKHRvdWNocyk7ICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHRvdWNocz1bXTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpXHJcbiAgICAgICAgICAgICAgICBpZiAoKCF3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAwKSB8fFxyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0VG91Y2hlcyA+IDApIHtcclxuICAgICAgICAgICAgICByZXR1cm47IC8vIElnbm9yZSBpZiBzdGlsbCB0b3VjaGluZyB3aXRoIG9uZSBvciBtb3JlIGZpbmdlcnNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpIHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b3VjaCkgIFxyXG4gICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTsgXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiRU5ERURcIjtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2guaXNUb3VjaD1mYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKHRvdWNoLF90aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLnRvdWNoRW5kKSBfdGhpcy5zdGF0ZXMuX3RvdWNoRW5kKGUpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuX3RvdWNoRW5kKSBfdGhpcy5fdG91Y2hFbmQoZSk7IFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07IFxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codG91Y2gpICBcclxuICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgdG91Y2hzLnB1c2goZSlcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uTVVMVElfVE9VQ0gpe1xyXG4gICAgICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy50b3VjaEVuZCkgX3RoaXMuc3RhdGVzLl90b3VjaEVuZCh0b3VjaHMpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hFbmQpIF90aGlzLl90b3VjaEVuZCh0b3VjaHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMuX2lzdG91Y2gpIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyhldmVudCxfdGhpcyk7XHJcbiAgICAgICAgICAgIF90aGlzLl9pc21vdXNlRG93bj10cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2guc3RhdGU9XCJTVEFSVFwiO1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2guaXNUb3VjaD10cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgIC8vIGZvciAodmFyIGkgPSBfdGhpcy5jaGlsZHJlbnRMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBpZihfdGhpcy5jaGlsZHJlbnRMaXN0W2ldLl9ldmVudGVuYWJsZSAmJmNoZWNrRXZlbnRBY3RvciggZSxfdGhpcy5jaGlsZHJlbnRMaXN0W2ldKSkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIF90aGlzLmNoaWxkcmVudExpc3RbaV0ubW91c2VEb3duKGUpXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvLyB9O1xyXG4gICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLl9tb3VzZURvd24pIF90aGlzLnN0YXRlcy5fbW91c2VEb3duKGUpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuX21vdXNlRG93bikgX3RoaXMuX21vdXNlRG93bihlKTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgaWYoX3RoaXMuX2lzbW91c2VEb3duKXtcclxuICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3MoZXZlbnQsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiTU9WSU5HXCI7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC55ID0gZS55O1xyXG4gICAgICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy5fbW91c2VEcmFnKSBfdGhpcy5zdGF0ZXMuX21vdXNlRHJhZyhlKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF90aGlzLl9tb3VzZURyYWcpIF90aGlzLl9tb3VzZURyYWcoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKF90aGlzLl9pc3RvdWNoKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3MoZXZlbnQsX3RoaXMpO1xyXG4gICAgICAgICAgICBfdGhpcy5faXNtb3VzZURvd249ZmFsc2U7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC54ID0gZS54O1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiRU5ERURcIjtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9ZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIGZvciAodmFyIGkgPSBfdGhpcy5jaGlsZHJlbnRMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBpZihfdGhpcy5jaGlsZHJlbnRMaXN0W2ldLl9ldmVudGVuYWJsZSAmJmNoZWNrRXZlbnRBY3RvciggZSxfdGhpcy5jaGlsZHJlbnRMaXN0W2ldKSkge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIF90aGlzLmNoaWxkcmVudExpc3RbaV0ubW91c2VVcChlKVxyXG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy5fbW91c2VVcCkgX3RoaXMuc3RhdGVzLl9tb3VzZVVwKGUpOyBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuX21vdXNlVXApIF90aGlzLl9tb3VzZVVwKGUpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxuICAgIHZhciBhZGRLZXlFdmVudD1mdW5jdGlvbihfdGhpcyl7XHJcbiAgICAgICAgQktHTS5LRVlTID0ge1xyXG5cclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBFTlRFUjoxMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBCQUNLU1BBQ0U6OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBUQUI6OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTSElGVDoxNixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDVFJMOjE3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEFMVDoxOCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBQQVVTRToxOSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDQVBTTE9DSzoyMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBFU0NBUEU6MjcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUEFHRVVQOjMzLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFBBR0VET1dOOjM0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEVORDozNSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBIT01FOjM2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIExFRlQ6MzcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gVVA6MzgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUklHSFQ6MzksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRE9XTjo0MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBJTlNFUlQ6NDUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gREVMRVRFOjQ2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDA6NDgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gMTo0OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyAyOjUwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDM6NTEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gNDo1MixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA1OjUzLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDY6NTQsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gNzo1NSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA4OjU2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDk6NTcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gYTo2NSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBiOjY2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGM6NjcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gZDo2OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBlOjY5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGY6NzAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gZzo3MSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBoOjcyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGk6NzMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gajo3NCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBrOjc1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGw6NzYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gbTo3NyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBuOjc4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIG86NzksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gcDo4MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBxOjgxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHI6ODIsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gczo4MyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB0Ojg0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHU6ODUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gdjo4NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB3Ojg3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHg6ODgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8geTo4OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB6OjkwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNFTEVDVDo5MyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQwOjk2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDE6OTcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNUEFEMjo5OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQzOjk5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDQ6MTAwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDU6MTAxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDY6MTAyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDc6MTAzLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDg6MTA0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDk6MTA1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE1VTFRJUExZOjEwNixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBBREQ6MTA3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNVQlRSQUNUOjEwOSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBERUNJTUFMUE9JTlQ6MTEwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIERJVklERToxMTEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjE6MTEyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYyOjExMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMzoxMTQsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjQ6MTE1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY1OjExNixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGNjoxMTcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjc6MTE4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY4OjExOSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGOToxMjAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjEwOjEyMSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMTE6MTIyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYxMjoxMjMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNTE9DSzoxNDQsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0NST0xMTE9DSzoxNDUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0VNSUNPTE9OOjE4NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBFUVVBTFNJR046MTg3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIENPTU1BOjE4OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBEQVNIOjE4OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBQRVJJT0Q6MTkwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEZPUldBUkRTTEFTSDoxOTEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gR1JBVkVBQ0NFTlQ6MTkyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE9QRU5CUkFDS0VUOjIxOSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBCQUNLU0xBU0g6MjIwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIENMT1NFQlJBS0VUOjIyMSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTSU5HTEVRVU9URToyMjJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxyXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5LZXlzPSBCS0dNLktFWVM7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNoaWZ0IGtleSBjb2RlXHJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCS0dNLlNISUZUX0tFWT0gICAgMTY7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnRyb2wga2V5IGNvZGVcclxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJLR00uQ09OVFJPTF9LRVk9ICAxNztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWx0IGtleSBjb2RlXHJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCS0dNLkFMVF9LRVk9ICAgICAgMTg7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVudGVyIGtleSBjb2RlXHJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCS0dNLkVOVEVSX0tFWT0gICAgMTM7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV2ZW50IG1vZGlmaWVycy5cclxuICAgICAgICAgKiBAdHlwZSBlbnVtXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5LRVlfTU9ESUZJRVJTPSB7XHJcblxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGFsdDogICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGNvbnRyb2w6ICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHNoaWZ0OiAgICAgIGZhbHNlXHJcbiAgICAgICAgfTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIF90aGlzLl9rZXlEb3duPXRydWU7XHJcbiAgICAgICAgICAgIGlmKF90aGlzLmtleURvd24pIF90aGlzLmtleURvd24oZXZlbnQpO1xyXG4gICAgICAgIH0sZmFsc2UpXHJcbiAgICB9XHJcbn0pKCk7XHJcbihmdW5jdGlvbigpe1xyXG4gICAgLy8gdmFyIEJLR00gPSBCS0dNfHx7fTtcclxuICAgIC8vIHZhciBzMSA9IG5ldyBCS0dNLkF1ZGlvKCkuc2V0QXVkaW8oJzEnKTtcclxuICAgIGZ1bmN0aW9uIGdldFBob25lR2FwUGF0aCgpIHtcclxuXHJcbiAgICAgICAgdmFyIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKCBwYXRoLCBwYXRoLmxlbmd0aCAtIDEwICk7XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcblxyXG4gICAgfTtcclxuICAgIEJLR00uQXVkaW8gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgQktHTS5BdWRpby5wcm90b3R5cGU9IHtcclxuXHJcbiAgICAgICAgYXVkaW8gICA6IG51bGwsXHJcblxyXG4gICAgICAgIHNldEF1ZGlvIDogZnVuY3Rpb24oIG5hbWUgLGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIGlmKEJLR00uX2lzQ29yZG92YSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNyYyA9IGdldFBob25lR2FwUGF0aCgpICsgXCIvXCIgKyBuYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmICFzZWxmLmNhbGwpIHtjYWxsYmFjaygpO3NlbGYuY2FsbD0xO31cclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW89IG5ldyBBdWRpbyhuYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8ucHJlbG9hZCA9ICdhdXRvJztcclxuICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLmxvYWQoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGZ1bmN0aW9uKCkgeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50VGltZT0wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmVuZGVkKSBzZWxmLmVuZGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIGZ1bmN0aW9uKCkgeyBcclxuICAgICAgICAgICAgICAgICAgIHNlbGYuX29ubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmICFzZWxmLmNhbGwpIHtjYWxsYmFjaygpO3NlbGYuY2FsbD0xO31cclxuICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBsb29wIDogZnVuY3Rpb24oIGxvb3AgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvb3A9bG9vcDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JjZXBsYXk6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoQktHTS5faXNDb3Jkb3ZhKXtcclxuICAgICAgICAgICAgICAgIHZhciBzcmM9dGhpcy5zcmM7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgc3JjPSdodHRwOi8vc3RhdGljLndlYXJlc3dvb3AuY29tL2F1ZGlvL2NoYXJsZXN0b3duL3RyYWNrXzEubXAzJztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgTWVkaWEgb2JqZWN0IGZyb20gc3JjXHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5hdWRpbyl0aGlzLmF1ZGlvID0gbmV3IE1lZGlhKHNyYywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgIHNlbGYuX29ubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3Ipe30pO1xyXG4gICAgICAgICAgICAgICAgLy8gUGxheSBhdWRpb1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwYXVzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvL3RoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0b3AgOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZihCS0dNLl9pc0NvcmRvdmEgJiYgdGhpcy5hdWRpbykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5zdG9wKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5jdXJyZW50VGltZT0wO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kZWQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfb25sb2FkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59KSgpO1xyXG4oZnVuY3Rpb24oKXtcclxuICAgIEJLR00ubG9hZEpTPWZ1bmN0aW9uKHVybCxjYWxsYmFjayl7XHJcbiAgICAgICAgLy8gQWRkaW5nIHRoZSBzY3JpcHQgdGFnIHRvIHRoZSBoZWFkIGFzIHN1Z2dlc3RlZCBiZWZvcmVcclxuICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XHJcbiAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcclxuXHJcbiAgICAgICAgLy8gVGhlbiBiaW5kIHRoZSBldmVudCB0byB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXHJcbiAgICAgICAgLy8gVGhlcmUgYXJlIHNldmVyYWwgZXZlbnRzIGZvciBjcm9zcyBicm93c2VyIGNvbXBhdGliaWxpdHkuXHJcbiAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBjYWxsYmFjaztcclxuXHJcbiAgICAgICAgLy8gRmlyZSB0aGUgbG9hZGluZ1xyXG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgIH07XHJcbiAgICBCS0dNLmNoZWNrTW91c2VCb3g9ZnVuY3Rpb24oZSxvYmopeyAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gKGUueD5vYmoueCYmZS55Pm9iai55JiZlLng8KG9iai54K29iai53KSYmZS55PChvYmoueStvYmouaCkpO1xyXG4gICAgfTtcclxuICAgIEJLR00uY2hlY2tFdmVudEFjdG9yPWZ1bmN0aW9uKGUsX2FjdG9yKXtcclxuICAgICAgICB2YXIgb3JpZ2luWD1fYWN0b3IueCxvcmlnaW5ZPV9hY3Rvci55O1xyXG4gICAgICAgIHZhciBtb3VzZVg9ZS54LG1vdXNlWT1lLnk7XHJcbiAgICAgICAgdmFyIGR4ID0gbW91c2VYIC0gb3JpZ2luWCwgZHkgPSBtb3VzZVkgLSBvcmlnaW5ZO1xyXG4gICAgICAgIC8vIGRpc3RhbmNlIGJldHdlZW4gdGhlIHBvaW50IGFuZCB0aGUgY2VudGVyIG9mIHRoZSByZWN0YW5nbGVcclxuICAgICAgICB2YXIgaDEgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSk7XHJcbiAgICAgICAgdmFyIGN1cnJBID0gTWF0aC5hdGFuMihkeSxkeCk7XHJcbiAgICAgICAgLy8gQW5nbGUgb2YgcG9pbnQgcm90YXRlZCBhcm91bmQgb3JpZ2luIG9mIHJlY3RhbmdsZSBpbiBvcHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIG5ld0EgPSBjdXJyQSAtIF9hY3Rvci5yb3RhdGlvbjtcclxuICAgICAgICAvLyBOZXcgcG9zaXRpb24gb2YgbW91c2UgcG9pbnQgd2hlbiByb3RhdGVkXHJcbiAgICAgICAgdmFyIHgyID0gTWF0aC5jb3MobmV3QSkgKiBoMTtcclxuICAgICAgICB2YXIgeTIgPSBNYXRoLnNpbihuZXdBKSAqIGgxO1xyXG4gICAgICAgIC8vIENoZWNrIHJlbGF0aXZlIHRvIGNlbnRlciBvZiByZWN0YW5nbGVcclxuICAgICAgICBpZiAoeDIgPiAtMC41ICogX2FjdG9yLndpZHRoICYmIHgyIDwgMC41ICogX2FjdG9yLndpZHRoICYmIHkyID4gLTAuNSAqIF9hY3Rvci5oZWlnaHQgJiYgeTIgPCAwLjUgKiBfYWN0b3IuaGVpZ2h0KXtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIEJLR00uYWpheCA9IGZ1bmN0aW9uKG9iail7XHJcbiAgICAgICAgdmFyIGFqYXggPSB7XHJcbiAgICAgICAgICAgIHVybDpvYmoudXJsID8gb2JqLnVybCA6XCJcIiwgLy91cmxcclxuICAgICAgICAgICAgdHlwZTpvYmoudHlwZSA/IG9iai50eXBlIDogXCJQT1NUXCIsLy8gUE9TVCBvciBHRVRcclxuICAgICAgICAgICAgZGF0YTpvYmouZGF0YSA/IG9iai5kYXRhIDogbnVsbCxcclxuICAgICAgICAgICAgLy8gcHJvY2Vzc0RhdGE6b2JqLnByb2Nlc3NEYXRhID8gb2JqLnByb2Nlc3NEYXRhIDogZmFsc2UsXHJcbiAgICAgICAgICAgIC8vIGNvbnRlbnRUeXBlOm9iai5jb250ZW50VHlwZSA/IG9iai5jb250ZW50VHlwZSA6ZmFsc2UsXHJcbiAgICAgICAgICAgIC8vIGNhY2hlOiBvYmouY2FjaGUgPyBvYmouY2FjaGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBvYmouc3VjY2VzcyA/IG9iai5zdWNjZXNzIDogbnVsbCxcclxuICAgICAgICAgICAgZXJyb3I6IG9iai5lcnJvciA/IG9iai5lcnJvciA6IG51bGwsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiBvYmouY29tcGxldGUgPyBvYmouY29tcGxldGUgOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAvLyB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJyxmdW5jdGlvbihldil7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKChldi5sb2FkZWQvZXYudG90YWwpKyclJyk7XHJcbiAgICAgICAgLy8gfSwgZmFsc2UpO1xyXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihldil7XHJcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzPT0yMDApIHtcclxuICAgICAgICAgICAgICAgIGlmKGFqYXguc3VjY2VzcykgYWpheC5zdWNjZXNzKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlPT00KVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhamF4LmNvbXBsZXRlKSBhamF4LmNvbXBsZXRlKHhoci5yZXNwb25zZVRleHQpICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWpheC5lcnJvcikgYWpheC5lcnJvcih4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgeGhyLm9wZW4oYWpheC50eXBlLCBhamF4LnVybCwgdHJ1ZSk7XHJcbiAgICAgICAgeGhyLnNlbmQoYWpheC5kYXRhKTtcclxuICAgIH1cclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBCS0dNLnByZWxvYWQ9ZnVuY3Rpb24oKXtcclxuICAgICAgICB0aGlzLmF1ZGlvcz17fTtcclxuICAgICAgICB0aGlzLmltYWdlcz17fTtcclxuICAgICAgICB0aGlzLl9tYXhFbGVtZW50TG9hZD0wO1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRMb2FkZWQ9MDtcclxuICAgIH07XHJcbiAgICBCS0dNLnByZWxvYWQucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24odHlwZSxuYW1lLHVybCxjYWxsYmFjayl7XHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuX21heEVsZW1lbnRMb2FkKys7XHJcbiAgICAgICAgICAgIGlmICh0eXBlPT09XCJpbWFnZVwiKXtcclxuICAgICAgICAgICAgICAgIHZhciBpbWFnZT1uZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgIGltYWdlLnNyYz11cmw7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmltYWdlc1tuYW1lXT1pbWFnZTtcclxuICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZD1mdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbmxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgaWYodHlwZT09PVwiYXVkaW9cIil7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZhciBhdWRpbz1uZXcgQktHTS5BdWRpbygpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8uc2V0QXVkaW8odXJsLGZ1bmN0aW9uKCl7c2VsZi5fb25sb2FkKCl9KTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXVkaW9zW25hbWVdPWF1ZGlvO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIEJLR00ucHJlbG9hZC5wcm90b3R5cGUuX29ubG9hZD1mdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB0aGlzLl9lbGVtZW50TG9hZGVkKys7XHJcbiAgICAgICAgaWYodGhpcy5fbWF4RWxlbWVudExvYWQ8PXRoaXMuX2VsZW1lbnRMb2FkZWQpXHJcbiAgICAgICAgICAgIHRoaXMub25sb2FkQWxsKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBCS0dNLnByZWxvYWQucHJvdG90eXBlLm9ubG9hZEFsbD1mdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KSgpO1xyXG4oZnVuY3Rpb24oKXtcclxuICAgIEJLR00uU2NvcmUgPSBmdW5jdGlvbih1c2VySUQsIHNjb3JlLCB1c2VyTmFtZSwgaW1hZ2VVUkwsIGxlYWRlcmJvYXJkSUQpe1xyXG4gICAgICAgIHRoaXMudXNlcklEID0gdXNlcklEO1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSBzY29yZSB8fCAwO1xyXG4gICAgICAgIHRoaXMudXNlck5hbWUgPSB1c2VyTmFtZTtcclxuICAgICAgICB0aGlzLmltYWdlVVJMID0gaW1hZ2VVUkw7XHJcbiAgICAgICAgdGhpcy5sZWFkZXJib2FyZElEID0gbGVhZGVyYm9hcmRJRDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4oZnVuY3Rpb24oKXtcclxuXHJcbiAgICBCS0dNLlNjb3JlTG9jYWw9ZnVuY3Rpb24obmFtZSl7XHJcbiAgICAgICAgdGhpcy5uYW1lPW5hbWU7XHJcbiAgICB9XHJcbiAgICBCS0dNLlNjb3JlTG9jYWwucHJvdG90eXBlPXtcclxuICAgICAgICBzdWJtaXRTY29yZTpmdW5jdGlvbihzY29yZSx1c2VySUQpe1xyXG4gICAgICAgICAgICBpZighbG9jYWxTdG9yYWdlKSByZXR1cm4gMDtcclxuICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMubmFtZTtcclxuICAgICAgICAgICAgdmFyIHNjb3JlSXRlbSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiQktHTS5cIituYW1lK1wiLnNjb3JlXCIpO1xyXG4gICAgICAgICAgICB2YXIgdG9wU2NvcmUgPSBwYXJzZUludChzY29yZUl0ZW0pIHx8IDA7XHJcbiAgICAgICAgICAgIGlmKHNjb3JlPnRvcFNjb3JlKVxyXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJCS0dNLlwiK25hbWUrXCIuc2NvcmVcIixzY29yZSk7XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2NvcmU6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYobG9jYWxTdG9yYWdlKXtcclxuICAgICAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlSXRlbSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiQktHTS5cIituYW1lK1wiLnNjb3JlXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlID0gcGFyc2VJbnQoc2NvcmVJdGVtKSB8fCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQktHTS5TY29yZShcIm1lXCIsIHNjb3JlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQktHTS5TY29yZShcIm1lXCIsIDApOztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICBcclxuXHJcbiAgICB9XHJcbiAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICBcclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBCS0dNLkFkcz1mdW5jdGlvbihhZHVuaXQpe1xyXG4gICAgICAgIHRoaXMuYWR1bml0PWFkdW5pdDtcclxuICAgICAgICBtb3B1Yl9hZF91bml0ID0gYWR1bml0O1xyXG4gICAgICAgIG1vcHViX2FkX3dpZHRoID0gdGhpcy53aWR0aDsgLy8gb3B0aW9uYWxcclxuICAgICAgICBtb3B1Yl9hZF9oZWlnaHQgPSB0aGlzLmhlaWdodDsgLy8gb3B0aW9uYWxcclxuICAgIH1cclxuICAgIEJLR00uQWRzLnByb3RvdHlwZT17XHJcbiAgICAgICAgd2lkdGg6MzIwLFxyXG4gICAgICAgIGhlaWdodDo1MCxcclxuICAgICAgICBpbml0OmZ1bmN0aW9uKGFkdW5pdCl7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2l6ZTpmdW5jdGlvbih3LGgpe1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoPXc7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0PWg7XHJcbiAgICAgICAgICAgIG1vcHViX2FkX3dpZHRoID0gdGhpcy53aWR0aDsgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgbW9wdWJfYWRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7IC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0S2V5d29yZDpmdW5jdGlvbihhcnIpe1xyXG4gICAgICAgICAgICB0aGlzLmtleT1hcnI7XHJcbiAgICAgICAgICAgIG1vcHViX2tleXdvcmRzID0gYXJyOyAvLyBvcHRpb25hbFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgICAgXHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJLR007XHJcbiIsInZhciBzZXQgPSB7XHJcblx0J0lQQUQnICAgIDogNzY4LFxyXG5cdCdJUEhPTkUnICA6IDMyMFxyXG59O1xyXG5cclxudmFyIHNjcmVlbnNldCA9IGZ1bmN0aW9uKGdhbWUsIG9wdCl7XHJcblx0Zm9yICh2YXIgd2lkdGggaW4gb3B0KSB7XHJcblx0XHRcclxuXHRcdGlmIChzZXRbd2lkdGhdID09PSBnYW1lLldJRFRIKSB7XHJcblx0XHRcdHZhciByZXN1bHQgPSBvcHRbd2lkdGhdO1xyXG5cdFx0XHRpZiAoIHR5cGVvZiByZXN1bHQgPT09IFwiZnVuY3Rpb25cIiApIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0KCk7XHJcblx0XHRcdH0gZWxzZSByZXR1cm4gcmVzdWx0O1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cdFx0XHJcblx0fVxyXG5cdHJldHVybiBvcHRbJ0RFRkFVTFQnXTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzY3JlZW5zZXQ7IiwiLyoqXHJcbiAqIHNjcmlwdHMvYXBwLmpzXHJcbiAqXHJcbiAqIFRoaXMgaXMgYSBzYW1wbGUgQ29tbW9uSlMgbW9kdWxlLlxyXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgQktHTSA9IHJlcXVpcmUoJy4vQktHTScpLFxyXG5cdFN0YXRlcyA9IHJlcXVpcmUoJy4vQktHTS9TdGF0ZXMnKSxcclxuXHRyYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xyXG5cclxuY29uc29sZS5sb2cocmVxdWlyZSgnc2hvdWxkJykpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cclxuXHRyZXF1aXJlKCcuL3NjcmVlbnBsYXknKSgpO1xyXG5cdHJlcXVpcmUoJy4vY29tbW9uVGFza3MnKSgpO1xyXG4gICBcdHJlcXVpcmUoJy4vZ2FtZVRhc2tzJykoKTtcclxuXHJcblx0cmVxdWlyZSgnLi9nYW1lJykucnVuKCk7XHJcbn1cclxuIiwidmFyIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICBzY3JlZW5zZXQgPSByZXF1aXJlKCcuL0JLR00vc2NyZWVuc2V0JyksXHJcbiAgICByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBIRUlHSFQgPSBnYW1lLkhFSUdIVCxcclxuICAgIHNwZWVkID0gY29uc3RhbnRzLlNQRUVEO1xyXG5cclxudmFyIGJsb2NrSGVpZ2h0ICAgPSBjb25zdGFudHMuQkxPQ0tfSEVJR0hULFxyXG4gICAgYmxvY2tHYXAgICAgICA9IGNvbnN0YW50cy5CTE9DS19HQVAsXHJcbiAgICBtYXhMZWZ0V2lkdGggID0gV0lEVEggLSBibG9ja0dhcCxcclxuICAgIG1heFkgICAgICAgICAgPSBIRUlHSFQgKyBibG9ja0hlaWdodCAvIDIsXHJcbiAgICBibG9ja0Rpc3RhbmNlID0gc2NyZWVuc2V0KGdhbWUse1xyXG4gICAgICAgICdJUEFEJzogMjEwLFxyXG4gICAgICAgICdJUEhPTkUnOiAxMDAsXHJcbiAgICAgICAgJ0RFRkFVTFQnOiBNYXRoLmZsb29yKDIxMCAqIFNDQUxFKVxyXG4gICAgfSk7XHJcblxyXG52YXIgQmxvY2tzID0ge307XHJcblxyXG5CbG9ja3MucmVzZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5ibG9ja3MgID0gW107XHJcbiAgICB0aGlzLmN1cnJlbnQgPSAwO1xyXG4gICAgdGhpcy5zaWRlICAgID0gMDtcclxuXHJcbn07XHJcblxyXG5CbG9ja3MucmVzZXQoKTtcclxuXHJcblxyXG5CbG9ja3MuZ2V0ID0gZnVuY3Rpb24oaSkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW2ldO1xyXG59O1xyXG5cclxuQmxvY2tzLmhlYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmJsb2Nrc1swXTtcclxufTtcclxuXHJcbkJsb2Nrcy5sYXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbdGhpcy5ibG9ja3MubGVuZ3RoIC0gMV07XHJcbn07XHJcblxyXG5CbG9ja3Mubm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbdGhpcy5jdXJyZW50XTtcclxufVxyXG5cclxuQmxvY2tzLnNwYXduID0gZnVuY3Rpb24ocG9zX3kpIHtcclxuICAgIHZhciB5ICAgID0gcG9zX3kgfHwgMCxcclxuICAgICAgICBtaW53ID0gMCxcclxuICAgICAgICBtYXh3ID0gbWF4TGVmdFdpZHRoLFxyXG4gICAgICAgIHN5ICAgPSB5IC0gYmxvY2tIZWlnaHQsXHJcbiAgICAgICAgc3cgICA9IHJhbmRvbShtaW53LCBtYXh3KSxcclxuICAgICAgICBzd3IgID0gc3cgKyBibG9ja0dhcDtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja3MucHVzaCh7eTogc3ksIHc6IHN3LCB3cjogc3dyfSk7XHJcbn07XHJcblxyXG5CbG9ja3MudW5zaGlmdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5ibG9ja3Muc2hpZnQoMSk7XHJcbiAgICB0aGlzLmN1cnJlbnQtLTtcclxufTtcclxuXHJcbkJsb2Nrcy51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSA8IGw7IGkrKyl7XHJcbiAgICAgICAgdGhpcy5ibG9ja3NbaV0ueSArPSBzcGVlZDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5oZWFkKCkueSA+PSBtYXhZKSB0aGlzLnVuc2hpZnQoKTtcclxuXHJcbiAgICB2YXIgcyA9IHRoaXMubGFzdCgpLnkgLSBibG9ja0Rpc3RhbmNlO1xyXG4gICAgaWYgKHMgPj0gMCkgdGhpcy5zcGF3bihzKTtcclxuXHJcbn07XHJcblxyXG5CbG9ja3MucGFzcyA9IGZ1bmN0aW9uKGRyb3ApIHtcclxuICAgIHZhciBjb25kaXRpb24gPSB0aGlzLm5vdygpLnkgPiBkcm9wLnRvcDtcclxuICAgIGlmIChjb25kaXRpb24pIHRoaXMuY3VycmVudCsrO1xyXG4gICAgcmV0dXJuIGNvbmRpdGlvblxyXG59O1xyXG5cclxuQmxvY2tzLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGdhbWUucmVjdE1vZGUoJ0NPUk5FUicpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgdiA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIGdhbWUuZmlsbCgyMDAsIDIwMCwgMjAwLCAyMjApO1xyXG4gICAgICAgIGdhbWUucmVjdCgwLCB2LnksIHYudywgYmxvY2tIZWlnaHQpO1xyXG4gICAgICAgIGdhbWUucmVjdCh2LndyLCB2LnksIFdJRFRIIC0gdi53ciwgYmxvY2tIZWlnaHQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCbG9ja3M7XHJcbiIsInZhciByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpLFxyXG5cdGRpcmVjdG9yID0gcmVxdWlyZSgnLi9CS0dNL2RpcmVjdG9yJyksXHJcblx0Z2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLFxyXG5cdGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBIRUlHSFQgPSBnYW1lLkhFSUdIVCxcclxuICAgIHNwZWVkID0gY29uc3RhbnRzLlNQRUVELFxyXG4gICAgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKSxcclxuICAgIGRyb3AgPSByZXF1aXJlKCcuL2Ryb3AnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcblx0dmFyIGJhY2tncm91bmRfYyA9IFtdO1xyXG5cclxuXHRkaXJlY3Rvci5kcmF3KCdiYWNrZ3JvdW5kJywgZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgYyA9IHJhbmRvbSgwLCAzMCk7XHJcbiAgICAgICAgZ2FtZS5iYWNrZ3JvdW5kKGMsIGMsIGMsIDI1NSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGMgPCAzICYmIGJhY2tncm91bmRfYy5sZW5ndGggPCAzMCkge1xyXG4gICAgICAgICAgICB2YXIgcmEgPSByYW5kb20oMCwgV0lEVEgvOCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kX2MucHVzaCh7XHJcbiAgICAgICAgICAgIFx0cjogcmEsXHJcbiAgICAgICAgICAgIFx0eDogcmFuZG9tKHJhLCBXSURUSCAtIHJhKSxcclxuICAgICAgICAgICAgXHR5OiAtcmEsXHJcbiAgICAgICAgICAgIFx0czogcmFuZG9tKHNwZWVkKjAuOCwgc3BlZWQqMS4yKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdhbWUuZmlsbCgyNTUtYywgMjU1LWMsIDI1NS1jLCA4MCk7XHJcbiAgICAgICAgdmFyIGluY3ggPSBkcm9wLnJvdGF0ZSAqIDIwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBiYWNrZ3JvdW5kX2MubGVuZ3RoIC0gMTsgaSA+PTA7IGktLSl7XHJcbiAgICAgICAgXHR2YXIgdiA9IGJhY2tncm91bmRfY1tpXTtcclxuICAgICAgICAgICAgdi54ID0gdi54ICsgaW5jeDtcclxuICAgICAgICAgICAgdi55ID0gdi55ICsgdi5zICsgMTtcclxuICAgICAgICAgICAgaWYgKHYueSA+IEhFSUdIVCArIHYuciB8fCB2LnggPiBXSURUSCArIHYuciB8fCB2LnggPCAtdi5yKSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kX2Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBnYW1lLmNpcmNsZSh2LngsIHYueSwgdi5yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBnYW1lLmJhY2tncm91bmQoMTAwLCAxMDAsIDEwMCwgMjU1KTtcclxuXHJcbiAgICB9LCB0cnVlKTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IuZHJhdygnbG9nbycsIGZ1bmN0aW9uKGxvZ29feCwgbG9nb195KXtcclxuXHJcbiAgICAgICAgdmFyIGMgPSByYW5kb20oMCwgMzApO1xyXG4gICAgICAgIHZhciBmID0gMjU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LWMsIDI1NS1jLCAyNTUtYywgMjU1KTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZCA9IHJhbmRvbSgtMSwgMSk7XHJcbiAgICAgICAgdmFyIGUgPSByYW5kb20oLTEsIDEpO1xyXG4gICAgICAgIGdhbWUuZm9udFNpemUoMjApO1xyXG4gICAgICAgIGdhbWUudGV4dCgnQktnYW1lTWFrZXInLCBsb2dvX3ggKyBkLCBsb2dvX3kgKyBmICsgZSk7XHJcbiAgICAgICAgZ2FtZS5mb250U2l6ZSg1MCk7XHJcbiAgICAgICAgZ2FtZS50ZXh0KCdXSElURSBEUk9QJywgbG9nb194ICsgZCwgbG9nb195IC0gZiArIGUpO1xyXG4gICAgICAgIGdhbWUuZmlsbCgyNTUtYywgMjU1LWMsIDI1NS1jLCAyNTUpO1xyXG4gICAgfSwgdHJ1ZSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLmRyYXcoXCJidXR0b25zXCIsIGZ1bmN0aW9uKGJ1dHRvbnMpIHtcclxuICAgICAgICB2YXIgeCBcdFx0PSBidXR0b25zLngsXHJcbiAgICAgICAgXHR5IFx0XHQ9IGJ1dHRvbnMueSxcclxuICAgICAgICBcdHcgXHRcdD0gYnV0dG9ucy53LFxyXG4gICAgICAgIFx0aCBcdFx0PSBidXR0b25zLmgsXHJcbiAgICAgICAgXHRzIFx0XHQ9IGJ1dHRvbnMucyxcclxuICAgICAgICBcdGYgXHRcdD0gMjAsLy9idXR0b25zLmYsXHJcbiAgICAgICAgXHRsaXN0XHQ9IGJ1dHRvbnMubGlzdDtcclxuICAgICAgICBcclxuICAgICAgICBnYW1lLnJlY3RNb2RlKCdDRU5URVInKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZCA9IHJhbmRvbSgwLCAxKSxcclxuICAgICAgICBcdGUgPSByYW5kb20oLTEsIDApO1xyXG5cclxuICAgICAgICBnYW1lLmZvbnRTaXplKGYpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgZ2FtZS5maWxsKDI0MCwgMjQwLCAyNDAsIDE4MCk7XHJcbiAgICAgICAgICAgIGdhbWUucmVjdCh4ICsgZCwgeSAtICggaCArIHMgKSAqIGkgKyBlLCB3LCBoKTtcclxuICAgICAgICAgICAgZ2FtZS5maWxsKDAsIDAsIDAsIDIyMCk7XHJcbiAgICAgICAgICAgIGdhbWUudGV4dChsaXN0W2ldLCB4ICsgZCwgeSAtICggaCArIHMgKSAqIGkgKyBlICsgNCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSwgdHJ1ZSk7XHJcbn07IiwidmFyIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuXHRzY3JlZW5zZXQ9cmVxdWlyZSgnLi9CS0dNL3NjcmVlbnNldCcpLFxyXG5cdFdJRFRIID0gZ2FtZS5XSURUSDtcclxuXHRTQ0FMRSA9KFdJRFRILzc2OCksXHJcblx0U1FSVF9TQ0FMRSA9IE1hdGguc3FydChXSURUSC83NjgpLFxyXG5cdERST1BfWSA9IE1hdGguZmxvb3IoZ2FtZS5IRUlHSFQvMiksXHJcblx0Q09OU1QgPSB7XHJcblxyXG5cdFNDQUxFIFx0XHRcdFx0OiBnYW1lLldJRFRILzc2OCxcclxuXHRTUVJUX1NDQUxFIFx0XHRcdDogTWF0aC5zcXJ0KGdhbWUuV0lEVEgvNzY4KSxcclxuXHRGTE9PUl9TQ0FMRSBcdFx0OiBNYXRoLmZsb29yKGdhbWUuV0lEVEgvNzY4KSxcclxuXHRGTE9PUl9TUVJUX1NDQUxFIFx0OiBNYXRoLmZsb29yKE1hdGguc3FydChnYW1lLldJRFRILzc2OCkpLFxyXG5cclxuXHRCTE9DS19IRUlHSFQgXHRcdDogTWF0aC5mbG9vcig1MCAqIFNRUlRfU0NBTEUpLFxyXG5cdEJMT0NLX0dBUFx0XHRcdDogTWF0aC5mbG9vcigxNTAgKiBTUVJUX1NDQUxFKSxcclxuXHJcblx0RFJPUF9ESUFNRVRFUiBcdFx0OiBNYXRoLmZsb29yKDMwICogU1FSVF9TQ0FMRSksXHJcblx0RFJPUF9BQ0NFTCBcdFx0XHQ6IE1hdGguZmxvb3IoMiAqIFNDQUxFICsgMC41KSxcclxuXHREUk9QX0dSQVZcdFx0XHQ6IGdhbWUuV0lEVEgsXHJcblx0RFJPUF9ZIFx0XHRcdFx0OiBEUk9QX1ksXHJcblx0U1BFRUQgXHRcdFx0XHQ6IHNjcmVlbnNldChnYW1lLHtcclxuXHRcdFx0XHRcdFx0XHQnSVBBRCc6MyxcclxuXHRcdFx0XHRcdFx0XHQnSVBIT05FJzoyLFxyXG5cdFx0XHRcdFx0XHRcdCdERUZBVUxUJzpNYXRoLmZsb29yKDQqU1FSVF9TQ0FMRSlcclxuXHRcdFx0XHRcdFx0fSksXHJcblx0QlVUVE9OU1x0XHRcdFx0OiBidXR0b25zID0ge1xyXG5cdFx0XHRcdFx0ICAgICAgICB4IDogV0lEVEgvMixcclxuXHRcdFx0XHRcdCAgICAgICAgeSA6IERST1BfWSAtIDE0MCxcclxuXHRcdFx0XHRcdCAgICAgICAgdyA6IDMwMCAqIFNRUlRfU0NBTEUsXHJcblx0XHRcdFx0XHQgICAgICAgIGggOiA1MCAqIFNRUlRfU0NBTEUsXHJcblx0XHRcdFx0XHQgICAgICAgIHMgOiAxNSAqIFNRUlRfU0NBTEUsXHJcblx0XHRcdFx0XHQgICAgICAgIGYgOiAzMCAqIFNRUlRfU0NBTEUsXHJcblx0XHRcdFx0XHQgICAgICAgIGxpc3QgOiBbXHJcblx0XHRcdFx0XHQgICAgICAgICAgICBcIlRyeSBhZ2FpblwiLFxyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJTaGFyZSB5b3VyIHNjb3JlXCIsXHJcblx0XHRcdFx0XHQgICAgICAgICAgICBcIlNob3cgTGVhZGVyYm9hcmRcIlxyXG5cdFx0XHRcdFx0ICAgICAgICBdLFxyXG5cdFx0XHRcdFx0ICAgICAgICBhY3Rpb25zIDogW1xyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJnYW1lXCIsXHJcblx0XHRcdFx0XHQgICAgICAgICAgICBcInNoYXJlXCIsXHJcblx0XHRcdFx0XHQgICAgICAgICAgICBcImxlYWRlcmJvYXJkXCJcclxuXHRcdFx0XHRcdCAgICAgICAgXVxyXG5cdFx0XHRcdFx0ICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ09OU1Q7IiwidmFyIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICBzY3JlZW5zZXQgPSByZXF1aXJlKCcuL0JLR00vc2NyZWVuc2V0JyksXHJcbiAgICBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBibG9ja0hlaWdodCA9IGNvbnN0YW50cy5CTE9DS19IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRDtcclxuXHJcbnZhciBkaWFtZXRlciAgICAgID0gY29uc3RhbnRzLkRST1BfRElBTUVURVIsXHJcbiAgICByYWRpdXMgICAgICAgID0gTWF0aC5mbG9vcihkaWFtZXRlciAvIDIgKyAwLjUpLFxyXG4gICAgcmFkaXVzU3F1YXJlICA9IHJhZGl1cyAqIHJhZGl1cyxcclxuICAgIGFjY2VsQ29lZiAgICAgPSBjb25zdGFudHMuRFJPUF9BQ0NFTCxcclxuICAgIHZHcmF2Q29lZiAgICAgPSBjb25zdGFudHMuRFJPUF9HUkFWLFxyXG4gICAgbWF4WCAgICAgICAgICA9IFdJRFRIIC0gcmFkaXVzLFxyXG4gICAgbWluWCAgICAgICAgICA9IHJhZGl1cyxcclxuICAgIHkgICAgICAgICAgICAgPSBjb25zdGFudHMuRFJPUF9ZLFxyXG4gICAgdG9wICAgICAgICAgICA9IHkgKyByYWRpdXMsXHJcbiAgICBib3QgICAgICAgICAgID0geSAtIHJhZGl1cyxcclxuICAgIG1heFRhaWxMZW5ndGggPSBzY3JlZW5zZXQoZ2FtZSwge1xyXG4gICAgICAgICdJUEFEJzogMjAsXHJcbiAgICAgICAgJ0lQSE9ORSc6IDE1LFxyXG4gICAgICAgICdERUZBVUxUJzogTWF0aC5mbG9vcigyMCAqIFNRUlRfU0NBTEUpXHJcbiAgICB9KTtcclxuXHJcbnZhciBkcm9wID0ge1xyXG4gICAgY29sbGlkZUJlYXJhYmxlUHJlY2FsZWQgOiB7fVxyXG59O1xyXG5cclxuZHJvcC5yZXNldCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLnRvcCAgICAgID0gdG9wO1xyXG4gICAgdGhpcy54ICAgICAgICA9IFdJRFRILzI7XHJcbiAgICB0aGlzLnJhZGl1cyAgID0gcmFkaXVzO1xyXG4gICAgdGhpcy52ZWx4ICAgICA9IDA7XHJcbiAgICB0aGlzLnRhaWwgICAgID0gWyBXSURUSC8yIF07XHJcbiAgICB0aGlzLnJvdGF0ZSAgID0gMDtcclxufTtcclxuXHJcbmRyb3AuY29sbGlkZUJlYXJhYmxlID0gZnVuY3Rpb24oYnRvcCwgYmJvdCl7XHJcbiAgICB2YXIgaFNxdWFyZSA9IE1hdGgubWluKCBNYXRoLmFicyhiYm90IC0geSksIE1hdGguYWJzKGJ0b3AgLSB5KSApLFxyXG4gICAgICAgIGhTcXVhcmUgPSBoU3F1YXJlKmhTcXVhcmU7XHJcbiAgICBpZiAocmFkaXVzU3F1YXJlID4gaFNxdWFyZSkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQocmFkaXVzU3F1YXJlIC0gaFNxdWFyZSk7XHJcbiAgICB9IGVsc2UgcmV0dXJuIHJhZGl1czsgLy8gRE9OVCBLTk9XIFdIQVQgVE8gUkVUVVJOIEFUIEFMTCA9Lj0nXHJcbn07XHJcblxyXG5kcm9wLmNvbGxpZGVCZWFyYWJsZVByZWNhbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBmb3IgKHZhciBpID0geSAtIHJhZGl1cyAtIGJsb2NrSGVpZ2h0IC0gNSwgbCA9IHkgKyByYWRpdXMgKyA1OyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5jb2xsaWRlQmVhcmFibGVQcmVjYWxlZFtpXSA9IHRoaXMuY29sbGlkZUJlYXJhYmxlKGksIGkgKyBibG9ja0hlaWdodCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kcm9wLnJlc2V0KCk7XHJcbmRyb3AuY29sbGlkZUJlYXJhYmxlUHJlY2FsKCk7XHJcblxyXG5nYW1lLnN0cm9rZSgyNTUsIDI1NSwgMjU1LCA2MSk7XHJcblxyXG52YXIgY29sbGlkZUJlYXJhYmxlUHJlY2FsZWQgPSBkcm9wLmNvbGxpZGVCZWFyYWJsZVByZWNhbGVkO1xyXG5cclxuZHJvcC51cGRhdGVUYWlsID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMudGFpbC51bnNoaWZ0KHRoaXMueCk7XHJcbiAgICBpZiAodGhpcy50YWlsLmxlbmd0aCA+PSBtYXhUYWlsTGVuZ3RoKSB0aGlzLnRhaWwucG9wKCk7XHJcbiAgICBcclxufVxyXG5cclxuZHJvcC51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMudmVseCArPSBnYW1lLmdyYXZpdHkueCAqIGFjY2VsQ29lZjtcclxuICAgIHZhciB4ID0gdGhpcy54ICAgICs9IHRoaXMudmVseDtcclxuICAgIFxyXG4gICAgaWYgKHggPiBtYXhYKSB7XHJcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcclxuICAgICAgICB0aGlzLnggPSBtYXhYO1xyXG4gICAgfSBlbHNlIGlmICh4IDwgbWluWCkge1xyXG4gICAgICAgIHRoaXMudmVseCA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0gbWluWDtcclxuICAgIH1cclxufTtcclxuXHJcbmRyb3AuZHJhd1RvdWNoID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciB4ID0gdGhpcy54O1xyXG4gICAgaWYgKGdhbWUuY3VycmVudFRvdWNoLnN0YXRlID09PSAnTU9WSU5HJykge1xyXG4gICAgICAgIHZhciB0eCA9IGdhbWUuY3VycmVudFRvdWNoLngsXHJcbiAgICAgICAgICAgIHR5ID0gZ2FtZS5jdXJyZW50VG91Y2gueTtcclxuICAgICAgICBnYW1lLnN0cm9rZVdpZHRoKDQpO1xyXG4gICAgICAgIGdhbWUuc3Ryb2tlKDI1NSwgMjU1LCAyNTUsIDYxKTtcclxuICAgICAgICBnYW1lLmxpbmUoeCwgeSwgdHgsIHR5KTtcclxuICAgICAgICBnYW1lLnN0cm9rZVdpZHRoKDApO1xyXG4gICAgICAgIGdhbWUuZmlsbCgyNTUsIDI1NSwgMjU1LCAxNDgpO1xyXG4gICAgICAgIGdhbWUuY2lyY2xlKHR4LCB0eSwgNTApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZHJvcC51cGRhdGVCeVRvdWNoID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciB4ID0gdGhpcy54O1xyXG4gICAgaWYgKGdhbWUuY3VycmVudFRvdWNoLnN0YXRlID09PSAnTU9WSU5HJykge1xyXG4gICAgICAgIHZhciB0eCA9IGdhbWUuY3VycmVudFRvdWNoLngsXHJcbiAgICAgICAgICAgIHR5ID0gZ2FtZS5jdXJyZW50VG91Y2gueTtcclxuICAgICAgICB0aGlzLnJvdGF0ZSA9ICh0eCAtIHgpIC8gNzY4O1xyXG4gICAgfVxyXG4gICAgICAgIHRoaXMudmVseCArPSB0aGlzLnJvdGF0ZTtcclxuICAgIHggPSB0aGlzLnggICAgKz0gdGhpcy52ZWx4O1xyXG4gICAgXHJcbiAgICBpZiAoeCA+IG1heFgpIHtcclxuICAgICAgICB0aGlzLnZlbHggPSAwO1xyXG4gICAgICAgIHRoaXMueCA9IG1heFg7XHJcbiAgICB9IGVsc2UgaWYgKHggPCBtaW5YKSB7XHJcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcclxuICAgICAgICB0aGlzLnggPSBtaW5YO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZHJvcC5jb2xsaWRlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBibG9jayA9IGJsb2Nrcy5ub3coKSxcclxuICAgICAgICBidG9wID0gYmxvY2sueSArIGJsb2NrSGVpZ2h0LFxyXG4gICAgICAgIGJib3QgPSBibG9jay55LFxyXG4gICAgICAgIHggICAgPSB0aGlzLng7XHJcbiAgICBpZiAoYnRvcCA+PSBib3QgJiYgYmJvdCA8PSB0b3ApIHtcclxuICAgICAgICB2YXIgYmVhcmFibGUgPSBjb2xsaWRlQmVhcmFibGVQcmVjYWxlZFtiYm90XTtcclxuICAgICAgICByZXR1cm4geCAtIGJsb2NrLncgPD0gYmVhcmFibGUgfHwgYmxvY2sud3IgLSB4IDw9IGJlYXJhYmxlO1xyXG4gICAgfSBlbHNlIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbmRyb3AuZHJhdyA9IGZ1bmN0aW9uKCl7XHJcbiAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgMjU1KTtcclxuICAgIFxyXG4gICAgLy8gRHJhdyBoZWFkXHJcbiAgICBnYW1lLmNpcmNsZSh4LCB5LCBkaWFtZXRlcik7XHJcblxyXG4gICAgLy8gRHJhdyB0aGlzLnRhaWxcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy50YWlsLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGdhbWUuY2lyY2xlKHRoaXMudGFpbFtpXSwgeSArIGkgKiBzcGVlZCwgZGlhbWV0ZXIgLSBkaWFtZXRlcippL2wpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB4ID0gdGhpcy54O1xyXG5cclxuICAgIFxyXG4gICAgLy8gRHJhdyBleWVzXHJcbiAgICBnYW1lLmZpbGwoMCwgMCwgMCwgMjU1KTtcclxuICAgIGdhbWUuY2lyY2xlKHggLSBkaWFtZXRlci82IC0gMSwgeS0xLCBkaWFtZXRlci8zKTtcclxuICAgIGdhbWUuY2lyY2xlKHggKyBkaWFtZXRlci82ICsgMSwgeS0xLCBkaWFtZXRlci8zKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZHJvcDsiLCJ2YXIgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLFxyXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcclxuICAgIHNjcmVlbnNldCA9IHJlcXVpcmUoJy4vQktHTS9zY3JlZW5zZXQnKSxcclxuICAgIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyksXHJcbiAgICBTQ0FMRSA9IGNvbnN0YW50cy5TQ0FMRSxcclxuICAgIFNRUlRfU0NBTEUgPSBjb25zdGFudHMuU1FSVF9TQ0FMRSxcclxuICAgIFdJRFRIID0gZ2FtZS5XSURUSCxcclxuICAgIEhFSUdIVCA9IGdhbWUuSEVJR0hULFxyXG4gICAgc3BlZWQgPSBjb25zdGFudHMuU1BFRUQ7XHJcblxyXG52YXIgYmxvY2tIZWlnaHQgICA9IGNvbnN0YW50cy5CTE9DS19IRUlHSFQsXHJcbiAgICBibG9ja0dhcCAgICAgID0gY29uc3RhbnRzLkJMT0NLX0dBUCxcclxuICAgIG1heExlZnRXaWR0aCAgPSBXSURUSCAtIGJsb2NrR2FwLFxyXG4gICAgbWF4WSAgICAgICAgICA9IEhFSUdIVCArIGJsb2NrSGVpZ2h0IC8gMixcclxuICAgIGJsb2NrRGlzdGFuY2UgPSBzY3JlZW5zZXQoZ2FtZSx7XHJcbiAgICAgICAgJ0lQQUQnOiAyMTAsXHJcbiAgICAgICAgJ0lQSE9ORSc6IDEwMCxcclxuICAgICAgICAnREVGQVVMVCc6IE1hdGguZmxvb3IoMjEwICogU0NBTEUpXHJcbiAgICB9KSxcclxuICAgIGZ1bGxBbmdsZSAgICAgPSAyKk1hdGguUEk7XHJcblxyXG52YXIgZXhwbG9zaW9uID0ge307XHJcblxyXG5mdW5jdGlvbiByb3RhdGUodiwgdGhldGEpe1xyXG4gICAgdmFyIHhUZW1wID0gdi54LFxyXG4gICAgICAgIGNzID0gTWF0aC5jb3ModGhldGEpLFxyXG4gICAgICAgIHNuID0gTWF0aC5zaW4odGhldGEpO1xyXG4gICAgdi54ID0gdi54KmNzIC0gdi55KnNuO1xyXG4gICAgdi55ID0geFRlbXAqc24gKyB2LnkqY3M7XHJcbn1cclxuXHJcbmV4cGxvc2lvbi5yZXNldCA9IGZ1bmN0aW9uKHgsIHkpe1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHt4OiB4LCB5OiB5fTtcclxuICAgIHRoaXMub3BhY2l0eSA9IDI1NTtcclxuICAgIHRoaXMudGltZSA9IDE7XHJcbiAgICB0aGlzLmxpbmVzID0gW107XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGRpciA9IHt4OiAwLCB5OiAxfTtcclxuICAgICAgICBcclxuICAgICAgICByb3RhdGUoZGlyLCBNYXRoLnJhbmRvbShmdWxsQW5nbGUpKTtcclxuICAgICAgICBkaXIueCAqPSByYW5kb20oMCwgTWF0aC5mbG9vcig3MCAqIFNDQUxFKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5saW5lcy5wdXNoKGRpcik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBsb3Npb24ucmVzZXQoKTtcclxuXHJcbnZhciBsaW5lcyA9IGV4cGxvc2lvbi5saW5lcztcclxuXHJcbmV4cGxvc2lvbi5pc0RvbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm9wYWNpdHkgPD0gMDtcclxufTtcclxuXHJcbmV4cGxvc2lvbi5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcclxuICAgIGdhbWUuZmlsbCgyNTUsIDI1NSwgMjU1LCByYW5kb20oMCwgMjUwKSk7XHJcbiAgICBnYW1lLnJlY3QoMCwwLFdJRFRILEhFSUdIVCk7XHJcbiAgICBcclxuICAgIHRoaXMudGltZSArPSAzIC8gKHRoaXMudGltZSAqIFNDQUxFKTtcclxuXHJcbiAgICBnYW1lLmxpbmVDYXBNb2RlKCdyb3VuZCcpO1xyXG4gICAgZ2FtZS5zdHJva2VXaWR0aChyYW5kb20oNSwgTWF0aC5mbG9vcigzMCAqIFNDQUxFKSkpO1xyXG4gICAgZ2FtZS5zdHJva2UoMjU1LDI1NSwyNTUsIE1hdGgubWF4KHRoaXMub3BhY2l0eSwwKSk7XHJcblxyXG4gICAgdmFyIHAgPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgdiA9IGxpbmVzW2ldO1xyXG4gICAgICAgIHZhciB2dCA9IHAgKyB2ICogdGhpcy50aW1lO1xyXG4gICAgICAgIGdhbWUubGluZShwLngsIHAueSwgdnQueCwgdnQueSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vcGFjaXR5ID0gMjU1ICogKDEgLSAodGhpcy50aW1lLzMwKSk7XHJcbiAgICBcclxuICAgIGdhbWUubGluZUNhcE1vZGUoJ2J1dHQnKTtcclxuICAgIGdhbWUuc3Ryb2tlV2lkdGgoMCk7XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZXhwbG9zaW9uOyIsInZhciBCS0dNID0gcmVxdWlyZSgnLi9CS0dNJyksXHJcblx0ZGlyZWN0b3IgPSByZXF1aXJlKCcuL0JLR00vZGlyZWN0b3InKSxcclxuXHRnYW1lID0gbmV3IEJLR00oe1xyXG4gICAgXHREZXZpY2VNb3Rpb246IHRydWUsXHJcbiAgICBcdENvZGVhXHRcdDogdHJ1ZSxcclxuXHQgICAgc2V0dXA6IGZ1bmN0aW9uKCl7XHJcblx0XHQgICAgZGlyZWN0b3Iuc3dpdGNoKFwibWVudVwiKTtcclxuXHQgICAgfSxcclxuXHQgICAgZHJhdzogZnVuY3Rpb24oKXtcclxuXHQgICAgICAgIGRpcmVjdG9yLnJ1bigpO1xyXG5cdCAgICB9XHJcblx0fSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWU7IiwidmFyIGRpcmVjdG9yID0gcmVxdWlyZSgnLi9CS0dNL2RpcmVjdG9yJyksXHJcbiAgICBCS0dNID0gcmVxdWlyZSgnLi9CS0dNJyksXHJcbiAgICBfZmIgPSAgIHJlcXVpcmUoJy4vQktHTS9mYmNvbm5lY3QnKSxcclxuXHRnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcblx0Y29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcclxuICAgIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyksXHJcbiAgICBTQ0FMRSA9IGNvbnN0YW50cy5TQ0FMRSxcclxuICAgIFNRUlRfU0NBTEUgPSBjb25zdGFudHMuU1FSVF9TQ0FMRSxcclxuICAgIFdJRFRIID0gZ2FtZS5XSURUSCxcclxuICAgIEhFSUdIVCA9IGdhbWUuSEVJR0hULFxyXG4gICAgc3BlZWQgPSBjb25zdGFudHMuU1BFRUQsXHJcbiAgICBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpLFxyXG4gICAgZHJvcCA9IHJlcXVpcmUoJy4vZHJvcCcpLFxyXG4gICAgRFJPUF9ZID0gY29uc3RhbnRzLkRST1BfWSxcclxuICAgIGV4cGxvc2lvbiA9IHJlcXVpcmUoJy4vZXhwbG9zaW9uJyksXHJcbiAgICBidXR0b25zID0gY29uc3RhbnRzLkJVVFRPTlM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG5cdHZhciBzY29yZSA9IDAsXHJcblx0XHRoaWdoc2NvcmUgPSAwLFxyXG4gICAgICAgIG5ld2Jlc3RzY29yZSA9IGZhbHNlLFxyXG4gICAgICAgIGxvY2Fsc2NvcmUgPSBuZXcgQktHTS5TY29yZUxvY2FsKFwid2hpdGVkcm9wXCIpO1xyXG5cclxuICAgIF9mYi5pbml0KHthcHBJZDpcIjI5NjYzMjEzNzE1MzQzN1wifSk7XHJcbiAgICBfZmIuaW5pdExlYWRlcmJvYXJkcyhnYW1lLG51bGwsMCwwLFdJRFRILEhFSUdIVCk7XHJcbiAgICBfZmIuaGlkZUxlYWRlcmJvYXJkKCk7XHJcbiAgICBfZmIubG9naW4oX2ZiLmhpZGVMZWFkZXJib2FyZCk7XHJcbiAgICBfZmIuZ2V0U2NvcmUobnVsbCwgZnVuY3Rpb24oc2NvcmUpe1xyXG4gICAgICAgIGxvY2Fsc2NvcmUuc3VibWl0U2NvcmUoc2NvcmUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIF9zdGFydGdhbWU9KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHggICAgICAgPSBidXR0b25zLngsXHJcbiAgICAgICAgICAgIHkgICAgICAgPSBidXR0b25zLnksXHJcbiAgICAgICAgICAgIHcyICAgICAgPSBidXR0b25zLncgLyAyLFxyXG4gICAgICAgICAgICBoICAgICAgID0gYnV0dG9ucy5oLFxyXG4gICAgICAgICAgICBoMiAgICAgID0gaCAvIDIsXHJcbiAgICAgICAgICAgIHMgICAgICAgPSBidXR0b25zLnMsXHJcbiAgICAgICAgICAgIGYgICAgICAgPSBidXR0b25zLmYsXHJcbiAgICAgICAgICAgIGxpc3QgICAgPSBidXR0b25zLmxpc3QsXHJcbiAgICAgICAgICAgIGFjdGlvbnMgPSBidXR0b25zLmFjdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBzd2l0Y2goZGlyZWN0b3IuY3VycmVudCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdnYW1lb3Zlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR4ID0gZS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eSA9IGUueSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSAgPSAwLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbCAgPSBhY3Rpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHggPiB4IC0gdzIgJiYgdHggPCB4ICsgdzIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgPD0gbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5ID4geSAtIChoICsgcykgKiBpIC0gaDIgJiYgdHkgPCB5IC0gKGggKyBzKSAqIGkgKyBoMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaChhY3Rpb25zW2ldKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FtZScgOiBkaXJlY3Rvci5zd2l0Y2goJ2dhbWUnKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NoYXJlJzogX2ZiLnBvc3RDYW52YXMoKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlYWRlcmJvYXJkJzpfZmIuc2hvd0xlYWRlcmJvYXJkKCk7YnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbWVudSc6IGRpcmVjdG9yLnN3aXRjaChcImdhbWVcIik7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pKCk7XHJcblxyXG4gICAgZ2FtZS5tb3VzZURvd249ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgX3N0YXJ0Z2FtZShlKTtcclxuICAgIH07XHJcblxyXG4gICAgZ2FtZS50b3VjaFN0YXJ0PWZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIF9zdGFydGdhbWUoZSk7XHJcbiAgICB9O1xyXG5cclxuXHRkaXJlY3Rvci50YXNrT25jZShcInNldHVwXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRoaWdoc2NvcmUgPSBsb2NhbHNjb3JlLmdldFNjb3JlKCkuc2NvcmUgfHwgMDtcclxuICAgICAgICBkcm9wLnJlc2V0KCk7XHJcbiAgICAgICAgYmxvY2tzLnJlc2V0KCk7XHJcbiAgICAgICAgYmxvY2tzLnNwYXduKDApO1xyXG4gICAgICAgIHNjb3JlID0gMDtcclxuICAgICAgICBuZXdiZXN0c2NvcmUgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLmRyYXcoXCJzY29yZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoYmxvY2tzLnBhc3MoZHJvcCkpe1xyXG4gICAgICAgICAgICAvL3NvdW5kKFNPVU5EX1BJQ0tVUCwgMzI5NDcpXHJcbiAgICAgICAgICAgIHNjb3JlKys7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudXBkYXRlKFwiZHJvcC50YWlsXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZHJvcC51cGRhdGVUYWlsKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IudXBkYXRlKFwiZHJvcC51cGRhdGVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBkcm9wLnVwZGF0ZUJ5VG91Y2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLmRyYXcoXCJkcm9wLmRyYXdUb3VjaFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AuZHJhd1RvdWNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwiZHJvcC5ncmF2XCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZHJvcC51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLmRyYXcoXCJkcm9wLmRyYXdcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBkcm9wLmRyYXcoKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwiY29sbGlkZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIGRyb3AuY29sbGlkZShibG9ja3Mubm93KCkpICkge1xyXG4gICAgICAgICAgICAvL3Nob3dBZEZyb21Ub3AoKVxyXG4gICAgICAgICAgICBkaXJlY3Rvci5zd2l0Y2goXCJleHBsb2RlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnRhc2tPbmNlKFwiY2Fsc2NvcmVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBfZmIuc3VibWl0U2NvcmUoc2NvcmUsbnVsbCxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAvLyBfZmIuc2hvd0xlYWRlcmJvYXJkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYoaGlnaHNjb3JlPHNjb3JlKXtcclxuICAgICAgICAgICAgbG9jYWxzY29yZS5zdWJtaXRTY29yZShzY29yZSk7XHJcbiAgICAgICAgICAgIGhpZ2hzY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICBuZXdiZXN0c2NvcmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnVwZGF0ZShcImJsb2Nrcy51cGRhdGVcIiwgZnVuY3Rpb24oKXtcclxuICAgIFx0YmxvY2tzLnVwZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IuZHJhdyhcImJsb2Nrcy5kcmF3XCIsIGZ1bmN0aW9uKCl7XHJcbiAgICBcdGJsb2Nrcy5kcmF3KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwiZ3VpZGVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NSwgMjU1LCAyNTUsIDI1NSk7XHJcbiAgICAgICAgZ2FtZS5mb250U2l6ZSgxNik7XHJcbiAgICAgICAgZ2FtZS50ZXh0KFwiQ2xpY2sgdG8gc3RhcnRcIiwgV0lEVEgvMiwgRFJPUF9ZIC0gODApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFza09uY2UoXCJjcmVhdGVFeHBsb3Npb25cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy9zb3VuZChEQVRBLCBcIlpnTkFDZ0JBSzBSQkdSSUk5WS90UHQ2dnlENmdqQkErS3dCNGIzcEFReWxGWEIwQ1wiKVxyXG4gICAgICAgIGV4cGxvc2lvbi5yZXNldChkcm9wLngsIERST1BfWSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IuZHJhdyhcImV4cGxvc2lvblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBleHBsb3Npb24uZHJhdygpXHJcbiAgICAgICAgaWYgKGV4cGxvc2lvbi5pc0RvbmUoKSkge1xyXG4gICAgICAgICAgICBkaXJlY3Rvci5zd2l0Y2goXCJnYW1lb3ZlclwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwicmVzdWx0XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUuZmlsbCgwLCAwLCAwLCAyMzApO1xyXG4gICAgICAgIGdhbWUucmVjdCgwLCAwLCBXSURUSCwgSEVJR0hUKTtcclxuICAgICAgICBcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgMjU1KTtcclxuICAgICAgICBcclxuICAgICAgICBnYW1lLmZvbnRTaXplKDI0KTtcclxuXHJcbiAgICAgICAgaWYgKCFuZXdiZXN0c2NvcmUpIHtcclxuICAgICAgICAgICAgZ2FtZS50ZXh0KFwiU0NPUkU6IFwiK3Njb3JlK1wiICAtICBCRVNUOiBcIitoaWdoc2NvcmUsIFdJRFRILzIsIEhFSUdIVC8yIC0gNDApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZS50ZXh0KFwiTkVXIEJFU1QgU0NPUkU6IFwiK3Njb3JlLCBXSURUSC8yLCBIRUlHSFQvMiAtIDQwKVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLmRyYXcoJ2Rpc3BsYXlTY29yZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NSwyNTUsMjU1LDI1NSk7XHJcbiAgICAgICAgdmFyIHRhaWwgPSBkcm9wLnRhaWw7XHJcbiAgICAgICAgZ2FtZS5mb250U2l6ZSgzMCk7XHJcbiAgICAgICAgZ2FtZS50ZXh0KHNjb3JlK1wiXCIsdGFpbFt0YWlsLmxlbmd0aC0xXSxEUk9QX1kgKyB0YWlsLmxlbmd0aCpzcGVlZC8gU0NBTEUgKyAxNSAqIFNDQUxFKTtcclxuXHJcbiAgICB9KTtcclxufTsiLCIvKipcclxuICogc2NyaXB0cy9tYWluLmpzXHJcbiAqXHJcbiAqIFRoaXMgaXMgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIGFwcGxpY2F0aW9uLlxyXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgYXBwID0gcmVxdWlyZSgnLi9hcHAuanMnKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2VyZWFkeVwiLCBhcHAsIGZhbHNlKTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFwcCwgZmFsc2UpOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWluLCBtYXgpe1xyXG5cdHJldHVybiBNYXRoLmZsb29yKG1pbiArIE1hdGgucmFuZG9tKCkqKG1heC1taW4pKTtcclxufSIsInZhciBkaXJlY3RvciA9IHJlcXVpcmUoJy4vQktHTS9kaXJlY3RvcicpLFxyXG4gICAgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLFxyXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKSxcclxuICAgIHJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyksXHJcbiAgICBTQ0FMRSA9IGNvbnN0YW50cy5TQ0FMRSxcclxuICAgIFNRUlRfU0NBTEUgPSBjb25zdGFudHMuU1FSVF9TQ0FMRSxcclxuICAgIGRyb3AgPSByZXF1aXJlKCcuL2Ryb3AnKSxcclxuICAgIERST1BfWSA9IGNvbnN0YW50cy5EUk9QX1ksXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBIRUlHSFQgPSBnYW1lLkhFSUdIVCxcclxuICAgIGJ1dHRvbnMgPSBjb25zdGFudHMuQlVUVE9OUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZ2FtZScsIFtcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3NldHVwJyxcclxuICAgICAgICAnZHJvcC50YWlsJyxcclxuICAgICAgICAnZHJvcC51cGRhdGUnLFxyXG4gICAgICAgICdibG9ja3MudXBkYXRlJyxcclxuICAgICAgICAnY29sbGlkZScsXHJcbiAgICAgICAgJ3Njb3JlJyxcclxuICAgICAgICAnZHJvcC5kcmF3JyxcclxuICAgICAgICAnZHJvcC5kcmF3VG91Y2gnLFxyXG4gICAgICAgICdkaXNwbGF5U2NvcmUnLFxyXG4gICAgICAgICdibG9ja3MuZHJhdydcclxuICAgIF0pO1xyXG5cclxuICAgIGRpcmVjdG9yLnN0YXRlKCdnYW1lZ3JhdicsIFtcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ3NldHVwJyxcclxuICAgICAgICAnZHJvcC50YWlsJyxcclxuICAgICAgICAnZHJvcC5ncmF2JyxcclxuICAgICAgICAnYmxvY2tzLnVwZGF0ZScsXHJcbiAgICAgICAgJ2NvbGxpZGUnLFxyXG4gICAgICAgICdzY29yZScsXHJcbiAgICAgICAgJ2Ryb3AuZHJhdycsXHJcbiAgICAgICAgJ2Rpc3BsYXlTY29yZScsXHJcbiAgICAgICAgJ2Jsb2Nrcy5kcmF3J1xyXG4gICAgXSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLnN0YXRlKCdtZW51JywgW1xyXG4gICAgICAgICdzZXR1cCcsXHJcbiAgICAgICAgJ2JhY2tncm91bmQnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ2xvZ28nLFxyXG4gICAgICAgICAgICBhcmdzOiBbV0lEVEgvMiwgSEVJR0hULzIgKyAxMjBdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2Ryb3AudGFpbCcsXHJcbiAgICAgICAgJ2Ryb3AuZHJhdycsXHJcbiAgICAgICAgJ2d1aWRlJyAgICAgICAgXHJcbiAgICBdKTtcclxuICAgICAgICBcclxuICAgIGRpcmVjdG9yLnN0YXRlKCdleHBsb2RlJywgW1xyXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICAnYmxvY2tzLmRyYXcnLFxyXG4gICAgICAgICdjcmVhdGVFeHBsb3Npb24nLFxyXG4gICAgICAgICdleHBsb3Npb24nXHJcbiAgICBdKTtcclxuICAgICAgICBcclxuICAgIGRpcmVjdG9yLnN0YXRlKCdnYW1lb3ZlcicsIFtcclxuICAgICAgICAnY2Fsc2NvcmUnLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICAnYmxvY2tzLnVwZGF0ZScsXHJcbiAgICAgICAgJ2Jsb2Nrcy5kcmF3JyxcclxuICAgICAgICAncmVzdWx0JyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdsb2dvJyxcclxuICAgICAgICAgICAgYXJnczogW1dJRFRILzIsIEhFSUdIVC8yICsgNTBdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8nZ3VpZGUnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogXCJidXR0b25zXCIsXHJcbiAgICAgICAgICAgIGFyZ3M6IFtidXR0b25zXVxyXG4gICAgICAgIH1cclxuICAgIF0pO1xyXG59OyIsIi8vIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1VuaXRfVGVzdGluZy8xLjBcbi8vXG4vLyBUSElTIElTIE5PVCBURVNURUQgTk9SIExJS0VMWSBUTyBXT1JLIE9VVFNJREUgVjghXG4vL1xuLy8gT3JpZ2luYWxseSBmcm9tIG5hcndoYWwuanMgKGh0dHA6Ly9uYXJ3aGFsanMub3JnKVxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IFRob21hcyBSb2JpbnNvbiA8Mjgwbm9ydGguY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0b1xuLy8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuLy8gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU5cbi8vIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyB3aGVuIHVzZWQgaW4gbm9kZSwgdGhpcyB3aWxsIGFjdHVhbGx5IGxvYWQgdGhlIHV0aWwgbW9kdWxlIHdlIGRlcGVuZCBvblxuLy8gdmVyc3VzIGxvYWRpbmcgdGhlIGJ1aWx0aW4gdXRpbCBtb2R1bGUgYXMgaGFwcGVucyBvdGhlcndpc2Vcbi8vIHRoaXMgaXMgYSBidWcgaW4gbm9kZSBtb2R1bGUgbG9hZGluZyBhcyBmYXIgYXMgSSBhbSBjb25jZXJuZWRcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcblxudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgaWYgKG9wdGlvbnMubWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBnZXRNZXNzYWdlKHRoaXMpO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH1cbiAgdmFyIHN0YWNrU3RhcnRGdW5jdGlvbiA9IG9wdGlvbnMuc3RhY2tTdGFydEZ1bmN0aW9uIHx8IGZhaWw7XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBzdGFja1N0YXJ0RnVuY3Rpb24ubmFtZTtcbiAgICAgIHZhciBpZHggPSBvdXQuaW5kZXhPZignXFxuJyArIGZuX25hbWUpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIC8vIG9uY2Ugd2UgaGF2ZSBsb2NhdGVkIHRoZSBmdW5jdGlvbiBmcmFtZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHN0cmlwIG91dCBldmVyeXRoaW5nIGJlZm9yZSBpdCAoYW5kIGl0cyBsaW5lKVxuICAgICAgICB2YXIgbmV4dF9saW5lID0gb3V0LmluZGV4T2YoJ1xcbicsIGlkeCArIDEpO1xuICAgICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKG5leHRfbGluZSArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YWNrID0gb3V0O1xuICAgIH1cbiAgfVxufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnICsgdmFsdWU7XG4gIH1cbiAgaWYgKHV0aWwuaXNOdW1iZXIodmFsdWUpICYmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSB8fCB1dGlsLmlzUmVnRXhwKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodXRpbC5pc1N0cmluZyhzKSkge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuYWN0dWFsLCByZXBsYWNlciksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmV4cGVjdGVkLCByZXBsYWNlciksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKSxcbiAgICAgICAga2V5LCBpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodXRpbC5pc1N0cmluZyhleHBlY3RlZCkpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYWN0dWFsID0gZTtcbiAgfVxuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCFzaG91bGRUaHJvdyAmJiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbdHJ1ZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW2ZhbHNlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikge3Rocm93IGVycjt9fTtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiQzpcXFxcVXNlcnNcXFxcSG9hbmdBbmhcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFxTbGlwcHlEcm9wXFxcXG5vZGVfbW9kdWxlc1xcXFxicm93c2VyaWZ5XFxcXG5vZGVfbW9kdWxlc1xcXFxpbnNlcnQtbW9kdWxlLWdsb2JhbHNcXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ2YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKyxcbiAgIC8vIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAgIGlmICh0eXBlb2YgVWludDhBcnJheSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gIC8vIERvZXMgdGhlIGJyb3dzZXIgc3VwcG9ydCBhZGRpbmcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzPyBJZlxuICAvLyBub3QsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0LiBXZSBuZWVkIHRvIGJlIGFibGUgdG9cbiAgLy8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuXG4gIC8vIFJlbGV2YW50IEZpcmVmb3ggYnVnOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMClcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gQXNzdW1lIG9iamVjdCBpcyBhbiBhcnJheVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBhdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2YgVWludDhBcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgc3ViamVjdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSBVaW50OEFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAndWNzMic6IC8vIFRPRE86IE5vIHN1cHBvcnQgZm9yIHVjczIgb3IgdXRmMTZsZSBlbmNvZGluZ3MgeWV0XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0dXJuIF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldHVybiBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0dXJuIF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ3VjczInOiAvLyBUT0RPOiBObyBzdXBwb3J0IGZvciB1Y3MyIG9yIHV0ZjE2bGUgZW5jb2RpbmdzIHlldFxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldHVybiBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXR1cm4gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldHVybiBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgLy8gY29weSFcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgaSsrKVxuICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG4vLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvYnVmZmVyLmh0bWwjYnVmZmVyX2J1Zl9zbGljZV9zdGFydF9lbmRcbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIGF1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgdGhlIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuZnVuY3Rpb24gYXVnbWVudCAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLFxuICAgICAgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0KHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cbiIsInZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgWkVSTyAgID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdG1vZHVsZS5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KCkpXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcbiIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vLyBUYWtlbiBmcm9tIG5vZGUncyBhc3NlcnQgbW9kdWxlLCBiZWNhdXNlIGl0IHN1Y2tzXG4vLyBhbmQgZXhwb3NlcyBuZXh0IHRvIG5vdGhpbmcgdXNlZnVsLlxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBfZGVlcEVxdWFsO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzQnVmZmVyKGFjdHVhbCkgJiYgdXRpbC5pc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICBpZiAoYWN0dWFsLmxlbmd0aCAhPSBleHBlY3RlZC5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG4gIC8vIDcuMi4gSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgRGF0ZSBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgRGF0ZSBvYmplY3QgdGhhdCByZWZlcnMgdG8gdGhlIHNhbWUgdGltZS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzRGF0ZShhY3R1YWwpICYmIHV0aWwuaXNEYXRlKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIFJlZ0V4cCBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgUmVnRXhwIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNvdXJjZSBhbmRcbiAgLy8gcHJvcGVydGllcyAoYGdsb2JhbGAsIGBtdWx0aWxpbmVgLCBgbGFzdEluZGV4YCwgYGlnbm9yZUNhc2VgKS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzUmVnRXhwKGFjdHVhbCkgJiYgdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLnNvdXJjZSA9PT0gZXhwZWN0ZWQuc291cmNlICYmXG4gICAgICAgICAgIGFjdHVhbC5nbG9iYWwgPT09IGV4cGVjdGVkLmdsb2JhbCAmJlxuICAgICAgICAgICBhY3R1YWwubXVsdGlsaW5lID09PSBleHBlY3RlZC5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgYWN0dWFsLmxhc3RJbmRleCA9PT0gZXhwZWN0ZWQubGFzdEluZGV4ICYmXG4gICAgICAgICAgIGFjdHVhbC5pZ25vcmVDYXNlID09PSBleHBlY3RlZC5pZ25vcmVDYXNlO1xuXG4gIC8vIDcuNC4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICghdXRpbC5pc09iamVjdChhY3R1YWwpICYmICF1dGlsLmlzT2JqZWN0KGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy41IEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBvYmpFcXVpdiAoYSwgYikge1xuICBpZiAodXRpbC5pc051bGxPclVuZGVmaW5lZChhKSB8fCB1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAodXRpbC5pc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghdXRpbC5pc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeXtcbiAgICB2YXIga2EgPSBPYmplY3Qua2V5cyhhKSxcbiAgICAgIGtiID0gT2JqZWN0LmtleXMoYiksXG4gICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4iLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJylcbiAgLCBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxuICAsIEFzc2VydGlvbkVycm9yID0gYXNzZXJ0LkFzc2VydGlvbkVycm9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCkge1xuICB2YXIgaSA9IHNob3VsZC5mb3JtYXQ7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBhc3NlcnQgdG8gc2hvdWxkXG4gICAqXG4gICAqIFRoaXMgYWxsb3dzIHlvdSB0byBkbyB0aGluZ3MgbGlrZSBiZWxvd1xuICAgKiB3aXRob3V0IHJlcXVpcmUoKWluZyB0aGUgYXNzZXJ0IG1vZHVsZS5cbiAgICpcbiAgICogICAgc2hvdWxkLmVxdWFsKGZvby5iYXIsIHVuZGVmaW5lZCk7XG4gICAqXG4gICAqL1xuICB1dGlsLm1lcmdlKHNob3VsZCwgYXNzZXJ0KTtcblxuXG4gIC8qKlxuICAgKiBBc3NlcnQgX29ial8gZXhpc3RzLCB3aXRoIG9wdGlvbmFsIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgc2hvdWxkLmV4aXN0ID0gc2hvdWxkLmV4aXN0cyA9IGZ1bmN0aW9uKG9iaiwgbXNnKSB7XG4gICAgaWYobnVsbCA9PSBvYmopIHtcbiAgICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcih7XG4gICAgICAgIG1lc3NhZ2U6IG1zZyB8fCAoJ2V4cGVjdGVkICcgKyBpKG9iaikgKyAnIHRvIGV4aXN0JyksIHN0YWNrU3RhcnRGdW5jdGlvbjogc2hvdWxkLmV4aXN0XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgX29ial8gZG9lcyBub3QgZXhpc3QsIHdpdGggb3B0aW9uYWwgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBvYmpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHNob3VsZC5ub3QgPSB7fTtcbiAgc2hvdWxkLm5vdC5leGlzdCA9IHNob3VsZC5ub3QuZXhpc3RzID0gZnVuY3Rpb24ob2JqLCBtc2cpIHtcbiAgICBpZihudWxsICE9IG9iaikge1xuICAgICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKHtcbiAgICAgICAgbWVzc2FnZTogbXNnIHx8ICgnZXhwZWN0ZWQgJyArIGkob2JqKSArICcgdG8gbm90IGV4aXN0JyksIHN0YWNrU3RhcnRGdW5jdGlvbjogc2hvdWxkLm5vdC5leGlzdFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICBBc3NlcnRpb24uYWRkKCd0cnVlJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pcy5leGFjdGx5KHRydWUpXG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2ZhbHNlJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pcy5leGFjdGx5KGZhbHNlKVxuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdvaycsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIHRydXRoeScgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqKTtcbiAgfSwgdHJ1ZSk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG5cbiAgZnVuY3Rpb24gYWRkTGluayhuYW1lKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFzc2VydGlvbi5wcm90b3R5cGUsIG5hbWUsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgWydhbicsICdvZicsICdhJywgJ2FuZCcsICdiZScsICdoYXZlJywgJ3dpdGgnLCAnaXMnLCAnd2hpY2gnXS5mb3JFYWNoKGFkZExpbmspO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGVxbCA9IHJlcXVpcmUoJy4uL2VxbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIHZhciBpID0gc2hvdWxkLmZvcm1hdDtcblxuICBBc3NlcnRpb24uYWRkKCdpbmNsdWRlJywgZnVuY3Rpb24ob2JqLCBkZXNjcmlwdGlvbikge1xuICAgIGlmKCFBcnJheS5pc0FycmF5KHRoaXMub2JqKSAmJiAhdXRpbC5pc1N0cmluZyh0aGlzLm9iaikpIHtcbiAgICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGluY2x1ZGUgYW4gb2JqZWN0IGVxdWFsIHRvICcgKyBpKG9iaiksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG4gICAgICB2YXIgY21wID0ge307XG4gICAgICBmb3IodmFyIGtleSBpbiBvYmopIGNtcFtrZXldID0gdGhpcy5vYmpba2V5XTtcbiAgICAgIHRoaXMuYXNzZXJ0KGVxbChjbXAsIG9iaikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBpbmNsdWRlICcgKyBpKG9iaiksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICAgIHRoaXMuYXNzZXJ0KH50aGlzLm9iai5pbmRleE9mKG9iaikpO1xuICAgIH1cbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnaW5jbHVkZUVxbCcsIGZ1bmN0aW9uKG9iaiwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBpbmNsdWRlIGFuIG9iamVjdCBlcXVhbCB0byAnICsgaShvYmopLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmouc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gZXFsKG9iaiwgaXRlbSk7XG4gICAgfSkpO1xuICB9KTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciBlcWwgPSByZXF1aXJlKCcuLi9lcWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICBBc3NlcnRpb24uYWRkKCdlcWwnLCBmdW5jdGlvbih2YWwsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gZXF1YWwnLCBleHBlY3RlZDogdmFsLCBzaG93RGlmZjogdHJ1ZSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KGVxbCh2YWwsIHRoaXMub2JqKSk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2VxdWFsJywgZnVuY3Rpb24odmFsLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlJywgZXhwZWN0ZWQ6IHZhbCwgc2hvd0RpZmY6IHRydWUsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh2YWwgPT09IHRoaXMub2JqKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCdlcXVhbCcsICdleGFjdGx5Jyk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIHZhciBpID0gc2hvdWxkLmZvcm1hdDtcblxuICBBc3NlcnRpb24uYWRkKCd0aHJvdycsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICB2YXIgZm4gPSB0aGlzLm9ialxuICAgICAgLCBlcnIgPSB7fVxuICAgICAgLCBlcnJvckluZm8gPSAnJ1xuICAgICAgLCBvayA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgZm4oKTtcbiAgICAgIG9rID0gZmFsc2U7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBlO1xuICAgIH1cblxuICAgIGlmKG9rKSB7XG4gICAgICBpZignc3RyaW5nJyA9PSB0eXBlb2YgbWVzc2FnZSkge1xuICAgICAgICBvayA9IG1lc3NhZ2UgPT0gZXJyLm1lc3NhZ2U7XG4gICAgICB9IGVsc2UgaWYobWVzc2FnZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBvayA9IG1lc3NhZ2UudGVzdChlcnIubWVzc2FnZSk7XG4gICAgICB9IGVsc2UgaWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgbWVzc2FnZSkge1xuICAgICAgICBvayA9IGVyciBpbnN0YW5jZW9mIG1lc3NhZ2U7XG4gICAgICB9XG5cbiAgICAgIGlmKG1lc3NhZ2UgJiYgIW9rKSB7XG4gICAgICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBtZXNzYWdlKSB7XG4gICAgICAgICAgZXJyb3JJbmZvID0gXCIgd2l0aCBhIG1lc3NhZ2UgbWF0Y2hpbmcgJ1wiICsgbWVzc2FnZSArIFwiJywgYnV0IGdvdCAnXCIgKyBlcnIubWVzc2FnZSArIFwiJ1wiO1xuICAgICAgICB9IGVsc2UgaWYobWVzc2FnZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgIGVycm9ySW5mbyA9IFwiIHdpdGggYSBtZXNzYWdlIG1hdGNoaW5nIFwiICsgbWVzc2FnZSArIFwiLCBidXQgZ290ICdcIiArIGVyci5tZXNzYWdlICsgXCInXCI7XG4gICAgICAgIH0gZWxzZSBpZignZnVuY3Rpb24nID09IHR5cGVvZiBtZXNzYWdlKSB7XG4gICAgICAgICAgZXJyb3JJbmZvID0gXCIgb2YgdHlwZSBcIiArIG1lc3NhZ2UubmFtZSArIFwiLCBidXQgZ290IFwiICsgZXJyLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9ySW5mbyA9IFwiIChnb3QgXCIgKyBpKGVycikgKyBcIilcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byB0aHJvdyBleGNlcHRpb24nICsgZXJyb3JJbmZvIH07XG5cbiAgICB0aGlzLmFzc2VydChvayk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcygndGhyb3cnLCAndGhyb3dFcnJvcicpO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLy92YXIgc3RhdHVzQ29kZXMgPSByZXF1aXJlKCdodHRwJykuU1RBVFVTX0NPREVTO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnaGVhZGVyJywgZnVuY3Rpb24oZmllbGQsIHZhbCkge1xuICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnaGVhZGVycycpO1xuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5oYXZlLnByb3BlcnR5KGZpZWxkLnRvTG93ZXJDYXNlKCksIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eShmaWVsZC50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ3N0YXR1cycsIGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAvL3RoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGhhdmUgcmVzcG9uc2UgY29kZSAnICsgY29kZSArICcgJyArIGkoc3RhdHVzQ29kZXNbY29kZV0pXG4gICAgLy8gICAgKyAnLCBidXQgZ290ICcgKyB0aGlzLm9iai5zdGF0dXNDb2RlICsgJyAnICsgaShzdGF0dXNDb2Rlc1t0aGlzLm9iai5zdGF0dXNDb2RlXSkgfVxuXG4gICAgdGhpcy5oYXZlLnByb3BlcnR5KCdzdGF0dXNDb2RlJywgY29kZSk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2pzb24nLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmhhdmUucHJvcGVydHkoJ2hlYWRlcnMnKVxuICAgICAgLmFuZC5oYXZlLnByb3BlcnR5KCdjb250ZW50LXR5cGUnKS5pbmNsdWRlKCdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2h0bWwnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmhhdmUucHJvcGVydHkoJ2hlYWRlcnMnKVxuICAgICAgLmFuZC5oYXZlLnByb3BlcnR5KCdjb250ZW50LXR5cGUnKS5pbmNsdWRlKCd0ZXh0L2h0bWwnKTtcbiAgfSwgdHJ1ZSk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgZXFsID0gcmVxdWlyZSgnLi4vZXFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgdmFyIGkgPSBzaG91bGQuZm9ybWF0O1xuXG4gIEFzc2VydGlvbi5hZGQoJ21hdGNoJywgZnVuY3Rpb24ob3RoZXIsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gbWF0Y2ggJyArIGkob3RoZXIpLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgaWYoIWVxbCh0aGlzLm9iaiwgb3RoZXIpKSB7XG4gICAgICBpZih1dGlsLmlzUmVnRXhwKG90aGVyKSkgeyAvLyBzb21ldGhpbmcgLSByZWdleFxuXG4gICAgICAgIGlmKHV0aWwuaXNTdHJpbmcodGhpcy5vYmopKSB7XG5cbiAgICAgICAgICB0aGlzLmFzc2VydChvdGhlci5leGVjKHRoaXMub2JqKSk7XG4gICAgICAgIH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHRoaXMub2JqKSkge1xuXG4gICAgICAgICAgdGhpcy5vYmouZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB0aGlzLmFzc2VydChvdGhlci5leGVjKGl0ZW0pKTsvLyBzaG91bGQgd2UgdHJ5IHRvIGNvbnZlcnQgdG8gU3RyaW5nIGFuZCBleGVjP1xuICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYodXRpbC5pc09iamVjdCh0aGlzLm9iaikpIHtcblxuICAgICAgICAgIHZhciBub3RNYXRjaGVkUHJvcHMgPSBbXSwgbWF0Y2hlZFByb3BzID0gW107XG4gICAgICAgICAgdXRpbC5mb3JPd24odGhpcy5vYmosIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICBpZihvdGhlci5leGVjKHZhbHVlKSkgbWF0Y2hlZFByb3BzLnB1c2goaShuYW1lKSk7XG4gICAgICAgICAgICBlbHNlIG5vdE1hdGNoZWRQcm9wcy5wdXNoKGkobmFtZSkpO1xuICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgaWYobm90TWF0Y2hlZFByb3BzLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRub3QgbWF0Y2hlZCBwcm9wZXJ0aWVzOiAnICsgbm90TWF0Y2hlZFByb3BzLmpvaW4oJywgJyk7XG4gICAgICAgICAgaWYobWF0Y2hlZFByb3BzLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRtYXRjaGVkIHByb3BlcnRpZXM6ICcgKyBtYXRjaGVkUHJvcHMuam9pbignLCAnKTtcblxuICAgICAgICAgIHRoaXMuYXNzZXJ0KG5vdE1hdGNoZWRQcm9wcy5sZW5ndGggPT0gMCk7XG4gICAgICAgIH0gLy8gc2hvdWxkIHdlIHRyeSB0byBjb252ZXJ0IHRvIFN0cmluZyBhbmQgZXhlYz9cbiAgICAgIH0gZWxzZSBpZih1dGlsLmlzRnVuY3Rpb24ob3RoZXIpKSB7XG4gICAgICAgIHZhciByZXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzID0gb3RoZXIodGhpcy5vYmopO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBpZihlIGluc3RhbmNlb2Ygc2hvdWxkLkFzc2VydGlvbkVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0JyArIGUubWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHJlcyBpbnN0YW5jZW9mIEFzc2VydGlvbikge1xuICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHQnICsgcmVzLmdldE1lc3NhZ2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgd2UgdGhyb3cgZXhjZXB0aW9uIG9rIC0gaXQgaXMgdXNlZCAuc2hvdWxkIGluc2lkZVxuICAgICAgICBpZih1dGlsLmlzQm9vbGVhbihyZXMpKSB7XG4gICAgICAgICAgdGhpcy5hc3NlcnQocmVzKTsgLy8gaWYgaXQgaXMganVzdCBib29sZWFuIGZ1bmN0aW9uIGFzc2VydCBvbiBpdFxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYodXRpbC5pc09iamVjdChvdGhlcikpIHsgLy8gdHJ5IHRvIG1hdGNoIHByb3BlcnRpZXMgKGZvciBPYmplY3QgYW5kIEFycmF5KVxuICAgICAgICBub3RNYXRjaGVkUHJvcHMgPSBbXTsgbWF0Y2hlZFByb3BzID0gW107XG5cbiAgICAgICAgdXRpbC5mb3JPd24ob3RoZXIsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5vYmpba2V5XS5zaG91bGQubWF0Y2godmFsdWUpO1xuICAgICAgICAgICAgbWF0Y2hlZFByb3BzLnB1c2goa2V5KTtcbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGlmKGUgaW5zdGFuY2VvZiBzaG91bGQuQXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgbm90TWF0Y2hlZFByb3BzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZihub3RNYXRjaGVkUHJvcHMubGVuZ3RoKVxuICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRub3QgbWF0Y2hlZCBwcm9wZXJ0aWVzOiAnICsgbm90TWF0Y2hlZFByb3BzLmpvaW4oJywgJyk7XG4gICAgICAgIGlmKG1hdGNoZWRQcm9wcy5sZW5ndGgpXG4gICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdG1hdGNoZWQgcHJvcGVydGllczogJyArIG1hdGNoZWRQcm9wcy5qb2luKCcsICcpO1xuXG4gICAgICAgIHRoaXMuYXNzZXJ0KG5vdE1hdGNoZWRQcm9wcy5sZW5ndGggPT0gMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdtYXRjaEVhY2gnLCBmdW5jdGlvbihvdGhlciwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBtYXRjaCBlYWNoICcgKyBpKG90aGVyKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHZhciBmID0gb3RoZXI7XG5cbiAgICBpZih1dGlsLmlzUmVnRXhwKG90aGVyKSlcbiAgICAgIGYgPSBmdW5jdGlvbihpdCkge1xuICAgICAgICByZXR1cm4gISFvdGhlci5leGVjKGl0KTtcbiAgICAgIH07XG4gICAgZWxzZSBpZighdXRpbC5pc0Z1bmN0aW9uKG90aGVyKSlcbiAgICAgIGYgPSBmdW5jdGlvbihpdCkge1xuICAgICAgICByZXR1cm4gZXFsKGl0LCBvdGhlcik7XG4gICAgICB9O1xuXG4gICAgdXRpbC5mb3JPd24odGhpcy5vYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIHZhciByZXMgPSBmKHZhbHVlLCBrZXkpO1xuXG4gICAgICAvL2lmIHdlIHRocm93IGV4Y2VwdGlvbiBvayAtIGl0IGlzIHVzZWQgLnNob3VsZCBpbnNpZGVcbiAgICAgIGlmKHV0aWwuaXNCb29sZWFuKHJlcykpIHtcbiAgICAgICAgdGhpcy5hc3NlcnQocmVzKTsgLy8gaWYgaXQgaXMganVzdCBib29sZWFuIGZ1bmN0aW9uIGFzc2VydCBvbiBpdFxuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9KTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgQXNzZXJ0aW9uLmFkZCgnTmFOJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgTmFOJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmogIT09IHRoaXMub2JqKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnSW5maW5pdHknLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBJbmZpbml0eScgfTtcblxuICAgIHRoaXMuaXMuYS5OdW1iZXJcbiAgICAgIC5hbmQubm90LmEuTmFOXG4gICAgICAuYW5kLmFzc2VydCghaXNGaW5pdGUodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnd2l0aGluJywgZnVuY3Rpb24oc3RhcnQsIGZpbmlzaCwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSB3aXRoaW4gJyArIHN0YXJ0ICsgJy4uJyArIGZpbmlzaCwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqID49IHN0YXJ0ICYmIHRoaXMub2JqIDw9IGZpbmlzaCk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2FwcHJveGltYXRlbHknLCBmdW5jdGlvbih2YWx1ZSwgZGVsdGEsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYXBwcm94aW1hdGVseSAnICsgdmFsdWUgKyBcIiDCsVwiICsgZGVsdGEsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydChNYXRoLmFicyh0aGlzLm9iaiAtIHZhbHVlKSA8PSBkZWx0YSk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2Fib3ZlJywgZnVuY3Rpb24obiwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhYm92ZSAnICsgbiwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqID4gbik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2JlbG93JywgZnVuY3Rpb24obiwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBiZWxvdyAnICsgbiwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqIDwgbik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcygnYWJvdmUnLCAnZ3JlYXRlclRoYW4nKTtcbiAgQXNzZXJ0aW9uLmFsaWFzKCdiZWxvdycsICdsZXNzVGhhbicpO1xuXG59O1xuIiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBlcWwgPSByZXF1aXJlKCcuLi9lcWwnKTtcblxudmFyIGFTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICB2YXIgaSA9IHNob3VsZC5mb3JtYXQ7XG5cbiAgQXNzZXJ0aW9uLmFkZCgncHJvcGVydHknLCBmdW5jdGlvbihuYW1lLCB2YWwpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHAgPSB7fTtcbiAgICAgIHBbbmFtZV0gPSB2YWw7XG4gICAgICB0aGlzLmhhdmUucHJvcGVydGllcyhwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYXZlLnByb3BlcnRpZXMobmFtZSk7XG4gICAgfVxuICAgIHRoaXMub2JqID0gdGhpcy5vYmpbbmFtZV07XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ3Byb3BlcnRpZXMnLCBmdW5jdGlvbihuYW1lcykge1xuICAgIHZhciB2YWx1ZXMgPSB7fTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgbmFtZXMgPSBhU2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIH0gZWxzZSBpZighQXJyYXkuaXNBcnJheShuYW1lcykpIHtcbiAgICAgIGlmKHV0aWwuaXNTdHJpbmcobmFtZXMpKSB7XG4gICAgICAgIG5hbWVzID0gW25hbWVzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlcyA9IG5hbWVzO1xuICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKG5hbWVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgb2JqID0gT2JqZWN0KHRoaXMub2JqKSwgbWlzc2luZ1Byb3BlcnRpZXMgPSBbXTtcblxuICAgIC8vanVzdCBlbnVtZXJhdGUgcHJvcGVydGllcyBhbmQgY2hlY2sgaWYgdGhleSBhbGwgcHJlc2VudFxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYoIShuYW1lIGluIG9iaikpIG1pc3NpbmdQcm9wZXJ0aWVzLnB1c2goaShuYW1lKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgcHJvcHMgPSBtaXNzaW5nUHJvcGVydGllcztcbiAgICBpZihwcm9wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHByb3BzID0gbmFtZXMubWFwKGkpO1xuICAgIH1cblxuICAgIHZhciBvcGVyYXRvciA9IChwcm9wcy5sZW5ndGggPT09IDEgP1xuICAgICAgJ3RvIGhhdmUgcHJvcGVydHkgJyA6ICd0byBoYXZlIHByb3BlcnRpZXMgJykgKyBwcm9wcy5qb2luKCcsICcpO1xuXG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiBvcGVyYXRvciB9O1xuXG4gICAgdGhpcy5hc3NlcnQobWlzc2luZ1Byb3BlcnRpZXMubGVuZ3RoID09PSAwKTtcblxuICAgIC8vIGNoZWNrIGlmIHZhbHVlcyBpbiBvYmplY3QgbWF0Y2hlZCBleHBlY3RlZFxuICAgIHZhciB2YWx1ZUNoZWNrTmFtZXMgPSBPYmplY3Qua2V5cyh2YWx1ZXMpO1xuICAgIGlmKHZhbHVlQ2hlY2tOYW1lcy5sZW5ndGgpIHtcbiAgICAgIHZhciB3cm9uZ1ZhbHVlcyA9IFtdO1xuICAgICAgcHJvcHMgPSBbXTtcblxuICAgICAgLy8gbm93IGNoZWNrIHZhbHVlcywgYXMgdGhlcmUgd2UgaGF2ZSBhbGwgcHJvcGVydGllc1xuICAgICAgdmFsdWVDaGVja05hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbbmFtZV07XG4gICAgICAgIGlmKCFlcWwob2JqW25hbWVdLCB2YWx1ZSkpIHtcbiAgICAgICAgICB3cm9uZ1ZhbHVlcy5wdXNoKGkobmFtZSkgKyAnIG9mICcgKyBpKHZhbHVlKSArICcgKGdvdCAnICsgaShvYmpbbmFtZV0pICsgJyknKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9wcy5wdXNoKGkobmFtZSkgKyAnIG9mICcgKyBpKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZih3cm9uZ1ZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3BzID0gd3JvbmdWYWx1ZXM7XG4gICAgICB9XG5cbiAgICAgIG9wZXJhdG9yID0gKHByb3BzLmxlbmd0aCA9PT0gMSA/XG4gICAgICAgICd0byBoYXZlIHByb3BlcnR5ICcgOiAndG8gaGF2ZSBwcm9wZXJ0aWVzICcpICsgcHJvcHMuam9pbignLCAnKTtcblxuICAgICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiBvcGVyYXRvciB9O1xuXG4gICAgICB0aGlzLmFzc2VydCh3cm9uZ1ZhbHVlcy5sZW5ndGggPT09IDApO1xuICAgIH1cbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnbGVuZ3RoJywgZnVuY3Rpb24obiwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLmhhdmUucHJvcGVydHkoJ2xlbmd0aCcsIG4sIGRlc2NyaXB0aW9uKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCdsZW5ndGgnLCAnbGVuZ3RoT2YnKTtcblxuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIEFzc2VydGlvbi5hZGQoJ293blByb3BlcnR5JywgZnVuY3Rpb24obmFtZSwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBoYXZlIG93biBwcm9wZXJ0eSAnICsgaShuYW1lKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KGhhc093blByb3BlcnR5LmNhbGwodGhpcy5vYmosIG5hbWUpKTtcblxuICAgIHRoaXMub2JqID0gdGhpcy5vYmpbbmFtZV07XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcygnaGFzT3duUHJvcGVydHknLCAnb3duUHJvcGVydHknKTtcblxuICBBc3NlcnRpb24uYWRkKCdlbXB0eScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGVtcHR5JyB9O1xuXG4gICAgaWYodXRpbC5pc1N0cmluZyh0aGlzLm9iaikgfHwgQXJyYXkuaXNBcnJheSh0aGlzLm9iaikgfHwgdXRpbC5pc0FyZ3VtZW50cyh0aGlzLm9iaikpIHtcbiAgICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnbGVuZ3RoJywgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvYmogPSBPYmplY3QodGhpcy5vYmopOyAvLyB3cmFwIHRvIHJlZmVyZW5jZSBmb3IgYm9vbGVhbnMgYW5kIG51bWJlcnNcbiAgICAgIGZvcih2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgdGhpcy5oYXZlLm5vdC5vd25Qcm9wZXJ0eShwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2tleXMnLCBmdW5jdGlvbihrZXlzKSB7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpIGtleXMgPSBhU2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGVsc2UgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB1dGlsLmlzU3RyaW5nKGtleXMpKSBrZXlzID0gWyBrZXlzIF07XG4gICAgZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09PSAwKSBrZXlzID0gW107XG5cbiAgICB2YXIgb2JqID0gT2JqZWN0KHRoaXMub2JqKTtcblxuICAgIC8vIGZpcnN0IGNoZWNrIGlmIHNvbWUga2V5cyBhcmUgbWlzc2luZ1xuICAgIHZhciBtaXNzaW5nS2V5cyA9IFtdO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMub2JqLCBrZXkpKVxuICAgICAgICBtaXNzaW5nS2V5cy5wdXNoKGkoa2V5KSk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBzZWNvbmQgY2hlY2sgZm9yIGV4dHJhIGtleXNcbiAgICB2YXIgZXh0cmFLZXlzID0gW107XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYoa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIGV4dHJhS2V5cy5wdXNoKGkoa2V5KSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdmVyYiA9IGtleXMubGVuZ3RoID09PSAwID8gJ3RvIGJlIGVtcHR5JyA6XG4gICAgICAndG8gaGF2ZSAnICsgKGtleXMubGVuZ3RoID09PSAxID8gJ2tleSAnIDogJ2tleXMgJyk7XG5cbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6IHZlcmIgKyBrZXlzLm1hcChpKS5qb2luKCcsICcpfTtcblxuICAgIGlmKG1pc3NpbmdLZXlzLmxlbmd0aCA+IDApXG4gICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0bWlzc2luZyBrZXlzOiAnICsgbWlzc2luZ0tleXMuam9pbignLCAnKTtcblxuICAgIGlmKGV4dHJhS2V5cy5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdGV4dHJhIGtleXM6ICcgKyBleHRyYUtleXMuam9pbignLCAnKTtcblxuICAgIHRoaXMuYXNzZXJ0KG1pc3NpbmdLZXlzLmxlbmd0aCA9PT0gMCAmJiBleHRyYUtleXMubGVuZ3RoID09PSAwKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKFwia2V5c1wiLCBcImtleVwiKTtcblxuICBBc3NlcnRpb24uYWRkKCdjb250YWluRXFsJywgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBjb250YWluICcgKyBpKG90aGVyKSB9O1xuICAgIHZhciBvYmogPSB0aGlzLm9iajtcbiAgICBpZihBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgIHRoaXMuYXNzZXJ0KG9iai5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGVxbChpdGVtLCBvdGhlcik7XG4gICAgICB9KSk7XG4gICAgfSBlbHNlIGlmKHV0aWwuaXNTdHJpbmcob2JqKSkge1xuICAgICAgLy8gZXhwZWN0IG9iaiB0byBiZSBzdHJpbmdcbiAgICAgIHRoaXMuYXNzZXJ0KG9iai5pbmRleE9mKFN0cmluZyhvdGhlcikpID49IDApO1xuICAgIH0gZWxzZSBpZih1dGlsLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIC8vIG9iamVjdCBjb250YWlucyBvYmplY3QgY2FzZVxuICAgICAgdXRpbC5mb3JPd24ob3RoZXIsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgb2JqLnNob3VsZC5oYXZlLnByb3BlcnR5KGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vb3RoZXIgdW5jb3ZlcmVkIGNhc2VzXG4gICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgfVxuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdjb250YWluRGVlcCcsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gY29udGFpbiAnICsgaShvdGhlcikgfTtcblxuICAgIHZhciBvYmogPSB0aGlzLm9iajtcbiAgICBpZihBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgIGlmKEFycmF5LmlzQXJyYXkob3RoZXIpKSB7XG4gICAgICAgIHZhciBvdGhlcklkeCA9IDA7XG4gICAgICAgIG9iai5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2hvdWxkKGl0ZW0pLm5vdC5iZS5udWxsLmFuZC5jb250YWluRGVlcChvdGhlcltvdGhlcklkeF0pO1xuICAgICAgICAgICAgb3RoZXJJZHgrKztcbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGlmKGUgaW5zdGFuY2VvZiBzaG91bGQuQXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFzc2VydChvdGhlcklkeCA9PSBvdGhlci5sZW5ndGgpO1xuICAgICAgICAvL3NlYXJjaCBhcnJheSBjb250YWluIG90aGVyIGFzIHN1YiBzZXF1ZW5jZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZih1dGlsLmlzU3RyaW5nKG9iaikpIHsvLyBleHBlY3Qgb3RoZXIgdG8gYmUgc3RyaW5nXG4gICAgICB0aGlzLmFzc2VydChvYmouaW5kZXhPZihTdHJpbmcob3RoZXIpKSA+PSAwKTtcbiAgICB9IGVsc2UgaWYodXRpbC5pc09iamVjdChvYmopKSB7Ly8gb2JqZWN0IGNvbnRhaW5zIG9iamVjdCBjYXNlXG4gICAgICBpZih1dGlsLmlzT2JqZWN0KG90aGVyKSkge1xuICAgICAgICB1dGlsLmZvck93bihvdGhlciwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIHNob3VsZChvYmpba2V5XSkubm90LmJlLm51bGwuYW5kLmNvbnRhaW5EZWVwKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Ugey8vb25lIG9mIHRoZSBwcm9wZXJ0aWVzIGNvbnRhaW4gdmFsdWVcbiAgICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVxbChvdGhlcik7XG4gICAgfVxuICB9KTtcblxufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICBBc3NlcnRpb24uYWRkKCdzdGFydFdpdGgnLCBmdW5jdGlvbihzdHIsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gc3RhcnQgd2l0aCAnICsgc2hvdWxkLmZvcm1hdChzdHIpLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQoMCA9PT0gdGhpcy5vYmouaW5kZXhPZihzdHIpKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnZW5kV2l0aCcsIGZ1bmN0aW9uKHN0ciwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBlbmQgd2l0aCAnICsgc2hvdWxkLmZvcm1hdChzdHIpLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmouaW5kZXhPZihzdHIsIHRoaXMub2JqLmxlbmd0aCAtIHN0ci5sZW5ndGgpID49IDApO1xuICB9KTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIEFzc2VydGlvbi5hZGQoJ051bWJlcicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGEgbnVtYmVyJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc051bWJlcih0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdhcmd1bWVudHMnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhcmd1bWVudHMnIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzQXJndW1lbnRzKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ3R5cGUnLCBmdW5jdGlvbih0eXBlLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGhhdmUgdHlwZSAnICsgdHlwZSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgICh0eXBlb2YgdGhpcy5vYmopLnNob3VsZC5iZS5leGFjdGx5KHR5cGUsIGRlc2NyaXB0aW9uKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnaW5zdGFuY2VvZicsIGZ1bmN0aW9uKGNvbnN0cnVjdG9yLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFuIGluc3RhbmNlIG9mICcgKyBjb25zdHJ1Y3Rvci5uYW1lLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQoT2JqZWN0KHRoaXMub2JqKSBpbnN0YW5jZW9mIGNvbnN0cnVjdG9yKTtcbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnRnVuY3Rpb24nLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhIGZ1bmN0aW9uJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc0Z1bmN0aW9uKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ09iamVjdCcsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFuIG9iamVjdCcgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNPYmplY3QodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnU3RyaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYSBzdHJpbmcnIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzU3RyaW5nKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ0FycmF5JywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYW4gYXJyYXknIH07XG5cbiAgICB0aGlzLmFzc2VydChBcnJheS5pc0FycmF5KHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ0Jvb2xlYW4nLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhIGJvb2xlYW4nIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzQm9vbGVhbih0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdFcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFuIGVycm9yJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc0Vycm9yKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ251bGwnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBudWxsJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodGhpcy5vYmogPT09IG51bGwpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ2luc3RhbmNlb2YnLCAnaW5zdGFuY2VPZicpO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHNob3VsZCA9IHJlcXVpcmUoJy4vc2hvdWxkJyk7XG5cbnNob3VsZFxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2Fzc2VydCcpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2NoYWluJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvYm9vbCcpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L251bWJlcicpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2VxbCcpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L3R5cGUnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9zdHJpbmcnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9wcm9wZXJ0eScpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2h0dHAnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9lcnJvcicpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L21hdGNoJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvZGVwcmVjYXRlZCcpKTtcblxuIG1vZHVsZS5leHBvcnRzID0gc2hvdWxkOyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcbiAgLCBBc3NlcnRpb25FcnJvciA9IHV0aWwuQXNzZXJ0aW9uRXJyb3JcbiAgLCBpbnNwZWN0ID0gdXRpbC5pbnNwZWN0O1xuXG4vKipcbiAqIE91ciBmdW5jdGlvbiBzaG91bGRcbiAqIEBwYXJhbSBvYmpcbiAqIEByZXR1cm5zIHtBc3NlcnRpb259XG4gKi9cbnZhciBzaG91bGQgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG5ldyBBc3NlcnRpb24odXRpbC5pc1dyYXBwZXJUeXBlKG9iaikgPyBvYmoudmFsdWVPZigpOiBvYmopO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBBc3NlcnRpb25gIHdpdGggdGhlIGdpdmVuIF9vYmpfLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgQXNzZXJ0aW9uID0gc2hvdWxkLkFzc2VydGlvbiA9IGZ1bmN0aW9uIEFzc2VydGlvbihvYmopIHtcbiAgdGhpcy5vYmogPSBvYmo7XG59O1xuXG5cbi8qKlxuICBXYXkgdG8gZXh0ZW5kIEFzc2VydGlvbiBmdW5jdGlvbi4gSXQgdXNlcyBzb21lIGxvZ2ljIFxuICB0byBkZWZpbmUgb25seSBwb3NpdGl2ZSBhc3NlcnRpb25zIGFuZCBpdHNlbGYgcnVsZSB3aXRoIG5lZ2F0aXZlIGFzc2VydGlvbi5cblxuICBBbGwgYWN0aW9ucyBoYXBwZW4gaW4gc3ViY29udGV4dCBhbmQgdGhpcyBtZXRob2QgdGFrZSBjYXJlIGFib3V0IG5lZ2F0aW9uLlxuICBQb3RlbnRpYWxseSB3ZSBjYW4gYWRkIHNvbWUgbW9yZSBtb2RpZmllcnMgdGhhdCBkb2VzIG5vdCBkZXBlbmRzIGZyb20gc3RhdGUgb2YgYXNzZXJ0aW9uLlxuKi9cbkFzc2VydGlvbi5hZGQgPSBmdW5jdGlvbihuYW1lLCBmLCBpc0dldHRlcikge1xuICB2YXIgcHJvcCA9IHt9O1xuICBwcm9wW2lzR2V0dGVyID8gJ2dldCcgOiAndmFsdWUnXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250ZXh0ID0gbmV3IEFzc2VydGlvbih0aGlzLm9iaik7XG4gICAgY29udGV4dC5jb3B5ID0gY29udGV4dC5jb3B5SWZNaXNzaW5nO1xuXG4gICAgdHJ5IHtcbiAgICAgIGYuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vY29weSBkYXRhIGZyb20gc3ViIGNvbnRleHQgdG8gdGhpc1xuICAgICAgdGhpcy5jb3B5KGNvbnRleHQpO1xuXG4gICAgICAvL2NoZWNrIGZvciBmYWlsXG4gICAgICBpZihlIGluc3RhbmNlb2Ygc2hvdWxkLkFzc2VydGlvbkVycm9yKSB7XG4gICAgICAgIC8vbmVnYXRpdmUgZmFpbFxuICAgICAgICBpZih0aGlzLm5lZ2F0ZSkge1xuICAgICAgICAgIHRoaXMub2JqID0gY29udGV4dC5vYmo7XG4gICAgICAgICAgdGhpcy5uZWdhdGUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgICB9XG4gICAgICAvLyB0aHJvdyBpZiBpdCBpcyBhbm90aGVyIGV4Y2VwdGlvblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgLy9jb3B5IGRhdGEgZnJvbSBzdWIgY29udGV4dCB0byB0aGlzXG4gICAgdGhpcy5jb3B5KGNvbnRleHQpO1xuICAgIGlmKHRoaXMubmVnYXRlKSB7XG4gICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5vYmogPSBjb250ZXh0Lm9iajtcbiAgICB0aGlzLm5lZ2F0ZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBc3NlcnRpb24ucHJvdG90eXBlLCBuYW1lLCBwcm9wKTtcbn07XG5cbkFzc2VydGlvbi5hbGlhcyA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIEFzc2VydGlvbi5wcm90b3R5cGVbdG9dID0gQXNzZXJ0aW9uLnByb3RvdHlwZVtmcm9tXVxufTtcblxuc2hvdWxkLkFzc2VydGlvbkVycm9yID0gQXNzZXJ0aW9uRXJyb3I7XG52YXIgaSA9IHNob3VsZC5mb3JtYXQgPSBmdW5jdGlvbiBpKHZhbHVlKSB7XG4gIGlmKHV0aWwuaXNEYXRlKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUuaW5zcGVjdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlLnRvSVNPU3RyaW5nKCk7IC8vc2hvdyBtaWxsaXMgaW4gZGF0ZXNcbiAgcmV0dXJuIGluc3BlY3QodmFsdWUsIHsgZGVwdGg6IG51bGwgfSk7XG59O1xuXG5zaG91bGQudXNlID0gZnVuY3Rpb24oZikge1xuICBmKHRoaXMsIEFzc2VydGlvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIEV4cG9zZSBzaG91bGQgdG8gZXh0ZXJuYWwgd29ybGQuXG4gKi9cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHNob3VsZDtcblxuXG4vKipcbiAqIEV4cG9zZSBhcGkgdmlhIGBPYmplY3Qjc2hvdWxkYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAnc2hvdWxkJywge1xuICBzZXQ6IGZ1bmN0aW9uKCl7fSxcbiAgZ2V0OiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBzaG91bGQodGhpcyk7XG4gIH0sXG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuQXNzZXJ0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEFzc2VydGlvbixcblxuICBhc3NlcnQ6IGZ1bmN0aW9uKGV4cHIpIHtcbiAgICBpZihleHByKSByZXR1cm47XG5cbiAgICB2YXIgcGFyYW1zID0gdGhpcy5wYXJhbXM7XG5cbiAgICB2YXIgbXNnID0gcGFyYW1zLm1lc3NhZ2UsIGdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgICBpZighbXNnKSB7XG4gICAgICBtc2cgPSB0aGlzLmdldE1lc3NhZ2UoKTtcbiAgICAgIGdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBlcnIgPSBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgbWVzc2FnZTogbXNnXG4gICAgICAsIGFjdHVhbDogdGhpcy5vYmpcbiAgICAgICwgZXhwZWN0ZWQ6IHBhcmFtcy5leHBlY3RlZFxuICAgICAgLCBzdGFja1N0YXJ0RnVuY3Rpb246IHRoaXMuYXNzZXJ0XG4gICAgfSk7XG5cbiAgICBlcnIuc2hvd0RpZmYgPSBwYXJhbXMuc2hvd0RpZmY7XG4gICAgZXJyLm9wZXJhdG9yID0gcGFyYW1zLm9wZXJhdG9yO1xuICAgIGVyci5nZW5lcmF0ZWRNZXNzYWdlID0gZ2VuZXJhdGVkTWVzc2FnZTtcblxuICAgIHRocm93IGVycjtcbiAgfSxcblxuICBnZXRNZXNzYWdlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ2V4cGVjdGVkICcgKyBpKHRoaXMub2JqKSArICh0aGlzLm5lZ2F0ZSA/ICcgbm90ICc6ICcgJykgK1xuICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArICgnZXhwZWN0ZWQnIGluIHRoaXMucGFyYW1zICA/ICcgJyArIGkodGhpcy5wYXJhbXMuZXhwZWN0ZWQpIDogJycpO1xuICB9LFxuXG4gIGNvcHk6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgdGhpcy5wYXJhbXMgPSBvdGhlci5wYXJhbXM7XG4gIH0sXG5cbiAgY29weUlmTWlzc2luZzogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICBpZighdGhpcy5wYXJhbXMpIHRoaXMucGFyYW1zID0gb3RoZXIucGFyYW1zO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIE5lZ2F0aW9uIG1vZGlmaWVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBnZXQgbm90KCkge1xuICAgIHRoaXMubmVnYXRlID0gIXRoaXMubmVnYXRlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4iLCIoZnVuY3Rpb24gKEJ1ZmZlcil7XG4vKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyoqXG4gKiBDaGVjayBpZiBnaXZlbiBvYmoganVzdCBhIHByaW1pdGl2ZSB0eXBlIHdyYXBwZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmV4cG9ydHMuaXNXcmFwcGVyVHlwZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc051bWJlcihvYmopIHx8IGlzU3RyaW5nKG9iaikgfHwgaXNCb29sZWFuKG9iaik7XG59O1xuXG4vKipcbiAqIE1lcmdlIG9iamVjdCBiIHdpdGggb2JqZWN0IGEuXG4gKlxuICogICAgIHZhciBhID0geyBmb286ICdiYXInIH1cbiAqICAgICAgICwgYiA9IHsgYmFyOiAnYmF6JyB9O1xuICpcbiAqICAgICB1dGlscy5tZXJnZShhLCBiKTtcbiAqICAgICAvLyA9PiB7IGZvbzogJ2JhcicsIGJhcjogJ2JheicgfVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uKGEsIGIpe1xuICBpZiAoYSAmJiBiKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICAgIGFba2V5XSA9IGJba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGE7XG59O1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8IGFyZyBpbnN0YW5jZW9mIE51bWJlcjtcbn1cblxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8IGFyZyBpbnN0YW5jZW9mIFN0cmluZztcbn1cblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8IGFyZyBpbnN0YW5jZW9mIEJvb2xlYW47XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIGFyZyBpbnN0YW5jZW9mIEJ1ZmZlcjtcbn1cblxuZXhwb3J0cy5pc0J1ZmZlciA9IGlzQnVmZmVyO1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuXG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhvYmplY3QpID09PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn1cblxuZXhwb3J0cy5pc0FyZ3VtZW50cyA9IGlzQXJndW1lbnRzO1xuXG5leHBvcnRzLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicgfHwgYXJnIGluc3RhbmNlb2YgRnVuY3Rpb247XG59O1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIChpc09iamVjdChlKSAmJiBvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJykgfHwgKGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5leHBvcnRzLmluc3BlY3QgPSByZXF1aXJlKCd1dGlsJykuaW5zcGVjdDtcblxuZXhwb3J0cy5Bc3NlcnRpb25FcnJvciA9IHJlcXVpcmUoJ2Fzc2VydCcpLkFzc2VydGlvbkVycm9yO1xuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5leHBvcnRzLmZvck93biA9IGZ1bmN0aW9uKG9iaiwgZiwgY29udGV4dCkge1xuICBmb3IodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgaWYoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG4gICAgICBmLmNhbGwoY29udGV4dCwgb2JqW3Byb3BdLCBwcm9wKTtcbiAgICB9XG4gIH1cbn07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIpIl19
