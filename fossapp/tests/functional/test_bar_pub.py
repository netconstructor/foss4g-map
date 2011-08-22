# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestBarPubController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='bar_pub'))
        # Test response...
