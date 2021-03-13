"use strict";

$(document).ready(function () {
    let input = $('.validate-input .input100');
    let retArrow=$("#return").hide();
    let btn=$('.login100-form-btn');
    let pwContainer=$("#pwContainer");
    
    let canLogin=true;
    let newUser=false;
    let sendRequest=false;

    let buttons=["Login", "Send request"];

    btn.on('click', function () {
        onButtonClick();
    });

    $(document).on('keydown', function (e) {
        if (e.keyCode == 13) {
            onButtonClick();
        }
    });

    $('.txt2').on("click", function () {
        if (pwContainer.is(":visible"))
        {
            swalMsg("Write the email address, we send to you a mail with your new password", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            }, function(){
                pwContainer.hide(700, function(){
                    retArrow.show();
                });
                btn.text(buttons[1]);
                newUser=this.hasAttribute("data-newuser");
                canLogin=false;
                sendRequest=true;
            });
        }
    });

    retArrow.on("click", function(){
        retArrow.hide(0, function(){
            pwContainer.show(700);
        });
        btn.text(buttons[0]);
        newUser=false;
        canLogin=true;
        sendRequest=false;
    })

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
        canLogin=false;
        let check = true;

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
                window.location.replace("index.html");
            });
        }
    }

    function onButtonClick(){
        if(canLogin)
        { 
            login();
        }
        else if(sendRequest)
        {
            requested();
        }
    }

    function requested()
    {
        if (validate(input[0]) == false)
        {
            showValidate(input[0]);
        }
        else
        {
            if(!newUser)
            {
                let requestMail=makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/findMail/", {
                "email": input.eq(0).val()
                });
                
                requestMail.fail(error)
                requestMail.done(function(data1){
                    sendRandomPW(input.eq(0).val())
                });
            }
            else
            {
                //
            }
        }
    }

    function sendRandomPW(email)
    {
        let requestPW = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/randomPW/", {
            "email": email
        });

        requestPW.fail(error);
        requestPW.done(function (data2) {
            swalMsg("A new password was sent to your mailbox", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            });
            $("#pwContainer").css("display", "block");
        });
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