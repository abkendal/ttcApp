// TTC App JS File

var app = {};
var $geolocation = [];
var closestStopsName = [];
var closestStopsURI = [];
var closestStopsLat = [];
var closestStopsLng = [];
var routeName = [];
var map;
var markers = [];
var userStopInfo = [];
var routeName = [];
 //USER STOP INFO LEGEND: (please keep here for now!)
 // userStopInfo[0] = name of selected stop
 // userStopInfo[1] = URI of selected stop
 // userStopInfo[2] = latitude of stop
 // userStopInfo[3] = longitude of stop
 var userRouteInfo = [];
 var nextBusTime;
 var routeResponse;
 var time;
 var busSeconds;
 var currentSeconds;
 var minutesTillBus;

//REFRESH FUNCTION
app.refresh = function() {
	$('.button-refresh').on('click', function() {
		document.location.reload(true);
	});
}

//LOGO FADE IN AND OUT
$('#overlay').fadeIn('fast').delay(3000).fadeOut('slow');

app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.initialize = function () {
	$('#closestStops').fadeIn('slow').removeClass('hide');
	map = new google.maps.Map(document.getElementById('mapCanvas'), {
	  zoom: 17, //increased zoom so that users can see store type icons - can change later
	  center: {lat: $geolocation[0], lng: $geolocation[1]}
	});

	var marker = new google.maps.Marker({
	    position: new google.maps.LatLng($geolocation[0],$geolocation[1]),
	    icon: 'http://maps.google.com/mapfiles/ms/micons/red-dot.png',
	    title:"You are Here!"
	});

	marker.setMap(map);
}


app.updatePosition = function(position) {
	$geolocation[0] = position.coords.latitude;
	$geolocation[1] = position.coords.longitude;
	app.getStops($geolocation[0], $geolocation[1]);
	// console.log($geolocation);
	app.initialize();
};


app.geoError = function(){
	 alert("No location info available. Error code: " + error.code);
};

//API REQUEST FOR STOPS
app.getStops = function(lat, lon){
	$.ajax({
		url:'http://myttc.ca/near/' + lat + ',' + lon + '.json',
		type: 'GET',
		dataType: 'jsonp',
		success: function(response){
			console.log(response);
			for (var i =0; i<3; i++){
				closestStopsName[i] = response.locations[i].name;
				closestStopsURI[i] = response.locations[i].uri;
				closestStopsLat[i] = response.locations[i].lat;
				closestStopsLng[i] = response.locations[i].lng;
			};
		app.displayStops();
		}
	})
};

//GET USER'S STOP CHOICE AND STORE THE DATA IN AN ARRAY
app.getUserStop = function() {
	$('#closestStops').on('change', function() {
		$('#routesAtStop').fadeOut();
		$("#routesAtStop").empty();
  		var selectedStop = $(this).val();
  		userStopInfo=[];
  		userStopInfo.push(closestStopsName[selectedStop], closestStopsURI[selectedStop], closestStopsLat[selectedStop], closestStopsLng[selectedStop]);
  		app.displayStopMarker();
  		app.getRoute();
  		// HIDE closestStops DROP-DOWN HERE
  		// $(this).fadeOut('slow').addClass('hide');

  		//SHOW LOADING BAR HERE
  		$('.loadingWrapper').fadeIn('slow').removeClass('hide');
	});
};

//DISPLAYING API RESULTS IN DROPDOWN
app.displayStops = function(){
	var $firstOption = $("<option>").val($(this)).text("1. Select Your Stop");
	$("#closestStops").append($firstOption);
	$.each (closestStopsName, function(index, item){
		var $option = $("<option>").val(index).text(item);
		$("#closestStops").append($option);
	});
	console.log(closestStopsName);
	app.getUserStop();
	
};

