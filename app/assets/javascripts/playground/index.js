/**
* Create new playground form 
*   
* Invokes rails /playgrounds/create by ajax
* Add the form to google maps infowindow
*/
function playgroundsNew(geocode_information,user) {
    
    // Create an new marker  
    playgroundsNewMarker = new google.maps.Marker({
        position: new google.maps.LatLng(geocode_information.latitude,geocode_information.longitude), 
        map: Gmaps.map.serviceObject,
        icon: 'http://www.google.com/mapfiles/marker_green.png',
        //icon: 'http://maps.google.com/mapfiles/kml/pal3/icon20.png',
    });
    
    // Invoke rails app to get the create form
    if(!user){
      display_form();
    }else
    {
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

}


/**
 * Open one infowindow at a time 
 */
function openInfowindow(html, marker){
    
    // Close previous infowindow if exists
    closeInfowindow();

    html_v = html;
    marker_v = marker;

     var contentString = '<div class="modal-content pop1">'+'<div class="modal-body">'+'<div class="col-md-12">'+'<h3>'+'<a href="javascript:void(0)" onclick="display_form1(1);">House<i class="fa fa-home"></i></a>'+'</h3>'+'<h3>'+'<a href="javascript:void(0)" onclick="display_form1(2);">Apartment<i class="fa fa-building"></i></a>'+'</h3>'+'<h3>'+'<a href="javascript:void(0)" onclick="display_form1(3);">Building<i class="fa fa-building-o"></i></a>'+'</h3>'+'</div>'+'</div>'
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
function display_form(){
 
   html_val =  '<div class="modal-content pop1">'+'<div class="modal-body">'+'<div class="col-md-12">'+'<h3>'+'<a href="/users/auth/google_oauth2" >Gmail<i class="fa fa-google"></i></a>'+'<a href="/users/auth/facebook" id="sign_in" >Facebook<i class="fa fa-facebook-official"></i></a>'+'<br/>'+'<a href="#" onclick="openWindow1();" >sign up</a>'+'<a href="#" onclick="openWindow2();" >sign in</a>'+'</div>'+'</div>'
  var html_h = html_val;
  var html_m = playgroundsNewMarker;

  closeInfowindow();

  // Set the content and open the home or apartment window
    Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html_h});
    Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, html_m);
}    

