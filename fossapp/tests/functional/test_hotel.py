# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestHotelController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='hotel'))
        # Test response...
