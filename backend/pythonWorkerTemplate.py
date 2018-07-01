import argparse
import logging
logging.getLogger('socketIO-client').setLevel(logging.DEBUG)
logging.basicConfig()
from socketIO_client import SocketIO, LoggingNamespace, BaseNamespace

class ImjoyPluginNamespace(BaseNamespace):

    def on_connect(self):
        print('connect')

    def on_disconnect(self):
        print('disconnect')

    def on_reconnect(self):
        print('reconnect')

def on_plugin_message(*args):
    print('on_plugin_message', args)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', type=str, required=True, help='plugin id')
    parser.add_argument('--secret', type=str, required=True, help='plugin secret')
    opt = parser.parse_args()
    socketIO = SocketIO('127.0.0.1', 8080, LoggingNamespace)
    # io = socketIO.define(ImjoyPluginNamespace, '/imjoy_plugin_engine')
    # Listen
    socketIO.on('message_to_plugin_'+opt.id, on_plugin_message)
    socketIO.emit('message', 'hello from the plugin.')

    socketIO.emit('message_from_plugin_'+opt.id, {"type": "initialized", "dedicatedThread": True})
    socketIO.wait()
