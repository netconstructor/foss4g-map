import logging

from math import cos, pi

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from fossapp.lib.base import BaseController, render

from mapfish.protocol import Protocol, create_default_filter
from mapfish.decorators import geojsonify

from fossapp.model.hotel import Hotel
from fossapp.model.bar_pub import BarPub
from fossapp.model.wynkoop import Wynkoop
from fossapp.model.cafe import Cafe
from fossapp.model.light_rail import LightRail
from fossapp.model.light_rail_line import LightRailLine
from fossapp.model.free_bus import FreeBus
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
            return { "error": True, "message": "No \"lat\" parameter was found." }
        
        if "lon" in request.params:
            lon = float( request.params["lon"] )
        else:
            return { "error": True, "message": "No \"lon\" parameter was found." }
        
        if "zoom" in request.params:
            zoom = int( request.params["zoom"] )
        else:
            return { "error": True, "message": "No \"zoom\" parameter was found." }
            
        point = Point(lon, lat)
        wkb_point = WKBSpatialElement( buffer( point.wkb ), 4326 )
        
        distance_meters = pow( 1.8, ( 20 - zoom ) )
        tolerance = metersToDegrees( distance_meters, lat )
        
        features = []
        
        #
        # Query points first
        #
        
        #
        # These layers aren't visible until we hit zoom 9
        #
        if zoom >= 9:
            #
            # Hotel query
            #
            hotelFilter = func.ST_DWithin( wkb_point, Hotel.geometry_column(), tolerance )
            hotelQuery = Session.query( Hotel ).filter( hotelFilter )
            
            for row in hotelQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "FOSS4G Venue"
                feature.properties["feature_type_label"] = "Hotel/Conference"
                features.append(feature)
                
            if len( features ) > 0:
                return FeatureCollection( features )
                
            #
            # Wynkoop query
            #
            wynkoopFilter = func.ST_DWithin( wkb_point, Wynkoop.geometry_column(), tolerance )
            wynkoopQuery = Session.query( Wynkoop ).filter( wynkoopFilter )
            
            for row in wynkoopQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "FOSS4G Venue"
                feature.properties["feature_type_label"] = "Wynkoop Brewery"
                features.append(feature)
                
            if len( features ) > 0:
                return FeatureCollection( features )
        
            #
            # Light Rail Stop query
            #
            lightRailFilter = func.ST_DWithin( wkb_point, LightRail.geometry_column(), tolerance )
            lightRailQuery = Session.query( LightRail ).filter( lightRailFilter )
            
            for row in lightRailQuery:
                feature = row.toFeature()
                feature.properties["feature_type"] = "Light Rail Stop"
                features.append( feature )
                
            if len( features ) > 0:
                return FeatureCollection(features)
                
            if zoom >= 16:
                #
                # These layers aren't visible until we hit zoom 16
                #
                
                #
                # Bar/Pub query
                #
                barPubFilter = func.ST_DWithin( wkb_point, BarPub.geometry_column(), tolerance )
                barPubQuery = Session.query( BarPub ).filter ( barPubFilter )
                
                for row in barPubQuery:
                    feature = row.toFeature()
                    feature.properties["feature_type"] = "Bar/Pub"
                    features.append( feature )
                    
                if len( features ) > 0:
                    return FeatureCollection( features )
                    
                #
                # Cafe query
                #
                cafeFilter = func.ST_DWithin( wkb_point, Cafe.geometry_column(), tolerance )
                cafeQuery = Session.query( Cafe ).filter ( cafeFilter )
                
                for row in cafeQuery:
                    feature = row.toFeature()
                    feature.properties["feature_type"] = "Cafe"
                    features.append( feature )
                    
                if len( features ) > 0:
                    return FeatureCollection( features )
                
                #
                # Restaurant query
                #
                restaurantFilter = func.ST_DWithin( wkb_point, Restaurant.geometry_column(), tolerance )
                restaurantQuery = Session.query( Restaurant ).filter ( restaurantFilter )
                
                for row in restaurantQuery:
                    feature = row.toFeature()
                    feature.properties["feature_type"] = "Restaurant"
                    features.append( feature )
                    
                if len( features ) > 0:
                    return FeatureCollection( features )
                
                #
                # Bicycle Rental query
                #
                bicycleRentalFilter = func.ST_DWithin( wkb_point, BicycleRental.geometry_column(), tolerance )
                bicycleRentalQuery = Session.query( BicycleRental ).filter ( bicycleRentalFilter )
                
                for row in bicycleRentalQuery:
                    feature = row.toFeature()
                    feature.properties["feature_type"] = "Bicycle Rental"
                    features.append( feature )
                    
                if len( features ) > 0:
                    return FeatureCollection( features )
                    
        #
        # If no points, query lines
        #
        
        #
        # Light Rail Line query
        #
        lightRailLineFilter = func.ST_DWithin( wkb_point, LightRailLine.geometry_column(), tolerance )
        lightRailLineQuery = Session.query( LightRailLine ).filter( lightRailLineFilter )
        
        for row in lightRailLineQuery:
            feature = row.toFeature()
            feature.properties["feature_type"] = "Light Rail Line"
            features.append( feature )
            
        if len( features ) > 0:
            return FeatureCollection( features )
            
        #
        # Free Bus query
        #
        freeBusFilter = func.ST_DWithin( wkb_point, FreeBus.geometry_column(), tolerance )
        freeBusQuery = Session.query( FreeBus ).filter( freeBusFilter )
        
        for row in freeBusQuery:
            feature = row.toFeature()
            feature.properties["feature_type"] = "Free Bus"
            features.append( feature )
            
        if len( features ) > 0:
            return FeatureCollection( features )
    
        
        return FeatureCollection( features )

def metersToDegrees( meters, currentLatitude ):
    lat = degreesToRadians( currentLatitude )

    p1 = 111412.84
    p2 = -93.5
    p3 = 0.118

    longlen = ( p1 * cos( lat ) ) + ( p2 * cos( 3 * lat ) ) + ( p3 * cos( 5 * lat ) );

    return ( 1 / longlen ) * meters

def degreesToRadians( deg ):
    conv_factor = ( 2.0 * pi ) / 360.0
    return deg * conv_factor
