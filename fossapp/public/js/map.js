var bd = {};

bd.baseMaps = [
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

bd.overlayMaps = [
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

bd.venues = [
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
        "desc": '<h2>The Big Party</h2><h3>Denver Art Museum</h3><p>The <a href="http://www.denverartmuseum.org/home">Denver Art Museum</a> will be the place to be on Thursday, September 15 for the Big Party. Come explore the <a href="http://expansion.denverartmuseum.org/">Hamilton Building</a> where we\'ll have access to several galleries as well as the gift shop. This is a great event for networking, so don\'t miss it!</p><p class="more-info"></p>',
        "lat": 39.737496577957,
        "lng": -104.9897128343582
    },{
        "desc": '<h2>Code Sprint</h2><h3>Tivoli Student Union</h3><p>Join us here Saturday, Sept 17 from 9:00am to 6:00pm at the Tivoli Student Union to work on some great open source geo projects. Not a coder? These projects also need people to test, document and give feedback. To sign up, head over to the <a href="http://wiki.osgeo.org/wiki/FOSS4G_2011_Code_Sprint">Code Sprint Wiki</a>.</p><p class="more-info"><a href="http://2011.foss4g.org/content/code-sprint">More Info</a></p>',
        "lat": 39.745181280550725,
        "lng": -105.00589728355408
    }
];

$(document).ready(function(){

	bd.map = new L.Map("map-container", {
	    minZoom: 10,
	    maxZoom: 18
	});
	
	if (mapLoad){
	    bd.map.on("load", mapLoad);
	}

	bd.map.setView(new L.LatLng(39.74976, -104.99075), 14);
	
	var baseMaps = {};
	var overlayMaps = {};

	$.each(bd.baseMaps, function(i, o){
		o.layer = createTiledMapLayer(o.config);
		if (o.initiallyVisible) bd.map.addLayer(o.layer);
		baseMaps[o.name] = o.layer;
	});
	$.each(bd.overlayMaps, function(i, o){
		o.layer = createTiledMapLayer(o.config);
		if (o.initiallyVisible){
			bd.map.addLayer(o.layer);
		}
		overlayMaps[o.name] = o.layer;
	});
	
	$.each( bd.venues, function( i, o ) {
	    var foss4gIcon = L.Icon.extend( {
	        iconUrl: o.is_the_hotel_where_all_this_stuff_is_happening ? "http://foss4g.geojason.info/img/marker/foss4g-large.png" : "http://foss4g.geojason.info/img/marker/foss4g-large.png",
	        iconSize: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 40, 24 ) : new L.Point( 34, 21 ),
	        iconAnchor: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 21, 13 ) : new L.Point( 17, 11 ),
	        popupAnchor: o.is_the_hotel_where_all_this_stuff_is_happening ? new L.Point( 21, 13 ) : new L.Point( 17, 11 )
	    } );
	    o.marker = new L.Marker( new L.LatLng( o.lat, o.lng ), {
	        icon: foss4gIcon
	    } );
	    o.marker.bindPopup( o.desc );
	    bd.map.addLayer( o.marker )
	} );
	
	if (window.handleMapClick){
	    bd.map.on("click", handleMapClick);
	}
	
	bd.layersControl = new L.Control.Layers(baseMaps, overlayMaps);
	bd.map.addControl(bd.layersControl);
	
	bd.poiLayer = new L.GeoJSON();
	bd.poiLayer.on("featureparse", function(e){
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
                    popupContent = '<h2>Opening Social</h2><p>Come taste some fine Denver microbrews and test your billiards skills against a local pro, <a href="http://www.wynkoop.com/billiards/viper-blog">Melissa "The Viper" Little</a>. We\'ll have the second floor to ourselves. Come help us kick off the conference!</p><p class="more-info"><a href="http://2011.foss4g.org/content/opening-social-wynkoop-brewery">More Info</a></p>';
                    break;
                case "Sheraton Denver Downtown":
                    popupContent = '<h2>The Conference</h2><p>The home of the 2011 FOSS4G Conference.</p><p class="more-info"><a href="http://www.sheratondenverdowntown.com/">More Info</a></p>';
                    break;
                case "Denver Art Museum":
                    popupContent = '<h2>The Big Party</h2><p>The <a href="http://www.denverartmuseum.org/home">Denver Art Museum</a> will be the place to be on Thursday, September 15 for the Big Party. Come explore the <a href="http://expansion.denverartmuseum.org/">Hamilton Building</a> where we\'ll have access to several galleries as well as the gift shop. This is a great event for networking, so don\'t miss it!</p><p class="more-info"></p>';
                    break;
                case "Tivoli Student Union":
                    popupContent = '<h2>Code Sprint</h2><p>Join us here Saturday, Sept 17 from 9:00am to 6:00pm at the Tivoli Student Union to work on some great open source geo projects. Not a coder? These projects also need people to test, document and give feedback. To sign up, head over to the <a href="http://wiki.osgeo.org/wiki/FOSS4G_2011_Code_Sprint">Code Sprint Wiki</a>.</p><p class="more-info"><a href="http://2011.foss4g.org/content/code-sprint">More Info</a></p>';
                    break;
            }
            e.layer.bindPopup( popupContent );
            setTimeout( function() {
                e.layer.openPopup();
            }, 300);
        }
	});
	bd.map.addLayer(bd.poiLayer);

});

function createTiledMapLayer(o){
	if (!o.options.subdomains) o.options.subdomains = [];
	return new L.TileLayer(o.url, o.options);
}
