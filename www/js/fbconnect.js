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
        }
        
    };
   
})();