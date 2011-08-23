function mapLoad(){
    
    $(".leaflet-bottom.leaflet-left").html('<div id="current-feature-container"><div class="left-side"><img id="current-feature-image" src="" /></div><div class="right-side"><div id="current-feature-type" class="content"></div><div id="current-feature-name" class="content"></div></div></div>');
    
    $("#current-feature-container").click(function(event){
    	event.stopPropagation();
    }).mousedown(function(event){
        event.stopPropagation();
    });
    
}

function handleMapClick( event ) {
    $("#current-feature-container").hide();
    $("#current-feature-container div.content").html("");
    bd.poiLayer.clearLayers();
    $.getJSON("select?lat=" + event.latlng.lat + "&lon=" + event.latlng.lng + "&zoom=" + bd.map.getZoom(), function(data){
        if (data && data.features && data.features.length){
            var feature = data.features[0];
            var imageUrl;
            switch (feature.properties.feature_type){
                case "Bike Path":
                    imageUrl = "/img/bike-white.png";
                    break;
                case "Foot Path":
                    imageUrl = "/img/walk-white.png";
                    break;
                case "Drinking Fountain":
                    imageUrl = "/img/drink-white.png";
                    break;
                case "Bike Shop":
                    imageUrl = "/img/bike-shop-white.png";
                    break;
                case "Park":
                    imageUrl = "/img/park-white.png";
                    break;
            }
            bd.poiLayer.addGeoJSON(feature);
            var is_bike_trail_and_has_name = false;
            if (feature.properties.feature_type == "Bike Path" && feature.properties.name && feature.properties.name.length > 0){
                /*$.each(bd.searchTrails, function(i, o){
                    var tester = new RegExp(o.searchVal);
                    if (tester.test(feature.properties.name.toLowerCase())){
                        id = o.id;
                        return false;
                    }
                });*/
		is_bike_trail_and_has_name = true;
            }
            $("#current-feature-type").html(feature.properties.feature_type + (feature.properties.surface ? (" ( " + data.features[0].properties.surface + " )") : ""));
            $("#current-feature-name").html(
        feature.properties.name
            ? (
            is_bike_trail_and_has_name
                ? ('<a href="/trails/' + feature.properties.name.replace(/ /g, "-") + '">' + feature.properties.name + '</a><br /><span>click for details</span>')
                : feature.properties.name
            )
            : "&nbsp;&nbsp;");
            $("#current-feature-image").attr("src", imageUrl);
            $("#current-feature-container").show();
        }
    });
}
