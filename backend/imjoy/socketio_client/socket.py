from engineio_client.emitter import Emitter
from engineio_client.utils import format_long
from .parser import Packet

import logging
logger = logging.getLogger(__name__)

class Socket(object):
    def __init__(self, namespace, manager):
        self.namespace = namespace
        self.manager = manager

        self.state = 'disconnected'
        self.event_handlers = Emitter()
        self.socket_handlers = Emitter()
        self.acks = {}
        self.ids = 0

        if self.manager.auto_connect:
            self.connect()

    def setup_manager_handlers(self):
        self.manager.attach_socket(self)
        self.manager.on('open', self.handle_open)
        self.manager.on('close', self.handle_close)
        self.manager.on('packet', self.handle_packet)

    def cleanup_manager_handlers(self):
        self.manager.off('open', self.handle_open)
        self.manager.off('close', self.handle_close)
        self.manager.off('packet', self.handle_packet)
        self.manager.detach_socket(self)
    
    def cleanup_handlers(self):
        self.socket_handlers.removeAllListeners()
        self.event_handlers.removeAllListeners()

    @property
    def id(self):
        return self.manager.id

    def connect(self):
        if self.state in ['connecting', 'connected']:
            return

        self.state = 'connecting'
        self.manager.connect()   # Ensure connected
        if self.manager.state == 'open':
            self.handle_open()
        self.socket_handlers.emit('connecting')
        self.setup_manager_handlers()

    def disconnect(self):
        if self.state not in ['connecting', 'connected']:
            return

        logger.debug("Sending disconnect")
        self.send_packet(Packet(Packet.DISCONNECT))
        self.cleanup_manager_handlers()
        self.handle_close()
        self.cleanup_handlers()

    def on(self, *args, **kwargs):
        """Attach handler for event-type messages"""
        return self.event_handlers.on(*args, **kwargs)

    def on_socket(self, *args, **kwargs):
        """Attach handler for generic socket events"""
        return self.socket_handlers.on(*args, **kwargs)

    def on_connecting(self, *args, **kwargs):
        return self.on_socket('connecting', *args, **kwargs)

    def on_connect(self, *args, **kwargs):
        return self.on_socket('connect', *args, **kwargs)

    def on_disconnect(self, *args, **kwargs):
        return self.on_socket('disconnect', *args, **kwargs)

    def on_error(self, *args, **kwargs):
        return self.on_socket('error', *args, **kwargs)

    def on_event(self, *args, **kwargs):
        return self.on_socket('event', *args, **kwargs)

    def emit(self, *args, **kwargs):
        """Send event-type message
        If callback is provided, it will be called when the server want to
        respond to the event (maybe never).
        """
        logger.debug(format_long("Sending event: %s", args))

        packet = Packet(type=Packet.EVENT, data=args)

        callback = kwargs.get('callback', None)
        if callback:
            packet.id = self.ids
            self.acks[packet.id] = callback
            self.ids += 1

        self.send_packet(packet)

    def send_packet(self, packet):
        packet.namespace = self.namespace
        self.manager.send_packet(packet)

    def handle_open(self):
        logger.debug("Manager is open, connecting")
        if self.namespace != '/':
            self.send_packet(Packet(Packet.CONNECT))

    def handle_close(self):
        logger.debug("Closed")
        self.state = 'disconnected'
        self.socket_handlers.emit('disconnect')

    def handle_packet(self, packet):
        if packet.namespace != self.namespace:
            return

        if packet.type == Packet.CONNECT:
            self.handle_connect()
        elif packet.type == Packet.DISCONNECT:
            self.handle_disconnect()
        elif packet.type in [Packet.EVENT, Packet.BINARY_EVENT]:
            self.handle_event(packet)
        elif packet.type in [Packet.ACK, Packet.BINARY_ACK]:
            self.handle_ack(packet)
        elif packet.type == Packet.ERROR:
            self.handle_error(packet.data)
        else:
            logger.error("Invalid packet type: %d", packet.type)

    def handle_connect(self):
        logger.debug("Received connect")
        self.state = 'connected'
        self.socket_handlers.emit('connect')

    def handle_disconnect(self):
        logger.debug("Received disconnect")
        self.cleanup_manager_handlers()
        self.handle_close()
        self.cleanup_handlers()

    def handle_event(self, packet):
        args = packet.data or []
        logger.debug(format_long("Received event: %s", args))

        kwargs = {}
        if packet.id:
            kwargs['callback'] = self.create_ack_callback(packet.id)

        self.event_handlers.emit(*args, **kwargs)
        self.socket_handlers.emit('event', *args, **kwargs)

    def handle_ack(self, packet):
        args = packet.data or []
        logger.debug(format_long("Received ack: %s", args))
        
        try:
            callback = self.acks.pop(packet.id)
        except KeyError:
            logger.warning("Invalid ack id")
        else:
            callback(*args)

    def handle_error(self, error):
        logger.warning("Received error: %s", error)
        self.socket_handlers.emit('error', error)

    def create_ack_callback(self, id):
        def callback(*args):
            if callback.sent:
                logger.warning("Ack already sent")
                return

            callback.sent = True
            logger.debug(format_long("Sending ack: %s", args))
            self.send_packet(Packet(type=Packet.ACK, id=id, data=args))
        callback.sent = False

        return callback

