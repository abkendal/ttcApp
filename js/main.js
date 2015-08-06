// TTC App JS File
// API Key: AIzaSyCQILEPhJaXY7iLnSr2B_vtomrIRSg6kI4

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



app.init = function (){
	app.getGeo();
	
};

$(function(){
	app.init();
});

