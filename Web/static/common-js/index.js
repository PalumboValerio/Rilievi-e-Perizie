"use strict"
/*
<div class="panel panel-default">
  <div class="panel-heading">Panel Heading</div>
  <div class="panel-body">Panel Content</div>
</div>
 */
$(document).ready(function()
{
	let infoWindow;
	let map;
	let thisLat;
	let thisLng;
	let thisID;
	let courrentPos;
	let thisPos;
	let actualComment;

	let btnPath = $("#btnPath");
	let btnUpdate = $("#btnUpdate");
	let adminCmt = $("#adminCmt");
	let btnReturn = $("#return");
	let btnDelete = $("#btnDelete");
	let btnOpenChangePw = $("#btnOpenChangePw");
	let btnCreateUser = $("#btnCreateUser");
	let btnNewUser = $("#btnNewUser");
	let btnChangePW = $("#btnChangePW");

	let wrapper = $("#wrapper");
	let _map =  wrapper.children(".map")[0];    // js
	let panel = wrapper.children(".panel")[0];   // js
	let msg =  wrapper.children(".msg");
	let carousel_inner = $(".carousel-inner");
	let dataContainer = $("#dataContainer");
	let createUser = $("#createUser");
	let changePW = $("#changePW");

	let newMail = $("#newEmail");
	let newName = $("#newName");
	let newSurname = $("#newSurname");

	initMap();
	setMarkers();

	$("#btnLogout").on("click", function()
	{
        let request = makeRequest("POST", "/api/logout/");
        request.fail(error);
        request.done(function(data)
        {
            console.log(data);
			window.location.reload();
        });
    })

	$(".toggle-password").on("click", function() {

        $(this).toggleClass("fa-eye fa-eye-slash");
		
        if ($(this).siblings("input").prop("type") == "password") 
		{
			$(this).siblings("input").prop("type", "text");
        } 
		else 
		{
			$(this).siblings("input").prop("type", "password");
        }
      });
	
	btnPath.on("click", function()
	{
		dataContainer.fadeOut();
		btnOpenChangePw.prop("disabled", false);
		btnCreateUser.prop("disabled", false);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				panel.innerHTML = "";

				let directionsService = new google.maps.DirectionsService();
				let directionsRenderer = new google.maps.DirectionsRenderer();
				courrentPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				let mapOptions =
				{
					"center":courrentPos,
					"zoom":16,
					"mapTypeId":google.maps.MapTypeId.ROADMAP
				}

				map = new google.maps.Map(_map, mapOptions);
				directionsRenderer.setMap(map);
				calcRoute(directionsService, directionsRenderer);
			},
			() => {
				handleLocationError(true, infoWindow, map.getCenter());
			}
		);
	});

	btnUpdate.on("click", function(){
		if(actualComment != adminCmt.val().trim())
		{
			let request = makeRequest("POST", "/api/adminComment/", {
				"id" : thisID, 
				"comment" : adminCmt.val().trim()
			});

			request.fail(error);
			request.done(function(data)
			{
				Swal.fire({
					title: 'Good!',
					text: "Data correctly updated",
					icon: 'success',
					confirmButtonText: 'Close'
				})
				actualComment = adminCmt.val().trim();
			});
		}
		else
		{
			Swal.fire({
				title: 'Error!',
				text: "Field empty or value is the same of the saved one",
				icon: 'error',
				confirmButtonText: 'Close'
			})
		}
	});

	btnNewUser.on("click", function(){
		if(newMail.val().trim() != "" && 
		newMail.val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) != null && 
		newName.val().trim() != "" && newSurname.val().trim() != "")
		{
			let requestMail=makeRequest("GET", "/api/findMail/", {
				"email": newMail.val().trim()
			});
			
			requestMail.fail(error)
			
			requestMail.done(function(data1){
				if(data1.hasOwnProperty("ris"))
				{
					let request = makeRequest("POST", "/api/createUser/", { 
						"email" : newMail.val().trim(), 
						"name" : newName.val().trim(), 
						"surname" : newSurname.val().trim() 
					});
		
					request.fail(error);
					request.done(function(data2)
					{
						Swal.fire(
							'Good!',
							'User created succesfully',
							'success'
						).then((result) => {
							$("#newEmail").val("");
							$("#newName").val("");
							$("#newSurname").val("");
						})
					});
				}
				else
				{
					Swal.fire({
						title: 'Error!',
						text: "Email already exist!",
						icon: 'error',
						confirmButtonText: 'Close'
					});
				}
			});
		}
		else
		{
			Swal.fire({
				title: 'Error!',
				text: "You must insert correct values before submitting!",
				icon: 'error',
				confirmButtonText: 'Close'
			});
		}
	})

	btnReturn.on("click", function(){
		window.location.reload();
	});

	btnDelete.on("click", function(){
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				let request = makeRequest("POST", "/api/deleteAppraisals/", {"id" : thisID });

				request.fail(error);
				request.done(function(data)
				{
					Swal.fire(
						'Deleted!',
						'Your file has been deleted.',
						'success'
					).then((result) => {
						window.location.reload();
					})
				});
			}
		})
	});

	btnOpenChangePw.on("click", function(){
		changePW.fadeIn();
		btnOpenChangePw.prop("disabled", true);
		btnCreateUser.prop("disabled", true);
	});

	btnCreateUser.on("click", function(){
		createUser.fadeIn();
		btnOpenChangePw.prop("disabled", true);
		btnCreateUser.prop("disabled", true);
	});

	btnChangePW.on("click", function(){
		if($("#newPassword").val().trim() == $("#confirmPassword").val().trim() && $("#newPassword").val().trim() != "")
		{
			let request = makeRequest("POST", "/api/changeAdminPW/", { "password" :  CryptoJS.MD5($("#newPassword").val().trim()).toString() });

			request.fail(error);
			request.done(function(data)
			{
				if(!data.hasOwnProperty("ris"))
				{
					Swal.fire(
						'Good!',
						'Password succesfully updated',
						'success'
					).then((result) => {
						$("#newPassword").val("");
						$("#confirmPassword").val("");
						changePW.fadeOut();
						btnOpenChangePw.prop("disabled", false);
						btnCreateUser.prop("disabled", false);
					})
				}
				else
				{
					Swal.fire({
						title: 'Error!',
						text: "Password cannot be the same of the saved one",
						icon: 'error',
						confirmButtonText: 'Close'
					})
				}
			});
		}
		else
		{
			Swal.fire({
				title: 'Error!',
				text: "You must insert correct values before submitting!",
				icon: 'error',
				confirmButtonText: 'Close'
			});
		}
	});

	$("#closeFirst").on("click", function(){
		dataContainer.fadeOut();
		btnOpenChangePw.prop("disabled", false);
		btnCreateUser.prop("disabled", false);
	});

	$("#closeSecond").on("click", function(){
		createUser.fadeOut();
		btnOpenChangePw.prop("disabled", false);
		btnCreateUser.prop("disabled", false);
	});

	$("#closeThird").on("click", function(){
		changePW.fadeOut();
		btnOpenChangePw.prop("disabled", false);
		btnCreateUser.prop("disabled", false);
	});

	function calcRoute(directionsService, directionsRenderer) {
        let request = {
            origin: courrentPos,
            destination: thisPos,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, function (routes, status) 
		{
            if (status == 'OK') {
                directionsRenderer.setDirections(routes);
				directionsRenderer.setPanel(panel);
            }

            let distance = routes.routes[0].legs[0].distance.text;
            let time = routes.routes[0].legs[0].duration.text;
            msg.html(`Distance: ${distance} | Time: ${time}`);
			btnReturn.fadeIn(400, "linear");
        });
    }

	function initMap() {
		map = new google.maps.Map(_map, {
			center: { lat: 45.3550156156037, lng: 8.60695184923455 },
			zoom: 7,
		  });
		if (navigator.geolocation)
		{
			navigator.geolocation.getCurrentPosition(
				(position) => {
				
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				  infoWindow = new google.maps.InfoWindow();

				map.setCenter(pos);
				},
				() => {
					handleLocationError(true, infoWindow, map.getCenter());
				}
			);
		}
		else
		{
			// Browser doesn't support Geolocation
			handleLocationError(false, infoWindow, map.getCenter());
		}
	}

	function setMarkers()
	{
		let request = makeRequest("POST", "/api/takeAppraisals/");

		request.fail(error);
		request.done(function(data)
		{
			let result = data["ris"];

			if(result != "nok")
			{
				for(let i = 0; i < result.length; i++)
				{
					let lat=parseFloat(result[i].coord.split("|")[0].split(":")[1].trim());
					let lng=parseFloat(result[i].coord.split("|")[1].split(":")[1].trim());

					let markerStyle = {
						path: "M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z",
						fillColor: "red",
						fillOpacity: 1,
						strokeWeight: 0,
						rotation: 0,
						scale: 2,
						anchor: new google.maps.Point(15, 30),
					};

					let marker = new google.maps.Marker({
						position: { "lat": lat, "lng": lng },
						map,
						title: result[i].user,
						animation: google.maps.Animation.DROP,
						icon: markerStyle
					});

					marker.addListener("click", function()
					{
						thisLat=parseFloat(result[i].coord.split("|")[0].split(":")[1].trim());
						thisLng=parseFloat(result[i].coord.split("|")[1].split(":")[1].trim());
						thisPos=new google.maps.LatLng(thisLat, thisLng);

						panel.innerHTML = "";
						dataContainer.fadeIn();
						carousel_inner.empty();
						btnOpenChangePw.prop("disabled", true);
						btnCreateUser.prop("disabled", true);

						thisID = result[i]._id;
						$("#email").val(result[i].user);
						$("#coord").val(`Lat: ${thisLat} | Lng: ${thisLng}`);
						$("#date").val(result[i].dateOf);
						$("#userCmt").val(result[i].userNotes);
						adminCmt.val(result[i].adminNotes);
						actualComment = result[i].adminNotes;
						
						for (let j = 0; j < result[i].image.length; j++) 
						{
							let div = $("<div>").addClass("carousel-item").append($("<img>").addClass("d-block w-100").prop("src", result[i].image[j]));
							if(j==0)
							{
								div.addClass("active");
							}
							div.appendTo(carousel_inner);
						}
					});
				}
			}
		});
	}

	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
		infoWindow.setPosition(pos);
		infoWindow.setContent(
		  browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation."
		);
		infoWindow.open(map);
	  }
});