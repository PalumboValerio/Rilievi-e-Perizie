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
        let _this=$(this);
        if (pwContainer.is(":visible"))
        {
            swalMsg("Write the email address, we send to you a mail with your new password", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            }, function(){
                pwContainer.hide(700, function(){
                    retArrow.fadeIn(400);
                });
                btn.text(buttons[1]);
                newUser=_this.hasClass("newUser");
                canLogin=false;
                sendRequest=true;
            });
        }
    });

    retArrow.on("click", function(){
        retArrow.fadeOut(400, function(){
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
        if($(input).prop("name")=="pass")
        {
            $(".fa-eye").hide();
        }
    }

    function hideValidate(input) {
        let thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
        if($(input).prop("name")=="pass")
        {
            $(".fa-eye").show();
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
            let passMd5 = CryptoJS.MD5(input.eq(1).val().trim()).toString();
            let request = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/login/", {
                "email": input.eq(0).val().trim(),
                "password": passMd5
            });

            request.fail(function(jqXHR, testStatus, strError)
            {
                canLogin=true;
                error(jqXHR, testStatus, strError)
            });
            request.done(function (data) {
                localStorage.setItem("SyphonUser", JSON.stringify(data));
                window.location.replace("index.html");
            });
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
            let email=input.eq(0).val();
            if(!newUser)
            {
                let request=makeRequest("GET", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/findMail/", {
                    "email": email
                });
                
                request.fail(error)
                request.done(function(data){
                    if(data.ris != "nok")
                    {
                        sendConfirmEmail(email);
                    }
                    else
                    {
                        swalMsg("This email address is not register yet", "error", "Error!", {
                            cancel: false,
                            confirm: "Close"
                        })
                    }
                });
            }
            else
            {
                sendConfirmEmail(email);
            }
        }
    }

    function sendConfirmEmail(email)
    {
        let request = makeRequest("POST", "https://palumbo-rilievi-e-perizie.herokuapp.com/api/confirmEmail/",
        {
            "email": email,
            "newUser": newUser
        });

        request.fail(error);
        request.done(function(data)
        {
            swalMsg("Confirm your identity to receive a new password! Check your mailbox", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            })
        });
    }
});