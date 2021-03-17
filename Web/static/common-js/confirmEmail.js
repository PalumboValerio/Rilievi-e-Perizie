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
            Swal.fire({
                title: 'Good!',
                text: "A new password was sent to your mailbox!",
                icon: 'success',
                confirmButtonText: 'Close'
            }).then((value) => {
                close();
            });
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
            Swal.fire({
                title: 'Good!',
                text: "Your account was created. Check your mailbox!",
                icon: 'success',
                confirmButtonText: 'Close'
            }).then((value) => {
                close();
            });
        });
    }
});