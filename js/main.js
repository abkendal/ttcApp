// TTC App JS File

var app = {};
var $geolocation = [];
var closestStopsName = [];
var closestStopsURI = [];


app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.updatePosition = function(position) {
	$geolocation[0] = position.coords.latitude;
	$geolocation[1] = position.coords.longitude;
	app.getStops($geolocation[0], $geolocation[1]);
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
			};
			
		}
	})
};
//DISPLAYING API RESULTS IN DROPDOWN
app.displayStops = function(){
	console.log(1);
	for (var i = 0; i < closestStopsName.length; i++){
		$(".closestStops").append(closestStopsName[i], closestStopsName[i], closestStopsName[i]);
		console.log(2);
	};
	console.log(3);
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
<<<<<<< HEAD
=======

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


>>>>>>> 4d88fec4304833c45b108751de4600037396760d

app.init = function (){
	app.getGeo();
};

$(function(){
	app.init();
	app.displayStops();
});




var map;
function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 8,
    center: {lat: -34.397, lng: 150.644}
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
