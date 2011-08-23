import re

class Version(object):

    def __init__(self, session, request):
        self.session = session
        ua = None
        if "HTTP_USER_AGENT" in request.environ:
            ua = request.environ["HTTP_USER_AGENT"]
        self.user_agent = ua

    def __is_mobile_browser(self):
        is_mobile_browser = False
        if self.user_agent is not None:
            _matches = r'android|blackberry|iphone|ipod|mobile'
            _matches = re.compile(_matches, re.IGNORECASE)
            if _matches.search(self.user_agent) != None:
                is_mobile_browser = True
        return is_mobile_browser

    def getVersion(self):

        version = "desktop"

        # First check to see if a session value is set
        if "version" in self.session:
            if self.session["version"] == "mobile":
                return "mobile"
            if self.session["version"] == "desktop":
                return "desktop"

        # There is no session value set, so let's check the user agent.
        if self.__is_mobile_browser():
            return "mobile"
        return version
