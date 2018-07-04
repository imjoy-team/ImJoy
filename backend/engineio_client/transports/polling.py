from ..transport import Transport
from ..parser import Packet
from ..utils import format_long
import requests
import gevent
import json

import logging
logger = logging.getLogger(__name__)


class Polling(Transport):
    name = 'polling'

    def __init__(self, *args, **kwargs):
        super(Polling, self).__init__(*args, **kwargs)
        self.session = requests.Session()
        self.session.headers.update(
            {'Content-Type': 'application/octet-stream'}
        )
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
        querystring = '?' + '&'.join(
            ['='.join(item) for item in query.items()]
        ) if query else ''

        return '%s://%s:%d%s/%s' % (self.scheme, self.hostname,
                                    self.port, self.path, querystring)

    def handle_payload(self, payload):
        packets = self.parser.decode_payload(payload)
        for packet in packets:
            if self.state == 'opening':
                self.handle_open()
            self.handle_packet(packet)

    def loop_read(self):
        while self.state in ['opening', 'open']:
            try:
                payload = self.read()
                self.handle_payload(payload)
            except requests.RequestException as e:
                self.handle_error(e)

    def do_open(self):
        self.read_loop = self.client.start_loop(self.loop_read)

    def do_close(self):
        def close():
            logger.debug('Writing close packet')
            self.send([Packet(Packet.CLOSE)])
            self.client.stop_loop(self.read_loop)

        if self.state == 'open':
            logger.debug('Closing')
            close()
        else:
            logger.debug('Deferring close')
            self.once('open', close)

    def do_send(self, packets):
        payload = self.parser.encode_payload(packets)
        try:
            self.write(payload)
        except requests.RequestException as e:
            self.handle_error(e)

    def handle_pause(self):
        self.state = 'paused'
        self.emit('pause')

    def pause(self):
        self.state = 'pausing'

        if not self.reading and not self.writing:
            self.handle_pause()

        nlocal = {'remaining_tasks': 0}

        def terminate_task():
            nlocal['remaining_tasks'] -= 1
            if nlocal['remaining_tasks'] <= 0:
                self.handle_pause()

        if self.reading:
            nlocal['remaining_tasks'] += 1
            self.once('read-done', terminate_task)

        if self.writing:
            nlocal['remaining_tasks'] += 1
            self.once('write-done', terminate_task)

    def read(self):
        self.reading = True
        logger.debug('Polling')
        r = self.session.get(self.get_uri(), stream=True)

        self.reading = False
        self.emit('read-done')

        r.raise_for_status()
        payload = r.raw.read()
        logger.debug(format_long('Received payload: %s', repr(payload)))
        return payload

    def write(self, payload):
        self.writing = True
        logger.debug(format_long('Sending payload: %s', repr(payload)))
        r = self.session.post(self.get_uri(), stream=True, data=payload)

        self.writing = False
        self.emit('write-done')

        r.raise_for_status()
