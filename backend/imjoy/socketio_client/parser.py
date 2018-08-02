"""
Parser for socket.io protocol

This implementation is inspired from the package python-socketio
written by Miguel Grinberg and available under the MIT license at
https://github.com/miguelgrinberg/python-socketio
"""

from engineio_client.emitter import Emitter
import six
import re
import json
import functools

import logging
logger = logging.getLogger(__name__)

class Packet(object):
    CONNECT      = 0
    DISCONNECT   = 1
    EVENT        = 2
    ACK          = 3
    ERROR        = 4
    BINARY_EVENT = 5
    BINARY_ACK   = 6

    def __init__(self, type=None, data=None, namespace=None, id=None):
        self.type = type
        self.data = data
        self.namespace = namespace or '/'
        self.id = id

    @property
    def type_string(self):
        return {
            self.CONNECT:      'connect',
            self.DISCONNECT:   'disconnect',
            self.EVENT:        'event',
            self.ACK:          'ack',
            self.ERROR:        'error',
            self.BINARY_EVENT: 'binary_event',
            self.BINARY_ACK:   'binary_ack'
        }[self.type]

    def __str__(self):
        return ' - '.join([str(i) for i in [self.type_string, self.id, self.namespace, self.data] if i])

PATTERN = '^'
PATTERN += '([0-6])'         # type
PATTERN += '(?:(\d+)-)?'     # number of attachments (optional)
PATTERN += '(?:(/[^,]+),?)?' # namespace (optional)
PATTERN += '(\d*)'           # message id (optional)
PATTERN += '(.*)'            # data
PATTERN += '$'

class Parser(object):
    def __init__(self):
        self.reset()

    def reset(self):
        self.packet = None
        self.raw_data = None
        self.num_attachments = 0
        self.attachments = []

    def decode(self, bytes):
        if not self.packet:
            packet_type, num_attachments, namespace, packet_id, data = self.decode_packet(bytes)
            self.packet = Packet(type=packet_type, namespace=namespace, id=packet_id)
            self.raw_data = data
            self.num_attachments = num_attachments
        else:
            self.attachments.append(bytes)

        if self.num_attachments != len(self.attachments):
            return None

        packet = self.packet
        packet.data = self.construct_data(self.raw_data, self.attachments)
        self.reset()
        return packet

    def decode_packet(self, bytes):
        matches = re.findall(PATTERN, bytes)
        if not matches:
            raise ParserException("Decoded packet is invalid: %s" % repr(bytes))

        items = matches[0]
        packet_type     = int(items[0])
        num_attachments = int(items[1]) if items[1] else 0
        namespace       = items[2]
        packet_id       = int(items[3]) if items[3] else None
        data            = json.loads(items[4]) if items[4] else None

        return packet_type, num_attachments, namespace, packet_id, data

    def construct_data(self, data, attachments):
        ret = data
        if isinstance(data, list):
            ret = [self.construct_data(item, attachments) for item in data]
        elif isinstance(data, dict):
            if data.get('_placeholder', False) and 0 <= data.get('num', -1) < len(attachments):
                ret = bytearray(attachments[data['num']])
            else:
                ret = {key: self.construct_data(value, attachments) for key, value in six.iteritems(data)}
        return ret

    def encode(self, packet):
        bytes = six.text_type()
        data, attachments = self.deconstruct_data(packet.data)

        if attachments:
            bytes += six.text_type(len(attachments)) + '-'
            if packet.type == Packet.EVENT:
                packet.type = Packet.BINARY_EVENT
            elif packet.type == Packet.ACK:
                packet.type = Packet.BINARY_ACK

        bytes = six.text_type(packet.type) + bytes

        if packet.namespace and packet.namespace != '/':
            bytes += packet.namespace
            if packet.id or data:
                bytes += ','
        if packet.id is not None:
            bytes += six.text_type(packet.id)
        if data is not None:
            bytes += json.dumps(data, separators=(',', ':'))

        return [bytes] + attachments

    def deconstruct_data(self, data, attachments=None):
        if attachments is None:
            attachments = []

        ret = data
        if isinstance(data, bytearray):
            attachments.append(data)
            ret = {'_placeholder': True, 'num': len(attachments) - 1}
        elif isinstance(data, (tuple, list)):
            ret = [self.deconstruct_data(item, attachments)[0]
                   for item in data]
        elif isinstance(data, dict):
            ret = {key: self.deconstruct_data(value, attachments)[0]
                   for key, value in six.iteritems(data)}
        return ret, attachments

class ParserException(Exception):
    pass

class PacketException(Exception):
    pass

