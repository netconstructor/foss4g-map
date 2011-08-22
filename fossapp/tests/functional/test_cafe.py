# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestCafeController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='cafe'))
        # Test response...
