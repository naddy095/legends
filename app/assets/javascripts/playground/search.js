$(document).ready(function () {
	
	$("#playground_search_box").bind('railsAutocomplete.select', function(event, data){
  	
  	debugger;
  	showMarker(data.item)
	});

});

