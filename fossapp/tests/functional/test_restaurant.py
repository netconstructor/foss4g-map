# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestRestaurantController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='restaurant'))
        # Test response...
