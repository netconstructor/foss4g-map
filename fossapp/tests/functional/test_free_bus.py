# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestFreeBusController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='free_bus'))
        # Test response...
