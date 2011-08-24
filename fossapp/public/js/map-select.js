function mapLoad(){
    
    $( ".leaflet-bottom.leaflet-left" ).html( '<div id="current-feature-container"><div class="left-side"><img id="current-feature-image" src="" /></div><div class="right-side"><div id="current-feature-type" class="content"></div><div id="current-feature-name" class="content"></div></div></div>' );
    
    $("#current-feature-container" ).click( function( event ) {
    	event.stopPropagation();
    } ).mousedown( function( event ) {
        event.stopPropagation();
    } );
    
}

function handleMapClick( event ) {
    $( "#current-feature-container" ).hide();
    $( "#current-feature-container div.content" ).html( "" );
    bd.poiLayer.clearLayers();
    $.getJSON( "select?lat=" + event.latlng.lat + "&lon=" + event.latlng.lng + "&zoom=" + bd.map.getZoom(), function(data){
        if ( data && data.features && data.features.length ) {
            var feature = data.features[0];
            var imageUrl;
            switch ( feature.properties.feature_type ) {
                case "Light Rail":
                    imageUrl = "/img/light-rail.png";
                    break;
                case "Bar/Pub":
                    imageUrl = "/img/bar-pub.png";
                    break;
                case "Cafe":
                    imageUrl = "/img/cafe.png";
                    break;
                case "Restaurant":
                    imageUrl = "/img/restaurant.png";
                    break;
                case "Bicycle Rental":
                    imageUrl = "/img/bicycle-rental.png";
                    break;
            }
            bd.poiLayer.addGeoJSON( feature );
            $("#current-feature-type").html( feature.properties.feature_type );
            $("#current-feature-name").html( feature.properties.name );
            $("#current-feature-image").attr( "src", imageUrl );
            $("#current-feature-container").show();
        }
    } );
}