// DISPLAYING SECOND MARKER FOR STOP
app.displayStopMarker = function() {
	var stopMarker = new google.maps.Marker({
	    position: new google.maps.LatLng(userStopInfo[2], userStopInfo[3]),
	    icon: 'http://maps.google.com/mapfiles/ms/micons/blue-dot.png',
	    title:"Your stop is here!"
	});

	stopMarker.setMap(map);
};
//API ROUTES #2
app.getRoute = function(){
	$.ajax({
		url: "http://myttc.ca/" + userStopInfo[1] + ".json",
		type: "GET",
		dataType: "jsonp",
		data: {
			routes: [],
		},
		success: function(returns){
			for(var i = 0;i<returns.stops[0].routes.length; i++) {
				routeName[i] = returns.stops[0].routes[i].name;
			}
			routeResponse = returns;
			app.filterRouteName(returns);
			console.log(returns);
		}	
	})
};
//FILTERING ROUTE OPTIONS
app.filterRouteName = function(stops){
	var $firstRouteOption = $("<option>").val($(this)).text("2. Select Your Route");
	$("#routesAtStop").append($firstRouteOption);
	for(i = 0; i < stops.stops[0].routes.length; i++){
		app.displayRoute(stops.stops[0].routes[i].uri, i);
	}
	$('.loadingWrapper').fadeOut(0);//HIDE LOADING BAR AFTER ROUTES ARE APPENDED INTO DROPDOWN

};
//DISPLAYING ROUTES IN DROP DOWN 
app.displayRoute = function(routes, key) {
	var $routeName = $("<option>").val(key).text(routes);
	//moved loading bar to filterRouteName
	$("#routesAtStop").append($routeName);
	$('#routesAtStop').fadeIn('slow').removeClass('hide');
};
//STORE SELECTED ROUTE IN VARIABLE
app.getUserRoute = function(userRoute) {
	$('#routesAtStop').on('change', function() {
		// Get the current time when the selection is made
		app.getTime();

		var selectedRoute = $('#routesAtStop :selected').val();
  		nextBusTime = routeResponse.stops[0].routes[selectedRoute].stop_times[0].departure_time;
		
  		// Store the am/pm marker 
  		var ampm = nextBusTime.slice(-1);

		// Remove am/pm marker from the end of time string
		nextBusTime = nextBusTime.substring(0, nextBusTime.length - 1);
		// Add seconds in order to standardize time string format
		nextBusTime = nextBusTime+":00";
		console.log("nextBusTime = "+ nextBusTime);

		// Convert time into seconds and add 12 hours if time is in pm
		var a = nextBusTime.split(':');
		busSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
		if (ampm==='p') {
			busSeconds = busSeconds + 43200;
		};

		app.compareTime(busSeconds, currentSeconds);

		// If the first bus has already passed (ie negative time) then grab the second bus
		if (minutesTillBus < 0) {
			nextBusTime = routeResponse.stops[0].routes[selectedRoute].stop_times[1].departure_time;
			// Store the am/pm marker 
  			var ampm = nextBusTime.slice(-1);

			// Remove am/pm marker from the end of time string
			nextBusTime = nextBusTime.substring(0, nextBusTime.length - 1);
			// Add seconds in order to standardize time string format
			nextBusTime = nextBusTime+":00";

			// Convert time into seconds and add 12 hours if time is in pm
			var a = nextBusTime.split(':');
			busSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
			if (ampm==='p') {
				busSeconds = busSeconds + 43200;
			};
			
			app.compareTime(busSeconds, currentSeconds);

			// If the second bus has also already passed, grab the third bus
			if (minutesTillBus < 0) {
				nextBusTime = routeResponse.stops[0].routes[selectedRoute].stop_times[2].departure_time;
				// Store the am/pm marker 
	  			var ampm = nextBusTime.slice(-1);

				// Remove am/pm marker from the end of time string
				nextBusTime = nextBusTime.substring(0, nextBusTime.length - 1);
				// Add seconds in order to standardize time string format
				nextBusTime = nextBusTime+":00";

				// Convert time into seconds and add 12 hours if time is in pm
				var a = nextBusTime.split(':');
				busSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
				if (ampm==='p') {
					busSeconds = busSeconds + 43200;
				};
				
				app.compareTime(busSeconds, currentSeconds);
			};
		};

		// $('#routesAtStop').fadeOut('slow').addClass('hide');
		$('.mapCover').fadeOut('slow');
		$('.suggestionContainer').fadeIn('slow').removeClass('hide');
		$('.buttonsContainer').fadeIn('slow').removeClass('hide');
	});
};

