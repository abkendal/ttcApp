// TTC App JS File

var app = {};
var $geolocation = [];


app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.updatePosition = function(position) {
	$geolocation[0] = position.coords.latitude;
	$geolocation[1] = position.coords.longitude;
	app.getStops($geolocation[0], $geolocation[1]);
}

app.geoError = function(){
	 alert("No location info available. Error code: " + error.code);
};

app.getStops = function(lat, lon){
	$.ajax({
		url:'http://myttc.ca/near/'+ lat +','+ lon + '.json',
		// url: 'http://myttc.ca/near/43.6483123,-79.39799909999999.json',
		type: 'GET',
		dataType: 'jsonp',
		success: function(response){
			console.log(response);
		}
	})
}





app.init = function (){
	app.getGeo();
};

$(function(){
	app.init();
});
