var bd = {};

bd.baseMaps = [
	/*{
		name: "Minimal",
		id: "cm_bd",
		initiallyVisible: true,
		config: {
			url: "http://{s}.tile.cloudmade.com/cadf22ef416446fd9b3b890052efa205/41027/256/{z}/{x}/{y}.png",
			options: {
				attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
				subdomains: ["a", "b", "c"],
				minZoom: 10,
				maxZoom: 19
			}
		}
	},*/{
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
        console.log(e);
        if ( e.properties.feature_type == "FOSS4G Venue" ) {
            switch ( e.properties.feature_type_label ) {
                case "Wynkoop Brewery":
                    e.layer.bindPopup( "Opening Ceremonies here yo<br /><br /><br /><br /><br /><br />" );
                    break;
            }
            e.layer.openPopup();
        }
	});
	bd.map.addLayer(bd.poiLayer);

});

function createTiledMapLayer(o){
	if (!o.options.subdomains) o.options.subdomains = [];
	return new L.TileLayer(o.url, o.options);
}
