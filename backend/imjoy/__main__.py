if __name__ == '__main__':
    try:
        import pkg_resources  # part of setuptools
        version = pkg_resources.require("MyProject")[0].version
        print('ImJoy Python Plugin Engine (version {})'.format(version))
    except:
        pass
    from .pluginEngine import *
    web.run_app(app)
