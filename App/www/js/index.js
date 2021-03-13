$(document).ready(function () {
    document.addEventListener('deviceready', function () {
        let form=$("#modal");
        let txtEmail=$("#input_5");
        let txtCoords=$("#input_9");
        let txtDateTime=$("#input_11");
        let txtNotes=$("#input_8");

        if(!localStorage.getItem("SyphonCookie"))
        {
            window.location.href="login.html";
            window.history.pushState([], "<name>", "<url>")
            $ionicViewService.clearHistory();
        }

        let cameraOptions = {
            "quality": 50
        };

        let gpsOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        $(".close").on("click", function(){
            form.css("display", "none");
        })

        $("#btnPhoto").on("click", function () {
            cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
            cameraOptions.destinationType = Camera.DestinationType.DATA_URL;
            navigator.camera.getPicture(success, error, cameraOptions);
        });

        $("#btnLogout").on("click", function () {
            localStorage.removeItem("SyphonCookie");
            window.location.href="login.html";
        });

        /*$("#btnCerca").on("click", function(){
            cameraOptions.sourceType=Camera.PictureSourceType.SAVEDPHOTOALBUM;
            cameraOptions.destinationType=Camera.DestinationType.DATA_URL;
            navigator.camera.getPicture(success, error, cameraOptions);
        });*/

        function success(image) {
            $("#img_14").prop("src", `data:image/jpeg;base64,${image}`);
            let date = new Date();
            // Codice/Mail operatore da reperire dal db. Dopo il login riuscito, salvarsi la mail
            // Note mediante una comparsa di una form che conterrà preview della foto scattata, 
            // posizione, data e ora e una input box per un eventuale commento facoltativo
            navigator.geolocation.getCurrentPosition(function (pos) {
                // Appare la form con la conferma dell'inserimento. Premendo su conferma si chiama il
                // server e gli si passano i dati per inserire nel db la nuova perizia
                txtEmail.val("prova@syphon.com");
                txtCoords.val(`Lat: ${pos.coords.latitude} - Lon: ${pos.coords.longitude}`);
                txtDateTime.val(date.toUTCString());

                form.css("display", "block");
            }, error, gpsOptions);
        }

        function error(err) {
            if (err.code) {
                notifica(`Errore: ${err.code}-${err.message}`);
            }
        }

        function notifica(msg) {
            navigator.notification.alert(
                msg,
                voidFunction,
                "Info", // Titolo finestra
                "Ok" // pulsante di chiusura
            );
        }

        let voidFunction = function () {}
    });
});