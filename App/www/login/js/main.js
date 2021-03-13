"use strict";

$(document).ready(function () {
    let input = $('.validate-input .input100');
    let canLogin=true;

    $('.login100-form-btn').on('click', function () {
        if(canLogin)
        {
            login();
        }
    });

    $(document).on('keydown', function (e) {
        if (e.keyCode == 13 && canLogin) {
            login();
        }
    });

    $('.txt2').on("click", function () {
        if (!(input.eq(1).css("display") == "none"))
        {
            $("#pwContainer").css("display", "none");
            swalMsg("Write the email address, we send to you a mail with your new password", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            });
        }
        else
        {
            if (validate(input[0]) == false)
            {
                showValidate(input[0]);
            }
            else
            {
                let requestMail=makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/findMail/", {
                    "email": input.eq(0).val()
                });
                
                requestMail.fail(error)
                requestMail.done(function(data1){
                    let requestPW = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/randomPW/", {
                        "email": input.eq(0).val()
                    });

                    requestPW.fail(error);
                    requestPW.done(function (data2) {
                        swalMsg("A new password was sent to your mailbox", "success", "Good!", {
                            cancel: false,
                            confirm: "Close"
                        });
                        $("#pwContainer").css("display", "block");
                    });
                });
            }
        }
    });

    $(".toggle-password").on("click", function () {

        $(this).toggleClass("fa-eye fa-eye-slash");
        if (input.eq(1).prop("type") == "password") 
        {
            input.eq(1).prop("type", "text");
        } else 
        {
            input.eq(1).prop("type", "password");
        }
    });

    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        let thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        let thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    function login() {
        let check = true;
        canLogin=false;

        for (let i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        if (check) {
            let passMd5 = CryptoJS.MD5(input.eq(1).val()).toString();
            let request = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/login/", {
                "email": input.eq(0).val(),
                "password": passMd5
            });

            request.fail(function(jqXHR, testStatus, strError)
            {
                canLogin=true;
                error(jqXHR, testStatus, strError)
            });
            request.done(function (data) {
                localStorage.setItem("SyphonCookie", data.ris);
                window.location.href="index.html";
            });
        }
    }

    function swalMsg(msg, icon, title, buttons, callback=null){
        swal(msg, {
            icon: icon,
            title: title,
            buttons: buttons
        }).then((value) => {
            if (typeof callback === 'function')
            {
                callback();
            }
        });
    }
});