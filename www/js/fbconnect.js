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
        alert("goi FBConnect");
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
    
   
})();