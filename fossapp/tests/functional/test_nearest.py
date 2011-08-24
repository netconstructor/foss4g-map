from fossapp.tests import *

class TestNearestController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='nearest', action='index'))
        # Test response...
