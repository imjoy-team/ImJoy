
## Installation
  * Install Annaconda3 python3.6
  * Run `pip install -r requirements-py3.txt`

  By default, python plugins will run with Python 3, if you want to develop plugins with Python 2, do the following steps:
  * Run `conda create -n python2 python=2.7 anaconda`
  * On Mac or Linux: Run `source activate python2 && pip install -r requirements-py2.txt`
  * On Windows: Run `activate python2 && pip install -r requirements-py2.txt`
  * In your plugin, add the following field to your `<config>`: `"env": "source activate python2 || activate python2 && pip install six requests gevent websocket-client numpy && python"`

## Usage
  * Run `python pluginEngine.py`
