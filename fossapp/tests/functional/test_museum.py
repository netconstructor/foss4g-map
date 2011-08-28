# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestMuseumController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='museum'))
        # Test response...
