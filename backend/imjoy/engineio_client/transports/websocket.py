from __future__ import absolute_import
import sys
if sys.version_info[0] == 3:
    import urllib.request, urllib.parse, urllib.error
    from urllib.parse import urlencode
else:
    from urllib import urlencode

from websocket import WebSocket

from ..parser import Packet
from ..transport import Transport
from ..utils import format_long

import logging
logger = logging.getLogger(__name__)


class Websocket(Transport):
    name = 'websocket'

    def __init__(self, *args, **kwargs):
        super(Websocket, self).__init__(*args, **kwargs)
        self.scheme = 'ws'
        self.connection = WebSocket()
        self.reading = False
        self.writing = False
        self.read_loop = None

    def get_uri(self):
        query = {
            'EIO': '3',
            'transport': self.name
        }

        if self.client and self.client.sid:
            query['sid'] = self.client.sid

        querystring = urlencode(query)

        return '%s://%s:%d%s/?%s' % (self.scheme, self.hostname,
                                    self.port, self.path, querystring)

    def loop_read(self):
        while self.state in ['opening', 'open']:
            if self.state == 'opening':
                self.handle_open()
            packet = self.read()
            packet = self.parser.decode_packet(packet)
            self.handle_packet(packet)

    def do_open(self):
        self.connection.connect(self.get_uri())
        self.read_loop = self.client.start_loop(self.loop_read)

    def do_close(self):
        def close():
            self.send([Packet(Packet.CLOSE)])
            self.client.stop_loop(self.read_loop)

        if self.state == 'open':
            close()
        else:
            self.once('open', close)

    def do_send(self, packets):
        for packet in packets:
            enc_packet = self.parser.encode_packet(packet)
            self.write(enc_packet)

    def read(self):
        self.reading = True
        packet = self.connection.recv()
        return packet

    def write(self, packet):
        self.writing = True
        logger.debug('Sending payload: %s' % repr(packet))
        self.connection.send(packet)
