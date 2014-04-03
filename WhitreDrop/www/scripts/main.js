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
            if(!window.FB) return;
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
            this.iframe.width="100%";
            this.iframe.height="100%";
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
            this.closeButton.style.left=(window.innerWidth-50)+'px';
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
            if(!window.FB) return;
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
            if(window.FB)
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
            if(window.FB)
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
            if(!window.FB) return;
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
    // var lastTime=0;
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
            document.body.appendChild(this.canvas);
            this.canvas.width  = 320;
            this.canvas.height = 600;
            // this.canvas.width =window.innerWidth;
            // this.canvas.height = window.innerHeight;
            
            
            
            
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
        SCALEX:1,
        SCALEY:1,
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
            if(BKGM._isCordova){
                this.SCALEX = this.WIDTH/window.innerWidth;
                this.SCALEY = this.HEIGHT/window.innerHeight;
            }
            else{
                this.SCALEX = this.WIDTH/this.canvas.offsetWidth;
                this.SCALEY = this.HEIGHT/this.canvas.offsetHeight;                
            }  
            // lastTime=new Date();
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
        x*=_this.SCALEX;
        y*=_this.SCALEY;
        if(_this.Codea){
            y=_this.HEIGHT-y;        }

        return {x:x,y:y,number:e.identifier}
    }
    
    var addMouseTouchEvent= function(_this){
        _this.currentTouch={ state:"ENDED" ,posX:0,posY:0,isTouch:false};
        _this.canvas.addEventListener('touchstart', function(event) {
            this._istouch=true;
            event.preventDefault();
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
                    _this.currentTouch.isTouch=true;
                    if(_this.states && _this.states._touchStart) _this.states._touchStart(e); else
                    if(_this._touchStart) _this._touchStart(e);
                    _this.currentTouch.posX=e.x;
                    _this.currentTouch.posY=e.y;
                    _this.currentTouch.x = e.x;
                    _this.currentTouch.y = e.y;
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
                var e=checkMousePos(touch,_this);
                if(BKGM.TYPE_TOUCH==BKGM.SINGLE_TOUCH && touch.identifier==0) {                   
                    _this.currentTouch.state="MOVING";
                    _this.currentTouch.x = e.x;
                    _this.currentTouch.y = e.y;                    
                    if(_this._touchDrag) _this._touchDrag(e);
                    break;

                }
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
            if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH) {
                var e={x:_this.currentTouch.posX,y:_this.currentTouch.posY};
                if(_this.states && _this.states.touchEnd) _this.states._touchEnd(e); else
                    if(_this._touchEnd) _this._touchEnd(e); 
                    return;
            }
            for (var i = 0; i < event.changedTouches.length; i++) {
               
                if(BKGM.TYPE_TOUCH===BKGM.SINGLE_TOUCH) {
                    
                    // this._istouch=false;            
                    // console.log(touch)  
                    var touch = event.changedTouches[0];                      
                    var e=checkMousePos(touch,_this);
                    _this.currentTouch.isTouch=false;
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
							'DEFAULT':1.8
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
    var x = this.x;
    // Draw head
    // game.circle(x, y, diameter);

    // Draw this.tail
    for (var i = 0, l = this.tail.length; i < l; i++) {
        game.circle(this.tail[i], y + i * speed, diameter - diameter*i/l);
    }

    

    
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
explosion.update = function() {
    this.opacity = 255 * (1 - (this.time/30));
    this.time += 3 / (this.time * SCALE);
};
explosion.draw = function() {
    
    game.fill(255, 255, 255, random(0, 250));
    game.rect(0,0,WIDTH,HEIGHT);
    

    game.lineCapMode('round');
    game.strokeWidth(random(5, Math.floor(30 * SCALE)));
    game.stroke(255,255,255, Math.max(this.opacity,0));

    var p = this.position;
    for (var i = 0, l = lines.length; i < l; i++) {
        var v = lines[i];
        var vt = p + v * this.time;
        game.line(p.x, p.y, vt.x, vt.y);
    }

    
    
    game.lineCapMode('butt');
    game.strokeWidth(0);

}
module.exports = explosion;
},{"./BKGM/screenset":5,"./constants":9,"./game":12,"./random":15}],12:[function(require,module,exports){
var BKGM = require('./BKGM'),
	director = require('./BKGM/director'),
	game = new BKGM({
    	DeviceMotion: false,
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
    
    director.update("explosion", function() {
        explosion.update();
        if (explosion.isDone()) {
            director.switch("gameover");
        }
        
    });

    director.draw("explosion", function() {
        explosion.draw();
        
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
// window.addEventListener("load", app, false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEhvYW5nQW5oXFxEb2N1bWVudHNcXEdpdEh1YlxcU2xpcHB5RHJvcFxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9TdGF0ZXMuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvQktHTS9kaXJlY3Rvci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9CS0dNL2ZiY29ubmVjdC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9CS0dNL2luZGV4LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL0JLR00vc2NyZWVuc2V0LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2FwcC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9hcHAvc2NyaXB0cy9ibG9ja3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29tbW9uVGFza3MuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvY29uc3RhbnRzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2Ryb3AuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZXhwbG9zaW9uLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL2dhbWUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvZ2FtZVRhc2tzLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL21haW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3AvYXBwL3NjcmlwdHMvcmFuZG9tLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL2FwcC9zY3JpcHRzL3NjcmVlbnBsYXkuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9uYXRpdmUtYnVmZmVyLWJyb3dzZXJpZnkvaW5kZXguanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL25hdGl2ZS1idWZmZXItYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9lcWwuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2Fzc2VydC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvYm9vbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvY2hhaW4uanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2RlcHJlY2F0ZWQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2VxbC5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9leHQvZXJyb3IuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L2h0dHAuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L21hdGNoLmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9udW1iZXIuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3Byb3BlcnR5LmpzIiwiQzovVXNlcnMvSG9hbmdBbmgvRG9jdW1lbnRzL0dpdEh1Yi9TbGlwcHlEcm9wL25vZGVfbW9kdWxlcy9zaG91bGQvbGliL2V4dC9zdHJpbmcuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvZXh0L3R5cGUuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvbm9kZS5qcyIsIkM6L1VzZXJzL0hvYW5nQW5oL0RvY3VtZW50cy9HaXRIdWIvU2xpcHB5RHJvcC9ub2RlX21vZHVsZXMvc2hvdWxkL2xpYi9zaG91bGQuanMiLCJDOi9Vc2Vycy9Ib2FuZ0FuaC9Eb2N1bWVudHMvR2l0SHViL1NsaXBweURyb3Avbm9kZV9tb2R1bGVzL3Nob3VsZC9saWIvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzErQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQktHTSA9IHJlcXVpcmUoJy4vJyk7XHJcblxyXG52YXIgU3RhdGVzID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuY3VycmVudCAgPSBcImRlZmF1bHRcIjtcclxuICAgIHRoaXMub25jZSAgICAgPSBmYWxzZTtcclxuICAgIHRoaXMuc3dpdGNoZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhdGVzICAgPSB7IGRlZmF1bHQgOiBbXSB9O1xyXG4gICAgdGhpcy51cGRhdGVzICA9IHt9O1xyXG4gICAgdGhpcy5kcmF3cyAgICA9IHt9O1xyXG4gICAgdGhpcy5sYXN0VGltZSA9IDA7XHJcbiAgICB0aGlzLnN0ZXBzICAgID0gMDtcclxuICAgIHRoaXMudGltZSAgICAgPSAwO1xyXG59XHJcblxyXG52YXIgZnJhbWVUaW1lID0gMTAwMC82MDtcclxuXHJcblN0YXRlcy5wcm90b3R5cGUgPSB7XHJcbiAgICBzdGF0ZTogZnVuY3Rpb24gKG5hbWUsIHRhc2tzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZXNbbmFtZV0gPSB0YXNrcztcclxuICAgIH0sXHJcbiAgICBkcmF3OiBmdW5jdGlvbiAobmFtZSwgZm4pIHtcclxuICAgICAgICB0aGlzLmRyYXdzW25hbWVdID0gZm47XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbihuYW1lLCBmbikge1xyXG4gICAgICAgIHRoaXMudXBkYXRlc1tuYW1lXSA9IGZuO1xyXG4gICAgfSxcclxuICAgIHRhc2tPbmNlOiBmdW5jdGlvbihuYW1lLCBmbikge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLmRyYXdzW25hbWVdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25jZSA9PT0gZmFsc2U/Zm4oYXJndW1lbnRzKTpudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgcnVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRpbWUgKz0gK25ldyBEYXRlKCkgLSB0aGlzLmxhc3RUaW1lO1xyXG4gICAgICAgIHZhciB0aW1lID0gdGhpcy50aW1lO1xyXG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSArbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zd2l0Y2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB0YXNrcyA9IHRoaXMuc3RhdGVzW3RoaXMuY3VycmVudF0sXHJcbiAgICAgICAgICAgIHVwZGF0ZXMgPSB0aGlzLnVwZGF0ZXMsXHJcbiAgICAgICAgICAgIGRyYXdzID0gdGhpcy5kcmF3cztcclxuXHJcbiAgICAgICAgd2hpbGUgKHRpbWUgPj0gZnJhbWVUaW1lKXtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0YXNrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXNrID0gdGFza3NbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlc1t0YXNrXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGFzayA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlc1t0YXNrXSkgdXBkYXRlc1t0YXNrXSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhc2suYXJncyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBkYXRlc1t0YXNrLm5hbWVdKSB1cGRhdGVzW3Rhc2submFtZV0uYXBwbHkobnVsbCwgdGFzay5hcmdzKCkgfHwgW10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVzW3Rhc2submFtZV0pIHVwZGF0ZXNbdGFzay5uYW1lXS5hcHBseShudWxsLCB0YXNrLmFyZ3MgfHwgW10pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aW1lIC09IGZyYW1lVGltZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50aW1lID0gdGltZTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0YXNrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc1tpXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXNrID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhd3NbdGFza10pIGRyYXdzW3Rhc2tdKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhc2suYXJncyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYXdzW3Rhc2submFtZV0pIGRyYXdzW3Rhc2submFtZV0uYXBwbHkobnVsbCwgdGFzay5hcmdzKCkgfHwgW10pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYXdzW3Rhc2submFtZV0pIGRyYXdzW3Rhc2submFtZV0uYXBwbHkobnVsbCwgdGFzay5hcmdzIHx8IFtdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuc3dpdGNoZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vbmNlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc3dpdGNoOiBmdW5jdGlvbihzdGF0ZSwgcnVuTm93KXtcclxuICAgICAgICB0aGlzLm9uY2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN3aXRjaGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBzdGF0ZTtcclxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gK25ldyBEYXRlKCk7XHJcbiAgICAgICAgdGhpcy5zdGVwID0gMDtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIGlmIChydW5Ob3cpIHRoaXMucnVuKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RhdGVzOyIsInZhciBTdGF0ZXMgPSByZXF1aXJlKCcuL1N0YXRlcycpLFxyXG5cdGRpcmVjdG9yID0gbmV3IFN0YXRlcygpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkaXJlY3RvcjsiLCJ2YXIgQktHTT1yZXF1aXJlKCcuLycpO1xyXG4oZnVuY3Rpb24oRkJDb25uZWN0KXtcclxuICAgIC8qXHJcbkNvcHlyaWdodCAoYykgMjAxMSwgRGFuaWVsIEd1ZXJyZXJvXHJcbkFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcclxubW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XHJcbiAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XHJcbiAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcclxuICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxyXG4gICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxyXG5cclxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXHJcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcclxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgREFOSUVMIEdVRVJSRVJPIEJFIExJQUJMRSBGT1IgQU5ZXHJcbkRJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXHJcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcclxuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EXHJcbk9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXHJcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXHJcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBVc2VzIHRoZSBuZXcgYXJyYXkgdHlwZWQgaW4gamF2YXNjcmlwdCB0byBiaW5hcnkgYmFzZTY0IGVuY29kZS9kZWNvZGVcclxuICogYXQgdGhlIG1vbWVudCBqdXN0IGRlY29kZXMgYSBiaW5hcnkgYmFzZTY0IGVuY29kZWRcclxuICogaW50byBlaXRoZXIgYW4gQXJyYXlCdWZmZXIgKGRlY29kZUFycmF5QnVmZmVyKVxyXG4gKiBvciBpbnRvIGFuIFVpbnQ4QXJyYXkgKGRlY29kZSlcclxuICogXHJcbiAqIFJlZmVyZW5jZXM6XHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0phdmFTY3JpcHRfdHlwZWRfYXJyYXlzL0FycmF5QnVmZmVyXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0phdmFTY3JpcHRfdHlwZWRfYXJyYXlzL1VpbnQ4QXJyYXlcclxuICovXHJcblxyXG53aW5kb3cuQmFzZTY0QmluYXJ5ID0ge1xyXG4gICAgX2tleVN0ciA6IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIixcclxuICAgIFxyXG4gICAgLyogd2lsbCByZXR1cm4gYSAgVWludDhBcnJheSB0eXBlICovXHJcbiAgICBkZWNvZGVBcnJheUJ1ZmZlcjogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgYnl0ZXMgPSAoaW5wdXQubGVuZ3RoLzQpICogMztcclxuICAgICAgICB2YXIgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xyXG4gICAgICAgIHRoaXMuZGVjb2RlKGlucHV0LCBhYik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGFiO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZGVjb2RlOiBmdW5jdGlvbihpbnB1dCwgYXJyYXlCdWZmZXIpIHtcclxuICAgICAgICAvL2dldCBsYXN0IGNoYXJzIHRvIHNlZSBpZiBhcmUgdmFsaWRcclxuICAgICAgICB2YXIgbGtleTEgPSB0aGlzLl9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTsgICAgICBcclxuICAgICAgICB2YXIgbGtleTIgPSB0aGlzLl9rZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTIpKTsgICAgICBcclxuICAgIFxyXG4gICAgICAgIHZhciBieXRlcyA9IChpbnB1dC5sZW5ndGgvNCkgKiAzO1xyXG4gICAgICAgIGlmIChsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXHJcbiAgICAgICAgaWYgKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdWFycmF5O1xyXG4gICAgICAgIHZhciBjaHIxLCBjaHIyLCBjaHIzO1xyXG4gICAgICAgIHZhciBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0O1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICB2YXIgaiA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGFycmF5QnVmZmVyKVxyXG4gICAgICAgICAgICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShieXRlcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgXCJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChpPTA7IGk8Ynl0ZXM7IGkrPTMpIHsgIFxyXG4gICAgICAgICAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcclxuICAgICAgICAgICAgZW5jMSA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcclxuICAgICAgICAgICAgZW5jMiA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcclxuICAgICAgICAgICAgZW5jMyA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcclxuICAgICAgICAgICAgZW5jNCA9IHRoaXMuX2tleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcclxuICAgIFxyXG4gICAgICAgICAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcclxuICAgICAgICAgICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xyXG4gICAgICAgICAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xyXG4gICAgXHJcbiAgICAgICAgICAgIHVhcnJheVtpXSA9IGNocjE7ICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcclxuICAgICAgICAgICAgaWYgKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gdWFycmF5OyAgXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4gICAgLy8gdmFyIEJLR00gPSBCS0dNfHx7fTsgXHJcbiAgICBcclxuICAgIGlmICggWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIGJ5dGVzID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHN0cmluZywgZnVuY3Rpb24oYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQobmV3IFVpbnQ4QXJyYXkoYnl0ZXMpLmJ1ZmZlcik7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFBvc3RJbWFnZVRvRmFjZWJvb2soYXV0aFRva2VuLCBmaWxlbmFtZSwgbWltZVR5cGUsIGltYWdlRGF0YSwgb2JqKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChpbWFnZURhdGEgIT0gbnVsbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vUHJvbXB0IHRoZSB1c2VyIHRvIGVudGVyIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICAvL0lmIHRoZSB1c2VyIGNsaWNrcyBvbiBPSyBidXR0b24gdGhlIHdpbmRvdyBtZXRob2QgcHJvbXB0KCkgd2lsbCByZXR1cm4gZW50ZXJlZCB2YWx1ZSBmcm9tIHRoZSB0ZXh0IGJveC4gXHJcbiAgICAgICAgICAgIC8vSWYgdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBDYW5jZWwgYnV0dG9uIHRoZSB3aW5kb3cgbWV0aG9kIHByb21wdCgpIHJldHVybnMgbnVsbC5cclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBwcm9tcHQoJ0ZhY2Vib29rJywgJ0VudGVyIGEgbWVzc2FnZScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT0gbnVsbClcclxuICAgICAgICAgICAgeyAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIGFqYXggPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKG9iaiAmJiBvYmouc3VjY2VzcykgPyBvYmouc3VjY2VzcyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChvYmogJiYgb2JqLmVycm9yKSA/IG9iai5lcnJvciA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IChvYmogJiYgb2JqLmNvbXBsZXRlKSA/IG9iai5jb21wbGV0ZSA6IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIG11bHRcclxuICAgICAgICAgICAgICAgIC8vIGxldCdzIGVuY29kZSBvdXJpcGFydC9mb3JtLWRhdGEgYm91bmRhcnkgd2UnbGwgdXNlXHJcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRhcnkgPSAnLS0tLVRoaXNJc1RoZUJvdW5kYXJ5MTIzNDU2Nzg5MCc7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm9ybURhdGEgPSAnLS0nICsgYm91bmRhcnkgKyAnXFxyXFxuJ1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gJ0NvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT1cInNvdXJjZVwiOyBmaWxlbmFtZT1cIicgKyBmaWxlbmFtZSArICdcIlxcclxcbic7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSArPSAnQ29udGVudC1UeXBlOiAnICsgbWltZVR5cGUgKyAnXFxyXFxuXFxyXFxuJztcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VEYXRhLmxlbmd0aDsgKytpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoaW1hZ2VEYXRhWyBpIF0gJiAweGZmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhICs9ICdcXHJcXG4nO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gJy0tJyArIGJvdW5kYXJ5ICsgJ1xcclxcbic7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YSArPSAnQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVwibWVzc2FnZVwiXFxyXFxuXFxyXFxuJztcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhICs9IG1lc3NhZ2UgKyAnXFxyXFxuJ1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgKz0gJy0tJyArIGJvdW5kYXJ5ICsgJy0tXFxyXFxuJztcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB4aHIub3BlbignUE9TVCcsICdodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbS9tZS9waG90b3M/YWNjZXNzX3Rva2VuPScgKyBhdXRoVG9rZW4sIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKGV2KXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cz09MjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFqYXguc3VjY2VzcykgYWpheC5zdWNjZXNzKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGU9PTQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWpheC5jb21wbGV0ZSkgYWpheC5jb21wbGV0ZSh4aHIucmVzcG9uc2VUZXh0KSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhamF4LmVycm9yKSBhamF4LmVycm9yKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcIm11bHRpcGFydC9mb3JtLWRhdGE7IGJvdW5kYXJ5PVwiICsgYm91bmRhcnkpO1xyXG4gICAgICAgICAgICAgICAgeGhyLnNlbmRBc0JpbmFyeShmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gdG9CS0dNU2NvcmUoZmJSZXNwb25zZSwgcmVxdWVzdFNjb3JlUGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBCS0dNLlNjb3JlKGZiUmVzcG9uc2UudXNlci5pZCwgZmJSZXNwb25zZS5zY29yZSwgZmJSZXNwb25zZS51c2VyLm5hbWUpO1xyXG4gICAgICAgIGlmIChyZXF1ZXN0U2NvcmVQYXJhbXMpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmxlYWRlcmJvYXJkSUQgPSByZXF1ZXN0U2NvcmVQYXJhbXMubGVhZGVyYm9hcmRJRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LmltYWdlVVJMID0gJ2h0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tLycgKyBmYlJlc3BvbnNlLnVzZXIuaWQgKyAnL3BpY3R1cmUnO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgQktHTS5GQkNvbm5lY3QgPSBmdW5jdGlvbigpeyAgICAgICAgXHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBCS0dNLkZCQ29ubmVjdC5wcm90b3R5cGU9IHtcclxuICAgICAgICBpbml0OmZ1bmN0aW9uKG9iaixjYWxsYmFjayl7XHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIHZhciBhcHBfaWQ9XCIyOTY2MzIxMzcxNTM0MzdcIjtcclxuICAgICAgICAgICAgaWYgKG9iail7XHJcbiAgICAgICAgICAgICAgICBhcHBfaWQ9b2JqLmFwcElkO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBpZighd2luZG93LkZCKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBCS0dNLl9pc0NvcmRvdmEgPyBGQi5pbml0KHsgYXBwSWQ6IGFwcF9pZCwgbmF0aXZlSW50ZXJmYWNlOiBDRFYuRkIsIHVzZUNhY2hlZERpYWxvZ3M6IGZhbHNlIH0pIDogRkIuaW5pdCh7IGFwcElkOiBhcHBfaWQsc3RhdHVzOiB0cnVlLHhmYm1sOiB0cnVlLGNvb2tpZTogdHJ1ZSxmcmljdGlvbmxlc3NSZXF1ZXN0czogdHJ1ZSxvYXV0aDogdHJ1ZX0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXBwX2lkPWFwcF9pZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRMZWFkZXJib2FyZHMgOiBmdW5jdGlvbihHYW1lLGxpbmsseCx5LHdpZHRoLGhlaWdodCxpc0Nsb3NlKXtcclxuICAgICAgICAgICAgdmFyIHNlbGY9dGhpcztcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmlmcmFtZS5zdHlsZS5iYWNrZ3JvdW5kY29sb3I9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuaWZyYW1lKTtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3JjPWxpbmt8fFwibGVhZGVyYm9hcmRzLmh0bWxcIjtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUud2lkdGg9XCIxMDAlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLmhlaWdodD1cIjEwMCVcIjtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5kaXNwbGF5PVwiaW5oZXJpdFwiO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS50b3A9KHl8fDApK1wicHhcIjtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3R5bGUubGVmdD0oeHx8MCkrXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5ib3JkZXI9XCJub25lXCI7XHJcbiAgICAgICAgICAgIGlmKGlzQ2xvc2UpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNsb3NlQnV0dG9uKTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5kaXNwbGF5PVwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLnBvc2l0aW9uPVwiZml4ZWRcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS53aWR0aD1cIjMwcHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5oZWlnaHQ9XCIzMHB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUubGluZUhlaWdodD1cIjMwcHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5ib3JkZXJSYWRpdXM9XCI0NXB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUudG9wPScxMHB4JztcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I9XCIjNDQ0NzUwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUuY29sb3I9XCIjZmFmYWZhXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUubGVmdD0od2luZG93LmlubmVyV2lkdGgtNTApKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUudGV4dEFsaWduPVwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUuZm9udFdlaWdodD1cImJvbGRcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS5mb250U2l6ZT1cIjMwcHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5zdHlsZS50ZXh0RGVjb3JhdGlvbj0gXCJub25lXCI7ICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUuY3Vyc29yPSBcInBvaW50ZXJcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5pbm5lckhUTUw9XCJYXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCdXR0b24uc3R5bGUub3BhY2l0eT0gLjg7IFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm9ubW91c2VvdmVyPWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlQnV0dG9uLnN0eWxlLm9wYWNpdHk9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5vbm1vdXNlb3V0PWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlQnV0dG9uLnN0eWxlLm9wYWNpdHk9IDAuODsgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLm9ubW91c2Vkb3duPWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlQnV0dG9uLnN0eWxlLm9wYWNpdHk9IDAuODsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5vbm1vdXNldXA9ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VCdXR0b24uc3R5bGUub3BhY2l0eT0gMTtcclxuICAgICAgICAgICAgICAgIGlmKHNlbGYuaGlkZUxlYWRlcmJvYXJkKSBzZWxmLmhpZGVMZWFkZXJib2FyZCgpO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBoYW5kbGVTdGF0dXNDaGFuZ2U6ZnVuY3Rpb24oc2Vzc2lvbikge1xyXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi5hdXRoUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICB2YXIgc3RyPVwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgeCBpbiBzZXNzaW9uLmF1dGhSZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cis9eDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoc3RyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9nb3V0OmZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIEZCLmxvZ291dChmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYoY2FsbGJhY2spIGNhbGxiYWNrKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgICAgICAgICAgICBcclxuICAgICAgICBsb2dpbjpmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBpZighd2luZG93LkZCKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2UpIHsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRkIubG9naW4oXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnNlc3Npb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2socmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IHNjb3BlOiBcInB1Ymxpc2hfYWN0aW9uc1wiIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBGQi5hcGkoJy9tZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICBzZWxmLmlkPXJlc3BvbnNlLmlkOyBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldExvZ2luU3RhdHVzOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBpZih3aW5kb3cuRkIpXHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gJ2Nvbm5lY3RlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9naW49dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuYXV0aFJlc3BvbnNlICYmIGNhbGxiYWNrKSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2socmVzcG9uc2UuYXV0aFJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9naW49ZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QXV0aFJlc3BvbnNlOiBmdW5jdGlvbihjYWxsYmFjazEpe1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBpZih3aW5kb3cuRkIpXHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gJ2Nvbm5lY3RlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuYXV0aFJlc3BvbnNlICYmIGNhbGxiYWNrMSkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrMShyZXNwb25zZS5hdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW4scmVzcG9uc2UuYXV0aFJlc3BvbnNlLnVzZXJJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvZ2luKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzcG9uc2UgJiYgcmVzcG9uc2UuYXV0aFJlc3BvbnNlKSB7YXV0aFJlc3BvbnNlPXJlc3BvbnNlLmF1dGhSZXNwb25zZTsgaWYgKGNhbGxiYWNrMSkgY2FsbGJhY2sxKGF1dGhSZXNwb25zZS5hY2Nlc3NUb2tlbixhdXRoUmVzcG9uc2UudXNlcklkKTt9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvc3RDYW52YXM6ZnVuY3Rpb24obWVzc2FnZSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRBdXRoUmVzcG9uc2UoZnVuY3Rpb24oYWNjZXNzX3Rva2VuLHVpZCl7XHJcbiAgICAgICAgICAgICAgICAvLyB2YXIgdWlkID0gYXV0aFJlc3BvbnNlLnVzZXJJRDtcclxuICAgICAgICAgICAgICAgIC8vIHZhciBhY2Nlc3NfdG9rZW4gPSBhdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlRGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVzcyA9bWVzc2FnZSB8fCBcImh0dHA6Ly9mYi5jb20vQktHYW1lTWFrZXIuY29tXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgZW5jb2RlZFBuZyA9IGltYWdlRGF0YS5zdWJzdHJpbmcoaW1hZ2VEYXRhLmluZGV4T2YoJywnKSsxLGltYWdlRGF0YS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlY29kZWRQbmcgPSBCYXNlNjRCaW5hcnkuZGVjb2RlKGVuY29kZWRQbmcpO1xyXG4gICAgICAgICAgICAgICAgUG9zdEltYWdlVG9GYWNlYm9vayhhY2Nlc3NfdG9rZW4sIFwiZmlsZW5hbWUucG5nXCIsICdpbWFnZS9wbmcnLCBkZWNvZGVkUG5nKTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXRTY29yZTpmdW5jdGlvbihzY29yZSxwYXJhbXMsY2FsbGJhY2spe1xyXG4gICAgICAgICAgICB0aGlzLmdldFNjb3JlKHBhcmFtcyxmdW5jdGlvbihjdXJyZW50U2NvcmUsIGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHRvcFNjb3JlID0gY3VycmVudFNjb3JlID8gY3VycmVudFNjb3JlLnNjb3JlIDogMDtcclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA8PSB0b3BTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZG9uJ3Qgc3VibWl0IHRoZSBuZXcgc2NvcmUgYmVjYXVzZSBhIGJldHRlciBzY29yZSBpcyBhbHJlYWR5IHN1Ym1pdHRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGFwaUNhbGwgPSBcIi9cIiArICgocGFyYW1zICYmIHBhcmFtcy51c2VySUQpID8gcGFyYW1zLnVzZXJJRCA6IFwibWVcIikgKyBcIi9zY29yZXNcIjtcclxuICAgICAgICAgICAgICAgIEZCLmFwaShhcGlDYWxsLCAnUE9TVCcsIHtzY29yZTpzY29yZX0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlLmVycm9yKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNjb3JlOiBmdW5jdGlvbihwYXJhbXMsY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYoIXdpbmRvdy5GQikgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgYXBpQ2FsbCA9ICgocGFyYW1zICYmIHBhcmFtcy51c2VySUQpID8gcGFyYW1zLnVzZXJJRCA6IFwibWVcIikgKyBcIi9zY29yZXNcIjtcclxuICAgICAgICAgICAgRkIuYXBpKGFwaUNhbGwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZS5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCS0dNLlNjb3JlKFwibWVcIiwwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlID0gdG9CS0dNU2NvcmUocmVzcG9uc2UuZGF0YVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2NvcmUsbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ObyBzY29yZSBoYXMgYmVlbiBzdWJtaXR0ZWQgeWV0IGZvciB0aGUgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCS0dNLlNjb3JlKFwibWVcIiwwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZUxlYWRlcmJvYXJkIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjtcclxuICAgICAgICAgICAgaWYodGhpcy5jbG9zZUJ1dHRvbil0aGlzLmNsb3NlQnV0dG9uLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93TGVhZGVyYm9hcmQgOiBmdW5jdGlvbihjYWxsYmFjaywgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHZhciBzZWxmPXRoaXM7XHJcbiAgICAgICAgICAgIHNlbGYuaWZyYW1lLnN0eWxlLmRpc3BsYXk9XCJpbmhlcml0XCI7XHJcbiAgICAgICAgICAgIGlmKHNlbGYuY2xvc2VCdXR0b24pc2VsZi5jbG9zZUJ1dHRvbi5zdHlsZS5kaXNwbGF5PVwiaW5oZXJpdFwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5nZXRBdXRoUmVzcG9uc2UoZnVuY3Rpb24oYWNjZXNzX3Rva2VuLHVpZCl7XHJcbiAgICAgICAgICAgICAgICBCS0dNLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDpcImh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL1wiK3NlbGYuYXBwX2lkICsgXCIvc2NvcmVzLz9hY2Nlc3NfdG9rZW49XCIgKyBhY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTonR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTpmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGlhbG9nLmNsb3NlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsYmFja1NlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlLmVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWFsb2cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSAmJiByZXNwb25zZS5kYXRhLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpPCByZXNwb25zZS5kYXRhLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjb3JlID0gdG9CS0dNU2NvcmUocmVzcG9uc2UuZGF0YVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUucG9zaXRpb24gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmltYWdlVVJMID0gXCJodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbS9cIiArIHNjb3JlLnVzZXJJRCArIFwiL3BpY3R1cmVcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZS5tZT1zY29yZS51c2VySUQ9PXNlbGYuaWQgPyBzY29yZS51c2VySUQgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNjb3JlLm1lID0gc2NvcmUudXNlcklEID09PSBtZS5mYi5fY3VycmVudFNlc3Npb24uYXV0aFJlc3BvbnNlLnVzZXJJRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZXMucHVzaChzY29yZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YXIganMgPSBcImFkZFNjb3JlcyhcIiArICArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmlmcmFtZS5jb250ZW50V2luZG93LmluaXRpYWxpemVWaWV3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaWZyYW1lLmNvbnRlbnRXaW5kb3cuYWRkU2NvcmVzKHNjb3Jlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWFsb2cuZXZhbChqcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7ICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICBcclxufSkoKTtcclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQktHTS5GQkNvbm5lY3QoKTsiLCJ3aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgfHwgXHJcbiAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcclxuICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8IFxyXG4gICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHwgXHJcbiAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fCBcclxuICAgICAgICBmdW5jdGlvbigvKiBmdW5jdGlvbiAqLyBjYWxsYmFjaywgLyogRE9NRWxlbWVudCAqLyBlbGVtZW50KXtcclxuICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xyXG4gICAgICAgIH07XHJcbn0pKCk7XHJcblxyXG5cclxudmFyIEJLR00gPSBCS0dNfHx7fTtcclxuXHJcbihmdW5jdGlvbigpe1xyXG4gICAgXHJcblxyXG4gICAgKCh0eXBlb2YoY29yZG92YSkgPT0gJ3VuZGVmaW5lZCcpICYmICh0eXBlb2YocGhvbmVnYXApID09ICd1bmRlZmluZWQnKSkgPyBCS0dNLl9pc0NvcmRvdmE9ZmFsc2UgOiBCS0dNLl9pc0NvcmRvdmE9dHJ1ZTtcclxuICAgIC8vIHZhciBsYXN0VGltZT0wO1xyXG4gICAgdmFyIHQgPSAwO1xyXG4gICAgdmFyIHNjZW5lVGltZSA9IDA7XHJcbiAgICB2YXIgZnJhbWVUaW1lPTEwMDAvNjA7XHJcbiAgICB2YXIgX3N0YXRlc0xvb3A9W107XHJcbiAgICB2YXIgX2NvdW50PVtdO1xyXG4gICAgXHJcbiAgICB2YXIgZGVidWc9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGRlYnVnLnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIjtcclxuICAgIGRlYnVnLnN0eWxlLmNvbG9yPVwicmVkXCI7XHJcbiAgICB2YXIgX0JLR01Mb29wO1xyXG4gICAgdmFyIGFkZExvb3AgPSBmdW5jdGlvbihfdGhpcyl7XHJcbiAgICAgICAgX0JLR01Mb29wPV90aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIHZhciB0aW1lPW5ldyBEYXRlKCk7XHJcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IF9zdGF0ZXNMb29wLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgLy8gICAgIHZhciBub3cgPW5ldyBEYXRlKCk7XHJcbiAgICAgICAgLy8gICAgIHZhciBkdCA9ICBub3cgLSBsYXN0VGltZTsvL0tob2FuZyB0aG9pIGdpYW4gZ2l1YSAyIGxhbiBjYXAgbmhhdFxyXG4gICAgICAgIC8vICAgICBsYXN0VGltZSA9IG5vdztcclxuICAgICAgICAvLyAgICAgdCArPSBkdCA7Ly9UaG9pIGdpYW4gZGVsYXkgZ2l1YSAyIGxhbiBjYXAgbmhhdFxyXG4gICAgICAgIC8vICAgICB3aGlsZSAodCA+PSBmcmFtZVRpbWUpIHsvL0NoYXkgY2hpIGtoaSB0aG9pIGdpYW4gZGVsYXkgZ2l1YSAyIGxhbiBsb24gaG9uIDEwbXNcclxuICAgICAgICAvLyAgICAgICAgIHQgLT0gZnJhbWVUaW1lOy8vRHVuZyBkZSB4YWMgZGluaCBzbyBidW9jJyB0aW5oIHRvYW5cclxuICAgICAgICAvLyAgICAgICAgIHNjZW5lVGltZSArPSBmcmFtZVRpbWU7XHJcbiAgICAgICAgLy8gICAgICAgICBfc3RhdGVzTG9vcFtpXS51cGRhdGUoX3N0YXRlc0xvb3BbaV0sIHNjZW5lVGltZSk7XHJcbiAgICAgICAgLy8gICAgICAgICBfc3RhdGVzTG9vcFtpXS50aW1lPXNjZW5lVGltZTtcclxuICAgICAgICAvLyAgICAgfSAgIFxyXG4gICAgICAgIC8vICAgICBfc3RhdGVzTG9vcFtpXS5sb29wKF9zdGF0ZXNMb29wW2ldKTtcclxuICAgICAgICAvLyB9O1xyXG4gICAgICAgIC8vIHZhciBfZHJhd3RpbWU9KG5ldyBEYXRlKCktIHRpbWUpO1xyXG4gICAgICAgIC8vIHZhciBkcmF3dGltZT0wO1xyXG4gICAgICAgIC8vIF9jb3VudC5wdXNoKF9kcmF3dGltZSk7XHJcbiAgICAgICAgLy8gZm9yICh2YXIgaSA9IF9jb3VudC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIC8vICAgICBkcmF3dGltZSs9X2NvdW50W2ldO1xyXG4gICAgICAgIC8vIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gaWYgKF9jb3VudC5sZW5ndGg+PTEwMCkge1xyXG4gICAgICAgIC8vICAgICBfY291bnQudW5zaGlmdCgpO1xyXG5cclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gaWYoZGVidWcgJiYgQktHTS5kZWJ1ZylkZWJ1Zy5pbm5lckhUTUw9XCJkcmF3IHRpbWU6IFwiKyhkcmF3dGltZS9fY291bnQubGVuZ3RoKjEwMD4+MCkvMTAwICtcIjwvYnI+IEZQUzogXCIrX3N0YXRlc0xvb3BbMF0uRlBTO1xyXG4gICAgICAgIEJLR00udGltZSA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGlmKF9CS0dNTG9vcCkgX0JLR01Mb29wLmxvb3AoX0JLR01Mb29wKTtcclxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF9sb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBCS0dNID0gZnVuY3Rpb24ob2JqKXtcclxuICAgICAgICB2YXIgX3RoaXM9dGhpcztcclxuICAgICAgICBfdGhpcy5ncmF2aXR5PXt4OjAseTowLHo6MH07XHJcbiAgICAgICAgQktHTS5TSU5HTEVfVE9VQ0g9MDtcclxuICAgICAgICBCS0dNLk1VTFRJX1RPVUNIPTE7XHJcbiAgICAgICAgQktHTS5UWVBFX1RPVUNIPUJLR00uU0lOR0xFX1RPVUNIO1xyXG5cclxuICAgICAgICBfdGhpcy5Db2RlYSA9IG9iai5Db2RlYTtcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmouRGV2aWNlTW90aW9uKVxyXG4gICAgICAgIGlmICgod2luZG93LkRldmljZU1vdGlvbkV2ZW50KSB8fCAoJ2xpc3RlbkZvckRldmljZU1vdmVtZW50JyBpbiB3aW5kb3cpKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCBmdW5jdGlvbihldmVudERhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55LzMseTpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54LzMsejpldmVudERhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihuYXZpZ2F0b3IgJiYgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyKXtcclxuICAgICAgICAgICAgICAgICAvLyBUaGUgd2F0Y2ggaWQgcmVmZXJlbmNlcyB0aGUgY3VycmVudCBgd2F0Y2hBY2NlbGVyYXRpb25gXHJcbiAgICAgICAgICAgICAgICB2YXIgd2F0Y2hJRCA9IG51bGw7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHdhdGNoaW5nIHRoZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdGFydFdhdGNoKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYWNjZWxlcmF0aW9uIGV2ZXJ5IDEwMDAvNjAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0geyBmcmVxdWVuY3k6IDEwMDAvNjAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2F0Y2hJRCA9IG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLndhdGNoQWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvciwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3RvcCB3YXRjaGluZyB0aGUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc3RvcFdhdGNoKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXRjaElEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5hY2NlbGVyb21ldGVyLmNsZWFyV2F0Y2god2F0Y2hJRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoSUQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGFjY2VsZXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmdyYXZpdHkgPSB7eDphY2NlbGVyYXRpb24ueC8zLHk6YWNjZWxlcmF0aW9uLnkvMyx6OmFjY2VsZXJhdGlvbi56fTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcigpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnb25FcnJvciEnKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzdGFydFdhdGNoKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBuYXZpZ2F0b3IuYWNjZWxlcm9tZXRlci5nZXRDdXJyZW50QWNjZWxlcmF0aW9uKG9uU3VjY2Vzcywgb25FcnJvcik7Ki9cclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5vdCBzdXBwb3J0ZWQgb24geW91ciBkZXZpY2Ugb3IgYnJvd3Nlci4gIFNvcnJ5LlwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZihvYmope1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwPW9iai5zZXR1cHx8dGhpcy5zZXR1cDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGU9b2JqLnVwZGF0ZXx8dGhpcy51cGRhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhdz1vYmouZHJhd3x8dGhpcy5kcmF3O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc291cmNlPXt9O1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdD1bXTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZVwiKSlcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVcIik7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiZ2FtZVwiKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoICA9IDMyMDtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gNjAwO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmNhbnZhcy53aWR0aCA9d2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSAgICAgICBcclxuICAgICAgICB0aGlzLndpZHRoPXRoaXMuY2FudmFzLndpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0PXRoaXMuY2FudmFzLmhlaWdodDtcclxuICAgICAgICB0aGlzLldJRFRIID0gdGhpcy5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgdGhpcy5IRUlHSFQgID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnNDBweCBTb3VyY2VTYW5zUHJvJztcclxuICAgICAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ2J1dHQnO1xyXG4gICAgICAgIHRoaXMuX2ZvbnRTaXplID0gNDA7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuX2NpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIC8vIHRoaXMuX2NpcmNsZS53aWR0aD0yMDA7XHJcbiAgICAgICAgLy8gdGhpcy5fY2lyY2xlLmhlaWdodD0yMDA7XHJcbiAgICAgICAgLy8gdmFyIF9jdHggPSB0aGlzLl9jaXJjbGUuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICAvLyBfY3R4LmFyYygxMDAsMTAwLDEwMCwwLE1hdGguUEkqMik7XHJcbiAgICAgICAgLy8gX2N0eC5maWxsU3R5bGU9JyNmZmYnO1xyXG4gICAgICAgIC8vIF9jdHguZmlsbCgpO1xyXG4gICAgICAgXHJcbiAgICAgICAgdGhpcy5fZnBzID0ge1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgOiAwLFxyXG4gICAgICAgICAgICBmcmFtZU51bWJlciA6IDAsXHJcbiAgICAgICAgICAgIGdldEZQUyA6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lTnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gKCBkIC0gdGhpcy5zdGFydFRpbWUgKSAvIDEwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gTWF0aC5mbG9vciggKCB0aGlzLmZyYW1lTnVtYmVyIC8gY3VycmVudFRpbWUgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBjdXJyZW50VGltZSA+IDEgKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL3RoaXMuY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtYXRvcCc7XHJcbiAgICAgICAgYWRkTW91c2VUb3VjaEV2ZW50KHRoaXMpO1xyXG4gICAgICAgIGFkZEtleUV2ZW50KHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgQktHTS5wcm90b3R5cGUgPSB7XHJcbiAgICAgICAgdGltZTowLFxyXG4gICAgICAgIFNDQUxFWDoxLFxyXG4gICAgICAgIFNDQUxFWToxLFxyXG4gICAgICAgIGxvb3A6ZnVuY3Rpb24oX3RoaXMpeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5GUFM9X3RoaXMuX2Zwcy5nZXRGUFMoKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgX3RoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCBfdGhpcy5jYW52YXMud2lkdGgsIF90aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICBfdGhpcy5fc3RhdGljRHJhdygpO1xyXG4gICAgICAgICAgICBfdGhpcy5kcmF3KF90aGlzKTsgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcnVuOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKEJLR00uZGVidWcpZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkZWJ1Zyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLlNDQUxFID0gTWF0aC5taW4odGhpcy5IRUlHSFQvNDAwLHRoaXMuV0lEVEgvNDAwKSA7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXAoKTtcclxuICAgICAgICAgICAgaWYodGhpcy5Db2RlYSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoMCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKDEsLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uX2lzQ29yZG92YSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlNDQUxFWCA9IHRoaXMuV0lEVEgvd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlNDQUxFWSA9IHRoaXMuSEVJR0hUL3dpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TQ0FMRVggPSB0aGlzLldJRFRIL3RoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TQ0FMRVkgPSB0aGlzLkhFSUdIVC90aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgLy8gbGFzdFRpbWU9bmV3IERhdGUoKTtcclxuICAgICAgICAgICAgYWRkTG9vcCh0aGlzKTtcclxuICAgICAgICAgICAgX2xvb3AoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXR1cDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYXc6ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfc3RhdGljRHJhdzpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmcpeyAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAncmdiKCcrdGhpcy5fYmcuUisnLCcrdGhpcy5fYmcuRysnLCcrdGhpcy5fYmcuQisnKSc7ICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYWNrZ3JvdW5kOmZ1bmN0aW9uKFIsIEcsIEIpe1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgucmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgXHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdyZ2IoJytSKycsJytHKycsJytCKycpJzsgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZpbGw6ZnVuY3Rpb24oUiwgRywgQiwgQSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGU9XCJyZ2JhKFwiK1IrXCIsIFwiK0crXCIsIFwiK0IrXCIsIFwiICsgKEEvMjU1KSArIFwiKVwiO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjdDpmdW5jdGlvbih4LCB5LCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgICAgICAgICAgaWYodGhpcy5fcmVjdE1vZGU9PT1cIkNFTlRFUlwiKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlY3QoeC13aWR0aC8yLCB5LWhlaWdodC8yLCB3aWR0aCwgaGVpZ2h0KTsgIFxyXG4gICAgICAgICAgICB9IGVsc2UgdGhpcy5jdHgucmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpOyAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjdE1vZGU6ZnVuY3Rpb24oSW5wdXQpe1xyXG4gICAgICAgICAgICB0aGlzLl9yZWN0TW9kZT1JbnB1dDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb250U2l6ZTogZnVuY3Rpb24oc2l6ZSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmZvbnQgPSBzaXplKydweCBTb3VyY2VTYW5zUHJvJztcclxuICAgICAgICAgICAgdGhpcy5fZm9udFNpemUgPSBzaXplO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRleHRBbGdpbjogZnVuY3Rpb24oYWxpZ24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gYWxpZ247XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGV4dDpmdW5jdGlvbiggc3RyaW5nLCB4LCB5LCBmb250U2l6ZSl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKDAsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKDEsLTEpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChzdHJpbmcsIHgsIHRoaXMuY2FudmFzLmhlaWdodC0oeS10aGlzLl9mb250U2l6ZS8yKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaXJjbGU6ZnVuY3Rpb24oIHgsIHksIGRpYW1ldGVyKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyh4LCB5LCBkaWFtZXRlci8yLCAwLCBNYXRoLlBJKjIsZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluZTpmdW5jdGlvbih4MSwgeTEsIHgyLCB5Mil7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbmVDYXBNb2RlOmZ1bmN0aW9uKGxpbmVNb2RlKXtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZUNhcCA9IGxpbmVNb2RlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZTpmdW5jdGlvbihSLCBHLCBCLCBBKXtcclxuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGU9XCJyZ2JhKFwiK1IrXCIsIFwiK0crXCIsIFwiK0IrXCIsIFwiICsgKEEvMjU1KSArIFwiKVwiO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0cm9rZVdpZHRoOiBmdW5jdGlvbih3aWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFJlczpmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlPXJlcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5wdXNoKGNoaWxkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVDaGlsZDpmdW5jdGlvbihjaGlsZCl7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW50TGlzdC5zcGxpY2UodGhpcy5jaGlsZHJlbnRMaXN0LmluZGV4T2YoY2hpbGQpLDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFN0YXRlczpmdW5jdGlvbihzdGF0ZXMpe1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlcz1zdGF0ZXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfc3dpcGU6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHZhciBzPXRoaXMuX3N0YXJ0V2lwZTtcclxuICAgICAgICAgICAgdmFyIHhfMT1zLngseV8xPXMueTtcclxuICAgICAgICAgICAgdmFyIHhfMj1lLngseV8yPWUueTtcclxuICAgICAgICAgICAgdmFyIGRlbHRhX3ggPSB4XzIgLSB4XzEsXHJcbiAgICAgICAgICAgIGRlbHRhX3kgPSB5XzIgLSB5XzE7XHJcbiAgICAgICAgICAgIHZhciB0aHJlYWRzb2xkPV9USFJFQURTT0xEKnRoaXMuU0NBTEU7XHJcbiAgICAgICAgICAgIGlmICggKGRlbHRhX3ggPCB0aHJlYWRzb2xkICYmIGRlbHRhX3ggPiAtdGhyZWFkc29sZCkgfHwgKGRlbHRhX3kgPCB0aHJlYWRzb2xkICYmIGRlbHRhX3kgPiAtdGhyZWFkc29sZCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGFuID0gTWF0aC5hYnMoZGVsdGFfeSAvIGRlbHRhX3gpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCAoIChkZWx0YV95ID4gMCA/IDEgOiAyKSArIChkZWx0YV94ID4gMCA/IDAgOiAyKSApICogKHRhbiA+IDE/IDEgOiAtMSkgKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgIDE6IC8vcG9zaXRpb24uVE9QX1JJR0hUOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAgMzogLy9wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdET1dOJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgLTE6IC8vLXBvc2l0aW9uLlRPUF9SSUdIVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTI6IC8vLXBvc2l0aW9uLkJPVFRPTV9SSUdIVDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXBlKCdSSUdIVCcpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIC0zOiAvLy1wb3NpdGlvbi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgIGNhc2UgLTQ6IC8vLXBvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ0xFRlQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgMjogLy9wb3NpdGlvbi5CT1RUT01fUklHSFQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlICA0OiAvL3Bvc2l0aW9uLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpcGUoJ1VQJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoU3RhcnQ6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hTdGFydCkgdGhpcy50b3VjaFN0YXJ0KGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX3RvdWNoRW5kOmZ1bmN0aW9uKGUpe1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5zd2lwZSAmJiBCS0dNLlRZUEVfVE9VQ0g9PUJLR00uU0lOR0xFX1RPVUNIKSB0aGlzLl9zd2lwZShlKTtcclxuICAgICAgICAgICAgaWYodGhpcy50b3VjaEVuZCkgdGhpcy50b3VjaEVuZChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF90b3VjaERyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudG91Y2hEcmFnKSB0aGlzLnRvdWNoRHJhZyhlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURvd246ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3dpcGUgJiYgQktHTS5UWVBFX1RPVUNIPT1CS0dNLlNJTkdMRV9UT1VDSCkgdGhpcy5fc3RhcnRXaXBlPWU7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEb3duKSB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZVVwOmZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBpZih0aGlzLnN3aXBlICYmIEJLR00uVFlQRV9UT1VDSD09QktHTS5TSU5HTEVfVE9VQ0gpIHRoaXMuX3N3aXBlKGUpO1xyXG4gICAgICAgICAgICBpZih0aGlzLm1vdXNlVXApIHRoaXMubW91c2VVcChlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIF9tb3VzZURyYWc6ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMubW91c2VEcmFnKSB0aGlzLm1vdXNlRHJhZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgdmFyIF9USFJFQURTT0xEID0gMjsgLy9waXhlbHNcclxuICAgIHZhciBjaGVja01vdXNlUG9zPWZ1bmN0aW9uKGUsX3RoaXMpe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIHZhciB5O1xyXG4gICAgICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHsgXHJcbiAgICAgICAgICB4ID0gZS5wYWdlWDtcclxuICAgICAgICAgIHkgPSBlLnBhZ2VZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgXHJcbiAgICAgICAgICB4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0ICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7IFxyXG4gICAgICAgICAgeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDsgXHJcbiAgICAgICAgfSBcclxuICAgICAgICB4IC09IF90aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIHkgLT0gX3RoaXMuY2FudmFzLm9mZnNldFRvcDtcclxuICAgICAgICB4Kj1fdGhpcy5TQ0FMRVg7XHJcbiAgICAgICAgeSo9X3RoaXMuU0NBTEVZO1xyXG4gICAgICAgIGlmKF90aGlzLkNvZGVhKXtcclxuICAgICAgICAgICAgeT1fdGhpcy5IRUlHSFQteTsgICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHt4OngseTp5LG51bWJlcjplLmlkZW50aWZpZXJ9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBhZGRNb3VzZVRvdWNoRXZlbnQ9IGZ1bmN0aW9uKF90aGlzKXtcclxuICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2g9eyBzdGF0ZTpcIkVOREVEXCIgLHBvc1g6MCxwb3NZOjAsaXNUb3VjaDpmYWxzZX07XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pc3RvdWNoPXRydWU7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciB0b3VjaHM9W107XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uU0lOR0xFX1RPVUNIKVxyXG4gICAgICAgICAgICAgICAgaWYgKCghd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkICYmIGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSkgfHxcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldFRvdWNoZXMgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gSWdub3JlIGlmIHRvdWNoaW5nIHdpdGggbW9yZSB0aGFuIDEgZmluZ2VyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT09QktHTS5TSU5HTEVfVE9VQ0gpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3ModG91Y2gsX3RoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIlNUQVJUXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9dHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5zdGF0ZXMgJiYgX3RoaXMuc3RhdGVzLl90b3VjaFN0YXJ0KSBfdGhpcy5zdGF0ZXMuX3RvdWNoU3RhcnQoZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hTdGFydCkgX3RoaXMuX3RvdWNoU3RhcnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnBvc1g9ZS54O1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5wb3NZPWUueTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LnRvdWNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKHRvdWNoLF90aGlzKTtcclxuICAgICAgICAgICAgICAgIHRvdWNocy5wdXNoKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uTVVMVElfVE9VQ0gpe1xyXG4gICAgICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy5fdG91Y2hTdGFydCkgX3RoaXMuc3RhdGVzLl90b3VjaFN0YXJ0KHRvdWNocyk7IGVsc2VcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLl90b3VjaFN0YXJ0KSBfdGhpcy5fdG91Y2hTdGFydCh0b3VjaHMpOyAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZm9yICh2YXIgaiA9IF90aGlzLmNoaWxkcmVudExpc3QubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuICAgICAgICAgICAgLy8gICAgIGlmKF90aGlzLmNoaWxkcmVudExpc3Rbal0uX2V2ZW50ZW5hYmxlICYmY2hlY2tFdmVudEFjdG9yKCBlLF90aGlzLmNoaWxkcmVudExpc3Rbal0pKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgaWYoX3RoaXMuY2hpbGRyZW50TGlzdFtqXS50b3VjaFN0YXJ0KSBfdGhpcy5jaGlsZHJlbnRMaXN0W2pdLnRvdWNoU3RhcnQoZSlcclxuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRvdWNoKVxyXG4gICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICBcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgX3RoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciB0b3VjaHM9W107XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PUJLR00uU0lOR0xFX1RPVUNIICYmIHRvdWNoLmlkZW50aWZpZXI9PTApIHsgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiTU9WSU5HXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hEcmFnKSBfdGhpcy5fdG91Y2hEcmFnKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRvdWNocy5wdXNoKGUpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoQktHTS5UWVBFX1RPVUNIPT1CS0dNLk1VTFRJX1RPVUNIKXtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLl90b3VjaERyYWcpIF90aGlzLl90b3VjaERyYWcodG91Y2hzKTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdG91Y2hzPVtdO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PT1CS0dNLlNJTkdMRV9UT1VDSClcclxuICAgICAgICAgICAgICAgIGlmICgoIXdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCAmJiBldmVudC50b3VjaGVzLmxlbmd0aCA+IDApIHx8XHJcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXRUb3VjaGVzID4gMCkge1xyXG4gICAgICAgICAgICAgIHJldHVybjsgLy8gSWdub3JlIGlmIHN0aWxsIHRvdWNoaW5nIHdpdGggb25lIG9yIG1vcmUgZmluZ2Vyc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKEJLR00uVFlQRV9UT1VDSD09PUJLR00uU0lOR0xFX1RPVUNIKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZT17eDpfdGhpcy5jdXJyZW50VG91Y2gucG9zWCx5Ol90aGlzLmN1cnJlbnRUb3VjaC5wb3NZfTtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMudG91Y2hFbmQpIF90aGlzLnN0YXRlcy5fdG91Y2hFbmQoZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fdG91Y2hFbmQpIF90aGlzLl90b3VjaEVuZChlKTsgXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PT1CS0dNLlNJTkdMRV9UT1VDSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuX2lzdG91Y2g9ZmFsc2U7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codG91Y2gpICBcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTsgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGU9Y2hlY2tNb3VzZVBvcyh0b3VjaCxfdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9ZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy50b3VjaEVuZCkgX3RoaXMuc3RhdGVzLl90b3VjaEVuZChlKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF90aGlzLl90b3VjaEVuZCkgX3RoaXMuX3RvdWNoRW5kKGUpOyBcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldOyBcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRvdWNoKSAgXHJcbiAgICAgICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKHRvdWNoLF90aGlzKTtcclxuICAgICAgICAgICAgICAgIHRvdWNocy5wdXNoKGUpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihCS0dNLlRZUEVfVE9VQ0g9PT1CS0dNLk1VTFRJX1RPVUNIKXtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMudG91Y2hFbmQpIF90aGlzLnN0YXRlcy5fdG91Y2hFbmQodG91Y2hzKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgaWYoX3RoaXMuX3RvdWNoRW5kKSBfdGhpcy5fdG91Y2hFbmQodG91Y2hzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgIFxyXG4gICAgICAgXHJcbiAgICAgICBcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKF90aGlzLl9pc3RvdWNoKSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBlPWNoZWNrTW91c2VQb3MoZXZlbnQsX3RoaXMpO1xyXG4gICAgICAgICAgICBfdGhpcy5faXNtb3VzZURvd249dHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnN0YXRlPVwiU1RBUlRcIjtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLmlzVG91Y2g9dHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC55ID0gZS55O1xyXG4gICAgICAgICAgICAvLyBmb3IgKHZhciBpID0gX3RoaXMuY2hpbGRyZW50TGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAvLyAgICAgaWYoX3RoaXMuY2hpbGRyZW50TGlzdFtpXS5fZXZlbnRlbmFibGUgJiZjaGVja0V2ZW50QWN0b3IoIGUsX3RoaXMuY2hpbGRyZW50TGlzdFtpXSkpIHtcclxuICAgICAgICAgICAgLy8gICAgICAgICBfdGhpcy5jaGlsZHJlbnRMaXN0W2ldLm1vdXNlRG93bihlKVxyXG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgLy8gfTtcclxuICAgICAgICAgICAgaWYoX3RoaXMuc3RhdGVzICYmIF90aGlzLnN0YXRlcy5fbW91c2VEb3duKSBfdGhpcy5zdGF0ZXMuX21vdXNlRG93bihlKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF90aGlzLl9tb3VzZURvd24pIF90aGlzLl9tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIF90aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIGlmKF90aGlzLl9pc21vdXNlRG93bil7XHJcbiAgICAgICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKGV2ZW50LF90aGlzKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIk1PVklOR1wiO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnggPSBlLng7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueSA9IGUueTtcclxuICAgICAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX21vdXNlRHJhZykgX3RoaXMuc3RhdGVzLl9tb3VzZURyYWcoZSk7IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpZihfdGhpcy5fbW91c2VEcmFnKSBfdGhpcy5fbW91c2VEcmFnKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICBfdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChfdGhpcy5faXN0b3VjaCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgZT1jaGVja01vdXNlUG9zKGV2ZW50LF90aGlzKTtcclxuICAgICAgICAgICAgX3RoaXMuX2lzbW91c2VEb3duPWZhbHNlO1xyXG4gICAgICAgICAgICBfdGhpcy5jdXJyZW50VG91Y2gueCA9IGUueDtcclxuICAgICAgICAgICAgX3RoaXMuY3VycmVudFRvdWNoLnkgPSBlLnk7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5zdGF0ZT1cIkVOREVEXCI7XHJcbiAgICAgICAgICAgIF90aGlzLmN1cnJlbnRUb3VjaC5pc1RvdWNoPWZhbHNlO1xyXG4gICAgICAgICAgICAvLyBmb3IgKHZhciBpID0gX3RoaXMuY2hpbGRyZW50TGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAvLyAgICAgaWYoX3RoaXMuY2hpbGRyZW50TGlzdFtpXS5fZXZlbnRlbmFibGUgJiZjaGVja0V2ZW50QWN0b3IoIGUsX3RoaXMuY2hpbGRyZW50TGlzdFtpXSkpIHtcclxuICAgICAgICAgICAgLy8gICAgICAgICBfdGhpcy5jaGlsZHJlbnRMaXN0W2ldLm1vdXNlVXAoZSlcclxuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgIC8vIH07XHJcbiAgICAgICAgICAgIGlmKF90aGlzLnN0YXRlcyAmJiBfdGhpcy5zdGF0ZXMuX21vdXNlVXApIF90aGlzLnN0YXRlcy5fbW91c2VVcChlKTsgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKF90aGlzLl9tb3VzZVVwKSBfdGhpcy5fbW91c2VVcChlKTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICB2YXIgYWRkS2V5RXZlbnQ9ZnVuY3Rpb24oX3RoaXMpe1xyXG4gICAgICAgIEJLR00uS0VZUyA9IHtcclxuXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRU5URVI6MTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQkFDS1NQQUNFOjgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gVEFCOjksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0hJRlQ6MTYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQ1RSTDoxNyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBBTFQ6MTgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUEFVU0U6MTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQ0FQU0xPQ0s6MjAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRVNDQVBFOjI3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFBBR0VVUDozMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBQQUdFRE9XTjozNCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBFTkQ6MzUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gSE9NRTozNixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBMRUZUOjM3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFVQOjM4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFJJR0hUOjM5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIERPV046NDAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gSU5TRVJUOjQ1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIERFTEVURTo0NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyAwOjQ4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDE6NDksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gMjo1MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyAzOjUxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDQ6NTIsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gNTo1MyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA2OjU0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIDc6NTUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gODo1NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyA5OjU3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGE6NjUsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gYjo2NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBjOjY3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGQ6NjgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gZTo2OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBmOjcwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGc6NzEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gaDo3MixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBpOjczLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIGo6NzQsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gazo3NSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBsOjc2LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIG06NzcsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gbjo3OCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBvOjc5LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHA6ODAsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gcTo4MSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyByOjgyLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHM6ODMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gdDo4NCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB1Ojg1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHY6ODYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gdzo4NyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyB4Ojg4LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIHk6ODksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gejo5MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTRUxFQ1Q6OTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNUEFEMDo5NixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQxOjk3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTVBBRDI6OTgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gTlVNUEFEMzo5OSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ0OjEwMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ1OjEwMSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ2OjEwMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ3OjEwMyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ4OjEwNCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBOVU1QQUQ5OjEwNSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBNVUxUSVBMWToxMDYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQUREOjEwNyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBTVUJUUkFDVDoxMDksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gREVDSU1BTFBPSU5UOjExMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBESVZJREU6MTExLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYxOjExMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMjoxMTMsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjM6MTE0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY0OjExNSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGNToxMTYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjY6MTE3LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEY3OjExOCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGODoxMTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjk6MTIwLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEYxMDoxMjEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRjExOjEyMixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGMTI6MTIzLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIE5VTUxPQ0s6MTQ0LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNDUk9MTExPQ0s6MTQ1LFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIFNFTUlDT0xPTjoxODYsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gRVFVQUxTSUdOOjE4NyxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDT01NQToxODgsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gREFTSDoxODksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gUEVSSU9EOjE5MCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBGT1JXQVJEU0xBU0g6MTkxLFxyXG4gICAgICAgICAgICAvKiogQGNvbnN0ICovIEdSQVZFQUNDRU5UOjE5MixcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBPUEVOQlJBQ0tFVDoyMTksXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gQkFDS1NMQVNIOjIyMCxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBDTE9TRUJSQUtFVDoyMjEsXHJcbiAgICAgICAgICAgIC8qKiBAY29uc3QgKi8gU0lOR0xFUVVPVEU6MjIyXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQGRlcHJlY2F0ZWRcclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJLR00uS2V5cz0gQktHTS5LRVlTO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTaGlmdCBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5TSElGVF9LRVk9ICAgIDE2O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb250cm9sIGtleSBjb2RlXHJcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCS0dNLkNPTlRST0xfS0VZPSAgMTc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsdCBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5BTFRfS0VZPSAgICAgIDE4O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbnRlciBrZXkgY29kZVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQktHTS5FTlRFUl9LRVk9ICAgIDEzO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFdmVudCBtb2RpZmllcnMuXHJcbiAgICAgICAgICogQHR5cGUgZW51bVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJLR00uS0VZX01PRElGSUVSUz0ge1xyXG5cclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBhbHQ6ICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBjb250cm9sOiAgICBmYWxzZSxcclxuICAgICAgICAgICAgLyoqIEBjb25zdCAqLyBzaGlmdDogICAgICBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBfdGhpcy5fa2V5RG93bj10cnVlO1xyXG4gICAgICAgICAgICBpZihfdGhpcy5rZXlEb3duKSBfdGhpcy5rZXlEb3duKGV2ZW50KTtcclxuICAgICAgICB9LGZhbHNlKVxyXG4gICAgfVxyXG59KSgpO1xyXG4oZnVuY3Rpb24oKXtcclxuICAgIC8vIHZhciBCS0dNID0gQktHTXx8e307XHJcbiAgICAvLyB2YXIgczEgPSBuZXcgQktHTS5BdWRpbygpLnNldEF1ZGlvKCcxJyk7XHJcbiAgICBmdW5jdGlvbiBnZXRQaG9uZUdhcFBhdGgoKSB7XHJcblxyXG4gICAgICAgIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnN0ciggcGF0aCwgcGF0aC5sZW5ndGggLSAxMCApO1xyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG5cclxuICAgIH07XHJcbiAgICBCS0dNLkF1ZGlvID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIEJLR00uQXVkaW8ucHJvdG90eXBlPSB7XHJcblxyXG4gICAgICAgIGF1ZGlvICAgOiBudWxsLFxyXG5cclxuICAgICAgICBzZXRBdWRpbyA6IGZ1bmN0aW9uKCBuYW1lICxjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICBpZihCS0dNLl9pc0NvcmRvdmEpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcmMgPSBnZXRQaG9uZUdhcFBhdGgoKSArIFwiL1wiICsgbmFtZTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayAmJiAhc2VsZi5jYWxsKSB7Y2FsbGJhY2soKTtzZWxmLmNhbGw9MTt9XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvPSBuZXcgQXVkaW8obmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLnByZWxvYWQgPSAnYXV0byc7XHJcbiAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBmdW5jdGlvbigpIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudFRpbWU9MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5lbmRlZCkgc2VsZi5lbmRlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBmdW5jdGlvbigpIHsgXHJcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9vbmxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayAmJiAhc2VsZi5jYWxsKSB7Y2FsbGJhY2soKTtzZWxmLmNhbGw9MTt9XHJcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbG9vcCA6IGZ1bmN0aW9uKCBsb29wICkge1xyXG4gICAgICAgICAgICB0aGlzLl9sb29wPWxvb3A7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yY2VwbGF5OmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKEJLR00uX2lzQ29yZG92YSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3JjPXRoaXMuc3JjO1xyXG4gICAgICAgICAgICAgICAgLy8gdmFyIHNyYz0naHR0cDovL3N0YXRpYy53ZWFyZXN3b29wLmNvbS9hdWRpby9jaGFybGVzdG93bi90cmFja18xLm1wMyc7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIE1lZGlhIG9iamVjdCBmcm9tIHNyY1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuYXVkaW8pdGhpcy5hdWRpbyA9IG5ldyBNZWRpYShzcmMsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9vbmxvYWQoKTtcclxuICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKXt9KTtcclxuICAgICAgICAgICAgICAgIC8vIFBsYXkgYXVkaW9cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGxheSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGF1c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy90aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmF1ZGlvKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdG9wIDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoQktHTS5faXNDb3Jkb3ZhICYmIHRoaXMuYXVkaW8pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uc3RvcCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8uY3VycmVudFRpbWU9MDtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgfSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZGVkOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX29ubG9hZDpmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBCS0dNLmxvYWRKUz1mdW5jdGlvbih1cmwsY2FsbGJhY2spe1xyXG4gICAgICAgIC8vIEFkZGluZyB0aGUgc2NyaXB0IHRhZyB0byB0aGUgaGVhZCBhcyBzdWdnZXN0ZWQgYmVmb3JlXHJcbiAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xyXG4gICAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xyXG4gICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XHJcblxyXG4gICAgICAgIC8vIFRoZW4gYmluZCB0aGUgZXZlbnQgdG8gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxyXG4gICAgICAgIC8vIFRoZXJlIGFyZSBzZXZlcmFsIGV2ZW50cyBmb3IgY3Jvc3MgYnJvd3NlciBjb21wYXRpYmlsaXR5LlxyXG4gICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBjYWxsYmFjaztcclxuICAgICAgICBzY3JpcHQub25sb2FkID0gY2FsbGJhY2s7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgdGhlIGxvYWRpbmdcclxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICB9O1xyXG4gICAgQktHTS5jaGVja01vdXNlQm94PWZ1bmN0aW9uKGUsb2JqKXsgICAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIChlLng+b2JqLngmJmUueT5vYmoueSYmZS54PChvYmoueCtvYmoudykmJmUueTwob2JqLnkrb2JqLmgpKTtcclxuICAgIH07XHJcbiAgICBCS0dNLmNoZWNrRXZlbnRBY3Rvcj1mdW5jdGlvbihlLF9hY3Rvcil7XHJcbiAgICAgICAgdmFyIG9yaWdpblg9X2FjdG9yLngsb3JpZ2luWT1fYWN0b3IueTtcclxuICAgICAgICB2YXIgbW91c2VYPWUueCxtb3VzZVk9ZS55O1xyXG4gICAgICAgIHZhciBkeCA9IG1vdXNlWCAtIG9yaWdpblgsIGR5ID0gbW91c2VZIC0gb3JpZ2luWTtcclxuICAgICAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBwb2ludCBhbmQgdGhlIGNlbnRlciBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAgICAgICAgdmFyIGgxID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpO1xyXG4gICAgICAgIHZhciBjdXJyQSA9IE1hdGguYXRhbjIoZHksZHgpO1xyXG4gICAgICAgIC8vIEFuZ2xlIG9mIHBvaW50IHJvdGF0ZWQgYXJvdW5kIG9yaWdpbiBvZiByZWN0YW5nbGUgaW4gb3Bwb3NpdGlvblxyXG4gICAgICAgIHZhciBuZXdBID0gY3VyckEgLSBfYWN0b3Iucm90YXRpb247XHJcbiAgICAgICAgLy8gTmV3IHBvc2l0aW9uIG9mIG1vdXNlIHBvaW50IHdoZW4gcm90YXRlZFxyXG4gICAgICAgIHZhciB4MiA9IE1hdGguY29zKG5ld0EpICogaDE7XHJcbiAgICAgICAgdmFyIHkyID0gTWF0aC5zaW4obmV3QSkgKiBoMTtcclxuICAgICAgICAvLyBDaGVjayByZWxhdGl2ZSB0byBjZW50ZXIgb2YgcmVjdGFuZ2xlXHJcbiAgICAgICAgaWYgKHgyID4gLTAuNSAqIF9hY3Rvci53aWR0aCAmJiB4MiA8IDAuNSAqIF9hY3Rvci53aWR0aCAmJiB5MiA+IC0wLjUgKiBfYWN0b3IuaGVpZ2h0ICYmIHkyIDwgMC41ICogX2FjdG9yLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBCS0dNLmFqYXggPSBmdW5jdGlvbihvYmope1xyXG4gICAgICAgIHZhciBhamF4ID0ge1xyXG4gICAgICAgICAgICB1cmw6b2JqLnVybCA/IG9iai51cmwgOlwiXCIsIC8vdXJsXHJcbiAgICAgICAgICAgIHR5cGU6b2JqLnR5cGUgPyBvYmoudHlwZSA6IFwiUE9TVFwiLC8vIFBPU1Qgb3IgR0VUXHJcbiAgICAgICAgICAgIGRhdGE6b2JqLmRhdGEgPyBvYmouZGF0YSA6IG51bGwsXHJcbiAgICAgICAgICAgIC8vIHByb2Nlc3NEYXRhOm9iai5wcm9jZXNzRGF0YSA/IG9iai5wcm9jZXNzRGF0YSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAvLyBjb250ZW50VHlwZTpvYmouY29udGVudFR5cGUgPyBvYmouY29udGVudFR5cGUgOmZhbHNlLFxyXG4gICAgICAgICAgICAvLyBjYWNoZTogb2JqLmNhY2hlID8gb2JqLmNhY2hlIDogdHJ1ZSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb2JqLnN1Y2Nlc3MgPyBvYmouc3VjY2VzcyA6IG51bGwsXHJcbiAgICAgICAgICAgIGVycm9yOiBvYmouZXJyb3IgPyBvYmouZXJyb3IgOiBudWxsLFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogb2JqLmNvbXBsZXRlID8gb2JqLmNvbXBsZXRlIDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgLy8geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygoZXYubG9hZGVkL2V2LnRvdGFsKSsnJScpO1xyXG4gICAgICAgIC8vIH0sIGZhbHNlKTtcclxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZXYpe1xyXG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cz09MjAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZihhamF4LnN1Y2Nlc3MpIGFqYXguc3VjY2Vzcyh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZT09NClcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWpheC5jb21wbGV0ZSkgYWpheC5jb21wbGV0ZSh4aHIucmVzcG9uc2VUZXh0KSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFqYXguZXJyb3IpIGFqYXguZXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcclxuICAgICAgICB9O1xyXG4gICAgICAgIHhoci5vcGVuKGFqYXgudHlwZSwgYWpheC51cmwsIHRydWUpO1xyXG4gICAgICAgIHhoci5zZW5kKGFqYXguZGF0YSk7XHJcbiAgICB9XHJcbn0pKCk7XHJcbihmdW5jdGlvbigpe1xyXG4gICAgQktHTS5wcmVsb2FkPWZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy5hdWRpb3M9e307XHJcbiAgICAgICAgdGhpcy5pbWFnZXM9e307XHJcbiAgICAgICAgdGhpcy5fbWF4RWxlbWVudExvYWQ9MDtcclxuICAgICAgICB0aGlzLl9lbGVtZW50TG9hZGVkPTA7XHJcbiAgICB9O1xyXG4gICAgQktHTS5wcmVsb2FkLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKHR5cGUsbmFtZSx1cmwsY2FsbGJhY2spe1xyXG4gICAgICAgICAgICB2YXIgc2VsZj10aGlzO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXhFbGVtZW50TG9hZCsrO1xyXG4gICAgICAgICAgICBpZiAodHlwZT09PVwiaW1hZ2VcIil7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2U9bmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmM9dXJsO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbWFnZXNbbmFtZV09aW1hZ2U7XHJcbiAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQ9ZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fb25sb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICAgIGlmKHR5cGU9PT1cImF1ZGlvXCIpe1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgYXVkaW89bmV3IEJLR00uQXVkaW8oKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLnNldEF1ZGlvKHVybCxmdW5jdGlvbigpe3NlbGYuX29ubG9hZCgpfSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmF1ZGlvc1tuYW1lXT1hdWRpbztcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICBCS0dNLnByZWxvYWQucHJvdG90eXBlLl9vbmxvYWQ9ZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdGhpcy5fZWxlbWVudExvYWRlZCsrO1xyXG4gICAgICAgIGlmKHRoaXMuX21heEVsZW1lbnRMb2FkPD10aGlzLl9lbGVtZW50TG9hZGVkKVxyXG4gICAgICAgICAgICB0aGlzLm9ubG9hZEFsbCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgQktHTS5wcmVsb2FkLnByb3RvdHlwZS5vbmxvYWRBbGw9ZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcbiAgICBCS0dNLlNjb3JlID0gZnVuY3Rpb24odXNlcklELCBzY29yZSwgdXNlck5hbWUsIGltYWdlVVJMLCBsZWFkZXJib2FyZElEKXtcclxuICAgICAgICB0aGlzLnVzZXJJRCA9IHVzZXJJRDtcclxuICAgICAgICB0aGlzLnNjb3JlID0gc2NvcmUgfHwgMDtcclxuICAgICAgICB0aGlzLnVzZXJOYW1lID0gdXNlck5hbWU7XHJcbiAgICAgICAgdGhpcy5pbWFnZVVSTCA9IGltYWdlVVJMO1xyXG4gICAgICAgIHRoaXMubGVhZGVyYm9hcmRJRCA9IGxlYWRlcmJvYXJkSUQ7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgQktHTS5TY29yZUxvY2FsPWZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgIHRoaXMubmFtZT1uYW1lO1xyXG4gICAgfVxyXG4gICAgQktHTS5TY29yZUxvY2FsLnByb3RvdHlwZT17XHJcbiAgICAgICAgc3VibWl0U2NvcmU6ZnVuY3Rpb24oc2NvcmUsdXNlcklEKXtcclxuICAgICAgICAgICAgaWYoIWxvY2FsU3RvcmFnZSkgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLm5hbWU7XHJcbiAgICAgICAgICAgIHZhciBzY29yZUl0ZW0gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkJLR00uXCIrbmFtZStcIi5zY29yZVwiKTtcclxuICAgICAgICAgICAgdmFyIHRvcFNjb3JlID0gcGFyc2VJbnQoc2NvcmVJdGVtKSB8fCAwO1xyXG4gICAgICAgICAgICBpZihzY29yZT50b3BTY29yZSlcclxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiQktHTS5cIituYW1lK1wiLnNjb3JlXCIsc2NvcmUpO1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNjb3JlOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKGxvY2FsU3RvcmFnZSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMubmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciBzY29yZUl0ZW0gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkJLR00uXCIrbmFtZStcIi5zY29yZVwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBzY29yZSA9IHBhcnNlSW50KHNjb3JlSXRlbSkgfHwgMDtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJLR00uU2NvcmUoXCJtZVwiLCBzY29yZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJLR00uU2NvcmUoXCJtZVwiLCAwKTs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgXHJcblxyXG4gICAgfVxyXG4gICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgXHJcbn0pKCk7XHJcbihmdW5jdGlvbigpe1xyXG4gICAgQktHTS5BZHM9ZnVuY3Rpb24oYWR1bml0KXtcclxuICAgICAgICB0aGlzLmFkdW5pdD1hZHVuaXQ7XHJcbiAgICAgICAgbW9wdWJfYWRfdW5pdCA9IGFkdW5pdDtcclxuICAgICAgICBtb3B1Yl9hZF93aWR0aCA9IHRoaXMud2lkdGg7IC8vIG9wdGlvbmFsXHJcbiAgICAgICAgbW9wdWJfYWRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7IC8vIG9wdGlvbmFsXHJcbiAgICB9XHJcbiAgICBCS0dNLkFkcy5wcm90b3R5cGU9e1xyXG4gICAgICAgIHdpZHRoOjMyMCxcclxuICAgICAgICBoZWlnaHQ6NTAsXHJcbiAgICAgICAgaW5pdDpmdW5jdGlvbihhZHVuaXQpe1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNpemU6ZnVuY3Rpb24odyxoKXtcclxuICAgICAgICAgICAgdGhpcy53aWR0aD13O1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodD1oO1xyXG4gICAgICAgICAgICBtb3B1Yl9hZF93aWR0aCA9IHRoaXMud2lkdGg7IC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgIG1vcHViX2FkX2hlaWdodCA9IHRoaXMuaGVpZ2h0OyAvLyBvcHRpb25hbFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEtleXdvcmQ6ZnVuY3Rpb24oYXJyKXtcclxuICAgICAgICAgICAgdGhpcy5rZXk9YXJyO1xyXG4gICAgICAgICAgICBtb3B1Yl9rZXl3b3JkcyA9IGFycjsgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgICAgIFxyXG59KSgpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCS0dNO1xyXG4iLCJ2YXIgc2V0ID0ge1xyXG5cdCdJUEFEJyAgICA6IDc2OCxcclxuXHQnSVBIT05FJyAgOiAzMjBcclxufTtcclxuXHJcbnZhciBzY3JlZW5zZXQgPSBmdW5jdGlvbihnYW1lLCBvcHQpe1xyXG5cdGZvciAodmFyIHdpZHRoIGluIG9wdCkge1xyXG5cdFx0XHJcblx0XHRpZiAoc2V0W3dpZHRoXSA9PT0gZ2FtZS5XSURUSCkge1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gb3B0W3dpZHRoXTtcclxuXHRcdFx0aWYgKCB0eXBlb2YgcmVzdWx0ID09PSBcImZ1bmN0aW9uXCIgKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3VsdCgpO1xyXG5cdFx0XHR9IGVsc2UgcmV0dXJuIHJlc3VsdDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHRcdFxyXG5cdH1cclxuXHRyZXR1cm4gb3B0WydERUZBVUxUJ107XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2NyZWVuc2V0OyIsIi8qKlxyXG4gKiBzY3JpcHRzL2FwcC5qc1xyXG4gKlxyXG4gKiBUaGlzIGlzIGEgc2FtcGxlIENvbW1vbkpTIG1vZHVsZS5cclxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIEJLR00gPSByZXF1aXJlKCcuL0JLR00nKSxcclxuXHRTdGF0ZXMgPSByZXF1aXJlKCcuL0JLR00vU3RhdGVzJyksXHJcblx0cmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKTtcclxuXHJcbmNvbnNvbGUubG9nKHJlcXVpcmUoJ3Nob3VsZCcpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcblx0cmVxdWlyZSgnLi9zY3JlZW5wbGF5JykoKTtcclxuXHRyZXF1aXJlKCcuL2NvbW1vblRhc2tzJykoKTtcclxuICAgXHRyZXF1aXJlKCcuL2dhbWVUYXNrcycpKCk7XHJcblxyXG5cdHJlcXVpcmUoJy4vZ2FtZScpLnJ1bigpO1xyXG59XHJcbiIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgc2NyZWVuc2V0ID0gcmVxdWlyZSgnLi9CS0dNL3NjcmVlbnNldCcpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRDtcclxuXHJcbnZhciBibG9ja0hlaWdodCAgID0gY29uc3RhbnRzLkJMT0NLX0hFSUdIVCxcclxuICAgIGJsb2NrR2FwICAgICAgPSBjb25zdGFudHMuQkxPQ0tfR0FQLFxyXG4gICAgbWF4TGVmdFdpZHRoICA9IFdJRFRIIC0gYmxvY2tHYXAsXHJcbiAgICBtYXhZICAgICAgICAgID0gSEVJR0hUICsgYmxvY2tIZWlnaHQgLyAyLFxyXG4gICAgYmxvY2tEaXN0YW5jZSA9IHNjcmVlbnNldChnYW1lLHtcclxuICAgICAgICAnSVBBRCc6IDIxMCxcclxuICAgICAgICAnSVBIT05FJzogMTAwLFxyXG4gICAgICAgICdERUZBVUxUJzogTWF0aC5mbG9vcigyMTAgKiBTQ0FMRSlcclxuICAgIH0pO1xyXG5cclxudmFyIEJsb2NrcyA9IHt9O1xyXG5cclxuQmxvY2tzLnJlc2V0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuYmxvY2tzICA9IFtdO1xyXG4gICAgdGhpcy5jdXJyZW50ID0gMDtcclxuICAgIHRoaXMuc2lkZSAgICA9IDA7XHJcblxyXG59O1xyXG5cclxuQmxvY2tzLnJlc2V0KCk7XHJcblxyXG5cclxuQmxvY2tzLmdldCA9IGZ1bmN0aW9uKGkpIHtcclxuICAgIHJldHVybiB0aGlzLmJsb2Nrc1tpXTtcclxufTtcclxuXHJcbkJsb2Nrcy5oZWFkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbMF07XHJcbn07XHJcblxyXG5CbG9ja3MubGFzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tzLmxlbmd0aCAtIDFdO1xyXG59O1xyXG5cclxuQmxvY2tzLm5vdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW3RoaXMuY3VycmVudF07XHJcbn1cclxuXHJcbkJsb2Nrcy5zcGF3biA9IGZ1bmN0aW9uKHBvc195KSB7XHJcbiAgICB2YXIgeSAgICA9IHBvc195IHx8IDAsXHJcbiAgICAgICAgbWludyA9IDAsXHJcbiAgICAgICAgbWF4dyA9IG1heExlZnRXaWR0aCxcclxuICAgICAgICBzeSAgID0geSAtIGJsb2NrSGVpZ2h0LFxyXG4gICAgICAgIHN3ICAgPSByYW5kb20obWludywgbWF4dyksXHJcbiAgICAgICAgc3dyICA9IHN3ICsgYmxvY2tHYXA7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzLnB1c2goe3k6IHN5LCB3OiBzdywgd3I6IHN3cn0pO1xyXG59O1xyXG5cclxuQmxvY2tzLnVuc2hpZnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYmxvY2tzLnNoaWZ0KDEpO1xyXG4gICAgdGhpcy5jdXJyZW50LS07XHJcbn07XHJcblxyXG5CbG9ja3MudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkgPCBsOyBpKyspe1xyXG4gICAgICAgIHRoaXMuYmxvY2tzW2ldLnkgKz0gc3BlZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaGVhZCgpLnkgPj0gbWF4WSkgdGhpcy51bnNoaWZ0KCk7XHJcblxyXG4gICAgdmFyIHMgPSB0aGlzLmxhc3QoKS55IC0gYmxvY2tEaXN0YW5jZTtcclxuICAgIGlmIChzID49IDApIHRoaXMuc3Bhd24ocyk7XHJcblxyXG59O1xyXG5cclxuQmxvY2tzLnBhc3MgPSBmdW5jdGlvbihkcm9wKSB7XHJcbiAgICB2YXIgY29uZGl0aW9uID0gdGhpcy5ub3coKS55ID4gZHJvcC50b3A7XHJcbiAgICBpZiAoY29uZGl0aW9uKSB0aGlzLmN1cnJlbnQrKztcclxuICAgIHJldHVybiBjb25kaXRpb25cclxufTtcclxuXHJcbkJsb2Nrcy5kcmF3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBnYW1lLnJlY3RNb2RlKCdDT1JORVInKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5ibG9ja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSB0aGlzLmJsb2Nrc1tpXTtcclxuICAgICAgICBnYW1lLmZpbGwoMjAwLCAyMDAsIDIwMCwgMjIwKTtcclxuICAgICAgICBnYW1lLnJlY3QoMCwgdi55LCB2LncsIGJsb2NrSGVpZ2h0KTtcclxuICAgICAgICBnYW1lLnJlY3Qodi53ciwgdi55LCBXSURUSCAtIHYud3IsIGJsb2NrSGVpZ2h0KTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvY2tzO1xyXG4iLCJ2YXIgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuXHRkaXJlY3RvciA9IHJlcXVpcmUoJy4vQktHTS9kaXJlY3RvcicpLFxyXG5cdGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuXHRjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRCxcclxuICAgIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyksXHJcbiAgICBkcm9wID0gcmVxdWlyZSgnLi9kcm9wJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG5cdHZhciBiYWNrZ3JvdW5kX2MgPSBbXTtcclxuXHJcblx0ZGlyZWN0b3IuZHJhdygnYmFja2dyb3VuZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGMgPSByYW5kb20oMCwgMzApO1xyXG4gICAgICAgIGdhbWUuYmFja2dyb3VuZChjLCBjLCBjLCAyNTUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjIDwgMyAmJiBiYWNrZ3JvdW5kX2MubGVuZ3RoIDwgMzApIHtcclxuICAgICAgICAgICAgdmFyIHJhID0gcmFuZG9tKDAsIFdJRFRILzgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYmFja2dyb3VuZF9jLnB1c2goe1xyXG4gICAgICAgICAgICBcdHI6IHJhLFxyXG4gICAgICAgICAgICBcdHg6IHJhbmRvbShyYSwgV0lEVEggLSByYSksXHJcbiAgICAgICAgICAgIFx0eTogLXJhLFxyXG4gICAgICAgICAgICBcdHM6IHJhbmRvbShzcGVlZCowLjgsIHNwZWVkKjEuMilcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnYW1lLmZpbGwoMjU1LWMsIDI1NS1jLCAyNTUtYywgODApO1xyXG4gICAgICAgIHZhciBpbmN4ID0gZHJvcC5yb3RhdGUgKiAyMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gYmFja2dyb3VuZF9jLmxlbmd0aCAtIDE7IGkgPj0wOyBpLS0pe1xyXG4gICAgICAgIFx0dmFyIHYgPSBiYWNrZ3JvdW5kX2NbaV07XHJcbiAgICAgICAgICAgIHYueCA9IHYueCArIGluY3g7XHJcbiAgICAgICAgICAgIHYueSA9IHYueSArIHYucyArIDE7XHJcbiAgICAgICAgICAgIGlmICh2LnkgPiBIRUlHSFQgKyB2LnIgfHwgdi54ID4gV0lEVEggKyB2LnIgfHwgdi54IDwgLXYucikge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZF9jLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZ2FtZS5jaXJjbGUodi54LCB2LnksIHYucik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZ2FtZS5iYWNrZ3JvdW5kKDEwMCwgMTAwLCAxMDAsIDI1NSk7XHJcblxyXG4gICAgfSwgdHJ1ZSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLmRyYXcoJ2xvZ28nLCBmdW5jdGlvbihsb2dvX3gsIGxvZ29feSl7XHJcblxyXG4gICAgICAgIHZhciBjID0gcmFuZG9tKDAsIDMwKTtcclxuICAgICAgICB2YXIgZiA9IDI1O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NS1jLCAyNTUtYywgMjU1LWMsIDI1NSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGQgPSByYW5kb20oLTEsIDEpO1xyXG4gICAgICAgIHZhciBlID0gcmFuZG9tKC0xLCAxKTtcclxuICAgICAgICBnYW1lLmZvbnRTaXplKDIwKTtcclxuICAgICAgICBnYW1lLnRleHQoJ0JLZ2FtZU1ha2VyJywgbG9nb194ICsgZCwgbG9nb195ICsgZiArIGUpO1xyXG4gICAgICAgIGdhbWUuZm9udFNpemUoNTApO1xyXG4gICAgICAgIGdhbWUudGV4dCgnV0hJVEUgRFJPUCcsIGxvZ29feCArIGQsIGxvZ29feSAtIGYgKyBlKTtcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LWMsIDI1NS1jLCAyNTUtYywgMjU1KTtcclxuICAgIH0sIHRydWUpO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwiYnV0dG9uc1wiLCBmdW5jdGlvbihidXR0b25zKSB7XHJcbiAgICAgICAgdmFyIHggXHRcdD0gYnV0dG9ucy54LFxyXG4gICAgICAgIFx0eSBcdFx0PSBidXR0b25zLnksXHJcbiAgICAgICAgXHR3IFx0XHQ9IGJ1dHRvbnMudyxcclxuICAgICAgICBcdGggXHRcdD0gYnV0dG9ucy5oLFxyXG4gICAgICAgIFx0cyBcdFx0PSBidXR0b25zLnMsXHJcbiAgICAgICAgXHRmIFx0XHQ9IDIwLC8vYnV0dG9ucy5mLFxyXG4gICAgICAgIFx0bGlzdFx0PSBidXR0b25zLmxpc3Q7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZ2FtZS5yZWN0TW9kZSgnQ0VOVEVSJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGQgPSByYW5kb20oMCwgMSksXHJcbiAgICAgICAgXHRlID0gcmFuZG9tKC0xLCAwKTtcclxuXHJcbiAgICAgICAgZ2FtZS5mb250U2l6ZShmKTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGdhbWUuZmlsbCgyNDAsIDI0MCwgMjQwLCAxODApO1xyXG4gICAgICAgICAgICBnYW1lLnJlY3QoeCArIGQsIHkgLSAoIGggKyBzICkgKiBpICsgZSwgdywgaCk7XHJcbiAgICAgICAgICAgIGdhbWUuZmlsbCgwLCAwLCAwLCAyMjApO1xyXG4gICAgICAgICAgICBnYW1lLnRleHQobGlzdFtpXSwgeCArIGQsIHkgLSAoIGggKyBzICkgKiBpICsgZSArIDQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0sIHRydWUpO1xyXG59OyIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcblx0c2NyZWVuc2V0PXJlcXVpcmUoJy4vQktHTS9zY3JlZW5zZXQnKSxcclxuXHRXSURUSCA9IGdhbWUuV0lEVEg7XHJcblx0U0NBTEUgPShXSURUSC83NjgpLFxyXG5cdFNRUlRfU0NBTEUgPSBNYXRoLnNxcnQoV0lEVEgvNzY4KSxcclxuXHREUk9QX1kgPSBNYXRoLmZsb29yKGdhbWUuSEVJR0hULzIpLFxyXG5cdENPTlNUID0ge1xyXG5cclxuXHRTQ0FMRSBcdFx0XHRcdDogZ2FtZS5XSURUSC83NjgsXHJcblx0U1FSVF9TQ0FMRSBcdFx0XHQ6IE1hdGguc3FydChnYW1lLldJRFRILzc2OCksXHJcblx0RkxPT1JfU0NBTEUgXHRcdDogTWF0aC5mbG9vcihnYW1lLldJRFRILzc2OCksXHJcblx0RkxPT1JfU1FSVF9TQ0FMRSBcdDogTWF0aC5mbG9vcihNYXRoLnNxcnQoZ2FtZS5XSURUSC83NjgpKSxcclxuXHJcblx0QkxPQ0tfSEVJR0hUIFx0XHQ6IE1hdGguZmxvb3IoNTAgKiBTUVJUX1NDQUxFKSxcclxuXHRCTE9DS19HQVBcdFx0XHQ6IE1hdGguZmxvb3IoMTUwICogU1FSVF9TQ0FMRSksXHJcblxyXG5cdERST1BfRElBTUVURVIgXHRcdDogTWF0aC5mbG9vcigzMCAqIFNRUlRfU0NBTEUpLFxyXG5cdERST1BfQUNDRUwgXHRcdFx0OiBNYXRoLmZsb29yKDIgKiBTQ0FMRSArIDAuNSksXHJcblx0RFJPUF9HUkFWXHRcdFx0OiBnYW1lLldJRFRILFxyXG5cdERST1BfWSBcdFx0XHRcdDogRFJPUF9ZLFxyXG5cdFNQRUVEIFx0XHRcdFx0OiBzY3JlZW5zZXQoZ2FtZSx7XHJcblx0XHRcdFx0XHRcdFx0J0lQQUQnOjMsXHJcblx0XHRcdFx0XHRcdFx0J0lQSE9ORSc6MixcclxuXHRcdFx0XHRcdFx0XHQnREVGQVVMVCc6MS44XHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdEJVVFRPTlNcdFx0XHRcdDogYnV0dG9ucyA9IHtcclxuXHRcdFx0XHRcdCAgICAgICAgeCA6IFdJRFRILzIsXHJcblx0XHRcdFx0XHQgICAgICAgIHkgOiBEUk9QX1kgLSAxNDAsXHJcblx0XHRcdFx0XHQgICAgICAgIHcgOiAzMDAgKiBTUVJUX1NDQUxFLFxyXG5cdFx0XHRcdFx0ICAgICAgICBoIDogNTAgKiBTUVJUX1NDQUxFLFxyXG5cdFx0XHRcdFx0ICAgICAgICBzIDogMTUgKiBTUVJUX1NDQUxFLFxyXG5cdFx0XHRcdFx0ICAgICAgICBmIDogMzAgKiBTUVJUX1NDQUxFLFxyXG5cdFx0XHRcdFx0ICAgICAgICBsaXN0IDogW1xyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJUcnkgYWdhaW5cIixcclxuXHRcdFx0XHRcdCAgICAgICAgICAgIFwiU2hhcmUgeW91ciBzY29yZVwiLFxyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJTaG93IExlYWRlcmJvYXJkXCJcclxuXHRcdFx0XHRcdCAgICAgICAgXSxcclxuXHRcdFx0XHRcdCAgICAgICAgYWN0aW9ucyA6IFtcclxuXHRcdFx0XHRcdCAgICAgICAgICAgIFwiZ2FtZVwiLFxyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJzaGFyZVwiLFxyXG5cdFx0XHRcdFx0ICAgICAgICAgICAgXCJsZWFkZXJib2FyZFwiXHJcblx0XHRcdFx0XHQgICAgICAgIF1cclxuXHRcdFx0XHRcdCAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENPTlNUOyIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyksXHJcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgc2NyZWVuc2V0ID0gcmVxdWlyZSgnLi9CS0dNL3NjcmVlbnNldCcpLFxyXG4gICAgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgYmxvY2tIZWlnaHQgPSBjb25zdGFudHMuQkxPQ0tfSEVJR0hULFxyXG4gICAgc3BlZWQgPSBjb25zdGFudHMuU1BFRUQ7XHJcblxyXG52YXIgZGlhbWV0ZXIgICAgICA9IGNvbnN0YW50cy5EUk9QX0RJQU1FVEVSLFxyXG4gICAgcmFkaXVzICAgICAgICA9IE1hdGguZmxvb3IoZGlhbWV0ZXIgLyAyICsgMC41KSxcclxuICAgIHJhZGl1c1NxdWFyZSAgPSByYWRpdXMgKiByYWRpdXMsXHJcbiAgICBhY2NlbENvZWYgICAgID0gY29uc3RhbnRzLkRST1BfQUNDRUwsXHJcbiAgICB2R3JhdkNvZWYgICAgID0gY29uc3RhbnRzLkRST1BfR1JBVixcclxuICAgIG1heFggICAgICAgICAgPSBXSURUSCAtIHJhZGl1cyxcclxuICAgIG1pblggICAgICAgICAgPSByYWRpdXMsXHJcbiAgICB5ICAgICAgICAgICAgID0gY29uc3RhbnRzLkRST1BfWSxcclxuICAgIHRvcCAgICAgICAgICAgPSB5ICsgcmFkaXVzLFxyXG4gICAgYm90ICAgICAgICAgICA9IHkgLSByYWRpdXMsXHJcbiAgICBtYXhUYWlsTGVuZ3RoID0gc2NyZWVuc2V0KGdhbWUsIHtcclxuICAgICAgICAnSVBBRCc6IDIwLFxyXG4gICAgICAgICdJUEhPTkUnOiAxNSxcclxuICAgICAgICAnREVGQVVMVCc6IE1hdGguZmxvb3IoMjAgKiBTUVJUX1NDQUxFKVxyXG4gICAgfSk7XHJcblxyXG52YXIgZHJvcCA9IHtcclxuICAgIGNvbGxpZGVCZWFyYWJsZVByZWNhbGVkIDoge31cclxufTtcclxuXHJcbmRyb3AucmVzZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy50b3AgICAgICA9IHRvcDtcclxuICAgIHRoaXMueCAgICAgICAgPSBXSURUSC8yO1xyXG4gICAgdGhpcy5yYWRpdXMgICA9IHJhZGl1cztcclxuICAgIHRoaXMudmVseCAgICAgPSAwO1xyXG4gICAgdGhpcy50YWlsICAgICA9IFsgV0lEVEgvMiBdO1xyXG4gICAgdGhpcy5yb3RhdGUgICA9IDA7XHJcbn07XHJcblxyXG5kcm9wLmNvbGxpZGVCZWFyYWJsZSA9IGZ1bmN0aW9uKGJ0b3AsIGJib3Qpe1xyXG4gICAgdmFyIGhTcXVhcmUgPSBNYXRoLm1pbiggTWF0aC5hYnMoYmJvdCAtIHkpLCBNYXRoLmFicyhidG9wIC0geSkgKSxcclxuICAgICAgICBoU3F1YXJlID0gaFNxdWFyZSpoU3F1YXJlO1xyXG4gICAgaWYgKHJhZGl1c1NxdWFyZSA+IGhTcXVhcmUpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHJhZGl1c1NxdWFyZSAtIGhTcXVhcmUpO1xyXG4gICAgfSBlbHNlIHJldHVybiByYWRpdXM7IC8vIERPTlQgS05PVyBXSEFUIFRPIFJFVFVSTiBBVCBBTEwgPS49J1xyXG59O1xyXG5cclxuZHJvcC5jb2xsaWRlQmVhcmFibGVQcmVjYWwgPSBmdW5jdGlvbigpe1xyXG4gICAgZm9yICh2YXIgaSA9IHkgLSByYWRpdXMgLSBibG9ja0hlaWdodCAtIDUsIGwgPSB5ICsgcmFkaXVzICsgNTsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuY29sbGlkZUJlYXJhYmxlUHJlY2FsZWRbaV0gPSB0aGlzLmNvbGxpZGVCZWFyYWJsZShpLCBpICsgYmxvY2tIZWlnaHQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZHJvcC5yZXNldCgpO1xyXG5kcm9wLmNvbGxpZGVCZWFyYWJsZVByZWNhbCgpO1xyXG5cclxuZ2FtZS5zdHJva2UoMjU1LCAyNTUsIDI1NSwgNjEpO1xyXG5cclxudmFyIGNvbGxpZGVCZWFyYWJsZVByZWNhbGVkID0gZHJvcC5jb2xsaWRlQmVhcmFibGVQcmVjYWxlZDtcclxuXHJcbmRyb3AudXBkYXRlVGFpbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLnRhaWwudW5zaGlmdCh0aGlzLngpO1xyXG4gICAgaWYgKHRoaXMudGFpbC5sZW5ndGggPj0gbWF4VGFpbExlbmd0aCkgdGhpcy50YWlsLnBvcCgpO1xyXG4gICAgXHJcbn1cclxuXHJcbmRyb3AudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnZlbHggKz0gZ2FtZS5ncmF2aXR5LnggKiBhY2NlbENvZWY7XHJcbiAgICB2YXIgeCA9IHRoaXMueCAgICArPSB0aGlzLnZlbHg7XHJcbiAgICBcclxuICAgIGlmICh4ID4gbWF4WCkge1xyXG4gICAgICAgIHRoaXMudmVseCA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0gbWF4WDtcclxuICAgIH0gZWxzZSBpZiAoeCA8IG1pblgpIHtcclxuICAgICAgICB0aGlzLnZlbHggPSAwO1xyXG4gICAgICAgIHRoaXMueCA9IG1pblg7XHJcbiAgICB9XHJcbn07XHJcblxyXG5kcm9wLmRyYXdUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgeCA9IHRoaXMueDtcclxuICAgIGlmIChnYW1lLmN1cnJlbnRUb3VjaC5zdGF0ZSA9PT0gJ01PVklORycpIHtcclxuICAgICAgICB2YXIgdHggPSBnYW1lLmN1cnJlbnRUb3VjaC54LFxyXG4gICAgICAgICAgICB0eSA9IGdhbWUuY3VycmVudFRvdWNoLnk7XHJcbiAgICAgICAgZ2FtZS5zdHJva2VXaWR0aCg0KTtcclxuICAgICAgICBnYW1lLnN0cm9rZSgyNTUsIDI1NSwgMjU1LCA2MSk7XHJcbiAgICAgICAgZ2FtZS5saW5lKHgsIHksIHR4LCB0eSk7XHJcbiAgICAgICAgZ2FtZS5zdHJva2VXaWR0aCgwKTtcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgMTQ4KTtcclxuICAgICAgICBnYW1lLmNpcmNsZSh0eCwgdHksIDUwKTtcclxuICAgIH1cclxufTtcclxuXHJcbmRyb3AudXBkYXRlQnlUb3VjaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgeCA9IHRoaXMueDtcclxuICAgIGlmIChnYW1lLmN1cnJlbnRUb3VjaC5zdGF0ZSA9PT0gJ01PVklORycpIHtcclxuICAgICAgICB2YXIgdHggPSBnYW1lLmN1cnJlbnRUb3VjaC54LFxyXG4gICAgICAgICAgICB0eSA9IGdhbWUuY3VycmVudFRvdWNoLnk7XHJcbiAgICAgICAgdGhpcy5yb3RhdGUgPSAodHggLSB4KSAvIDc2ODtcclxuICAgIH1cclxuICAgICAgICB0aGlzLnZlbHggKz0gdGhpcy5yb3RhdGU7XHJcbiAgICB4ID0gdGhpcy54ICAgICs9IHRoaXMudmVseDtcclxuICAgIFxyXG4gICAgaWYgKHggPiBtYXhYKSB7XHJcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcclxuICAgICAgICB0aGlzLnggPSBtYXhYO1xyXG4gICAgfSBlbHNlIGlmICh4IDwgbWluWCkge1xyXG4gICAgICAgIHRoaXMudmVseCA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0gbWluWDtcclxuICAgIH1cclxufTtcclxuXHJcbmRyb3AuY29sbGlkZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgYmxvY2sgPSBibG9ja3Mubm93KCksXHJcbiAgICAgICAgYnRvcCA9IGJsb2NrLnkgKyBibG9ja0hlaWdodCxcclxuICAgICAgICBiYm90ID0gYmxvY2sueSxcclxuICAgICAgICB4ICAgID0gdGhpcy54O1xyXG4gICAgaWYgKGJ0b3AgPj0gYm90ICYmIGJib3QgPD0gdG9wKSB7XHJcbiAgICAgICAgdmFyIGJlYXJhYmxlID0gY29sbGlkZUJlYXJhYmxlUHJlY2FsZWRbYmJvdF07XHJcbiAgICAgICAgcmV0dXJuIHggLSBibG9jay53IDw9IGJlYXJhYmxlIHx8IGJsb2NrLndyIC0geCA8PSBiZWFyYWJsZTtcclxuICAgIH0gZWxzZSByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5kcm9wLmRyYXcgPSBmdW5jdGlvbigpe1xyXG4gICAgZ2FtZS5maWxsKDI1NSwgMjU1LCAyNTUsIDI1NSk7XHJcbiAgICB2YXIgeCA9IHRoaXMueDtcclxuICAgIC8vIERyYXcgaGVhZFxyXG4gICAgLy8gZ2FtZS5jaXJjbGUoeCwgeSwgZGlhbWV0ZXIpO1xyXG5cclxuICAgIC8vIERyYXcgdGhpcy50YWlsXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudGFpbC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBnYW1lLmNpcmNsZSh0aGlzLnRhaWxbaV0sIHkgKyBpICogc3BlZWQsIGRpYW1ldGVyIC0gZGlhbWV0ZXIqaS9sKTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBcclxuICAgIC8vIERyYXcgZXllc1xyXG4gICAgZ2FtZS5maWxsKDAsIDAsIDAsIDI1NSk7XHJcbiAgICBnYW1lLmNpcmNsZSh4IC0gZGlhbWV0ZXIvNiAtIDEsIHktMSwgZGlhbWV0ZXIvMyk7XHJcbiAgICBnYW1lLmNpcmNsZSh4ICsgZGlhbWV0ZXIvNiArIDEsIHktMSwgZGlhbWV0ZXIvMyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRyb3A7IiwidmFyIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICBzY3JlZW5zZXQgPSByZXF1aXJlKCcuL0JLR00vc2NyZWVuc2V0JyksXHJcbiAgICByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBXSURUSCA9IGdhbWUuV0lEVEgsXHJcbiAgICBIRUlHSFQgPSBnYW1lLkhFSUdIVCxcclxuICAgIHNwZWVkID0gY29uc3RhbnRzLlNQRUVEO1xyXG5cclxudmFyIGJsb2NrSGVpZ2h0ICAgPSBjb25zdGFudHMuQkxPQ0tfSEVJR0hULFxyXG4gICAgYmxvY2tHYXAgICAgICA9IGNvbnN0YW50cy5CTE9DS19HQVAsXHJcbiAgICBtYXhMZWZ0V2lkdGggID0gV0lEVEggLSBibG9ja0dhcCxcclxuICAgIG1heFkgICAgICAgICAgPSBIRUlHSFQgKyBibG9ja0hlaWdodCAvIDIsXHJcbiAgICBibG9ja0Rpc3RhbmNlID0gc2NyZWVuc2V0KGdhbWUse1xyXG4gICAgICAgICdJUEFEJzogMjEwLFxyXG4gICAgICAgICdJUEhPTkUnOiAxMDAsXHJcbiAgICAgICAgJ0RFRkFVTFQnOiBNYXRoLmZsb29yKDIxMCAqIFNDQUxFKVxyXG4gICAgfSksXHJcbiAgICBmdWxsQW5nbGUgICAgID0gMipNYXRoLlBJO1xyXG5cclxudmFyIGV4cGxvc2lvbiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gcm90YXRlKHYsIHRoZXRhKXtcclxuICAgIHZhciB4VGVtcCA9IHYueCxcclxuICAgICAgICBjcyA9IE1hdGguY29zKHRoZXRhKSxcclxuICAgICAgICBzbiA9IE1hdGguc2luKHRoZXRhKTtcclxuICAgIHYueCA9IHYueCpjcyAtIHYueSpzbjtcclxuICAgIHYueSA9IHhUZW1wKnNuICsgdi55KmNzO1xyXG59XHJcblxyXG5leHBsb3Npb24ucmVzZXQgPSBmdW5jdGlvbih4LCB5KXtcclxuICAgIHRoaXMucG9zaXRpb24gPSB7eDogeCwgeTogeX07XHJcbiAgICB0aGlzLm9wYWNpdHkgPSAyNTU7XHJcbiAgICB0aGlzLnRpbWUgPSAxO1xyXG4gICAgdGhpcy5saW5lcyA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTA7IGkrKykge1xyXG4gICAgICAgIHZhciBkaXIgPSB7eDogMCwgeTogMX07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcm90YXRlKGRpciwgTWF0aC5yYW5kb20oZnVsbEFuZ2xlKSk7XHJcbiAgICAgICAgZGlyLnggKj0gcmFuZG9tKDAsIE1hdGguZmxvb3IoNzAgKiBTQ0FMRSkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubGluZXMucHVzaChkaXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwbG9zaW9uLnJlc2V0KCk7XHJcblxyXG52YXIgbGluZXMgPSBleHBsb3Npb24ubGluZXM7XHJcblxyXG5leHBsb3Npb24uaXNEb25lID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcGFjaXR5IDw9IDA7XHJcbn07XHJcbmV4cGxvc2lvbi51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub3BhY2l0eSA9IDI1NSAqICgxIC0gKHRoaXMudGltZS8zMCkpO1xyXG4gICAgdGhpcy50aW1lICs9IDMgLyAodGhpcy50aW1lICogU0NBTEUpO1xyXG59O1xyXG5leHBsb3Npb24uZHJhdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgXHJcbiAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgcmFuZG9tKDAsIDI1MCkpO1xyXG4gICAgZ2FtZS5yZWN0KDAsMCxXSURUSCxIRUlHSFQpO1xyXG4gICAgXHJcblxyXG4gICAgZ2FtZS5saW5lQ2FwTW9kZSgncm91bmQnKTtcclxuICAgIGdhbWUuc3Ryb2tlV2lkdGgocmFuZG9tKDUsIE1hdGguZmxvb3IoMzAgKiBTQ0FMRSkpKTtcclxuICAgIGdhbWUuc3Ryb2tlKDI1NSwyNTUsMjU1LCBNYXRoLm1heCh0aGlzLm9wYWNpdHksMCkpO1xyXG5cclxuICAgIHZhciBwID0gdGhpcy5wb3NpdGlvbjtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSBsaW5lc1tpXTtcclxuICAgICAgICB2YXIgdnQgPSBwICsgdiAqIHRoaXMudGltZTtcclxuICAgICAgICBnYW1lLmxpbmUocC54LCBwLnksIHZ0LngsIHZ0LnkpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgXHJcbiAgICBnYW1lLmxpbmVDYXBNb2RlKCdidXR0Jyk7XHJcbiAgICBnYW1lLnN0cm9rZVdpZHRoKDApO1xyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cGxvc2lvbjsiLCJ2YXIgQktHTSA9IHJlcXVpcmUoJy4vQktHTScpLFxyXG5cdGRpcmVjdG9yID0gcmVxdWlyZSgnLi9CS0dNL2RpcmVjdG9yJyksXHJcblx0Z2FtZSA9IG5ldyBCS0dNKHtcclxuICAgIFx0RGV2aWNlTW90aW9uOiBmYWxzZSxcclxuICAgIFx0Q29kZWFcdFx0OiB0cnVlLFxyXG5cdCAgICBzZXR1cDogZnVuY3Rpb24oKXtcclxuXHRcdCAgICBkaXJlY3Rvci5zd2l0Y2goXCJtZW51XCIpO1xyXG5cdCAgICB9LFxyXG5cdCAgICBkcmF3OiBmdW5jdGlvbigpe1xyXG5cdCAgICAgICAgZGlyZWN0b3IucnVuKCk7XHJcblx0ICAgIH1cclxuXHR9KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZTsiLCJ2YXIgZGlyZWN0b3IgPSByZXF1aXJlKCcuL0JLR00vZGlyZWN0b3InKSxcclxuICAgIEJLR00gPSByZXF1aXJlKCcuL0JLR00nKSxcclxuICAgIF9mYiA9ICAgcmVxdWlyZSgnLi9CS0dNL2ZiY29ubmVjdCcpLFxyXG5cdGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuXHRjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpLFxyXG4gICAgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKSxcclxuICAgIFNDQUxFID0gY29uc3RhbnRzLlNDQUxFLFxyXG4gICAgU1FSVF9TQ0FMRSA9IGNvbnN0YW50cy5TUVJUX1NDQUxFLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBzcGVlZCA9IGNvbnN0YW50cy5TUEVFRCxcclxuICAgIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyksXHJcbiAgICBkcm9wID0gcmVxdWlyZSgnLi9kcm9wJyksXHJcbiAgICBEUk9QX1kgPSBjb25zdGFudHMuRFJPUF9ZLFxyXG4gICAgZXhwbG9zaW9uID0gcmVxdWlyZSgnLi9leHBsb3Npb24nKSxcclxuICAgIGJ1dHRvbnMgPSBjb25zdGFudHMuQlVUVE9OUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcblx0dmFyIHNjb3JlID0gMCxcclxuXHRcdGhpZ2hzY29yZSA9IDAsXHJcbiAgICAgICAgbmV3YmVzdHNjb3JlID0gZmFsc2UsXHJcbiAgICAgICAgbG9jYWxzY29yZSA9IG5ldyBCS0dNLlNjb3JlTG9jYWwoXCJ3aGl0ZWRyb3BcIik7XHJcblxyXG4gICAgX2ZiLmluaXQoe2FwcElkOlwiMjk2NjMyMTM3MTUzNDM3XCJ9KTtcclxuICAgIF9mYi5pbml0TGVhZGVyYm9hcmRzKGdhbWUsbnVsbCwwLDAsV0lEVEgsSEVJR0hUKTtcclxuICAgIF9mYi5oaWRlTGVhZGVyYm9hcmQoKTtcclxuICAgIF9mYi5sb2dpbihfZmIuaGlkZUxlYWRlcmJvYXJkKTtcclxuICAgIF9mYi5nZXRTY29yZShudWxsLCBmdW5jdGlvbihzY29yZSl7XHJcbiAgICAgICAgbG9jYWxzY29yZS5zdWJtaXRTY29yZShzY29yZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgX3N0YXJ0Z2FtZT0oZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgeCAgICAgICA9IGJ1dHRvbnMueCxcclxuICAgICAgICAgICAgeSAgICAgICA9IGJ1dHRvbnMueSxcclxuICAgICAgICAgICAgdzIgICAgICA9IGJ1dHRvbnMudyAvIDIsXHJcbiAgICAgICAgICAgIGggICAgICAgPSBidXR0b25zLmgsXHJcbiAgICAgICAgICAgIGgyICAgICAgPSBoIC8gMixcclxuICAgICAgICAgICAgcyAgICAgICA9IGJ1dHRvbnMucyxcclxuICAgICAgICAgICAgZiAgICAgICA9IGJ1dHRvbnMuZixcclxuICAgICAgICAgICAgbGlzdCAgICA9IGJ1dHRvbnMubGlzdCxcclxuICAgICAgICAgICAgYWN0aW9ucyA9IGJ1dHRvbnMuYWN0aW9ucztcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHN3aXRjaChkaXJlY3Rvci5jdXJyZW50KXtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2dhbWVvdmVyJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdHggPSBlLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5ID0gZS55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpICA9IDAsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsICA9IGFjdGlvbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eCA+IHggLSB3MiAmJiB0eCA8IHggKyB3Mikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8PSBsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHkgPiB5IC0gKGggKyBzKSAqIGkgLSBoMiAmJiB0eSA8IHkgLSAoaCArIHMpICogaSArIGgyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGFjdGlvbnNbaV0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdnYW1lJyA6IGRpcmVjdG9yLnN3aXRjaCgnZ2FtZScpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2hhcmUnOiBfZmIucG9zdENhbnZhcygpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVhZGVyYm9hcmQnOl9mYi5zaG93TGVhZGVyYm9hcmQoKTticmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtZW51JzogZGlyZWN0b3Iuc3dpdGNoKFwiZ2FtZVwiKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcbiAgICBnYW1lLm1vdXNlRG93bj1mdW5jdGlvbihlKXtcclxuICAgICAgICBfc3RhcnRnYW1lKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnYW1lLnRvdWNoU3RhcnQ9ZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgX3N0YXJ0Z2FtZShlKTtcclxuICAgIH07XHJcblxyXG5cdGRpcmVjdG9yLnRhc2tPbmNlKFwic2V0dXBcIiwgZnVuY3Rpb24oKXtcclxuXHRcdGhpZ2hzY29yZSA9IGxvY2Fsc2NvcmUuZ2V0U2NvcmUoKS5zY29yZSB8fCAwO1xyXG4gICAgICAgIGRyb3AucmVzZXQoKTtcclxuICAgICAgICBibG9ja3MucmVzZXQoKTtcclxuICAgICAgICBibG9ja3Muc3Bhd24oMCk7XHJcbiAgICAgICAgc2NvcmUgPSAwO1xyXG4gICAgICAgIG5ld2Jlc3RzY29yZSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IuZHJhdyhcInNjb3JlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChibG9ja3MucGFzcyhkcm9wKSl7XHJcbiAgICAgICAgICAgIC8vc291bmQoU09VTkRfUElDS1VQLCAzMjk0NylcclxuICAgICAgICAgICAgc2NvcmUrKztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci51cGRhdGUoXCJkcm9wLnRhaWxcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBkcm9wLnVwZGF0ZVRhaWwoKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci51cGRhdGUoXCJkcm9wLnVwZGF0ZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AudXBkYXRlQnlUb3VjaCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IuZHJhdyhcImRyb3AuZHJhd1RvdWNoXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZHJvcC5kcmF3VG91Y2goKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLmRyYXcoXCJkcm9wLmdyYXZcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBkcm9wLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgZGlyZWN0b3IuZHJhdyhcImRyb3AuZHJhd1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGRyb3AuZHJhdygpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGRpcmVjdG9yLmRyYXcoXCJjb2xsaWRlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICggZHJvcC5jb2xsaWRlKGJsb2Nrcy5ub3coKSkgKSB7XHJcbiAgICAgICAgICAgIC8vc2hvd0FkRnJvbVRvcCgpXHJcbiAgICAgICAgICAgIGRpcmVjdG9yLnN3aXRjaChcImV4cGxvZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudGFza09uY2UoXCJjYWxzY29yZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIF9mYi5zdWJtaXRTY29yZShzY29yZSxudWxsLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIC8vIF9mYi5zaG93TGVhZGVyYm9hcmQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZihoaWdoc2NvcmU8c2NvcmUpe1xyXG4gICAgICAgICAgICBsb2NhbHNjb3JlLnN1Ym1pdFNjb3JlKHNjb3JlKTtcclxuICAgICAgICAgICAgaGlnaHNjb3JlID0gc2NvcmU7XHJcbiAgICAgICAgICAgIG5ld2Jlc3RzY29yZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IudXBkYXRlKFwiYmxvY2tzLnVwZGF0ZVwiLCBmdW5jdGlvbigpe1xyXG4gICAgXHRibG9ja3MudXBkYXRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci5kcmF3KFwiYmxvY2tzLmRyYXdcIiwgZnVuY3Rpb24oKXtcclxuICAgIFx0YmxvY2tzLmRyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRpcmVjdG9yLmRyYXcoXCJndWlkZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLmZpbGwoMjU1LCAyNTUsIDI1NSwgMjU1KTtcclxuICAgICAgICBnYW1lLmZvbnRTaXplKDE2KTtcclxuICAgICAgICBnYW1lLnRleHQoXCJDbGljayB0byBzdGFydFwiLCBXSURUSC8yLCBEUk9QX1kgLSA4MCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci50YXNrT25jZShcImNyZWF0ZUV4cGxvc2lvblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAvL3NvdW5kKERBVEEsIFwiWmdOQUNnQkFLMFJCR1JJSTlZL3RQdDZ2eUQ2Z2pCQStLd0I0YjNwQVF5bEZYQjBDXCIpXHJcbiAgICAgICAgZXhwbG9zaW9uLnJlc2V0KGRyb3AueCwgRFJPUF9ZKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci51cGRhdGUoXCJleHBsb3Npb25cIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZXhwbG9zaW9uLnVwZGF0ZSgpO1xyXG4gICAgICAgIGlmIChleHBsb3Npb24uaXNEb25lKCkpIHtcclxuICAgICAgICAgICAgZGlyZWN0b3Iuc3dpdGNoKFwiZ2FtZW92ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IuZHJhdyhcImV4cGxvc2lvblwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBleHBsb3Npb24uZHJhdygpO1xyXG4gICAgICAgIFxyXG4gICAgfSk7XHJcblxyXG4gICAgZGlyZWN0b3IuZHJhdyhcInJlc3VsdFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLmZpbGwoMCwgMCwgMCwgMjMwKTtcclxuICAgICAgICBnYW1lLnJlY3QoMCwgMCwgV0lEVEgsIEhFSUdIVCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZ2FtZS5maWxsKDI1NSwgMjU1LCAyNTUsIDI1NSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZ2FtZS5mb250U2l6ZSgyNCk7XHJcblxyXG4gICAgICAgIGlmICghbmV3YmVzdHNjb3JlKSB7XHJcbiAgICAgICAgICAgIGdhbWUudGV4dChcIlNDT1JFOiBcIitzY29yZStcIiAgLSAgQkVTVDogXCIraGlnaHNjb3JlLCBXSURUSC8yLCBIRUlHSFQvMiAtIDQwKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWUudGV4dChcIk5FVyBCRVNUIFNDT1JFOiBcIitzY29yZSwgV0lEVEgvMiwgSEVJR0hULzIgLSA0MClcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBkaXJlY3Rvci5kcmF3KCdkaXNwbGF5U2NvcmUnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIGdhbWUuZmlsbCgyNTUsMjU1LDI1NSwyNTUpO1xyXG4gICAgICAgIHZhciB0YWlsID0gZHJvcC50YWlsO1xyXG4gICAgICAgIGdhbWUuZm9udFNpemUoMzApO1xyXG4gICAgICAgIGdhbWUudGV4dChzY29yZStcIlwiLHRhaWxbdGFpbC5sZW5ndGgtMV0sRFJPUF9ZICsgdGFpbC5sZW5ndGgqc3BlZWQvIFNDQUxFICsgMTUgKiBTQ0FMRSk7XHJcblxyXG4gICAgfSk7XHJcbn07IiwiLyoqXHJcbiAqIHNjcmlwdHMvbWFpbi5qc1xyXG4gKlxyXG4gKiBUaGlzIGlzIHRoZSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBhcHBsaWNhdGlvbi5cclxuICogVGFrZSBhIGxvb2sgYXQgaHR0cDovL2Jyb3dzZXJpZnkub3JnLyBmb3IgbW9yZSBpbmZvXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlcmVhZHlcIiwgYXBwLCBmYWxzZSk7XHJcbi8vIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhcHAsIGZhbHNlKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcclxuXHRyZXR1cm4gTWF0aC5mbG9vcihtaW4gKyBNYXRoLnJhbmRvbSgpKihtYXgtbWluKSk7XHJcbn0iLCJ2YXIgZGlyZWN0b3IgPSByZXF1aXJlKCcuL0JLR00vZGlyZWN0b3InKSxcclxuICAgIGdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKSxcclxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyksXHJcbiAgICByYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpLFxyXG4gICAgU0NBTEUgPSBjb25zdGFudHMuU0NBTEUsXHJcbiAgICBTUVJUX1NDQUxFID0gY29uc3RhbnRzLlNRUlRfU0NBTEUsXHJcbiAgICBkcm9wID0gcmVxdWlyZSgnLi9kcm9wJyksXHJcbiAgICBEUk9QX1kgPSBjb25zdGFudHMuRFJPUF9ZLFxyXG4gICAgV0lEVEggPSBnYW1lLldJRFRILFxyXG4gICAgSEVJR0hUID0gZ2FtZS5IRUlHSFQsXHJcbiAgICBidXR0b25zID0gY29uc3RhbnRzLkJVVFRPTlM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgZGlyZWN0b3Iuc3RhdGUoJ2dhbWUnLCBbXHJcbiAgICAgICAgJ2JhY2tncm91bmQnLFxyXG4gICAgICAgICdzZXR1cCcsXHJcbiAgICAgICAgJ2Ryb3AudGFpbCcsXHJcbiAgICAgICAgJ2Ryb3AudXBkYXRlJyxcclxuICAgICAgICAnYmxvY2tzLnVwZGF0ZScsXHJcbiAgICAgICAgJ2NvbGxpZGUnLFxyXG4gICAgICAgICdzY29yZScsXHJcbiAgICAgICAgJ2Ryb3AuZHJhdycsXHJcbiAgICAgICAgJ2Ryb3AuZHJhd1RvdWNoJyxcclxuICAgICAgICAnZGlzcGxheVNjb3JlJyxcclxuICAgICAgICAnYmxvY2tzLmRyYXcnXHJcbiAgICBdKTtcclxuXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZ2FtZWdyYXYnLCBbXHJcbiAgICAgICAgJ2JhY2tncm91bmQnLFxyXG4gICAgICAgICdzZXR1cCcsXHJcbiAgICAgICAgJ2Ryb3AudGFpbCcsXHJcbiAgICAgICAgJ2Ryb3AuZ3JhdicsXHJcbiAgICAgICAgJ2Jsb2Nrcy51cGRhdGUnLFxyXG4gICAgICAgICdjb2xsaWRlJyxcclxuICAgICAgICAnc2NvcmUnLFxyXG4gICAgICAgICdkcm9wLmRyYXcnLFxyXG4gICAgICAgICdkaXNwbGF5U2NvcmUnLFxyXG4gICAgICAgICdibG9ja3MuZHJhdydcclxuICAgIF0pO1xyXG4gICAgXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnbWVudScsIFtcclxuICAgICAgICAnc2V0dXAnLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdsb2dvJyxcclxuICAgICAgICAgICAgYXJnczogW1dJRFRILzIsIEhFSUdIVC8yICsgMTIwXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICdkcm9wLnRhaWwnLFxyXG4gICAgICAgICdkcm9wLmRyYXcnLFxyXG4gICAgICAgICdndWlkZScgICAgICAgIFxyXG4gICAgXSk7XHJcbiAgICAgICAgXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZXhwbG9kZScsIFtcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ2Jsb2Nrcy5kcmF3JyxcclxuICAgICAgICAnY3JlYXRlRXhwbG9zaW9uJyxcclxuICAgICAgICAnZXhwbG9zaW9uJ1xyXG4gICAgXSk7XHJcbiAgICAgICAgXHJcbiAgICBkaXJlY3Rvci5zdGF0ZSgnZ2FtZW92ZXInLCBbXHJcbiAgICAgICAgJ2NhbHNjb3JlJyxcclxuICAgICAgICAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgJ2Jsb2Nrcy51cGRhdGUnLFxyXG4gICAgICAgICdibG9ja3MuZHJhdycsXHJcbiAgICAgICAgJ3Jlc3VsdCcsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnbG9nbycsXHJcbiAgICAgICAgICAgIGFyZ3M6IFtXSURUSC8yLCBIRUlHSFQvMiArIDUwXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vJ2d1aWRlJyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwiYnV0dG9uc1wiLFxyXG4gICAgICAgICAgICBhcmdzOiBbYnV0dG9uc11cclxuICAgICAgICB9XHJcbiAgICBdKTtcclxufTsiLCIvLyBodHRwOi8vd2lraS5jb21tb25qcy5vcmcvd2lraS9Vbml0X1Rlc3RpbmcvMS4wXG4vL1xuLy8gVEhJUyBJUyBOT1QgVEVTVEVEIE5PUiBMSUtFTFkgVE8gV09SSyBPVVRTSURFIFY4IVxuLy9cbi8vIE9yaWdpbmFsbHkgZnJvbSBuYXJ3aGFsLmpzIChodHRwOi8vbmFyd2hhbGpzLm9yZylcbi8vIENvcHlyaWdodCAoYykgMjAwOSBUaG9tYXMgUm9iaW5zb24gPDI4MG5vcnRoLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG9cbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4vLyByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Jcbi8vIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOXG4vLyBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gd2hlbiB1c2VkIGluIG5vZGUsIHRoaXMgd2lsbCBhY3R1YWxseSBsb2FkIHRoZSB1dGlsIG1vZHVsZSB3ZSBkZXBlbmQgb25cbi8vIHZlcnN1cyBsb2FkaW5nIHRoZSBidWlsdGluIHV0aWwgbW9kdWxlIGFzIGhhcHBlbnMgb3RoZXJ3aXNlXG4vLyB0aGlzIGlzIGEgYnVnIGluIG5vZGUgbW9kdWxlIGxvYWRpbmcgYXMgZmFyIGFzIEkgYW0gY29uY2VybmVkXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwvJyk7XG5cbnZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gMS4gVGhlIGFzc2VydCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25zIHRoYXQgdGhyb3dcbi8vIEFzc2VydGlvbkVycm9yJ3Mgd2hlbiBwYXJ0aWN1bGFyIGNvbmRpdGlvbnMgYXJlIG5vdCBtZXQuIFRoZVxuLy8gYXNzZXJ0IG1vZHVsZSBtdXN0IGNvbmZvcm0gdG8gdGhlIGZvbGxvd2luZyBpbnRlcmZhY2UuXG5cbnZhciBhc3NlcnQgPSBtb2R1bGUuZXhwb3J0cyA9IG9rO1xuXG4vLyAyLiBUaGUgQXNzZXJ0aW9uRXJyb3IgaXMgZGVmaW5lZCBpbiBhc3NlcnQuXG4vLyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHsgbWVzc2FnZTogbWVzc2FnZSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQgfSlcblxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucykge1xuICB0aGlzLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLmFjdHVhbCA9IG9wdGlvbnMuYWN0dWFsO1xuICB0aGlzLmV4cGVjdGVkID0gb3B0aW9ucy5leHBlY3RlZDtcbiAgdGhpcy5vcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3I7XG4gIGlmIChvcHRpb25zLm1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2U7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gZ2V0TWVzc2FnZSh0aGlzKTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICB9XG4gIHZhciBzdGFja1N0YXJ0RnVuY3Rpb24gPSBvcHRpb25zLnN0YWNrU3RhcnRGdW5jdGlvbiB8fCBmYWlsO1xuXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gbm9uIHY4IGJyb3dzZXJzIHNvIHdlIGNhbiBoYXZlIGEgc3RhY2t0cmFjZVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICBpZiAoZXJyLnN0YWNrKSB7XG4gICAgICB2YXIgb3V0ID0gZXJyLnN0YWNrO1xuXG4gICAgICAvLyB0cnkgdG8gc3RyaXAgdXNlbGVzcyBmcmFtZXNcbiAgICAgIHZhciBmbl9uYW1lID0gc3RhY2tTdGFydEZ1bmN0aW9uLm5hbWU7XG4gICAgICB2YXIgaWR4ID0gb3V0LmluZGV4T2YoJ1xcbicgKyBmbl9uYW1lKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAvLyBvbmNlIHdlIGhhdmUgbG9jYXRlZCB0aGUgZnVuY3Rpb24gZnJhbWVcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgaXQgKGFuZCBpdHMgbGluZSlcbiAgICAgICAgdmFyIG5leHRfbGluZSA9IG91dC5pbmRleE9mKCdcXG4nLCBpZHggKyAxKTtcbiAgICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZyhuZXh0X2xpbmUgKyAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFjayA9IG91dDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIGFzc2VydC5Bc3NlcnRpb25FcnJvciBpbnN0YW5jZW9mIEVycm9yXG51dGlsLmluaGVyaXRzKGFzc2VydC5Bc3NlcnRpb25FcnJvciwgRXJyb3IpO1xuXG5mdW5jdGlvbiByZXBsYWNlcihrZXksIHZhbHVlKSB7XG4gIGlmICh1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgIHJldHVybiAnJyArIHZhbHVlO1xuICB9XG4gIGlmICh1dGlsLmlzTnVtYmVyKHZhbHVlKSAmJiAoaXNOYU4odmFsdWUpIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbih2YWx1ZSkgfHwgdXRpbC5pc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHRydW5jYXRlKHMsIG4pIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocykpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPCBuID8gcyA6IHMuc2xpY2UoMCwgbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWVzc2FnZShzZWxmKSB7XG4gIHJldHVybiB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmFjdHVhbCwgcmVwbGFjZXIpLCAxMjgpICsgJyAnICtcbiAgICAgICAgIHNlbGYub3BlcmF0b3IgKyAnICcgK1xuICAgICAgICAgdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5leHBlY3RlZCwgcmVwbGFjZXIpLCAxMjgpO1xufVxuXG4vLyBBdCBwcmVzZW50IG9ubHkgdGhlIHRocmVlIGtleXMgbWVudGlvbmVkIGFib3ZlIGFyZSB1c2VkIGFuZFxuLy8gdW5kZXJzdG9vZCBieSB0aGUgc3BlYy4gSW1wbGVtZW50YXRpb25zIG9yIHN1YiBtb2R1bGVzIGNhbiBwYXNzXG4vLyBvdGhlciBrZXlzIHRvIHRoZSBBc3NlcnRpb25FcnJvcidzIGNvbnN0cnVjdG9yIC0gdGhleSB3aWxsIGJlXG4vLyBpZ25vcmVkLlxuXG4vLyAzLiBBbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCB0aHJvdyBhbiBBc3NlcnRpb25FcnJvclxuLy8gd2hlbiBhIGNvcnJlc3BvbmRpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQsIHdpdGggYSBtZXNzYWdlIHRoYXRcbi8vIG1heSBiZSB1bmRlZmluZWQgaWYgbm90IHByb3ZpZGVkLiAgQWxsIGFzc2VydGlvbiBtZXRob2RzIHByb3ZpZGVcbi8vIGJvdGggdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzIHRvIHRoZSBhc3NlcnRpb24gZXJyb3IgZm9yXG4vLyBkaXNwbGF5IHB1cnBvc2VzLlxuXG5mdW5jdGlvbiBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG9wZXJhdG9yLCBzdGFja1N0YXJ0RnVuY3Rpb24pIHtcbiAgdGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgb3BlcmF0b3I6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGdW5jdGlvbjogc3RhY2tTdGFydEZ1bmN0aW9uXG4gIH0pO1xufVxuXG4vLyBFWFRFTlNJT04hIGFsbG93cyBmb3Igd2VsbCBiZWhhdmVkIGVycm9ycyBkZWZpbmVkIGVsc2V3aGVyZS5cbmFzc2VydC5mYWlsID0gZmFpbDtcblxuLy8gNC4gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISFndWFyZC5cbi8vIGFzc2VydC5vayhndWFyZCwgbWVzc2FnZV9vcHQpO1xuLy8gVGhpcyBzdGF0ZW1lbnQgaXMgZXF1aXZhbGVudCB0byBhc3NlcnQuZXF1YWwodHJ1ZSwgISFndWFyZCxcbi8vIG1lc3NhZ2Vfb3B0KTsuIFRvIHRlc3Qgc3RyaWN0bHkgZm9yIHRoZSB2YWx1ZSB0cnVlLCB1c2Vcbi8vIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCBndWFyZCwgbWVzc2FnZV9vcHQpOy5cblxuZnVuY3Rpb24gb2sodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkgZmFpbCh2YWx1ZSwgdHJ1ZSwgbWVzc2FnZSwgJz09JywgYXNzZXJ0Lm9rKTtcbn1cbmFzc2VydC5vayA9IG9rO1xuXG4vLyA1LiBUaGUgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHNoYWxsb3csIGNvZXJjaXZlIGVxdWFsaXR5IHdpdGhcbi8vID09LlxuLy8gYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5lcXVhbCk7XG59O1xuXG4vLyA2LiBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90IGVxdWFsXG4vLyB3aXRoICE9IGFzc2VydC5ub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RFcXVhbCA9IGZ1bmN0aW9uIG5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9JywgYXNzZXJ0Lm5vdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gNy4gVGhlIGVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBhIGRlZXAgZXF1YWxpdHkgcmVsYXRpb24uXG4vLyBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmRlZXBFcXVhbCA9IGZ1bmN0aW9uIGRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBFcXVhbCcsIGFzc2VydC5kZWVwRXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzQnVmZmVyKGFjdHVhbCkgJiYgdXRpbC5pc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICBpZiAoYWN0dWFsLmxlbmd0aCAhPSBleHBlY3RlZC5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG4gIC8vIDcuMi4gSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgRGF0ZSBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgRGF0ZSBvYmplY3QgdGhhdCByZWZlcnMgdG8gdGhlIHNhbWUgdGltZS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzRGF0ZShhY3R1YWwpICYmIHV0aWwuaXNEYXRlKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIFJlZ0V4cCBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgUmVnRXhwIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNvdXJjZSBhbmRcbiAgLy8gcHJvcGVydGllcyAoYGdsb2JhbGAsIGBtdWx0aWxpbmVgLCBgbGFzdEluZGV4YCwgYGlnbm9yZUNhc2VgKS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzUmVnRXhwKGFjdHVhbCkgJiYgdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLnNvdXJjZSA9PT0gZXhwZWN0ZWQuc291cmNlICYmXG4gICAgICAgICAgIGFjdHVhbC5nbG9iYWwgPT09IGV4cGVjdGVkLmdsb2JhbCAmJlxuICAgICAgICAgICBhY3R1YWwubXVsdGlsaW5lID09PSBleHBlY3RlZC5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgYWN0dWFsLmxhc3RJbmRleCA9PT0gZXhwZWN0ZWQubGFzdEluZGV4ICYmXG4gICAgICAgICAgIGFjdHVhbC5pZ25vcmVDYXNlID09PSBleHBlY3RlZC5pZ25vcmVDYXNlO1xuXG4gIC8vIDcuNC4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICghdXRpbC5pc09iamVjdChhY3R1YWwpICYmICF1dGlsLmlzT2JqZWN0KGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy41IEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYikge1xuICBpZiAodXRpbC5pc051bGxPclVuZGVmaW5lZChhKSB8fCB1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAoaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIWlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYik7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAgICBrYiA9IG9iamVjdEtleXMoYiksXG4gICAgICAgIGtleSwgaTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghX2RlZXBFcXVhbChhW2tleV0sIGJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gOC4gVGhlIG5vbi1lcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgZm9yIGFueSBkZWVwIGluZXF1YWxpdHkuXG4vLyBhc3NlcnQubm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdERlZXBFcXVhbCA9IGZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcEVxdWFsJywgYXNzZXJ0Lm5vdERlZXBFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDkuIFRoZSBzdHJpY3QgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHN0cmljdCBlcXVhbGl0eSwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBzdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT09JywgYXNzZXJ0LnN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gMTAuIFRoZSBzdHJpY3Qgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igc3RyaWN0IGluZXF1YWxpdHksIGFzXG4vLyBkZXRlcm1pbmVkIGJ5ICE9PS4gIGFzc2VydC5ub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIG5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPT0nLCBhc3NlcnQubm90U3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIGlmICghYWN0dWFsIHx8ICFleHBlY3RlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXhwZWN0ZWQpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgcmV0dXJuIGV4cGVjdGVkLnRlc3QoYWN0dWFsKTtcbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkLmNhbGwoe30sIGFjdHVhbCkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3Rocm93cyhzaG91bGRUaHJvdywgYmxvY2ssIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIHZhciBhY3R1YWw7XG5cbiAgaWYgKHV0aWwuaXNTdHJpbmcoZXhwZWN0ZWQpKSB7XG4gICAgbWVzc2FnZSA9IGV4cGVjdGVkO1xuICAgIGV4cGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgYmxvY2soKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGFjdHVhbCA9IGU7XG4gIH1cblxuICBtZXNzYWdlID0gKGV4cGVjdGVkICYmIGV4cGVjdGVkLm5hbWUgPyAnICgnICsgZXhwZWN0ZWQubmFtZSArICcpLicgOiAnLicpICtcbiAgICAgICAgICAgIChtZXNzYWdlID8gJyAnICsgbWVzc2FnZSA6ICcuJyk7XG5cbiAgaWYgKHNob3VsZFRocm93ICYmICFhY3R1YWwpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdNaXNzaW5nIGV4cGVjdGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICghc2hvdWxkVGhyb3cgJiYgZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdHb3QgdW53YW50ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKChzaG91bGRUaHJvdyAmJiBhY3R1YWwgJiYgZXhwZWN0ZWQgJiZcbiAgICAgICFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkgfHwgKCFzaG91bGRUaHJvdyAmJiBhY3R1YWwpKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9XG59XG5cbi8vIDExLiBFeHBlY3RlZCB0byB0aHJvdyBhbiBlcnJvcjpcbi8vIGFzc2VydC50aHJvd3MoYmxvY2ssIEVycm9yX29wdCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQudGhyb3dzID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL2Vycm9yLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW3RydWVdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG4vLyBFWFRFTlNJT04hIFRoaXMgaXMgYW5ub3lpbmcgdG8gd3JpdGUgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbmFzc2VydC5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFtmYWxzZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24oZXJyKSB7IGlmIChlcnIpIHt0aHJvdyBlcnI7fX07XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkM6XFxcXFVzZXJzXFxcXEhvYW5nQW5oXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcU2xpcHB5RHJvcFxcXFxub2RlX21vZHVsZXNcXFxcYnJvd3NlcmlmeVxcXFxub2RlX21vZHVsZXNcXFxcaW5zZXJ0LW1vZHVsZS1nbG9iYWxzXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwidmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssXG4gICAvLyBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAvLyBEb2VzIHRoZSBicm93c2VyIHN1cHBvcnQgYWRkaW5nIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcz8gSWZcbiAgLy8gbm90LCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydC4gV2UgbmVlZCB0byBiZSBhYmxlIHRvXG4gIC8vIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLlxuICAvLyBSZWxldmFudCBGaXJlZm94IGJ1ZzogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDApXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIEFzc3VtZSBvYmplY3QgaXMgYW4gYXJyYXlcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHN1YmplY3QgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgVWludDhBcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ3VjczInOiAvLyBUT0RPOiBObyBzdXBwb3J0IGZvciB1Y3MyIG9yIHV0ZjE2bGUgZW5jb2RpbmdzIHlldFxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldHVybiBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXR1cm4gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldHVybiBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICd1Y3MyJzogLy8gVE9ETzogTm8gc3VwcG9ydCBmb3IgdWNzMiBvciB1dGYxNmxlIGVuY29kaW5ncyB5ZXRcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXR1cm4gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0dXJuIF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXR1cm4gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIC8vIGNvcHkhXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7IGkrKylcbiAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuLy8gaHR0cDovL25vZGVqcy5vcmcvYXBpL2J1ZmZlci5odG1sI2J1ZmZlcl9idWZfc2xpY2Vfc3RhcnRfZW5kXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBhdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IHRoZSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbmZ1bmN0aW9uIGF1Z21lbnQgKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCxcbiAgICAgICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50KHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFpFUk8gICA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUylcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0gpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRtb2R1bGUuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSgpKVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG4iLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLy8gVGFrZW4gZnJvbSBub2RlJ3MgYXNzZXJ0IG1vZHVsZSwgYmVjYXVzZSBpdCBzdWNrc1xuLy8gYW5kIGV4cG9zZXMgbmV4dCB0byBub3RoaW5nIHVzZWZ1bC5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gX2RlZXBFcXVhbDtcblxudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gb2JqRXF1aXYgKGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKHV0aWwuaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIXV0aWwuaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB0cnl7XG4gICAgdmFyIGthID0gT2JqZWN0LmtleXMoYSksXG4gICAgICBrYiA9IE9iamVjdC5rZXlzKGIpLFxuICAgICAga2V5LCBpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0JylcbiAgLCBBc3NlcnRpb25FcnJvciA9IGFzc2VydC5Bc3NlcnRpb25FcnJvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQpIHtcbiAgdmFyIGkgPSBzaG91bGQuZm9ybWF0O1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgYXNzZXJ0IHRvIHNob3VsZFxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB5b3UgdG8gZG8gdGhpbmdzIGxpa2UgYmVsb3dcbiAgICogd2l0aG91dCByZXF1aXJlKClpbmcgdGhlIGFzc2VydCBtb2R1bGUuXG4gICAqXG4gICAqICAgIHNob3VsZC5lcXVhbChmb28uYmFyLCB1bmRlZmluZWQpO1xuICAgKlxuICAgKi9cbiAgdXRpbC5tZXJnZShzaG91bGQsIGFzc2VydCk7XG5cblxuICAvKipcbiAgICogQXNzZXJ0IF9vYmpfIGV4aXN0cywgd2l0aCBvcHRpb25hbCBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IG9ialxuICAgKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHNob3VsZC5leGlzdCA9IHNob3VsZC5leGlzdHMgPSBmdW5jdGlvbihvYmosIG1zZykge1xuICAgIGlmKG51bGwgPT0gb2JqKSB7XG4gICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgICBtZXNzYWdlOiBtc2cgfHwgKCdleHBlY3RlZCAnICsgaShvYmopICsgJyB0byBleGlzdCcpLCBzdGFja1N0YXJ0RnVuY3Rpb246IHNob3VsZC5leGlzdFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnRzIF9vYmpfIGRvZXMgbm90IGV4aXN0LCB3aXRoIG9wdGlvbmFsIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gb2JqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBzaG91bGQubm90ID0ge307XG4gIHNob3VsZC5ub3QuZXhpc3QgPSBzaG91bGQubm90LmV4aXN0cyA9IGZ1bmN0aW9uKG9iaiwgbXNnKSB7XG4gICAgaWYobnVsbCAhPSBvYmopIHtcbiAgICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcih7XG4gICAgICAgIG1lc3NhZ2U6IG1zZyB8fCAoJ2V4cGVjdGVkICcgKyBpKG9iaikgKyAnIHRvIG5vdCBleGlzdCcpLCBzdGFja1N0YXJ0RnVuY3Rpb246IHNob3VsZC5ub3QuZXhpc3RcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgQXNzZXJ0aW9uLmFkZCgndHJ1ZScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXMuZXhhY3RseSh0cnVlKVxuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdmYWxzZScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXMuZXhhY3RseShmYWxzZSlcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnb2snLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSB0cnV0aHknIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaik7XG4gIH0sIHRydWUpO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuXG4gIGZ1bmN0aW9uIGFkZExpbmsobmFtZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBc3NlcnRpb24ucHJvdG90eXBlLCBuYW1lLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIFsnYW4nLCAnb2YnLCAnYScsICdhbmQnLCAnYmUnLCAnaGF2ZScsICd3aXRoJywgJ2lzJywgJ3doaWNoJ10uZm9yRWFjaChhZGRMaW5rKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBlcWwgPSByZXF1aXJlKCcuLi9lcWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICB2YXIgaSA9IHNob3VsZC5mb3JtYXQ7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnaW5jbHVkZScsIGZ1bmN0aW9uKG9iaiwgZGVzY3JpcHRpb24pIHtcbiAgICBpZighQXJyYXkuaXNBcnJheSh0aGlzLm9iaikgJiYgIXV0aWwuaXNTdHJpbmcodGhpcy5vYmopKSB7XG4gICAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBpbmNsdWRlIGFuIG9iamVjdCBlcXVhbCB0byAnICsgaShvYmopLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuICAgICAgdmFyIGNtcCA9IHt9O1xuICAgICAgZm9yKHZhciBrZXkgaW4gb2JqKSBjbXBba2V5XSA9IHRoaXMub2JqW2tleV07XG4gICAgICB0aGlzLmFzc2VydChlcWwoY21wLCBvYmopKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaW5jbHVkZSAnICsgaShvYmopLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgICB0aGlzLmFzc2VydCh+dGhpcy5vYmouaW5kZXhPZihvYmopKTtcbiAgICB9XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2luY2x1ZGVFcWwnLCBmdW5jdGlvbihvYmosIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaW5jbHVkZSBhbiBvYmplY3QgZXF1YWwgdG8gJyArIGkob2JqKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqLnNvbWUoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIGVxbChvYmosIGl0ZW0pO1xuICAgIH0pKTtcbiAgfSk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgZXFsID0gcmVxdWlyZSgnLi4vZXFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgQXNzZXJ0aW9uLmFkZCgnZXFsJywgZnVuY3Rpb24odmFsLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGVxdWFsJywgZXhwZWN0ZWQ6IHZhbCwgc2hvd0RpZmY6IHRydWUsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydChlcWwodmFsLCB0aGlzLm9iaikpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdlcXVhbCcsIGZ1bmN0aW9uKHZhbCwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZScsIGV4cGVjdGVkOiB2YWwsIHNob3dEaWZmOiB0cnVlLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQodmFsID09PSB0aGlzLm9iaik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcygnZXF1YWwnLCAnZXhhY3RseScpO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICB2YXIgaSA9IHNob3VsZC5mb3JtYXQ7XG5cbiAgQXNzZXJ0aW9uLmFkZCgndGhyb3cnLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgdmFyIGZuID0gdGhpcy5vYmpcbiAgICAgICwgZXJyID0ge31cbiAgICAgICwgZXJyb3JJbmZvID0gJydcbiAgICAgICwgb2sgPSB0cnVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZuKCk7XG4gICAgICBvayA9IGZhbHNlO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gZTtcbiAgICB9XG5cbiAgICBpZihvaykge1xuICAgICAgaWYoJ3N0cmluZycgPT0gdHlwZW9mIG1lc3NhZ2UpIHtcbiAgICAgICAgb2sgPSBtZXNzYWdlID09IGVyci5tZXNzYWdlO1xuICAgICAgfSBlbHNlIGlmKG1lc3NhZ2UgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgb2sgPSBtZXNzYWdlLnRlc3QoZXJyLm1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIGlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIG1lc3NhZ2UpIHtcbiAgICAgICAgb2sgPSBlcnIgaW5zdGFuY2VvZiBtZXNzYWdlO1xuICAgICAgfVxuXG4gICAgICBpZihtZXNzYWdlICYmICFvaykge1xuICAgICAgICBpZignc3RyaW5nJyA9PSB0eXBlb2YgbWVzc2FnZSkge1xuICAgICAgICAgIGVycm9ySW5mbyA9IFwiIHdpdGggYSBtZXNzYWdlIG1hdGNoaW5nICdcIiArIG1lc3NhZ2UgKyBcIicsIGJ1dCBnb3QgJ1wiICsgZXJyLm1lc3NhZ2UgKyBcIidcIjtcbiAgICAgICAgfSBlbHNlIGlmKG1lc3NhZ2UgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICBlcnJvckluZm8gPSBcIiB3aXRoIGEgbWVzc2FnZSBtYXRjaGluZyBcIiArIG1lc3NhZ2UgKyBcIiwgYnV0IGdvdCAnXCIgKyBlcnIubWVzc2FnZSArIFwiJ1wiO1xuICAgICAgICB9IGVsc2UgaWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgbWVzc2FnZSkge1xuICAgICAgICAgIGVycm9ySW5mbyA9IFwiIG9mIHR5cGUgXCIgKyBtZXNzYWdlLm5hbWUgKyBcIiwgYnV0IGdvdCBcIiArIGVyci5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvckluZm8gPSBcIiAoZ290IFwiICsgaShlcnIpICsgXCIpXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gdGhyb3cgZXhjZXB0aW9uJyArIGVycm9ySW5mbyB9O1xuXG4gICAgdGhpcy5hc3NlcnQob2spO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ3Rocm93JywgJ3Rocm93RXJyb3InKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8vdmFyIHN0YXR1c0NvZGVzID0gcmVxdWlyZSgnaHR0cCcpLlNUQVRVU19DT0RFUztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuXG4gIEFzc2VydGlvbi5hZGQoJ2hlYWRlcicsIGZ1bmN0aW9uKGZpZWxkLCB2YWwpIHtcbiAgICB0aGlzLmhhdmUucHJvcGVydHkoJ2hlYWRlcnMnKTtcbiAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eShmaWVsZC50b0xvd2VyQ2FzZSgpLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhdmUucHJvcGVydHkoZmllbGQudG9Mb3dlckNhc2UoKSk7XG4gICAgfVxuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdzdGF0dXMnLCBmdW5jdGlvbihjb2RlKSB7XG4gICAgLy90aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBoYXZlIHJlc3BvbnNlIGNvZGUgJyArIGNvZGUgKyAnICcgKyBpKHN0YXR1c0NvZGVzW2NvZGVdKVxuICAgIC8vICAgICsgJywgYnV0IGdvdCAnICsgdGhpcy5vYmouc3RhdHVzQ29kZSArICcgJyArIGkoc3RhdHVzQ29kZXNbdGhpcy5vYmouc3RhdHVzQ29kZV0pIH1cblxuICAgIHRoaXMuaGF2ZS5wcm9wZXJ0eSgnc3RhdHVzQ29kZScsIGNvZGUpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdqc29uJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5oYXZlLnByb3BlcnR5KCdoZWFkZXJzJylcbiAgICAgIC5hbmQuaGF2ZS5wcm9wZXJ0eSgnY29udGVudC10eXBlJykuaW5jbHVkZSgnYXBwbGljYXRpb24vanNvbicpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdodG1sJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5oYXZlLnByb3BlcnR5KCdoZWFkZXJzJylcbiAgICAgIC5hbmQuaGF2ZS5wcm9wZXJ0eSgnY29udGVudC10eXBlJykuaW5jbHVkZSgndGV4dC9odG1sJyk7XG4gIH0sIHRydWUpO1xufTsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGVxbCA9IHJlcXVpcmUoJy4uL2VxbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIHZhciBpID0gc2hvdWxkLmZvcm1hdDtcblxuICBBc3NlcnRpb24uYWRkKCdtYXRjaCcsIGZ1bmN0aW9uKG90aGVyLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIG1hdGNoICcgKyBpKG90aGVyKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIGlmKCFlcWwodGhpcy5vYmosIG90aGVyKSkge1xuICAgICAgaWYodXRpbC5pc1JlZ0V4cChvdGhlcikpIHsgLy8gc29tZXRoaW5nIC0gcmVnZXhcblxuICAgICAgICBpZih1dGlsLmlzU3RyaW5nKHRoaXMub2JqKSkge1xuXG4gICAgICAgICAgdGhpcy5hc3NlcnQob3RoZXIuZXhlYyh0aGlzLm9iaikpO1xuICAgICAgICB9IGVsc2UgaWYoQXJyYXkuaXNBcnJheSh0aGlzLm9iaikpIHtcblxuICAgICAgICAgIHRoaXMub2JqLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdGhpcy5hc3NlcnQob3RoZXIuZXhlYyhpdGVtKSk7Ly8gc2hvdWxkIHdlIHRyeSB0byBjb252ZXJ0IHRvIFN0cmluZyBhbmQgZXhlYz9cbiAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIGlmKHV0aWwuaXNPYmplY3QodGhpcy5vYmopKSB7XG5cbiAgICAgICAgICB2YXIgbm90TWF0Y2hlZFByb3BzID0gW10sIG1hdGNoZWRQcm9wcyA9IFtdO1xuICAgICAgICAgIHV0aWwuZm9yT3duKHRoaXMub2JqLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYob3RoZXIuZXhlYyh2YWx1ZSkpIG1hdGNoZWRQcm9wcy5wdXNoKGkobmFtZSkpO1xuICAgICAgICAgICAgZWxzZSBub3RNYXRjaGVkUHJvcHMucHVzaChpKG5hbWUpKTtcbiAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgIGlmKG5vdE1hdGNoZWRQcm9wcy5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0bm90IG1hdGNoZWQgcHJvcGVydGllczogJyArIG5vdE1hdGNoZWRQcm9wcy5qb2luKCcsICcpO1xuICAgICAgICAgIGlmKG1hdGNoZWRQcm9wcy5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0bWF0Y2hlZCBwcm9wZXJ0aWVzOiAnICsgbWF0Y2hlZFByb3BzLmpvaW4oJywgJyk7XG5cbiAgICAgICAgICB0aGlzLmFzc2VydChub3RNYXRjaGVkUHJvcHMubGVuZ3RoID09IDApO1xuICAgICAgICB9IC8vIHNob3VsZCB3ZSB0cnkgdG8gY29udmVydCB0byBTdHJpbmcgYW5kIGV4ZWM/XG4gICAgICB9IGVsc2UgaWYodXRpbC5pc0Z1bmN0aW9uKG90aGVyKSkge1xuICAgICAgICB2YXIgcmVzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlcyA9IG90aGVyKHRoaXMub2JqKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgaWYoZSBpbnN0YW5jZW9mIHNob3VsZC5Bc3NlcnRpb25FcnJvcikge1xuICAgICAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdCcgKyBlLm1lc3NhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZihyZXMgaW5zdGFuY2VvZiBBc3NlcnRpb24pIHtcbiAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0JyArIHJlcy5nZXRNZXNzYWdlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIHdlIHRocm93IGV4Y2VwdGlvbiBvayAtIGl0IGlzIHVzZWQgLnNob3VsZCBpbnNpZGVcbiAgICAgICAgaWYodXRpbC5pc0Jvb2xlYW4ocmVzKSkge1xuICAgICAgICAgIHRoaXMuYXNzZXJ0KHJlcyk7IC8vIGlmIGl0IGlzIGp1c3QgYm9vbGVhbiBmdW5jdGlvbiBhc3NlcnQgb24gaXRcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKHV0aWwuaXNPYmplY3Qob3RoZXIpKSB7IC8vIHRyeSB0byBtYXRjaCBwcm9wZXJ0aWVzIChmb3IgT2JqZWN0IGFuZCBBcnJheSlcbiAgICAgICAgbm90TWF0Y2hlZFByb3BzID0gW107IG1hdGNoZWRQcm9wcyA9IFtdO1xuXG4gICAgICAgIHV0aWwuZm9yT3duKG90aGVyLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMub2JqW2tleV0uc2hvdWxkLm1hdGNoKHZhbHVlKTtcbiAgICAgICAgICAgIG1hdGNoZWRQcm9wcy5wdXNoKGtleSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICBpZihlIGluc3RhbmNlb2Ygc2hvdWxkLkFzc2VydGlvbkVycm9yKSB7XG4gICAgICAgICAgICAgIG5vdE1hdGNoZWRQcm9wcy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYobm90TWF0Y2hlZFByb3BzLmxlbmd0aClcbiAgICAgICAgICB0aGlzLnBhcmFtcy5vcGVyYXRvciArPSAnXFxuXFx0bm90IG1hdGNoZWQgcHJvcGVydGllczogJyArIG5vdE1hdGNoZWRQcm9wcy5qb2luKCcsICcpO1xuICAgICAgICBpZihtYXRjaGVkUHJvcHMubGVuZ3RoKVxuICAgICAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRtYXRjaGVkIHByb3BlcnRpZXM6ICcgKyBtYXRjaGVkUHJvcHMuam9pbignLCAnKTtcblxuICAgICAgICB0aGlzLmFzc2VydChub3RNYXRjaGVkUHJvcHMubGVuZ3RoID09IDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnbWF0Y2hFYWNoJywgZnVuY3Rpb24ob3RoZXIsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gbWF0Y2ggZWFjaCAnICsgaShvdGhlciksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB2YXIgZiA9IG90aGVyO1xuXG4gICAgaWYodXRpbC5pc1JlZ0V4cChvdGhlcikpXG4gICAgICBmID0gZnVuY3Rpb24oaXQpIHtcbiAgICAgICAgcmV0dXJuICEhb3RoZXIuZXhlYyhpdCk7XG4gICAgICB9O1xuICAgIGVsc2UgaWYoIXV0aWwuaXNGdW5jdGlvbihvdGhlcikpXG4gICAgICBmID0gZnVuY3Rpb24oaXQpIHtcbiAgICAgICAgcmV0dXJuIGVxbChpdCwgb3RoZXIpO1xuICAgICAgfTtcblxuICAgIHV0aWwuZm9yT3duKHRoaXMub2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICB2YXIgcmVzID0gZih2YWx1ZSwga2V5KTtcblxuICAgICAgLy9pZiB3ZSB0aHJvdyBleGNlcHRpb24gb2sgLSBpdCBpcyB1c2VkIC5zaG91bGQgaW5zaWRlXG4gICAgICBpZih1dGlsLmlzQm9vbGVhbihyZXMpKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0KHJlcyk7IC8vIGlmIGl0IGlzIGp1c3QgYm9vbGVhbiBmdW5jdGlvbiBhc3NlcnQgb24gaXRcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfSk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNob3VsZCwgQXNzZXJ0aW9uKSB7XG4gIEFzc2VydGlvbi5hZGQoJ05hTicsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIE5hTicgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqICE9PSB0aGlzLm9iaik7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ0luZmluaXR5JywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgSW5maW5pdHknIH07XG5cbiAgICB0aGlzLmlzLmEuTnVtYmVyXG4gICAgICAuYW5kLm5vdC5hLk5hTlxuICAgICAgLmFuZC5hc3NlcnQoIWlzRmluaXRlKHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ3dpdGhpbicsIGZ1bmN0aW9uKHN0YXJ0LCBmaW5pc2gsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgd2l0aGluICcgKyBzdGFydCArICcuLicgKyBmaW5pc2gsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaiA+PSBzdGFydCAmJiB0aGlzLm9iaiA8PSBmaW5pc2gpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdhcHByb3hpbWF0ZWx5JywgZnVuY3Rpb24odmFsdWUsIGRlbHRhLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFwcHJveGltYXRlbHkgJyArIHZhbHVlICsgXCIgwrFcIiArIGRlbHRhLCBtZXNzYWdlOiBkZXNjcmlwdGlvbiB9O1xuXG4gICAgdGhpcy5hc3NlcnQoTWF0aC5hYnModGhpcy5vYmogLSB2YWx1ZSkgPD0gZGVsdGEpO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdhYm92ZScsIGZ1bmN0aW9uKG4sIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYWJvdmUgJyArIG4sIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaiA+IG4pO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdiZWxvdycsIGZ1bmN0aW9uKG4sIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYmVsb3cgJyArIG4sIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydCh0aGlzLm9iaiA8IG4pO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ2Fib3ZlJywgJ2dyZWF0ZXJUaGFuJyk7XG4gIEFzc2VydGlvbi5hbGlhcygnYmVsb3cnLCAnbGVzc1RoYW4nKTtcblxufTtcbiIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgZXFsID0gcmVxdWlyZSgnLi4vZXFsJyk7XG5cbnZhciBhU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgdmFyIGkgPSBzaG91bGQuZm9ybWF0O1xuXG4gIEFzc2VydGlvbi5hZGQoJ3Byb3BlcnR5JywgZnVuY3Rpb24obmFtZSwgdmFsKSB7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBwID0ge307XG4gICAgICBwW25hbWVdID0gdmFsO1xuICAgICAgdGhpcy5oYXZlLnByb3BlcnRpZXMocCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGF2ZS5wcm9wZXJ0aWVzKG5hbWUpO1xuICAgIH1cbiAgICB0aGlzLm9iaiA9IHRoaXMub2JqW25hbWVdO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWRkKCdwcm9wZXJ0aWVzJywgZnVuY3Rpb24obmFtZXMpIHtcbiAgICB2YXIgdmFsdWVzID0ge307XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIG5hbWVzID0gYVNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB9IGVsc2UgaWYoIUFycmF5LmlzQXJyYXkobmFtZXMpKSB7XG4gICAgICBpZih1dGlsLmlzU3RyaW5nKG5hbWVzKSkge1xuICAgICAgICBuYW1lcyA9IFtuYW1lc107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZXMgPSBuYW1lcztcbiAgICAgICAgbmFtZXMgPSBPYmplY3Qua2V5cyhuYW1lcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG9iaiA9IE9iamVjdCh0aGlzLm9iaiksIG1pc3NpbmdQcm9wZXJ0aWVzID0gW107XG5cbiAgICAvL2p1c3QgZW51bWVyYXRlIHByb3BlcnRpZXMgYW5kIGNoZWNrIGlmIHRoZXkgYWxsIHByZXNlbnRcbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGlmKCEobmFtZSBpbiBvYmopKSBtaXNzaW5nUHJvcGVydGllcy5wdXNoKGkobmFtZSkpO1xuICAgIH0pO1xuXG4gICAgdmFyIHByb3BzID0gbWlzc2luZ1Byb3BlcnRpZXM7XG4gICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwcm9wcyA9IG5hbWVzLm1hcChpKTtcbiAgICB9XG5cbiAgICB2YXIgb3BlcmF0b3IgPSAocHJvcHMubGVuZ3RoID09PSAxID9cbiAgICAgICd0byBoYXZlIHByb3BlcnR5ICcgOiAndG8gaGF2ZSBwcm9wZXJ0aWVzICcpICsgcHJvcHMuam9pbignLCAnKTtcblxuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogb3BlcmF0b3IgfTtcblxuICAgIHRoaXMuYXNzZXJ0KG1pc3NpbmdQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCk7XG5cbiAgICAvLyBjaGVjayBpZiB2YWx1ZXMgaW4gb2JqZWN0IG1hdGNoZWQgZXhwZWN0ZWRcbiAgICB2YXIgdmFsdWVDaGVja05hbWVzID0gT2JqZWN0LmtleXModmFsdWVzKTtcbiAgICBpZih2YWx1ZUNoZWNrTmFtZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgd3JvbmdWYWx1ZXMgPSBbXTtcbiAgICAgIHByb3BzID0gW107XG5cbiAgICAgIC8vIG5vdyBjaGVjayB2YWx1ZXMsIGFzIHRoZXJlIHdlIGhhdmUgYWxsIHByb3BlcnRpZXNcbiAgICAgIHZhbHVlQ2hlY2tOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVzW25hbWVdO1xuICAgICAgICBpZighZXFsKG9ialtuYW1lXSwgdmFsdWUpKSB7XG4gICAgICAgICAgd3JvbmdWYWx1ZXMucHVzaChpKG5hbWUpICsgJyBvZiAnICsgaSh2YWx1ZSkgKyAnIChnb3QgJyArIGkob2JqW25hbWVdKSArICcpJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvcHMucHVzaChpKG5hbWUpICsgJyBvZiAnICsgaSh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYod3JvbmdWYWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBwcm9wcyA9IHdyb25nVmFsdWVzO1xuICAgICAgfVxuXG4gICAgICBvcGVyYXRvciA9IChwcm9wcy5sZW5ndGggPT09IDEgP1xuICAgICAgICAndG8gaGF2ZSBwcm9wZXJ0eSAnIDogJ3RvIGhhdmUgcHJvcGVydGllcyAnKSArIHByb3BzLmpvaW4oJywgJyk7XG5cbiAgICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogb3BlcmF0b3IgfTtcblxuICAgICAgdGhpcy5hc3NlcnQod3JvbmdWYWx1ZXMubGVuZ3RoID09PSAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2xlbmd0aCcsIGZ1bmN0aW9uKG4sIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5oYXZlLnByb3BlcnR5KCdsZW5ndGgnLCBuLCBkZXNjcmlwdGlvbik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcygnbGVuZ3RoJywgJ2xlbmd0aE9mJyk7XG5cbiAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICBBc3NlcnRpb24uYWRkKCdvd25Qcm9wZXJ0eScsIGZ1bmN0aW9uKG5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gaGF2ZSBvd24gcHJvcGVydHkgJyArIGkobmFtZSksIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICB0aGlzLmFzc2VydChoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMub2JqLCBuYW1lKSk7XG5cbiAgICB0aGlzLm9iaiA9IHRoaXMub2JqW25hbWVdO1xuICB9KTtcblxuICBBc3NlcnRpb24uYWxpYXMoJ2hhc093blByb3BlcnR5JywgJ293blByb3BlcnR5Jyk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnZW1wdHknLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBlbXB0eScgfTtcblxuICAgIGlmKHV0aWwuaXNTdHJpbmcodGhpcy5vYmopIHx8IEFycmF5LmlzQXJyYXkodGhpcy5vYmopIHx8IHV0aWwuaXNBcmd1bWVudHModGhpcy5vYmopKSB7XG4gICAgICB0aGlzLmhhdmUucHJvcGVydHkoJ2xlbmd0aCcsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb2JqID0gT2JqZWN0KHRoaXMub2JqKTsgLy8gd3JhcCB0byByZWZlcmVuY2UgZm9yIGJvb2xlYW5zIGFuZCBudW1iZXJzXG4gICAgICBmb3IodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgICAgIHRoaXMuaGF2ZS5ub3Qub3duUHJvcGVydHkocHJvcCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdrZXlzJywgZnVuY3Rpb24oa2V5cykge1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBrZXlzID0gYVNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBlbHNlIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdXRpbC5pc1N0cmluZyhrZXlzKSkga2V5cyA9IFsga2V5cyBdO1xuICAgIGVsc2UgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkga2V5cyA9IFtdO1xuXG4gICAgdmFyIG9iaiA9IE9iamVjdCh0aGlzLm9iaik7XG5cbiAgICAvLyBmaXJzdCBjaGVjayBpZiBzb21lIGtleXMgYXJlIG1pc3NpbmdcbiAgICB2YXIgbWlzc2luZ0tleXMgPSBbXTtcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZighaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLm9iaiwga2V5KSlcbiAgICAgICAgbWlzc2luZ0tleXMucHVzaChpKGtleSkpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgLy8gc2Vjb25kIGNoZWNrIGZvciBleHRyYSBrZXlzXG4gICAgdmFyIGV4dHJhS2V5cyA9IFtdO1xuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmKGtleXMuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgICBleHRyYUtleXMucHVzaChpKGtleSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHZlcmIgPSBrZXlzLmxlbmd0aCA9PT0gMCA/ICd0byBiZSBlbXB0eScgOlxuICAgICAgJ3RvIGhhdmUgJyArIChrZXlzLmxlbmd0aCA9PT0gMSA/ICdrZXkgJyA6ICdrZXlzICcpO1xuXG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiB2ZXJiICsga2V5cy5tYXAoaSkuam9pbignLCAnKX07XG5cbiAgICBpZihtaXNzaW5nS2V5cy5sZW5ndGggPiAwKVxuICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKz0gJ1xcblxcdG1pc3Npbmcga2V5czogJyArIG1pc3NpbmdLZXlzLmpvaW4oJywgJyk7XG5cbiAgICBpZihleHRyYUtleXMubGVuZ3RoID4gMClcbiAgICAgIHRoaXMucGFyYW1zLm9wZXJhdG9yICs9ICdcXG5cXHRleHRyYSBrZXlzOiAnICsgZXh0cmFLZXlzLmpvaW4oJywgJyk7XG5cbiAgICB0aGlzLmFzc2VydChtaXNzaW5nS2V5cy5sZW5ndGggPT09IDAgJiYgZXh0cmFLZXlzLmxlbmd0aCA9PT0gMCk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hbGlhcyhcImtleXNcIiwgXCJrZXlcIik7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnY29udGFpbkVxbCcsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gY29udGFpbiAnICsgaShvdGhlcikgfTtcbiAgICB2YXIgb2JqID0gdGhpcy5vYmo7XG4gICAgaWYoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICB0aGlzLmFzc2VydChvYmouc29tZShmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBlcWwoaXRlbSwgb3RoZXIpO1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSBpZih1dGlsLmlzU3RyaW5nKG9iaikpIHtcbiAgICAgIC8vIGV4cGVjdCBvYmogdG8gYmUgc3RyaW5nXG4gICAgICB0aGlzLmFzc2VydChvYmouaW5kZXhPZihTdHJpbmcob3RoZXIpKSA+PSAwKTtcbiAgICB9IGVsc2UgaWYodXRpbC5pc09iamVjdChvYmopKSB7XG4gICAgICAvLyBvYmplY3QgY29udGFpbnMgb2JqZWN0IGNhc2VcbiAgICAgIHV0aWwuZm9yT3duKG90aGVyLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIG9iai5zaG91bGQuaGF2ZS5wcm9wZXJ0eShrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL290aGVyIHVuY292ZXJlZCBjYXNlc1xuICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgIH1cbiAgfSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnY29udGFpbkRlZXAnLCBmdW5jdGlvbihvdGhlcikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGNvbnRhaW4gJyArIGkob3RoZXIpIH07XG5cbiAgICB2YXIgb2JqID0gdGhpcy5vYmo7XG4gICAgaWYoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICBpZihBcnJheS5pc0FycmF5KG90aGVyKSkge1xuICAgICAgICB2YXIgb3RoZXJJZHggPSAwO1xuICAgICAgICBvYmouZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNob3VsZChpdGVtKS5ub3QuYmUubnVsbC5hbmQuY29udGFpbkRlZXAob3RoZXJbb3RoZXJJZHhdKTtcbiAgICAgICAgICAgIG90aGVySWR4Kys7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICBpZihlIGluc3RhbmNlb2Ygc2hvdWxkLkFzc2VydGlvbkVycm9yKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hc3NlcnQob3RoZXJJZHggPT0gb3RoZXIubGVuZ3RoKTtcbiAgICAgICAgLy9zZWFyY2ggYXJyYXkgY29udGFpbiBvdGhlciBhcyBzdWIgc2VxdWVuY2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYodXRpbC5pc1N0cmluZyhvYmopKSB7Ly8gZXhwZWN0IG90aGVyIHRvIGJlIHN0cmluZ1xuICAgICAgdGhpcy5hc3NlcnQob2JqLmluZGV4T2YoU3RyaW5nKG90aGVyKSkgPj0gMCk7XG4gICAgfSBlbHNlIGlmKHV0aWwuaXNPYmplY3Qob2JqKSkgey8vIG9iamVjdCBjb250YWlucyBvYmplY3QgY2FzZVxuICAgICAgaWYodXRpbC5pc09iamVjdChvdGhlcikpIHtcbiAgICAgICAgdXRpbC5mb3JPd24ob3RoZXIsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICBzaG91bGQob2JqW2tleV0pLm5vdC5iZS5udWxsLmFuZC5jb250YWluRGVlcCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHsvL29uZSBvZiB0aGUgcHJvcGVydGllcyBjb250YWluIHZhbHVlXG4gICAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lcWwob3RoZXIpO1xuICAgIH1cbiAgfSk7XG5cbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2hvdWxkLCBBc3NlcnRpb24pIHtcbiAgQXNzZXJ0aW9uLmFkZCgnc3RhcnRXaXRoJywgZnVuY3Rpb24oc3RyLCBkZXNjcmlwdGlvbikge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIHN0YXJ0IHdpdGggJyArIHNob3VsZC5mb3JtYXQoc3RyKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KDAgPT09IHRoaXMub2JqLmluZGV4T2Yoc3RyKSk7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2VuZFdpdGgnLCBmdW5jdGlvbihzdHIsIGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gZW5kIHdpdGggJyArIHNob3VsZC5mb3JtYXQoc3RyKSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqLmluZGV4T2Yoc3RyLCB0aGlzLm9iai5sZW5ndGggLSBzdHIubGVuZ3RoKSA+PSAwKTtcbiAgfSk7XG59OyIsIi8qIVxuICogU2hvdWxkXG4gKiBDb3B5cmlnaHQoYykgMjAxMC0yMDE0IFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaG91bGQsIEFzc2VydGlvbikge1xuICBBc3NlcnRpb24uYWRkKCdOdW1iZXInLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhIG51bWJlcicgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNOdW1iZXIodGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnYXJndW1lbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYXJndW1lbnRzJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc0FyZ3VtZW50cyh0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCd0eXBlJywgZnVuY3Rpb24odHlwZSwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBoYXZlIHR5cGUgJyArIHR5cGUsIG1lc3NhZ2U6IGRlc2NyaXB0aW9uIH07XG5cbiAgICAodHlwZW9mIHRoaXMub2JqKS5zaG91bGQuYmUuZXhhY3RseSh0eXBlLCBkZXNjcmlwdGlvbik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ2luc3RhbmNlb2YnLCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhbiBpbnN0YW5jZSBvZiAnICsgY29uc3RydWN0b3IubmFtZSwgbWVzc2FnZTogZGVzY3JpcHRpb24gfTtcblxuICAgIHRoaXMuYXNzZXJ0KE9iamVjdCh0aGlzLm9iaikgaW5zdGFuY2VvZiBjb25zdHJ1Y3Rvcik7XG4gIH0pO1xuXG4gIEFzc2VydGlvbi5hZGQoJ0Z1bmN0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYSBmdW5jdGlvbicgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNGdW5jdGlvbih0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdPYmplY3QnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhbiBvYmplY3QnIH07XG5cbiAgICB0aGlzLmFzc2VydCh1dGlsLmlzT2JqZWN0KHRoaXMub2JqKSk7XG4gIH0sIHRydWUpO1xuXG4gIEFzc2VydGlvbi5hZGQoJ1N0cmluZycsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGEgc3RyaW5nJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc1N0cmluZyh0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdBcnJheScsIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyYW1zID0geyBvcGVyYXRvcjogJ3RvIGJlIGFuIGFycmF5JyB9O1xuXG4gICAgdGhpcy5hc3NlcnQoQXJyYXkuaXNBcnJheSh0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdCb29sZWFuJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgYSBib29sZWFuJyB9O1xuXG4gICAgdGhpcy5hc3NlcnQodXRpbC5pc0Jvb2xlYW4odGhpcy5vYmopKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFkZCgnRXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmFtcyA9IHsgb3BlcmF0b3I6ICd0byBiZSBhbiBlcnJvcicgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHV0aWwuaXNFcnJvcih0aGlzLm9iaikpO1xuICB9LCB0cnVlKTtcblxuICBBc3NlcnRpb24uYWRkKCdudWxsJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB7IG9wZXJhdG9yOiAndG8gYmUgbnVsbCcgfTtcblxuICAgIHRoaXMuYXNzZXJ0KHRoaXMub2JqID09PSBudWxsKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgQXNzZXJ0aW9uLmFsaWFzKCdpbnN0YW5jZW9mJywgJ2luc3RhbmNlT2YnKTtcbn07IiwiLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbnZhciBzaG91bGQgPSByZXF1aXJlKCcuL3Nob3VsZCcpO1xuXG5zaG91bGRcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9hc3NlcnQnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9jaGFpbicpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2Jvb2wnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9udW1iZXInKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9lcWwnKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC90eXBlJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvc3RyaW5nJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvcHJvcGVydHknKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9odHRwJykpXG4gIC51c2UocmVxdWlyZSgnLi9leHQvZXJyb3InKSlcbiAgLnVzZShyZXF1aXJlKCcuL2V4dC9tYXRjaCcpKVxuICAudXNlKHJlcXVpcmUoJy4vZXh0L2RlcHJlY2F0ZWQnKSk7XG5cbiBtb2R1bGUuZXhwb3J0cyA9IHNob3VsZDsiLCIvKiFcbiAqIFNob3VsZFxuICogQ29weXJpZ2h0KGMpIDIwMTAtMjAxNCBUSiBIb2xvd2F5Y2h1ayA8dGpAdmlzaW9uLW1lZGlhLmNhPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG4gICwgQXNzZXJ0aW9uRXJyb3IgPSB1dGlsLkFzc2VydGlvbkVycm9yXG4gICwgaW5zcGVjdCA9IHV0aWwuaW5zcGVjdDtcblxuLyoqXG4gKiBPdXIgZnVuY3Rpb24gc2hvdWxkXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJucyB7QXNzZXJ0aW9ufVxuICovXG52YXIgc2hvdWxkID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBuZXcgQXNzZXJ0aW9uKHV0aWwuaXNXcmFwcGVyVHlwZShvYmopID8gb2JqLnZhbHVlT2YoKTogb2JqKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgQXNzZXJ0aW9uYCB3aXRoIHRoZSBnaXZlbiBfb2JqXy5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIEFzc2VydGlvbiA9IHNob3VsZC5Bc3NlcnRpb24gPSBmdW5jdGlvbiBBc3NlcnRpb24ob2JqKSB7XG4gIHRoaXMub2JqID0gb2JqO1xufTtcblxuXG4vKipcbiAgV2F5IHRvIGV4dGVuZCBBc3NlcnRpb24gZnVuY3Rpb24uIEl0IHVzZXMgc29tZSBsb2dpYyBcbiAgdG8gZGVmaW5lIG9ubHkgcG9zaXRpdmUgYXNzZXJ0aW9ucyBhbmQgaXRzZWxmIHJ1bGUgd2l0aCBuZWdhdGl2ZSBhc3NlcnRpb24uXG5cbiAgQWxsIGFjdGlvbnMgaGFwcGVuIGluIHN1YmNvbnRleHQgYW5kIHRoaXMgbWV0aG9kIHRha2UgY2FyZSBhYm91dCBuZWdhdGlvbi5cbiAgUG90ZW50aWFsbHkgd2UgY2FuIGFkZCBzb21lIG1vcmUgbW9kaWZpZXJzIHRoYXQgZG9lcyBub3QgZGVwZW5kcyBmcm9tIHN0YXRlIG9mIGFzc2VydGlvbi5cbiovXG5Bc3NlcnRpb24uYWRkID0gZnVuY3Rpb24obmFtZSwgZiwgaXNHZXR0ZXIpIHtcbiAgdmFyIHByb3AgPSB7fTtcbiAgcHJvcFtpc0dldHRlciA/ICdnZXQnIDogJ3ZhbHVlJ10gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBBc3NlcnRpb24odGhpcy5vYmopO1xuICAgIGNvbnRleHQuY29weSA9IGNvbnRleHQuY29weUlmTWlzc2luZztcblxuICAgIHRyeSB7XG4gICAgICBmLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvL2NvcHkgZGF0YSBmcm9tIHN1YiBjb250ZXh0IHRvIHRoaXNcbiAgICAgIHRoaXMuY29weShjb250ZXh0KTtcblxuICAgICAgLy9jaGVjayBmb3IgZmFpbFxuICAgICAgaWYoZSBpbnN0YW5jZW9mIHNob3VsZC5Bc3NlcnRpb25FcnJvcikge1xuICAgICAgICAvL25lZ2F0aXZlIGZhaWxcbiAgICAgICAgaWYodGhpcy5uZWdhdGUpIHtcbiAgICAgICAgICB0aGlzLm9iaiA9IGNvbnRleHQub2JqO1xuICAgICAgICAgIHRoaXMubmVnYXRlID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgICAgfVxuICAgICAgLy8gdGhyb3cgaWYgaXQgaXMgYW5vdGhlciBleGNlcHRpb25cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIC8vY29weSBkYXRhIGZyb20gc3ViIGNvbnRleHQgdG8gdGhpc1xuICAgIHRoaXMuY29weShjb250ZXh0KTtcbiAgICBpZih0aGlzLm5lZ2F0ZSkge1xuICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgIH1cblxuICAgIHRoaXMub2JqID0gY29udGV4dC5vYmo7XG4gICAgdGhpcy5uZWdhdGUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXNzZXJ0aW9uLnByb3RvdHlwZSwgbmFtZSwgcHJvcCk7XG59O1xuXG5Bc3NlcnRpb24uYWxpYXMgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBBc3NlcnRpb24ucHJvdG90eXBlW3RvXSA9IEFzc2VydGlvbi5wcm90b3R5cGVbZnJvbV1cbn07XG5cbnNob3VsZC5Bc3NlcnRpb25FcnJvciA9IEFzc2VydGlvbkVycm9yO1xudmFyIGkgPSBzaG91bGQuZm9ybWF0ID0gZnVuY3Rpb24gaSh2YWx1ZSkge1xuICBpZih1dGlsLmlzRGF0ZSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgIT09ICdmdW5jdGlvbicpIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpOyAvL3Nob3cgbWlsbGlzIGluIGRhdGVzXG4gIHJldHVybiBpbnNwZWN0KHZhbHVlLCB7IGRlcHRoOiBudWxsIH0pO1xufTtcblxuc2hvdWxkLnVzZSA9IGZ1bmN0aW9uKGYpIHtcbiAgZih0aGlzLCBBc3NlcnRpb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBFeHBvc2Ugc2hvdWxkIHRvIGV4dGVybmFsIHdvcmxkLlxuICovXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzaG91bGQ7XG5cblxuLyoqXG4gKiBFeHBvc2UgYXBpIHZpYSBgT2JqZWN0I3Nob3VsZGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3Nob3VsZCcsIHtcbiAgc2V0OiBmdW5jdGlvbigpe30sXG4gIGdldDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gc2hvdWxkKHRoaXMpO1xuICB9LFxuICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbkFzc2VydGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBBc3NlcnRpb24sXG5cbiAgYXNzZXJ0OiBmdW5jdGlvbihleHByKSB7XG4gICAgaWYoZXhwcikgcmV0dXJuO1xuXG4gICAgdmFyIHBhcmFtcyA9IHRoaXMucGFyYW1zO1xuXG4gICAgdmFyIG1zZyA9IHBhcmFtcy5tZXNzYWdlLCBnZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7XG4gICAgaWYoIW1zZykge1xuICAgICAgbXNnID0gdGhpcy5nZXRNZXNzYWdlKCk7XG4gICAgICBnZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgZXJyID0gbmV3IEFzc2VydGlvbkVycm9yKHtcbiAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgLCBhY3R1YWw6IHRoaXMub2JqXG4gICAgICAsIGV4cGVjdGVkOiBwYXJhbXMuZXhwZWN0ZWRcbiAgICAgICwgc3RhY2tTdGFydEZ1bmN0aW9uOiB0aGlzLmFzc2VydFxuICAgIH0pO1xuXG4gICAgZXJyLnNob3dEaWZmID0gcGFyYW1zLnNob3dEaWZmO1xuICAgIGVyci5vcGVyYXRvciA9IHBhcmFtcy5vcGVyYXRvcjtcbiAgICBlcnIuZ2VuZXJhdGVkTWVzc2FnZSA9IGdlbmVyYXRlZE1lc3NhZ2U7XG5cbiAgICB0aHJvdyBlcnI7XG4gIH0sXG5cbiAgZ2V0TWVzc2FnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdleHBlY3RlZCAnICsgaSh0aGlzLm9iaikgKyAodGhpcy5uZWdhdGUgPyAnIG5vdCAnOiAnICcpICtcbiAgICAgICAgdGhpcy5wYXJhbXMub3BlcmF0b3IgKyAoJ2V4cGVjdGVkJyBpbiB0aGlzLnBhcmFtcyAgPyAnICcgKyBpKHRoaXMucGFyYW1zLmV4cGVjdGVkKSA6ICcnKTtcbiAgfSxcblxuICBjb3B5OiBmdW5jdGlvbihvdGhlcikge1xuICAgIHRoaXMucGFyYW1zID0gb3RoZXIucGFyYW1zO1xuICB9LFxuXG4gIGNvcHlJZk1pc3Npbmc6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgaWYoIXRoaXMucGFyYW1zKSB0aGlzLnBhcmFtcyA9IG90aGVyLnBhcmFtcztcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBOZWdhdGlvbiBtb2RpZmllci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZ2V0IG5vdCgpIHtcbiAgICB0aGlzLm5lZ2F0ZSA9ICF0aGlzLm5lZ2F0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuIiwiKGZ1bmN0aW9uIChCdWZmZXIpe1xuLyohXG4gKiBTaG91bGRcbiAqIENvcHlyaWdodChjKSAyMDEwLTIwMTQgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qKlxuICogQ2hlY2sgaWYgZ2l2ZW4gb2JqIGp1c3QgYSBwcmltaXRpdmUgdHlwZSB3cmFwcGVyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnRzLmlzV3JhcHBlclR5cGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNOdW1iZXIob2JqKSB8fCBpc1N0cmluZyhvYmopIHx8IGlzQm9vbGVhbihvYmopO1xufTtcblxuLyoqXG4gKiBNZXJnZSBvYmplY3QgYiB3aXRoIG9iamVjdCBhLlxuICpcbiAqICAgICB2YXIgYSA9IHsgZm9vOiAnYmFyJyB9XG4gKiAgICAgICAsIGIgPSB7IGJhcjogJ2JheicgfTtcbiAqXG4gKiAgICAgdXRpbHMubWVyZ2UoYSwgYik7XG4gKiAgICAgLy8gPT4geyBmb286ICdiYXInLCBiYXI6ICdiYXonIH1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbihhLCBiKXtcbiAgaWYgKGEgJiYgYikge1xuICAgIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiBhO1xufTtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fCBhcmcgaW5zdGFuY2VvZiBOdW1iZXI7XG59XG5cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fCBhcmcgaW5zdGFuY2VvZiBTdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fCBhcmcgaW5zdGFuY2VvZiBCb29sZWFuO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBhcmcgaW5zdGFuY2VvZiBCdWZmZXI7XG59XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSBpc0J1ZmZlcjtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cblxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuXG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gb2JqZWN0VG9TdHJpbmcob2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmV4cG9ydHMuaXNBcmd1bWVudHMgPSBpc0FyZ3VtZW50cztcblxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nIHx8IGFyZyBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xufTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiAoaXNPYmplY3QoZSkgJiYgb2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScpIHx8IChlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZXhwb3J0cy5pbnNwZWN0ID0gcmVxdWlyZSgndXRpbCcpLmluc3BlY3Q7XG5cbmV4cG9ydHMuQXNzZXJ0aW9uRXJyb3IgPSByZXF1aXJlKCdhc3NlcnQnKS5Bc3NlcnRpb25FcnJvcjtcblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZXhwb3J0cy5mb3JPd24gPSBmdW5jdGlvbihvYmosIGYsIGNvbnRleHQpIHtcbiAgZm9yKHZhciBwcm9wIGluIG9iaikge1xuICAgIGlmKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuICAgICAgZi5jYWxsKGNvbnRleHQsIG9ialtwcm9wXSwgcHJvcCk7XG4gICAgfVxuICB9XG59O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyKSJdfQ==
