// TTC App JS File

var app = {};
var $geolocation = [];
var closestStopsName = [];
var closestStopsURI = [];
var closestStopsLat = [];
var closestStopsLng = [];
var map;
var userStopInfo = [];
var routeName = [];
 //USER STOP INFO LEGEND: (please keep here for now!)
 // userStopInfo[0] = name of selected stop
 // userStopInfo[1] = URI of selected stop
 // userStopInfo[2] = latitude of stop
 // userStopInfo[3] = longitude of stop
 var userRouteInfo = [];

//LOGO FADE IN AND OUT
$('#overlay').fadeIn('fast').delay(700).fadeOut('slow');

app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.initialize = function () {
	map = new google.maps.Map(document.getElementById('mapCanvas'), {
	  zoom: 18, //increased zoom so that users can see store type icons - can change later
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
	console.log($geolocation);
	app.initialize();
};


app.geoError = function(){
	 alert("No location info available. Error code: " + error.code);
};
//DROP DOWN STYLES
$(function(){
	$('select.styled').addClass("customSelect");
});


//API REQUEST FOR STOPS
app.getStops = function(lat, lon){
	$.ajax({
		url:'http://myttc.ca/near/' + lat + ',' + lon + '.json',
		type: 'GET',
		dataType: 'jsonp',
		success: function(response){
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
  		var selectedStop = $(this).val();
  		userStopInfo.push(closestStopsName[selectedStop], closestStopsURI[selectedStop], closestStopsLat[selectedStop], closestStopsLng[selectedStop]);
  		console.log(userStopInfo);
  		app.displayStopMarker();
  		app.getPlaces();
  		app.getRoute();
  		// HIDE closestStops DROP-DOWN HERE
  		$(this).fadeOut('slow').addClass('hide');
	});
};

//DISPLAYING API RESULTS IN DROPDOWN
app.displayStops = function(){
	var $firstOption = $("<option>").val($(this)).text("Select Your Stop");
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
			app.filterRouteName(returns);
			console.log("working");
		}	
	})
};
//FILTERING ROUTE OPTIONS
app.filterRouteName = function(stops){
	var $firstRouteOption = $("<option>").val($(this)).text("Select Your Route");
	$("#routesAtStop").append($firstRouteOption);
	for(i = 0; i < stops.stops[0].routes.length; i++){
		app.displayRoute(stops.stops[0].routes[i].uri);
		console.log(stops);
	}
};
//DISPLAYING ROUTES IN DROP DOWN 
app.displayRoute = function(routes) {
	var $routeName = $("<option>").val($(this)).text(routes);
	$("#routesAtStop").append($routeName);
	$('#routesAtStop').fadeIn('slow').removeClass('hide');
	app.getUserRoute();
};
//STORE SELECTED ROUTE IN VARIABLE
app.getUserRoute = function(userRoute) {
	$('#routesAtStop').on('change', function() {
  		var selectedRoute = $(this).val();
  // 		userRouteInfo.push(selectedRoute.stops.routes.stop_times[0].departure_time);
		// console.log(userRoute);
		$('#routesAtStop').fadeOut('slow').addClass('hide');
		$('.resultsSection').fadeIn('slow').removeClass('hide');
	});
};

//Commented out by Christina
// app.getPlaces = function(lat, lon){
// 	$.ajax({
// 		url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
// 		type: 'GET',
// 		dataType: 'json',
// 		data: {
// 			key: 'AIzaSyArRVZ-NVkbo5_Ux1AKg7ChSny27D7EtYo',
// 			location:lat+","+lon,
// 			rankby: 'distance',
// 			type: 'cafe',
// 			opennow: ''
// 		},
// 		success: function(response) {
// 			console.log(response);
// 		}
// 	});
// };

app.getPlaces = function() {
	var request = {
	    location: new google.maps.LatLng(userStopInfo[2], userStopInfo[3]),
	    // rankBy: google.maps.places.RankBy.DISTANCE,
	    radius: 100, 
	    types: ['cafe', 'store',  'book_store', 'meal_takeaway', 'food', 'restaurant']
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

//LOADING FUNCTIONS
app.loadingTest = function() {
	$('.suggestionContainer').on('click', function() {
		$(this).fadeOut('slow').addClass('hide');
		$('#routesAtStop').fadeIn('slow').removeClass('hide');
	});
}

	

app.init = function (){
	app.getGeo();
	app.loadingTest();
	
};

$(function(){
	app.init();
});



