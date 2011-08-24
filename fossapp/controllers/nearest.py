import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from fossapp.lib.base import BaseController, render

from fossapp.lib.version import Version

log = logging.getLogger(__name__)

class NearestController(BaseController):

    def __init__(self):
        self.version = Version( session, request )

    def index(self):
        if self.version.getVersion() == "mobile":
            return render( "/m.nearest.html" )
        return render( "/nearest.html" )
