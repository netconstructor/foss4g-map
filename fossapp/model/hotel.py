# -*- coding: utf-8 -*-

from sqlalchemy import Column, types

from geoalchemy import GeometryColumn, Point

from mapfish.sqlalchemygeom import GeometryTableMixIn
from fossapp.model.meta import Session, Base

class Hotel(Base, GeometryTableMixIn):
    __tablename__ = 'hotel'
    __table_args__ = {
        "schema": 'foss4g',
        "autoload": True,
        "autoload_with": Session.bind
    }
    the_geom = GeometryColumn(Point(srid=4326))
