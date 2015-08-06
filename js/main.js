// TTC App JS File

var app = {};
var $geolocation = [];
var closestStopsName = [];
var closestStopsURI = [];
var map;


app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.initialize = function () {
	map = new google.maps.Map(document.getElementById('map-canvas'), {
	  zoom: 16,
	  center: {lat: $geolocation[0], lng: $geolocation[1]}
	});
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
			}
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



