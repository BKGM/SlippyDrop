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
            alert(message);
            
        }
    };
   
})();