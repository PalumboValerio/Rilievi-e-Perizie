"use strict"
function makeRequest(method, url, parameters = {}) {
    let contentType;
    if (method.toUpperCase() == "GET")
    {
        contentType = "application/x-www-form-urlencoded; charset=UTF-8"
    }
    else
    {
        contentType = "application/json; charset=UTF-8"
        parameters = JSON.stringify(parameters);
    }

    return $.ajax({
        url: url, //default: currentPage
        type: method,
        data: parameters,
        contentType: contentType,
        dataType: "json",
        timeout: 500000
    });
}


function error(jqXHR, testStatus, strError) {
    if (jqXHR.status == 0)
    {
        swal("Error!", "Connection refused or Server timeout", "error");
    }
    else if(jqXHR.status == 403)
    {
        window.location.href="../../login.html";
    }
    else if (jqXHR.status == 200)
    {
        swal("Error!", "Data format uncorrect: " + jqXHR.responseText, "error");
    }
    else
    {
        swal("Error!", "Server Error: " + jqXHR.status + " - " + jqXHR.responseText, "error");
    }
}

function doned(data) {
    console.log(data);
}

function userLogged(callback=null)
{
    let request=makeRequest("POST", "/api/checkToken");
    let logged = false;

    request.fail(function()
    {
        logged=false;
        if (typeof callback === 'function')
        {
            callback(logged);
        }
    });

    request.done(function(data){
        if(data["ris"]!="noToken")
        {
            logged=true;
        }
        else
        {
            logged=false;
        }

        if (typeof callback === 'function')
        {
            callback(logged);
        }
    });
}

function logout()
{
    let reqLogout=makeRequest("POST","api/logout");
    reqLogout.fail(error);
    reqLogout.done(function(data){
        window.location.reload();
    });
}

function getParameters()
{
    let params=window.location.search.replace("?", "").split("&");
    let returnedParams={};

    for(let i=0; i<params.length;i++)
    {
        let thisParameter=params[i].split("=");
        returnedParams[thisParameter[0]]=thisParameter[1];
    }
    return returnedParams;
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