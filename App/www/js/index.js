$(document).ready(function () {
    document.addEventListener('deviceready', function () { 
        /**************** START *********************/
        let email=$("#email");
        let name=$("#name");
        let surname=$("#surname");
        let newPW=$("#newPassword");
        let confPW=$("#confirmPassword");
        
        let form=$("#modal");
        let txtEmail=$("#input_5");
        let txtCoords=$("#input_9");
        let txtDateTime=$("#input_11");
        let txtNotes=$("#input_8");
        let images=[];

        let btnAppraisals=$("#btnAppraisals");
        let btnUser=$("#btnUser");
        let btnSubmit=$("#btnSubmit");
        let btnPhoto=$("#btnPhoto");

        if(!localStorage.getItem("SyphonUser"))
        {
            window.location.replace("login.html");
        }

        updateUserData();

        let cameraOptions = {
            "quality": 50
        };

        let gpsOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        /**************** FORM *********************/

        $(".close").on("click", function(){
            form.css("display", "none");
        })

        btnAppraisals.on("click", function () {
            $(this).prop("disabled", true);

            navigator.geolocation.getCurrentPosition(function (pos) 
            {
                txtCoords.val(`Lat: ${pos.coords.latitude} | Lon: ${pos.coords.longitude}`);
                txtDateTime.val((new Date).toISOString());

                form.css("display", "block");
                btnAppraisals.prop("disabled", false);

            }, errore, gpsOptions);
        });

        btnPhoto.on("click", function()
        {
            cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
            cameraOptions.destinationType = Camera.DestinationType.DATA_URL;
            navigator.camera.getPicture(success, errore, cameraOptions);
        })

        $(".toggle-password").on("click", function () {

            $(this).toggleClass("fa-eye fa-eye-slash");
            let input=$(this).siblings();
            if (input.prop("type") == "password") 
            {
                input.prop("type", "text");
            } else 
            {
                input.prop("type", "password");
            }
        });

        btnSubmit.on("click", function(){
            $(this).prop("disabled", true);

            let requestAppraisals=makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/newAppraisals/", {
                "user" : txtEmail.val(),
                "coord" : txtCoords.val(),
                "dateOf" : txtDateTime.val(),
                "userNotes" : txtNotes.val(),
                "image" : images
            });
            
            requestAppraisals.fail(function(jqXHR, testStatus, strError){
                btnSubmit.prop("disabled", false);
                error(jqXHR, testStatus, strError);
            });

            requestAppraisals.done(function(data){
                swalMsg("Your appraisals was uploaded", "success", "Good!", {
                    cancel: false,
                    confirm: "Close"
                }, function(){
                    txtNotes.val("");
                    form.css("display", "none");
                    btnSubmit.prop("disabled", false);
                })
            });
        });

        /**************** MAIN *********************/

        btnUser.on("click", function () 
        {
            $(this).prop("disabled", true);

            if(newPW.val().trim() == confPW.val().trim())
            {
                let passMd5;
                if(newPW.val().trim() != "")
                {
                    passMd5 = CryptoJS.MD5(newPW.val().trim()).toString();
                }
                else
                {
                    passMd5 = "";
                }

                let request = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/updateUser/", {
                    "email": email.val().trim(),
                    "name": name.val().trim(),
                    "surname": surname.val().trim(),
                    "password": passMd5
                });

                request.fail(function(jqXHR, testStatus, strError){
                    btnUser.prop("disabled", false);
                    error(jqXHR, testStatus, strError);
                });

                request.done(function (info) {
                    let requestMail=makeRequest("GET", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/findMail/", {
                        "email": email.val().trim()
                    });
                    
                    requestMail.fail(function(jqXHR, testStatus, strError){
                        btnUser.prop("disabled", false);
                        error(jqXHR, testStatus, strError);
                    })
                    requestMail.done(function(data){
                        localStorage.setItem("SyphonUser", JSON.stringify(data));
                        updateUserData();
                        newPW.val("");
                        confPW.val("");
                        btnUser.prop("disabled", false);
                        swalMsg("Your data was updated", "success", "Good!", {
                            cancel: false,
                            confirm: "Close"
                        })
                    });
                });
            }
        });

        $("#btnLogout").on("click", function () {
            localStorage.removeItem("SyphonUser");
            window.location.replace("login.html");
        });

        /**************** FUNCTION *********************/

        function success(image) {
            $("#img_14").prop("src", `data:image/jpeg;base64,${image}`);
            
            let requestImage=makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/uploadImage/", {
                "file" : image
            });
            
            requestImage.fail(function(jqXHR, testStatus, strError){
                btnSubmit.prop("disabled", false);
                error(jqXHR, testStatus, strError);
            });

            requestImage.done(function(result){
                images.push(result["result"]["secure_url"]);
            });
        }

        function errore(err) {
            if (err.code) {
                swalMsg(`Errore: ${err.code}-${err.message}`, "error", "Good!", {
                    cancel: false,
                    confirm: "Close"
                })
            }
            btnAppraisals.prop("disabled", false);
            btnSubmit.prop("disabled", false);
        }

        function updateUserData()
        {
            let userData=JSON.parse(localStorage.getItem("SyphonUser"));
            email.val(userData.email);
            name.val(userData.name);
            surname.val(userData.surname);
            txtEmail.val(userData.email);
        }
    });
});