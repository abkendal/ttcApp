// TTC App JS File

var app = {};
var $geolocation = [];


app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: app.geoError});
};

app.updatePosition = function(position) {
	$geolocation[0] = position.coords.latitude;
	$geolocation[1] = position.coords.longitude;

}

app.geoError = function(){
	 alert("No location info available. Error code: " + error.code);
};





app.init = function (){
	app.getGeo();
};

$(function(){
	app.init();
});
