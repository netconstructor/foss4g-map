import logging

from math import cos, pi

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from bikedenapp.lib.base import BaseController, render

from mapfish.protocol import Protocol, create_default_filter
from mapfish.decorators import geojsonify

from bikedenapp.model.bike_path import BikePath
from bikedenapp.model.foot_path import FootPath
from bikedenapp.model.drinking_fountain import DrinkingFountain
from bikedenapp.model.bike_shop import BikeShop
from bikedenapp.model.park import Park

from bikedenapp.model.meta import Session

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
            lat = float(request.params["lat"])
        else:
            return {"error": True, "message": "No \"lat\" parameter was found."}
        
        if "lon" in request.params:
            lon = float(request.params["lon"])
        else:
            return {"error": True, "message": "No \"lon\" parameter was found."}
        
        if "zoom" in request.params:
            zoom = int(request.params["zoom"])
        else:
            return {"error": True, "message": "No \"zoom\" parameter was found."}
            
        point = Point(lon, lat)
        wkb_point = WKBSpatialElement(buffer(point.wkb), 4326)
        
        distance_meters = pow(1.8, (20 - zoom))
        tolerance = metersToDegrees(distance_meters, lat)
        
        features = []
        
        """ Query points first """
        """  ... but only if we're >= zoom 14 """
        if zoom >= 14:
            drinkingFountainFilter = func.ST_DWithin(wkb_point, DrinkingFountain.geometry_column(), tolerance)
            drinkingFountainQuery = Session.query(DrinkingFountain).filter(drinkingFountainFilter)
            
            for row in drinkingFountainQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Drinking Fountain"
                features.append(feature)
                
            if len(features) > 0:
                """ If we found some points, go ahead and return them.
                No sense searching for lines/polygons. """
                return FeatureCollection(features)
    
            bikeShopFilter = func.ST_DWithin(wkb_point, BikeShop.geometry_column(), tolerance)
            bikeShopQuery = Session.query(BikeShop).filter(bikeShopFilter)
            
            for row in bikeShopQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Bike Shop"
                features.append(feature)
                
            if len(features) > 0:
                """ If we found some points, go ahead and return them.
                No sense searching for lines/polygons. """
                return FeatureCollection(features)
                
            parkFilter = func.ST_DWithin(wkb_point, Park.geometry_column(), tolerance)
            parkQuery = Session.query(Park).filter(parkFilter)
            
            for row in parkQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Park"
                features.append(feature)
                
            if len(features) > 0:
                """ If we found some points, go ahead and return them.
                No sense searching for lines/polygons. """
                return FeatureCollection(features)
            
        """ Then query lines """
        """ Bike Paths first """
        bikePathFilter = func.ST_DWithin(wkb_point, BikePath.geometry_column(), tolerance)
        bikePathQuery = Session.query(BikePath).filter(bikePathFilter)
        
        for row in bikePathQuery:
            feature = row.toFeature()
            feature.properties["feature_type"] = "Bike Path"
            features.append(feature)
            
        if len(features) > 0:
            """ If we found some bike paths, go ahead and return them.
            No sense searching for foot paths or polygons. """
            return FeatureCollection(features)
        
        """ Then Foot Paths """
        footPathFilter = func.ST_DWithin(wkb_point, FootPath.geometry_column(), tolerance)
        footPathQuery = Session.query(FootPath).filter(footPathFilter)
        
        for row in footPathQuery:
            feature = row.toFeature()
            feature.properties["feature_type"] = "Foot Path"
            features.append(feature)
            
        if len(features) > 0:
            """ If we found some foot paths, go ahead and return them.
            No sense searching for polygons. """
            return FeatureCollection(features)
        
        """ Finally, query polygons (none for now) """
        
        """ return {"lat": lat, "lon": lon, "zoom": zoom} """
        return FeatureCollection(features)

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
