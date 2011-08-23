import logging

from math import cos, pi

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from fossapp.lib.base import BaseController, render

from mapfish.protocol import Protocol, create_default_filter
from mapfish.decorators import geojsonify

#from fossapp.model.bike_path import BikePath
#from fossapp.model.foot_path import FootPath
#from fossapp.model.drinking_fountain import DrinkingFountain
#from fossapp.model.bike_shop import BikeShop
#from fossapp.model.park import Park
from fossapp.model.bar_pub import BarPub
from fossapp.model.cafe import Cafe
from fossapp.model.light_rail import LighRail
from fossapp.model.restaurant import Restaurant
from fossapp.model.bicycle_rental import BicycleRental

from fossapp.model.meta import Session

from shapely.geometry.point import Point
from geoalchemy import WKBSpatialElement
from geoalchemy.functions import functions
from sqlalchemy.sql import and_, or_, select
from sqlalchemy import func

from geojson import Feature, FeatureCollection, loads, GeoJSON

log = logging.getLogger(__name__)

class MapSelectController(BaseController):
    readonly = True # if set to True, only GET is supported

    @geojsonify
    def index(self):
        if "lat" in request.params:
            lat = float( request.params["lat"] )
        else:
            return {"error": True, "message": "No \"lat\" parameter was found."}
        
        if "lon" in request.params:
            lon = float( request.params["lon"] )
        else:
            return {"error": True, "message": "No \"lon\" parameter was found."}
        
        if "zoom" in request.params:
            zoom = int( request.params["zoom"] )
        else:
            return {"error": True, "message": "No \"zoom\" parameter was found."}
            
        point = Point(lon, lat)
        wkb_point = WKBSpatialElement(buffer(point.wkb), 4326)
        
        distance_meters = pow( 1.8, ( 20 - zoom ) )
        tolerance = metersToDegrees( distance_meters, lat )
        
        features = []
        
        """ Query points first """
        """  ... but only if we're >= zoom 14 """
        if zoom >= 14:
            lightRailFilter = func.ST_DWithin( wkb_point, LightRail.geometry_column(), tolerance )
            lightRailQuery = Session.query( LightRail ).filter( lightRailFilter )
            
            for row in lightRailQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Light Rail"
                features.append(feature)
                
            if len(features) > 0:
                """ If we found some points, go ahead and return them.
                No sense searching for lines/polygons. """
                return FeatureCollection(features)
    
            """bikeShopFilter = func.ST_DWithin(wkb_point, BikeShop.geometry_column(), tolerance)
            bikeShopQuery = Session.query(BikeShop).filter(bikeShopFilter)
            
            for row in bikeShopQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Bike Shop"
                features.append(feature)
                
            if len(features) > 0:
                #If we found some points, go ahead and return them.
                #No sense searching for lines/polygons.
                return FeatureCollection(features)
                
            parkFilter = func.ST_DWithin(wkb_point, Park.geometry_column(), tolerance)
            parkQuery = Session.query(Park).filter(parkFilter)
            
            for row in parkQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Park"
                features.append(feature)
                
            if len(features) > 0:
                #If we found some points, go ahead and return them.
                #No sense searching for lines/polygons.
                return FeatureCollection(features)
            
        # Then query lines
        # Bike Paths first
        bikePathFilter = func.ST_DWithin(wkb_point, BikePath.geometry_column(), tolerance)
        bikePathQuery = Session.query(BikePath).filter(bikePathFilter)
        
        for row in bikePathQuery:
            feature = row.toFeature()
            feature.properties["feature_type"] = "Bike Path"
            features.append(feature)
            
        if len(features) > 0:
            # If we found some bike paths, go ahead and return them.
            #No sense searching for foot paths or polygons.
            return FeatureCollection(features)"""
        
        return FeatureCollection( features )

def metersToDegrees(meters, currentLatitude):
    lat = degreesToRadians(currentLatitude)

    p1 = 111412.84
    p2 = -93.5
    p3 = 0.118

    longlen = (p1 * cos(lat)) + (p2 * cos(3 * lat)) + (p3 * cos(5 * lat));

    return (1 / longlen) * meters

def degreesToRadians(deg):
    conv_factor = (2.0 * pi)/360.0
    return deg * conv_factor
