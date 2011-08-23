import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from bikedenapp.lib.base import BaseController, render

log = logging.getLogger(__name__)

class MobileController(BaseController):

    def index(self):
        session["version"] = "mobile"
        session.save()
        redirect( url(controller="main", action="index") )