function display_form1(h_v){

  //display the home or apartment type
  
  if (h_v && h_v==1){
    html_val = '<strong><h3>House:</h3></strong><br><input type="hidden" name="house_type" id="house_type" value="House"/>'+html_v;
  
  }
  else if (h_v && h_v==2){

    html_val = '<strong><h3>Apartment:</h3></strong><br><input type="hidden" name="house_type" id="house_type" value="Apartment"/>'+html_v;
  
  }else if (h_v && h_v==3){
    html_val = '<strong><h3>Building:</h3></strong><br><input type="hidden" name="house_type" id="house_type" value="Building"/>'+html_v;
  }else{
    html_val = html_v;
  }
  var html_h1 = html_val;
  var html_m2 = marker_v;


  closeInfowindow();

  // Set the content and open the home or apartment window
    Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html_h1});
    Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, html_m2);
  
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
              address =  responses[0].formatted_address;
              
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

  type = $('#house_type').val();
   country = $('#playground_country').val();
   name = $('#playground_name').val();
   address = $('#playground_address').val();
   city = $('#playground_city').val();
   postal_code = $('#playground_postal_code').val();
   state = $('#playground_state').val();
   latitude = $('#playground_latitude').val();
   longitude = $('#playground_longitude').val();
   route = $('#playground_route').val();
   street_number = $('#playground_street_number').val();
   
   
  
  //  $.post($('#playground_form').attr('action'),$('#playground_form').serialize()+"&home_type="+type+"&image1="+image1+"&image="+image, null, "script");

   var file_data = $("#playground_logo").prop("files")[0];
   var file_data_two = $("#playground_picture").prop("files")[0];
   var form_data = new FormData();
   form_data.append("playground[logo]", file_data); 
   form_data.append("playground[picture]", file_data_two); 
   form_data.append("playground[country]", country);  
   form_data.append("playground[name]", name); 
   form_data.append("playground[address]", address);  
   form_data.append("home_type", type);  
   form_data.append("playground[city]", city);  
   form_data.append("playground[postal_code]", postal_code);  
   form_data.append("playground[state]", state);  
   form_data.append("playground[latitude]", latitude); 
   form_data.append("playground[longitude]", longitude); 
   form_data.append("playground[route]", route); 
   form_data.append("playground[street_number]", street_number);
   
  
    $.ajax({
            type: 'POST',
            url: '/playgrounds',
            data: form_data,
            processData: false,
            contentType: false,
            dataType : 'script',
            cache: false,

            success: function(data){ 

            
                  showMarker({ latitude: latitude, longitude: longitude, myadd_type: type });

             // window.location.href = "/playgrounds";
            },
            error: function (jqXHR, exception) {
              alert("error");
            }
            });

}

 function report_spam(id,lat,log){
  // clearMarker(playgroundsNewMarker);

        // // Create marker info
        // var markerInfo = {    
        //     position: new google.maps.LatLng(
        //             parseFloat(lat),
        //             parseFloat(log)
        //     ), 
        //     map: Gmaps.map.serviceObject,
        //     id: id
        // }
            
        // // Create new marker
        // var marker = new google.maps.Marker(markerInfo);
    
        // // Add marker serviceObject
        // markerInfo.serviceObject = marker;
    
        // // Add to the markers array
        // Gmaps.map.markers.push(markerInfo);


lat_l = {"A":parseFloat(log),"F":parseFloat(lat)}

    geocode_information  = lat_l 
    // Create an new marker  
    playgroundsNewMarker = new google.maps.Marker({
        position: new google.maps.LatLng(geocode_information.latitude,geocode_information.longitude), 
        map: Gmaps.map.serviceObject,
        icon: 'http://www.google.com/mapfiles/marker_green.png',
        //icon: 'http://maps.google.com/mapfiles/kml/pal3/icon20.png',
    });
    
     html_m = playgroundsNewMarker
     html_h = '<div class="modal-content pop1 spam2">'+'<div class="modal-body">'+'<div class="col-md-10">'+'<strong>Report Spam:</strong><BR><TEXTAREA NAME="comments" COLS=40 ROWS=6 ID="spam_desc"></TEXTAREA>'+'<a href="javascript:void(0);"  onclick= "post_spam('+id+');" class="btn postspam">Post Spam</a> '+ '</div>'+'</div>'+'</div>'

      closeInfowindow();

    Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html_h});
    Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, html_m);
    
  }

  function post_spam(id){
    var desc = $('#spam_desc').val()
      if (desc == null || desc == "") {
        alert("Enter Valid Reason");
        return false;
    }

   else {
     $.ajax({
        url: '/playgrounds/update_spam?' + jQuery.param({playground_id: id, spam_desc: desc}) + '',
        type: 'GET',
        async: false,
        success: function(html) { 

             closeInfowindow()
                      

            // Add on close behaviour to clear this marker
         
        },
   

    });
  
     }
      
  }



function showMarker(playground) {
  var icon = null;

  if (playground.myadd_type == "House") {
    icon = window.location.origin + '/assets/house.png';
  }
  else if (playground.myadd_type == "Apartment") {
    icon = window.location.origin + '/assets/apartment-3.png';
  }
  else if (playground.myadd_type == "Building") {
    icon = window.location.origin + '/assets/office-building.png';
  }
  else {
    // icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
  }


  playgroundMarker = new google.maps.Marker({
      position: new google.maps.LatLng(playground.latitude, playground.longitude), 
      map: Gmaps.map.serviceObject,
      icon: icon
  });

  // openPlagroundPopup(playground, playgroundMarker)

  playgroundMarker.addListener('click', function() {
    openPlagroundPopup(playground, playgroundMarker);
  });

}

function openPlagroundPopup(playground, playgroundMarker){
  if (playground.owner) {
    var url = '/playgrounds/' + playground.id + '/edit';
  } else {
    var url = '/playgrounds/' + playground.id;
  }

    

    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: function(html) { 

            closeInfowindow();
            // Add on close behaviour to clear this marker
            // Set the content and open
            Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html});
            Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject, playgroundMarker);
    
        }
    });
    
}

function openWindow1(){
var URL = "/users/sign_up";
// window.open(URL,"Recover","width=700,height=450");
 $.ajax({
        url: URL,
        type: 'GET',
        async: false,
        success: function(html) { 

            closeInfowindow();
            // Add on close behaviour to clear this marker
            // Set the content and open
            Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html});
            Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject);
    
        }
    });
}



function openWindow2(){
var URL = "/users/sign_in";
// window.open(URL,"Recover","width=700,height=450");
 $.ajax({
        url: URL,
        type: 'GET',
        async: false,
        success: function(html) { 

            closeInfowindow();
            // Add on close behaviour to clear this marker
            // Set the content and open
            Gmaps.map.visibleInfoWindow = new google.maps.InfoWindow({content: html});
            Gmaps.map.visibleInfoWindow.open(Gmaps.map.serviceObject);
    
        }
    });
}

 