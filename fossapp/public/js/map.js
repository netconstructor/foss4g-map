var fm = {};

fm.baseMaps = [
    {
		name: "Road Map",
		id: "mq_osm",
		initiallyVisible: true,
		config: {
			url: "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
			options: {
				attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
				subdomains: ["otile1", "otile2", "otile3", "otile4"],
				minZoom: 4,
				maxZoom: 18
			}
		}
	},{
		name: "Aerial",
		id: "mq_oa",
		initiallyVisible: false,
		config: {
			url: "http://{s}.mqcdn.com/naip/{z}/{x}/{y}.png",
			options: {
				attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
				subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
				minZoom: 10,
				maxZoom: 18
			}
		}
	}
];

fm.overlayMaps = [
	{
		name: "Local Amenities",
		id: "foss4g",
		initiallyVisible: true,
		layerType: "tiled",
		config: {
			url: "/tiles/foss4g/{z}/{x}/{y}.png",
			options: {
				minZoom: 10,
				maxZoom: 18
			}
		}
	}
];

fm.venues = [
    {
        "desc": '<h2>Opening Social</h2><h3>Wynkoop Brewery</h3><p>Come taste some fine Denver microbrews and test your billiards skills against a local pro, <a href="http://www.wynkoop.com/billiards/viper-blog">Melissa "The Viper" Little</a>. We\'ll have the second floor to ourselves. Come help us kick off the conference!</p><p class="more-info"><a href="http://2011.foss4g.org/content/opening-social-wynkoop-brewery">More Info</a></p>',
        "lat": 39.75356211538687,
        "lng": -104.99846756458282
    },{
        "desc": '<h2>The Conference</h2><h3>Sheraton Denver Downtown</h3><p>The home of the 2011 FOSS4G Conference.</p><p class="more-info"><a href="http://www.sheratondenverdowntown.com/">More Info</a></p>',
        "lat": 39.74269405515172,
        "lng": -104.9893319606781,
        "is_the_hotel_where_all_this_stuff_is_happening": true
    },{
        "desc": '<h2>The Big Party</h2><h3>Denver Art Museum</h3><p>The <a href="http://www.denverartmuseum.org/home">Denver Art Museum</a> will be the place to be on Thursday, September 15 for the Big Party. Come explore the <a href="http://expansion.denverartmuseum.org/">Hamilton Building</a> where we\'ll have access to several galleries as well as the gift shop. This is a great event for networking, so don\'t miss it!</p><p class="more-info"><a href="http://2011.foss4g.org/content/big-party-denver-art-museum">More Info</a></p>',
        "lat": 39.737496577957,
        "lng": -104.9897128343582
    },{
        "desc": '<h2>Code Sprint</h2><h3>Tivoli Student Union</h3><p>Join us here Saturday, Sept 17 from 9:00am to 6:00pm at the Tivoli Student Union to work on some great open source geo projects. Not a coder? These projects also need people to test, document and give feedback. To sign up, head over to the <a href="http://wiki.osgeo.org/wiki/FOSS4G_2011_Code_Sprint">Code Sprint Wiki</a>.</p><p class="more-info"><a href="http://2011.foss4g.org/content/code-sprint">More Info</a></p>',
        "lat": 39.745181280550725,
        "lng": -105.00589728355408
    }
];

