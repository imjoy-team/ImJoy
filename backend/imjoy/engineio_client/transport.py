from .emitter import Emitter
from .utils import format_long

import logging
logger = logging.getLogger(__name__)

class Transport(Emitter):
    """Abstract base class for transports implementations
    """
    def __init__(self, client, scheme, hostname, port, path, parser=None):
        super(Transport, self).__init__()
        self.client = client
        self.scheme = scheme
        self.hostname = hostname
        self.port = port
        self.path = path
        self.parser = parser

        self.state = 'closed'

    def open(self):
        if self.state == 'closed':
            self.state = 'opening'
            self.do_open()

    def close(self, send=True):
        if self.state in ['open', 'opening']:
            if send:
                self.do_close()
            self.handle_close()

    def send(self, packets):
        if self.state != 'open':
            raise TransportNotOpenException()

        self.do_send(packets)

    def handle_error(self, error):
        logger.warning("Transport error: %s", error)
        self.emit('error', error)

    def handle_open(self):
        logger.debug("Transport open")
        self.state = 'open'
        self.emit('open')

    def handle_close(self):
        logger.debug("Transport closed")
        self.state = 'closed'
        self.emit('close')

    def handle_packet(self, packet):
        logger.debug(format_long("Received packet: %s - %s", packet.type_string, repr(packet.data)))
        self.emit('packet', packet)

    def do_open(self):
        raise NotImplementedError()

    def do_close(self):
        raise NotImplementedError()

    def do_send(self, packets):
        raise NotImplementedError()

class TransportException(Exception):
    pass

class TransportNotOpenException(TransportException):
    pass

