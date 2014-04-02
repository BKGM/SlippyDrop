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