$(document).ready(function(){

	fm.map = new L.Map("map-container", {
	    minZoom: 10,
	    maxZoom: 18
	});
	
	fm.map.on("load", mapLoad);

	fm.map.setView(new L.LatLng(39.74402223643582, -104.99264717102051), 14);
	
	var baseMaps = {};
	var overlayMaps = {};

	$.each(fm.baseMaps, function(i, o){
		o.layer = createTiledMapLayer(o.config);
		if (o.initiallyVisible) fm.map.addLayer(o.layer);
		baseMaps[o.name] = o.layer;
	});
	
	$.each(fm.overlayMaps, function(i, o){
		o.layer = createTiledMapLayer(o.config);
		if (o.initiallyVisible){
			fm.map.addLayer(o.layer);
		}
		overlayMaps[o.name] = o.layer;
	});
	
	$.each( fm.venues, function( i, o ) {
	    var foss4gIcon = L.Icon.extend( {
	        iconUrl: o.is_the_hotel_where_all_this_stuff_is_happening ? "http://foss4g.geojason.info/img/marker/foss4g-large.png" : "http://foss4g.geojason.info/img/marker/foss4g-large.png",
	        shadowUrl: o.is_the_hotel_where_all_this_stuff_is_happening ? "http://foss4g.geojason.info/img/marker/foss4g-large-shadow.png" : "http://foss4g.geojason.info/img/marker/foss4g-large-shadow.png",
	        iconSize: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 40, 24 ) : new L.Point( 34, 21 ),
	        iconAnchor: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 21, 13 ) : new L.Point( 17, 11 ),
	        popupAnchor: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 0, -12 ) : new L.Point( 0, -10 ),
	        shadowSize: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 53, 24 ) : new L.Point( 45, 21 )
	    } );
	    o.marker = new L.Marker( new L.LatLng( o.lat, o.lng ), {
	        icon: new foss4gIcon()
	    } );
	    o.marker.bindPopup( o.desc );
	    o.marker.on( "click", clearSelection);
	    fm.map.addLayer( o.marker )
	} );
	
	fm.map.on("click", handleMapClick);
	
	fm.layersControl = new L.Control.Layers(baseMaps, overlayMaps);
	fm.map.addControl(fm.layersControl);
	
	fm.poiLayer = new L.GeoJSON();
	fm.poiLayer.on("featureparse", function(e){
		var options = {
			color: "#f00",
			weight: 5,
			opacity: 0.6
		};
        if (e.geometryType != "Point"){
            e.layer.setStyle(options);
        }
        if ( e.properties.feature_type == "FOSS4G Venue" ) {
            var popupContent;
            switch ( e.properties.feature_type_label ) {
                case "Wynkoop Brewery":
                    popupContent = '<h2>Opening Social</h2><p><img src="http://foss4g.geojason.info/img/venue-wynkoop.jpg" alt="Wynkoop Brewery" />Come taste some fine Denver microbrews and test your billiards skills against a local pro, <a href="http://www.wynkoop.com/billiards/viper-blog">Melissa "The Viper" Little</a>. We\'ll have the second floor to ourselves. Come help us kick off the conference!</p><p class="more-info"><a href="http://2011.foss4g.org/content/welcome-reception-tuesday">More Info</a></p>';
                    break;
                case "Sheraton Denver Downtown":
                    popupContent = '<h2>The Conference</h2><p><img src="http://foss4g.geojason.info/img/venue-sheraton.jpg" alt="Sheraton Denver Downtown" />The home of the 2011 FOSS4G Conference.</p><p class="more-info"><a href="http://www.sheratondenverdowntown.com/">More Info</a></p>';
                    break;
                case "Denver Art Museum":
                    popupContent = '<h2>The Big Party</h2><p><img src="http://foss4g.geojason.info/img/venue-museum.jpg" alt="Denver Art Museum" />The <a href="http://www.denverartmuseum.org/home">Denver Art Museum</a> will be the place to be on Thursday, September 15 for the Big Party. Come explore the <a href="http://expansion.denverartmuseum.org/">Hamilton Building</a> where we\'ll have access to several galleries as well as the gift shop. This is a great event for networking, so don\'t miss it!</p><p class="more-info"></p>';
                    break;
                case "Tivoli Student Union":
                    popupContent = '<h2>Code Sprint</h2><p><img src="http://foss4g.geojason.info/img/venue-student-union.jpg" alt="Tivoli Student Union" />Join us here Saturday, Sept 17 from 9:00am to 6:00pm at the Tivoli Student Union to work on some great open source geo projects. Not a coder? These projects also need people to test, document and give feedback. To sign up, head over to the <a href="http://wiki.osgeo.org/wiki/FOSS4G_2011_Code_Sprint">Code Sprint Wiki</a>.</p><p class="more-info"><a href="http://wiki.osgeo.org/wiki/FOSS4G_2011_Code_Sprint">More Info</a></p>';
                    break;
            }
            e.layer.bindPopup( popupContent );
            setTimeout( function() {
                e.layer.openPopup();
            }, 300);
        }
	});
	fm.map.addLayer(fm.poiLayer);

});

function createTiledMapLayer(o){
	if (!o.options.subdomains) o.options.subdomains = [];
	return new L.TileLayer(o.url, o.options);
}

function mapLoad(){
    
    $( ".leaflet-bottom.leaflet-left" ).html( '<div id="current-feature-container"><div class="left-side"><img id="current-feature-image" src="" /></div><div class="right-side"><div id="current-feature-type" class="content"></div><div id="current-feature-name" class="content"></div></div></div>' );
    
    $("#current-feature-container" ).click( function( event ) {
    	event.stopPropagation();
    } ).mousedown( function( event ) {
        event.stopPropagation();
    } );
    
}

function handleMapClick( event ) {
    clearSelection();
    $.getJSON( "select?lat=" + event.latlng.lat + "&lon=" + event.latlng.lng + "&zoom=" + fm.map.getZoom(), function(data){
        if ( data && data.features && data.features.length ) {
            var feature = data.features[0];
            var imageUrl;
            switch ( feature.properties.feature_type ) {
                case "Free Bus":
                    imageUrl = "/img/free-bus.png";
                    break;
                case "Light Rail Stop":
                    imageUrl = "/img/light-rail.png";
                    break;
                case "Light Rail Line":
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
            fm.poiLayer.addGeoJSON( feature );
            $("#current-feature-type").html( feature.properties.feature_type );
            $("#current-feature-name").html( feature.properties.name );
            $("#current-feature-image").attr( "src", imageUrl );
            $("#current-feature-container").show();
        }
    } );
}

function clearSelection() {
    $( "#current-feature-container" ).hide();
    $( "#current-feature-container div.content" ).html( "" );
    fm.poiLayer.clearLayers();
}
