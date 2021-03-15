"use strict";

$(document).ready(function(){
    let input = $('.validate-input .input100');

    $('.login100-form-btn').on('click',function(){
        login();
    });

    $(document).on('keydown', function(e) {
        if (e.keyCode == 13)
        {
            login();
        }
    });

    $('.txt2').on("click", function () {
        let request = makeRequest("POST", "/api/confirmEmail/",
        {
            "email":"syphon.ict@gmail.com",
            "newUser": false
        });

        request.fail(error);
        request.done(function(data)
        {
            swalMsg("Confirm your identity to receive a new password! Check Admin's mailbox", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            })
        });
    });

    $(".toggle-password").on("click", function() {

        $(this).toggleClass("fa-eye fa-eye-slash");
        if (input.eq(1).prop("type") == "password") {
          input.eq(1).prop("type", "text");
        } else {
          input.eq(1).prop("type", "password");
        }
      });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
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
    
    function login() {
        let check = true;

        for(let i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        if(check=false)
        {
            return;
        }
        else
        {
            let passMd5 = CryptoJS.MD5(input.eq(1).val().trim()).toString();
            let request = makeRequest("POST", "/api/login/",
            {
                "email":input.eq(0).val().trim(),
                "password":passMd5,
                "admin":true
            });

            request.fail(error);
            request.done(function(data)
            {
                window.location.reload();
            });
        }
    }
});