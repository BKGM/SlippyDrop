(function(){
    var BKGM = BKGM||{};    
    BKGM.FBConnect = function(obj,callback){
        var app_id="296632137153437";
        if (obj){
            app_id=obj.appId;
        }
        var loaded=0;
        var _onLoad=function(){
            loaded++;
            if(loaded==2){
                try {
                    if (cordova) FB.init({ appId: app_id, nativeInterface: CDV.FB, useCachedDialogs: false });
                    else FB.init({ appId: app_id,status: true,xfbml: truecookie: true,frictionlessRequests: true,oauth: true});
                } catch (e) {
                    alert(e);
                }
                if (callback) callback();
                }       
                
        }
        if (BKGM.loadJS)  {
            if (cordova){
                BKGM.loadJS('cdv-plugin-fb-connect.js',_onLoad);
                BKGM.loadJS('facebook-js-sdk.js',_onLoad);
            } else {
                _onLoad();
                BKGM.loadJS('//connect.facebook.net/en_US/all.js',_onLoad);
            }

           
        }
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
            var mess =message || "http://fb.com/BKGameMaker.com"
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
    }
})();