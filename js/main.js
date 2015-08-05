// TTC App JS File

var app = {};
var $geolocation = [];



function noLocation(error) {
    alert("No location info available. Error code: " + error.code);
}


app.getGeo = function(){
	$.geolocation.get({win: app.updatePosition, fail: noLocation});
};

app.updatePosition = function(position) {
	$geolocation[0] = position.coords.latitude;
	$geolocation[1] = position.coords.longitude;

}

app.init = function (){
	app.getGeo();
};

$(function(){
	app.init();
});