// GET CURRENT TIME
app.getTime = function() {
	var dt = new Date();
	time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
	console.log(time);
	var a = time.split(':');
	currentSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) + 43200;
};

// CALCULATE TIME UNTIL NEXT BUS AND DISPLAY ON SCREEN
app.compareTime = function(busTime, currentTime) {
	minutesTillBus = (busTime - currentTime) / 60;
	minutesTillBus = minutesTillBus.toFixed(2); 
	console.log(busTime);
	console.log(currentTime);
	console.log(minutesTillBus);
	if (minutesTillBus < -50) {
		var suggestionText = "Your bus 'aint comin' for a looooooong time!"
	}
	else if (minutesTillBus < 5) {
		var suggestionText = "You have " + minutesTillBus + " minutes until your next bus. You should probably get to your stop."
	} else if (minutesTillBus < 15) {
		var suggestionText = "You have " + minutesTillBus + " minutes until your next bus. You've got time for something quick like a coffee shop or convenience store."
	} else {
		var suggestionText = "You have " + minutesTillBus + " minutes until your next bus. You've got time to check out a retail store or grab some take out."
	}
	$('#suggestionText').text(suggestionText);

	// Only look for places if there is more than 5 minutes until the next bus or night bus
	if (minutesTillBus >= 5 || minutesTillBus < -50) {
		app.getPlaces(minutesTillBus);
	};
}


// Query google places based on location and time until next bus.
app.getPlaces = function(time) {
	var request = {
	    location: new google.maps.LatLng(userStopInfo[2], userStopInfo[3]),
	    radius: '', 
	    types: []
	  };
	  if (time < -50) {
	  	request.radius = 500;
	  	request.types = ['cafe', 'convenience_store', 'store',  'book_store', 'meal_takeaway', 'food', 'restaurant', 'bakery', 'liquor_store'];
	  }
	  else if (time <7.5) {
	  	request.radius = 75;
	  	request.types = ['cafe', 'convenience_store', 'bakery'];
	  } 

	  else if (time <10) {
	  	request.radius = 150;
	  	request.types = ['cafe', 'convenience_store', 'bakery'];
	  } 

	  else if (time <15) {
	  	request.radius = 200;
	  	request.types = ['cafe', 'convenience_store', 'bakery'];
	  } 

	  else {
	  	request.radius = 200;
	  	request.types = ['cafe', 'convenience_store', 'store',  'book_store', 'meal_takeaway', 'food', 'restaurant', 'bakery', 'liquor_store'];
	  };

	  infowindow = new google.maps.InfoWindow();
	  var service = new google.maps.places.PlacesService(map);
	  service.nearbySearch(request, callback);

	  function callback(results, status) {
	    if (status == google.maps.places.PlacesServiceStatus.OK) {
	      for (var i = 0; i < results.length; i++) {
	        createMarker(results[i]);
	      }
	    }
	  }

	  function createMarker(place) {
	  	// console.log(place);
	    var marker = new google.maps.Marker({
	      map: map,
	      icon: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
	      position: place.geometry.location
	    });

	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.setContent(place.name);
	        infowindow.open(map, this);
	      });
	  };
};


app.init = function (){
	app.getGeo();
	app.refresh();
	app.getUserRoute();
	
};


$(function(){
	app.init();
});



