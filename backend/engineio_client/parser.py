"""
Parser for engine.io protocol

This implementation is largely inspired from the package python-engineio
written by Miguel Grinberg and available under the MIT license at
https://github.com/miguelgrinberg/python-engineio
"""

import six

class Packet(object):
    OPEN    = 0
    CLOSE   = 1
    PING    = 2
    PONG    = 3
    MESSAGE = 4
    UPGRADE = 5
    NOOP    = 6

    def __init__(self, _type, data='', binary=False):
        self.type = _type
        self.data = data
        self.binary = binary

    @property
    def type_string(self):
        return {
            self.OPEN:     'open',
            self.CLOSE:    'close',
            self.PING:     'ping',
            self.PONG:     'pong',
            self.MESSAGE:  'message',
            self.UPGRADE:  'upgrade',
            self.NOOP:     'noop'
        }[self.type]

class Parser(object):
    def decode_packet(self, bytes):
        """Decode a received package."""
        b64 = False
        if not isinstance(bytes, six.binary_type):
            bytes = bytes.encode('utf-8')

        packet_type = six.byte2int(bytes[0:1])
        if packet_type == ord('b'):
            binary = True
            bytes = bytes[1:]
            packet_type = int(chr(six.byte2int(bytes[0:1])))
            b64 = True
        elif packet_type >= ord('0'):
            packet_type = int(chr(packet_type))
            binary = False
        else:
            binary = True

        packet_data = None
        if len(bytes) > 1:
            if binary:
                if b64:
                    packet_data = base64.b64decode(bytes[1:])
                else:
                    packet_data = bytes[1:]
            else:
                packet_data = bytes[1:].decode('utf-8')

        return Packet(packet_type, packet_data, binary)

    def encode_packet(self, packet, b64=False):
        """Encode the packet to be sent."""
        if packet.binary and not b64:
            bytes = six.int2byte(packet.type)
        else:
            bytes = six.binary_type(str(packet.type).encode('ascii'))
            if packet.binary and b64:
                bytes = 'b' + bytes

        if packet.binary and b64:
            bytes += base64.b64encode(packet.data).decode('utf-8')
        else:
            bytes += six.binary_type(str(packet.data).encode('ascii'))

        return bytes

    def decode_payload(self, bytes):
        """Decode a received payload."""
        packets = []
        while bytes:
            if six.byte2int(bytes[0:1]) <= 1:
                packet_len = 0
                i = 1
                while six.byte2int(bytes[i:i + 1]) != 255:
                    packet_len = packet_len * 10 + six.byte2int(bytes[i:i + 1])
                    i += 1
                packet_start = i+1
            else:
                i = bytes.find(b':')
                if i == -1:
                    raise ValueError('Invalid payload')
                packet_len = int(bytes[0:i])
                packet_start = i+1

            packet = self.decode_packet(bytes[packet_start:packet_start+packet_len])
            packets.append(packet)
            bytes = bytes[packet_start+packet_len:]

        return packets

    def encode_payload(self, packets, b64=False):
        """Encode the payload to be sent."""
        bytes = b''
        for packet in packets:
            packet_bytes = self.encode_packet(packet, b64)
            packet_len = len(packet_bytes)
            if b64:
                bytes += str(packet_len) + b':' + packet_bytes
            else:
                binary_len = b''
                while packet_len != 0:
                    binary_len = six.int2byte(packet_len % 10) + binary_len
                    packet_len = int(packet_len / 10)
                bytes += b'\x01' if packet.binary else b'\x00'
                bytes += binary_len + b'\xff' + packet_bytes

        return bytes
