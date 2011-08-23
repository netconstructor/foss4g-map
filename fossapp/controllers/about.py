# -*- coding: utf-8 -*-

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect

from fossapp.lib.base import BaseController, render
from fossapp.model.meta import Session

class AboutController(BaseController):

    def show(self):
        return ""

    def index(self):
        return render("/about.html")
