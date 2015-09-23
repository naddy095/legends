/**
* Create new playground form 
*   
* Invokes rails /playgrounds/create by ajax
* Add the form to google maps infowindow
*/
function playgroundsNew(geocode_information) {
    
    // Create an new marker  
    playgroundsNewMarker = new google.maps.Marker({
        position: new google.maps.LatLng(geocode_information.latitude,geocode_information.longitude), 
        map: Gmaps.map.serviceObject,
        icon: 'http://www.google.com/mapfiles/marker_green.png',
        //icon: 'http://maps.google.com/mapfiles/kml/pal3/icon20.png',
    });
    
    // Invoke rails app to get the create form
    $.ajax({
        url: '/playgrounds/new?' + jQuery.param({playground:geocode_information}) + '#chunked=true',
        type: 'GET',
        async: false,
        success: function(html) { 
            
            // Add on close behaviour to clear this marker
            var createFormOpen = function() {
                
                // Open new form                    
                openInfowindow(html, playgroundsNewMarker);
                
                // Add close infowindow behaviour
                google.maps.event.addListener(Gmaps.map.visibleInfoWindow,'closeclick', function(){
                   clearMarker(playgroundsNewMarker);
                });   
            }
            
            // Invoke now
            createFormOpen();
            
            // Clicking "again" on the new marker will reproduce behaviour 
            google.maps.event.addListener(playgroundsNewMarker, "click", function() {
                createFormOpen();
            });
        }
    });
}


/**
 * Open one infowindow at a time 
 */
function openInfowindow(html, marker){
    
    // Close previous infowindow if exists
    closeInfowindow();

    html_v = html;
    marker_v = marker;

     var contentString = '<div class="modal-content pop1">'+'<div class="modal-body">'+'<div class="col-md-6">'+'<h3>'+'<a href="javascript:void(0)" onclick="display_form(1);">House<i class="fa fa-home"></i></a>'+'</h3>'+'<h3>'+'<a href="javascript:void(0)" onclick="display_form(2);">Apartment<i class="fa fa-building"></i></a>'+'</h3>'+'</div>'+'</div>'
      '</div>';

    // Set the content and open
    Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: contentString});
    Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, marker);
}

/**
 * Close the infowindow
 */
function closeInfowindow() {
    if (Gmaps.map.visibleInfoWindow) 
        Gmaps.map.visibleInfoWindow.close();
}


//display the home or apartment form here
function display_form(h_v){
  var html_h;
  var html_m;

  //display the home or apartment type
  if (h_v && h_v==1){
    html_val = '<input type="hidden" name="house_type" id="house_type" value="house"/>'+html_v;
  }
  else if (h_v && h_v==2){
    html_val = '<input type="hidden" name="house_type" id="house_type" value="apartment"/>'+html_v;
  }else{
    html_val = html_v;
  }

  var html_h = html_val;
  var html_m = marker_v;

  closeInfowindow();

  // Set the content and open the home or apartment window
    Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html_h});
    Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, html_m);
}    

/**
 * Dummy clear marker
 */
function clearMarker(marker) {
    try {
        marker.setMap(null); 
    }
    catch (err){
    }
}

/**
 * Clear marker, including markers array
 */
function clearMarkerById(id) {
    
    // Search and destroy
    clearMarker(findById(id));
    
    // Remove from markers array
    Gmaps.map.markers = Gmaps.map.markers.filter(function(obj) { 
        return obj.id != id
    });   
}

/**
 * Locate the marker in the markers array by id, 
 * then return corresponding serviceObject
 */
function findById(id) {
    var markers_search_results = Gmaps.map.markers.filter(function(obj) { 
        return obj.id == id;
    });
    
    if (markers_search_results[0]) {
        if (markers_search_results[0].serviceObject)
            return markers_search_results[0].serviceObject;
    }
}

/**
 * Geocode with callback invocation
 */
function geocodePoint(latlng, callback) {

    var street_number = ''; 
    var route = ''; 
    var country = ''; 
    var postal_code = ''; 
    var city = ''; 
    var address = '';
    var state = '';
    var latitude = latlng.lat();
    var longitude = latlng.lng();
      
    geocoder.geocode({'latLng': latlng }, function(responses) { 
  
        if (responses && responses.length > 0) {
              
              // Address altogether style 
              address = 'Address at ' + responses[0].formatted_address;
              
              // Extract address parts
              responses[0].address_components.forEach(function(el) { 
                  el.types.forEach(function(type) { 
                      if(type == 'street_number') street_number = el.long_name;  
                      if(type == 'route') route = el.long_name; 
                      if(type == 'country') country = el.long_name;
                      if(type == 'postal_code') postal_code = el.long_name; 
                      if(type == 'postal_town' && el.long_name) city = el.long_name; 
                      if(type == 'locality' && el.long_name) city = el.long_name;
                      if(type == 'administrative_area_level_1' && el.long_name) state = el.long_name;
                  }) 
              }); 
              
              // Export data by callback on success
              callback({
                  street_number: street_number,
                  route: route,
                  postal_code: postal_code,
                  city: city,
                  state: state,
                  country: country,
                  latitude: latitude,
                  longitude: longitude,
                  address:address
              }); 
              
        }
        else {
            // Inform user
            alert_user("Google Maps had some trouble finding the position, try somewhere else", "alert-error");
        }
    });  
}       

/**
 * Bootstrap growl
 */
function alert_user(message, type) {
    // Adding div contents
    $('#alert_placeholder').append('<div id="alertdiv" class="alert ' + type + '"><a class="close" data-dismiss="alert">×</a><span>' + message +'</span></div>');

    // Close it after 5 seconds
    setTimeout(function() { 
        $("#alertdiv").remove();
    }, 5000);
}

function start_store(){
   var type = $('#house_type').val();
   $.post($('#playground_form').attr('action'), $('#playground_form').serialize()+"&home_type="+type, null, "script");
}


