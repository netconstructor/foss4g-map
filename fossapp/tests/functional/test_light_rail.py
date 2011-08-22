# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestLightRailController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='light_rail'))
        # Test response...
