(function(FBConnect){
    // var BKGM = BKGM||{}; 
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
                FB.init({ appId: app_id, nativeInterface: CDV.FB, useCachedDialogs: false });
                //FB.init({ appId: app_id,status: true,xfbml: truecookie: true,frictionlessRequests: true,oauth: true});
            } catch (e) {
                alert(e);
            }
            FB.Event.subscribe('auth.statusChange', self.handleStatusChange);
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
                            alert(response.authResponse.userId);
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
            var canvas = document.getElementById("game");
                var imageData = canvas.toDataURL("image/png");
                var mess =message || "http://fb.com/BKGameMaker.com";
                window.plugins.socialsharing.share(message, null, imageData , null);
            // this.getAuthResponse(function(access_token,uid){
            //     // var uid = authResponse.userID;
            //     // var access_token = authResponse.accessToken;
            //     alert(uid);

            //     // try {
            //     //     blob = dataURItoBlob(imageData);
            //     // } catch (e) {
            //     //     console.log(e);
            //     // }

            //     // var fd = new FormData();
            //     // fd.append("access_token", access_token);
            //     // fd.append("source", blob);
            //     // fd.append("message", mess);
            //     // try {
            //     //     $.ajax({
            //     //         url: "https://graph.facebook.com/me/photos?access_token=" + access_token,
            //     //         type: "POST",
            //     //         data: fd,
            //     //         processData: false,
            //     //         contentType: false,
            //     //         cache: false,
            //     //         success: function (data) {
            //     //             console.log("success " + data);
            //     //             $("#poster").html("Posted Canvas Successfully");
            //     //         },
            //     //         error: function (shr, status, data) {
            //     //             console.log("error " + data + " Status " + shr.status);
            //     //         },
            //     //         complete: function () {
            //     //             console.log("Posted to facebook");
            //     //         }
            //     //     });

            //     // } catch (e) {
            //     //     console.log(e);
            //     // }
            // });

            // if (!this.isLogin) {
            //     alert('Error! Not login FB');
            //     return;
            // }

        }
    };
   
})();