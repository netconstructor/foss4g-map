# -*- coding: utf-8 -*-

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect

from bikedenapp.lib.base import BaseController, render
#from bikedenapp.model.bike_path import BikePath
from bikedenapp.model.meta import Session

#from mapfish.protocol import Protocol, create_default_filter
#from mapfish.decorators import geojsonify

class AboutController(BaseController):
    readonly = False # if set to True, only GET is supported

    #def __init__(self):
        #self.protocol = Protocol(Session, BikePath, self.readonly)

    def show(self):
        return ""

    def index(self):
        return render("/about.html")
