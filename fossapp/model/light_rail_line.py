# -*- coding: utf-8 -*-

from sqlalchemy import Column, types

from geoalchemy import GeometryColumn, LineString

from mapfish.sqlalchemygeom import GeometryTableMixIn
from fossapp.model.meta import Session, Base

class LightRailLine(Base, GeometryTableMixIn):
    __tablename__ = 'light_rail_line'
    __table_args__ = {
        "schema": 'foss4g',
        "autoload": True,
        "autoload_with": Session.bind
    }
    the_geom = GeometryColumn(LineString(srid=4326))
