import sys
if sys.version_info < (3,0):
    sys.exit('Sorry, Python < 2.7 is not supported')
from setuptools import setup

setup(name='imjoy',
      version='0.1.1',
      description='Python plugin engine for ImJoy.io',
      url='http://github.com/oeway/ImJoy',
      author='Wei OUYANG',
      author_email='wei.ouyang@cri-paris.org',
      license='MIT',
      packages=['imjoy'],
      install_requires=[
          'requests',
          'gevent',
          'python-socketio',
          'aiohttp',
          'six',
          'websocket-client-py3'
      ],
      zip_safe=False)
