from collections import defaultdict

class Emitter(object):
    def __init__(self):
        self.handlers = defaultdict(list)

    def on(self, event, func=None):
        def set_event_handler(handler):
            self.handlers[event].append(handler)
            return handler

        if func:
            set_event_handler(func)
        else:
            return set_event_handler

    def off(self, event, func):
        self.handlers[event].remove(func)

    def once(self, event, func=None):
        def set_event_handler(handler):

            def wrapper(*args, **kwargs):
                self.off(event, wrapper)
                return handler(*args, **kwargs)

            self.on(event, wrapper)
            return handler

        if func:
            set_event_handler(func)
        else:
            return set_event_handler

    def emit(self, event, *args, **kwargs):
        for handler in self.handlers[event]:
            handler(*args, **kwargs)

    def removeAllListeners(self):
        self.handlers.clear()

