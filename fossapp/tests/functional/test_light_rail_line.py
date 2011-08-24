# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestLightRailLineController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='light_rail_line'))
        # Test response...
