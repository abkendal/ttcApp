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
  		app.getRoute();
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
//SELECT STOP
// app.selectedStop = function(){
// 	$option.on("click", function(e){
// 		e.preventDefault();
// 		var $stop = $(this).$option;
// 		console.log($stop);
// 	});
// }; //end of selected stop

//API REQUEST FOR ROUTES
app.getRoute = function(){
	$.ajax({
		url: "http://myttc.ca/vehicles/near/" + userStopInfo[1] + ".json",
		type: "GET",
		dataType: "jsonp",
		data: {
			vehicles: [],
		},
		success: function(returns){
			app.filterRouteName(returns);
		}	
	})
};
app.filterRouteName = function(routes){
	var $firstRouteOption = $("<option>").val($(this)).text("Select Your Route");
	$("#routesAtStop").append($firstRouteOption);
	for(i = 0; i < routes.vehicles.length; i++){
		app.displayRoute(routes.vehicles[i].long_name);
	}
};
app.displayRoute = function(long_name){
	var $routeName = $("<option>").val($(this)).text(long_name);
	$("#routesAtStop").append($routeName);
	console.log(long_name);
};

// app.getPlaces = function(lat, lon){
// 	$.ajax({
// 		url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
// 		type: 'GET',
// 		dataType: 'jsonp',
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


app.getPlaces = function(lat, lon){

};

app.init = function (){
	app.getGeo();
	
};

$(function(){
	app.init();
});



