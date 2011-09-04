# -*- coding: utf-8 -*-

from fossapp.tests import *

class TestStudentUnionController(TestController):
    def test_index(self):
        response = self.app.get(url(controller='student_union'))
        # Test response...
