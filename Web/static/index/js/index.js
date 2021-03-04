"use strict";
$(document).ready(function(){
    $("#btnLogout").on("click", function(){
        let request = makeRequest("POST", "/api/logout/");
        request.fail(error);
        request.done(function(data)
        {
            console.log(data);
			window.location.reload();
        });
    })
})