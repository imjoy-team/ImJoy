import argparse
import logging
import time
import sys
import gevent
import random
from inspect import isfunction
from gevent import monkey;
monkey.patch_socket()
from socketio_client.manager import Manager

def _encode(aObject, callbacks):
    if aObject is None:
        return aObject
    isarray = type(aObject) is list
    bObject = [] if isarray else {}
    #skip if already encoded
    if type(aObject) is dict and '__jailed_type__' in aObject and '__value__' in aObject:
        return aObject
    keys = range(len(aObject)) if isarray else aObject.keys()
    for k in keys:
        v = aObject[k];
        if isfunction(v):
            id = str(random.random())
            callbacks[id] = v
            if isarray:
                bObject.append({'__jailed_type__': 'callback', '__value__' : 'f', 'num': id})
            else:
                bObject[k] = {'__jailed_type__': 'callback', '__value__' : 'f', 'num': id}
      # // send objects supported by structure clone algorithm
      # // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
        #if(v !== Object(v) || v instanceof Boolean || v instanceof String || v instanceof Date || v instanceof RegExp || v instanceof Blob || v instanceof File || v instanceof FileList || v instanceof ArrayBuffer || v instanceof ArrayBufferView || v instanceof ImageData){
        elif type(v) is dict or type(v) is list:
            if isarray:
                 bObject.append(_encode(v, callbacks))
            else:
                bObject[k] = _encode(v, callbacks)
        else:
            if isarray:
                bObject.append({'__jailed_type__': 'argument', '__value__' : v})
            else:
                bObject[k] =  {'__jailed_type__': 'argument', '__value__' : v}

    return bObject

def _wrap(args):
    callbacks = {};
    wrapped = _encode(args, callbacks)
    result = {'args': wrapped}
    # TODO: handle callbacks
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', type=str, required=True, help='plugin id')
    parser.add_argument('--secret', type=str, required=True, help='plugin secret')
    opt = parser.parse_args()

    io = Manager('http', 'localhost', 8080)
    sio = io.socket('/')
    _init = False
    @sio.on_connect()
    def sio_connect():
        sio.emit('message_'+opt.secret, {"type": "initialized", "dedicatedThread": True})

    @sio.on('plugin_message_'+opt.secret)
    def sio_plugin_message(data):
        global _init
        # print('------------------------------------------------', data)
        # sys.stdout.flush()
        if data['type']== 'import':
            sio.emit('message_'+opt.secret,  {'type':'importSuccess', 'url': data['url']})
        else:
            if data['type']== 'execute':
                sio.emit('message_'+opt.secret,  {'type':'executeSuccess'})
            elif data['type']== 'message':
                d = data['data']
                if d['type'] == 'getInterface':
                    sio.emit('message_'+opt.secret, {'type':'setInterface', 'api': [{'name': 'setup', 'data': None}, {'name': 'run', 'data': None}]})

                elif d['type'] == 'setInterface':
                    sio.emit('message_'+opt.secret, {'type':'interfaceSetAsRemote'})
                    if not _init:
                        sio.emit('message_'+opt.secret, {'type':'getInterface'})
                        _init = True

                elif d['type'] == 'interfaceSetAsRemote':
                    #sio.emit('message_'+opt.secret, {'type':'getInterface'})
                    pass
                elif d['type'] == 'method':
                    if d['name'] == 'setup':
                        arg = { 'name': 'Python Demo Plugin', 'type': 'demo/pyworker', 'tags': ['demo', 'op'], 'ui': 'run python plugin'}
                        call_register = {'type':'method', 'name': 'register', 'args': _wrap([arg]) }
                        sio.emit('message_'+opt.secret, call_register)
                    elif d['name'] == 'run':
                        if 'promise' in d:
                            callbackId = d['promise']['callbackId']
                            resolve, reject = d['promise']['args']
                            result = {'data': {'result from python': '123'}}
                            call_promise = {'type':'callback','id': callbackId,  'num': resolve['num'], 'args': _wrap([result]) }
                            sio.emit('message_'+opt.secret, call_promise)

    io.connect()
    gevent.wait()
