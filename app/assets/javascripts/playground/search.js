$(document).ready(function () {
	
	$('#playground_search_box').bind('railsAutocomplete.select', function(event, data){
  	
  	var myLatLng = { lat: data.item.latitude, lng: data.item.longitude };

  	debugger;
	});

});