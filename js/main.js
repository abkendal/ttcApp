// TTC App JS File

var app = {};
var $geolocation = [];
var closestStopsName = [];
var closestStopsURI = [];
var closestStopsLat = [];
var closestStopsLng = [];
var map;



app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.initialize = function () {
	map = new google.maps.Map(document.getElementById('mapCanvas'), {
	  zoom: 16,
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
		app.displayStopMarker();
		}
	})
};

//DISPLAYING API RESULTS IN DROPDOWN
app.displayStops = function(){
	var $firstOption = $("<option>").val($(this)).text("Select Your Stop");
	$("#closestStops").append($firstOption);
	$.each (closestStopsName, function(index, item){
	var $option = $("<option>").val(item).text(item);
	$("#closestStops").append($option);
	});
	console.log(closestStopsName);
	});
};

// DISPLAYING SECOND MARKER FOR STOP
app.displayStopMarker = function() {
	var stopMarker = new google.maps.Marker({
	    position: new google.maps.LatLng(43.647518,-79.3958),
	    icon: 'http://maps.google.com/mapfiles/ms/micons/blue-dot.png',
	    title:"Your stop is here!"
	});

	stopMarker.setMap(map);
};

//API REQUEST FOR ROUTES
app.getRoute = function(){
	$.ajax({
		url: "http://myttc.ca/vehicles/near/" + userStop + ".json",
		type: "GET",
		dataType: "jsonp",
		success: function(returns){
			console.log(returns);
		}
	})
};

app.getPlaces = function(lat, lon){
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
		type: 'GET',
		dataType: 'jsonp',
		data: {
			key: 'AIzaSyArRVZ-NVkbo5_Ux1AKg7ChSny27D7EtYo',
			location:lat+","+lon,
			rankby: 'distance',
			type: 'cafe',
			opennow: ''
		},
		success: function(response) {
			console.log(response);
		}
	});
};

app.init = function (){
	app.getGeo();
	
};

$(function(){
	app.init();
});



