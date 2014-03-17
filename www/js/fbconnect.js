(function(FBConnect){
    // var BKGM = BKGM||{}; 
    function dataURItoBlob(dataURI,mime) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs

        var byteString = window.atob(dataURI);

        // separate out the mime component


        // write the bytes of the string to an ArrayBuffer
        //var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ia], { type: mime });

        return blob;
    };
    function binEncode(data) {

        //array holds the initial set of un-padded binary results
        var binArray = []

        //the string to hold the padded results
        var datEncode = "";

        //encode each character in data to it's binary equiv and push it into an array
        for (i=0; i < data.length; i++) {
        binArray.push(data[i].charCodeAt(0).toString(2));

        }

        //loop through binArray to pad each binary entry.
        for (j=0; j < binArray.length; j++) {
        //pad the binary result with zeros to the left to ensure proper 8 bit binary
        var pad = padding_left(binArray[j], '0', 8);

        //append each result into a string
        datEncode += pad + ' ';

        }

        //function to check if each set is encoded to 8 bits, padd the left with zeros if not.

        function padding_left(s, c, n) {
        if (! s || ! c || s.length >= n) {
        return s;
        }

        var max = (n - s.length)/c.length;
        for (var i = 0; i < max; i++) {
        s = c + s;
        }

        return s;
        }

        //print array of unpadded results in console
        console.log(binArray);

        //string of padded results in console
        return datEncode;
    };
    function PostImageToFacebook(authToken, filename, mimeType, imageData)
    {
        if (imageData != null)
        {
            //Prompt the user to enter a message
            //If the user clicks on OK button the window method prompt() will return entered value from the text box. 
            //If the user clicks on the Cancel button the window method prompt() returns null.
            var message = prompt('Facebook', 'Enter a message');

            if (message != null)
            {
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
                xhr.onload = xhr.onerror = function() {
                };
                xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
                xhr.sendAsBinary(formData);
            }
        }
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
            this.getAuthResponse(function(access_token,uid){
                // var uid = authResponse.userID;
                // var access_token = authResponse.accessToken;
                var canvas = document.getElementById("game");
                var imageData = canvas.toDataURL("image/png");
                var mess =message || "http://fb.com/BKGameMaker.com";
                try{
                        blob = dataURItoBlob(imageData,"image/png");
                }catch(e){console.log(e);}
                var fd = new FormData();
                fd.append("access_token",access_token);
                fd.append("source", blob);fd.append("message","Kiss");
                try{
                   $.ajax({
                        url:"https://graph.facebook.com/" + uid + "/photos?access_token=" + access_token,
                        type:"POST"
                        data:fd,
                        processData:false,
                        contentType:false,
                        cache:false,
                        success:function(data){
                            alert("success " + data);
                        },
                        error:function(shr,status,data){
                            console.log("error " + data + " Status " + shr.status);
                        },
                        complete:function(){
                            console.log("Ajax Complete");
                        }
                    });

                }catch(e){console.log(e);}

                // blob = binEncode(imageData.split(',')[1]);
                // alert(blob);
                // PostImageToFacebook(access_token, "filename", 'image/png', blob)
                // var fd = new FormData();
                // fd.append("access_token", access_token);
                // fd.append("source", blob);
                // fd.append("message", mess);
                // try {
                //     $.ajax({
                //         url: "https://graph.facebook.com/me/photos?access_token=" + access_token,
                //         type: "POST",
                //         data: fd,
                //         processData: false,
                //         contentType: false,
                //         cache: false,
                //         success: function (data) {
                //             console.log("success " + data);
                //             $("#poster").html("Posted Canvas Successfully");
                //         },
                //         error: function (shr, status, data) {
                //             console.log("error " + data + " Status " + shr.status);
                //         },
                //         complete: function () {
                //             console.log("Posted to facebook");
                //         }
                //     });

                // } catch (e) {
                //     console.log(e);
                // }
            });

            

        }
    };
   
})();