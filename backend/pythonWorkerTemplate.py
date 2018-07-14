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
from RestrictedPython import compile_restricted
from RestrictedPython import safe_builtins

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
            cid = str(random.random())
            callbacks[cid] = v
            if isarray:
                bObject.append({'__jailed_type__': 'callback', '__value__' : 'f', 'num': cid})
            else:
                bObject[k] = {'__jailed_type__': 'callback', '__value__' : 'f', 'num': cid}
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


def _start_socketio(secret, protocol='http', host='localhost', port=8080, namespace='/'):
    io = Manager(protocol, host, port)
    sio = io.socket(namespace)
    _init = False
    _loc = {}
    @sio.on_connect()
    def sio_connect():
        global _init
        _init = False
        sio.emit('from_plugin_'+secret, {"type": "initialized", "dedicatedThread": True})

    @sio.on('to_plugin_'+secret)
    def sio_plugin_message(data):
        global _init
        # print('------------------------------------------------', data)
        # sys.stdout.flush()
        if data['type']== 'import':
            sio.emit('from_plugin_'+secret,  {'type':'importSuccess', 'url': data['url']})
        else:
            if data['type']== 'execute':
                byte_code = compile_restricted(data['code'], '<inline>', 'exec')
                exec(byte_code, safe_builtins, _loc)
                sio.emit('from_plugin_'+secret,  {'type':'executeSuccess'})
            elif data['type']== 'message':
                d = data['data']
                if d['type'] == 'getInterface':
                    sio.emit('from_plugin_'+secret, {'type':'setInterface', 'api': [{'name': 'setup', 'data': None}, {'name': 'run', 'data': None}]})
                elif d['type'] == 'setInterface':
                    sio.emit('from_plugin_'+secret, {'type':'interfaceSetAsRemote'})
                    if not _init:
                        sio.emit('from_plugin_'+secret, {'type':'getInterface'})
                        _init = True

                elif d['type'] == 'interfaceSetAsRemote':
                    #sio.emit('from_plugin_'+secret, {'type':'getInterface'})
                    pass
                elif d['type'] == 'method':
                    if d['name'] in _loc:
                        func = _loc[d['name']]
                    if d['name'] == 'setup':
                        arg = { 'name': 'Python Demo Plugin', 'type': 'demo/pyworker', 'tags': ['demo', 'op'], 'ui': 'run python plugin'}
                        call_register = {'type':'method', 'name': 'register', 'args': _wrap([arg]) }
                        sio.emit('from_plugin_'+secret, call_register)
                    elif d['name'] == 'run':
                        if 'promise' in d:
                            callbackId = d['promise']['callbackId']
                            resolve, reject = d['promise']['args']
                            result = {'data': {'result from python': '123'}}
                            call_promise = {'type':'callback','id': callbackId,  'num': resolve['num'], 'args': _wrap([result]) }
                            sio.emit('from_plugin_'+secret, call_promise)
    io.connect()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', type=str, required=True, help='plugin id')
    parser.add_argument('--secret', type=str, required=True, help='plugin secret')
    opt = parser.parse_args()
    _start_socketio(opt.secret)
    gevent.wait()
