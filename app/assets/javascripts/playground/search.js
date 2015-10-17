$(document).ready(function () {
	
	$('#playground_search_box').bind('railsAutocomplete.select', function(event, data){
  	
  	
  	showMarker(data.item)
	});

});