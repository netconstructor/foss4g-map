# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestWynkoopController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='wynkoop'))
        # Test response...
