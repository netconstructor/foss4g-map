# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestBicycleRentalController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='bicycle_rental'))
        # Test response...
