"use strict"

$(document).ready(function()
{
    let param = getParameters();
    param.newUser = param.newUser == "true";

    if(!param.newUser)
    {
        let request = makeRequest("POST", "/api/forgotPW/",
        {
            "email": param.email
        });

        request.fail(error);
        request.done(function(data)
        {
            swalMsg("A new password was sent to your mailbox!", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            }, function(){
                close();
            })
        });
    }
    else
    {
        let request = makeRequest("POST", "/api/signUp/",
        {
            "email": param.email
        });

        request.fail(error);
        request.done(function(data)
        {
            swalMsg("Your account was created. Check your mailbox!", "success", "Good!", {
                cancel: false,
                confirm: "Close"
            }, function(){
                close();
            })
        });
    }
});