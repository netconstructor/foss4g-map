import site
import os, sys

site.addsitedir('/home/ubuntu/env/lib/python2.6/site-packages')

sys.path.append('/home/ubuntu/FossApp')
os.environ['PYTHON_EGG_CACHE'] = '/var/cache/apache2/python-eggs'

# configure the logging system
from paste.script.util.logging_config import fileConfig
fileConfig('/home/ubuntu/FossApp/development.ini')

from paste.deploy import loadapp
application = loadapp('config:/home/ubuntu/FossApp/development.ini')
