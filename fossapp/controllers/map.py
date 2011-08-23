# -*- coding: utf-8 -*-

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect

from bikedenapp.lib.base import BaseController, render
from bikedenapp.model.trail_desc import TrailDesc
from bikedenapp.model.meta import Session

import json

#from mapfish.protocol import Protocol, create_default_filter
#from mapfish.decorators import geojsonify

class MapController(BaseController):
    readonly = False # if set to True, only GET is supported

    #def __init__(self):
        #self.protocol = Protocol(Session, BikePath, self.readonly)

    def show(self):
        return ""

    def index(self):
	template_values = {}
        trails_js = []
        trailsQuery = Session.query(TrailDesc).all()
        for row in trailsQuery:
            trail_js = {
                "id": row.id,
                "searchVal": row.osm_search
            }
            trails_js.append(trail_js)
        template_values["trails_js"] = json.dumps(trails_js)
        return render("/map.html", template_values)
