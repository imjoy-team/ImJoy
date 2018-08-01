import argparse
import logging
import time
import sys
import gevent
import random
import traceback
from inspect import isfunction
from gevent import monkey;
import six
monkey.patch_socket()
from socketio_client.manager import Manager
# from RestrictedPython import compile_restricted
# from RestrictedPython import safe_builtins
import inspect

class ReferenceStore():
    def __init__(self):
        self._store = {}
        self._indices = [0]

    def _genId(self):
        if len(self._indices) == 1:
            self._indices[0] += 1
            id = self._indices[0]
        else:
            id = self._indices.popleft()
        return id

    def _releaseId(self, id):
        for i in range(len(self._indices)):
            if id < self._indices[i]:
                self._indices.insert(i, id)
                break

        # cleaning-up the sequence tail
        for i in reversed(range(len(self._indices))):
            if self._indices[i]-1 == self._indices[i-1]:
                self._indices.pop()
            else:
                break

    def put(self, obj):
        id = self._genId()
        self._store[id] = obj
        return id

    def fetch(id):
        obj = self._store[id]
        self._store[id] = None
        del self._store[id]
        self._releaseId(id)
        return obj


class API(dict):
    def __getattr__(self, name):
        if name in self:
            return self[name]
        else:
            raise AttributeError("No such attribute: " + name)
    def __setattr__(self, name, value):
        self[name] = value
    def __delattr__(self, name):
        if name in self:
            del self[name]
        else:
            raise AttributeError("No such attribute: " + name)

class PluginConnection():
    def __init__(self, pid, secret, protocol='http', host='localhost', port=8080, namespace='/', api=None):
        self.io = Manager(protocol, host, port)
        sio = self.io.socket(namespace)
        self._init = False
        self.secret = secret
        self.id = pid
        def emit(msg):
            sio.emit('from_plugin_'+ secret, msg)
        self.emit = emit

        @sio.on_connect()
        def sio_connect():
            self._init = False
            self.emit({"type": "initialized", "dedicatedThread": True})

        @sio.on_disconnect()
        def sio_disconnect():
            sys.exit(1)

        sio.on('to_plugin_'+secret, self.sio_plugin_message)
        self.sio = sio
        _remote = API()
        _remote["ndarray"] = self._ndarray
        _remote["export"] = self._sendInterface
        self._local = {"api": _remote}
        self._interface = {}
        self._store = ReferenceStore()

    def start(self):
        self.io.connect()


    def _encode(self, aObject, callbacks):
        if aObject is None:
            return aObject
        if type(aObject) is tuple:
            aObject = list(aObject)
        isarray = type(aObject) is list
        bObject = [] if isarray else {}
        #skip if already encoded
        if type(aObject) is dict and '__jailed_type__' in aObject and '__value__' in aObject:
            return aObject
        keys = range(len(aObject)) if isarray else aObject.keys()
        for k in keys:
            v = aObject[k]
            value = None
            if isfunction(v):
                cid = str(random.random())
                callbacks[cid] = v
                vObj = {'__jailed_type__': 'callback', '__value__' : 'f', 'num': cid}
          # // send objects supported by structure clone algorithm
          # // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
            #if(v !== Object(v) || v instanceof Boolean || v instanceof String || v instanceof Date || v instanceof RegExp || v instanceof Blob || v instanceof File || v instanceof FileList || v instanceof ArrayBuffer || v instanceof ArrayBufferView || v instanceof ImageData){
            elif 'np' in self._local and isinstance(v, (self._local['np'].ndarray, self._local['np'].generic)):
                if sys.version_info >= (3, 0):
                    v_bytes = v.tobytes().decode()
                else:
                    v_bytes = v.tobytes()
                vObj = {'__jailed_type__': 'ndarray', '__value__' : v_bytes, '__shape__': v.shape, '__is_bytes__': True, '__dtype__': str(v.dtype)}
            elif type(v) is dict or type(v) is list:
                vObj = self._encode(v, callbacks)
            elif not isinstance(v, six.string_types) and type(v) is bytes:
                v = v.decode() # covert python3 bytes to str
            elif isinstance(v, Exception):
                vObj = {'__jailed_type__': 'error', '__value__' : str(v)}
            else:
                vObj = {'__jailed_type__': 'argument', '__value__' : v}

            if isarray:
                bObject.append(vObj)
            else:
                bObject[k] = vObj

        return bObject

    def _genRemoteCallback(self, id, argNum, withPromise):
        def remoteCallback(*arguments):
            return self.emit({
                'type' : 'callback',
                'id'   : id,
                'num'  : argNum,
                'args' : self._wrap(arguments)
            })
        return remoteCallback

    def _decode(self, aObject, callbackId, withPromise):
        if aObject is None:
            return aObject
        if '__jailed_type__' in aObject and '__value__' in aObject:
            if aObject['__jailed_type__'] == 'callback':
                bObject = self._genRemoteCallback(callbackId, aObject['num'], withPromise)
            elif aObject['__jailed_type__'] == 'ndarray':
                # create build array/tensor if used in the plugin
                try:
                    np = self._local['np']
                    if sys.version_info < (3, 0) and isinstance(aObject['__value__'], unicode):
                        aObject['__value__'] = bytearray(aObject['__value__'], encoding="utf-8")
                    elif sys.version_info >= (3, 0) and isinstance(aObject['__value__'], str):
                        aObject['__value__'] = bytearray(aObject['__value__'], encoding="utf-8")
                    else:
                        raise Exception('type error')

                    if aObject['__is_bytes__']:
                        bObject = np.frombuffer(aObject['__value__'], dtype=aObject['__dtype__']).reshape(tuple(aObject['__shape__']))
                    else:
                        bObject = np.array(aObject['__value__'], aObject['__dtype__']).reshape(aObject['__shape__'])
                except Exception as e:
                    print('Error in converting: '+str(e), aObject)
                    sys.stdout.flush()
                    # try:
                    #     tf = self._local['tf']
                    #     bObject = tf.Tensor(aObject['__value__'], aObject['__shape__'], aObject['__dtype__'])
                    # except Exception as e:
                    # keep it as regular if transfered to the main app
                    bObject = aObject
                    raise e
            elif aObject['__jailed_type__'] == 'error':
                bObject = Exception(aObject['__value__'])
            elif aObject['__jailed_type__'] == 'argument':
                bObject = aObject['__value__']
            else:
                bObject = aObject['__value__']
            return bObject
        else:
            if type(aObject) is tuple:
                aObject = list(aObject)
            isarray = type(aObject) is list
            bObject =  [] if isarray else {}
            keys = range(len(aObject)) if isarray else aObject.keys()
            for k in keys:
                if isarray or k in aObject:
                    v = aObject[k]
                    if type(v) is dict or type(v) is list:
                        if isarray:
                            bObject.append(self._decode(v, callbackId, withPromise))
                        else:
                            bObject[k] = self._decode(v, callbackId, withPromise)
            return bObject

    def _wrap(self, args):
        callbacks = {}
        wrapped = self._encode(args, callbacks)
        result = {'args': wrapped}
        if len(callbacks.keys()) > 0:
            result['callbackId'] = self. _store.put(callbacks)
        return result

    def _unwrap(self, args, withPromise):
        called = False
        if "callbackId" not in args:
            args["callbackId"] = None
        # wraps each callback so that the only one could be called
        result = self._decode(args["args"], args["callbackId"], withPromise)
        return result

    def _ndarray(self, typedArray, shape, dtype):
        _dtype = type(typedArray)
        if dtype and dtype != _dtype:
            raise Exception("dtype doesn't match the type of the array: "+_dtype+' != '+dtype)
        shape = shape or (len(typedArray), )
        return {"__jailed_type__": 'ndarray', "__value__" : typedArray, "__shape__": shape, "__dtype__": _dtype}

    def _sendInterface(self, api):
        if inspect.isclass(type(api)):
            api = {a:getattr(api, a) for a in dir(api) if not a.startswith('_')}
        self._interface = api
        names = []
        for name in self._interface:
            if callable(self._interface[name]):
                names.append({"name":name, "data": None})
            else:
                data = self._interface[name]
                if data is not None and type(data) is dict:
                    data2 = {}
                    for k in data:
                        if callable(data[k]):
                            data2[k] = "**@@FUNCTION@@**:"+k
                        else:
                            data2[k] = data[k]
                    names.push({"name":name, "data": data2})
                else:
                  names.push({"name":name, "data": data})
        self.emit({'type':'setInterface', 'api': names})

    def _genRemoteMethod(self, name):
        def remoteMethod(*arguments):
            call_func = {
                'type': 'method',
                'name': name,
                'args': self._wrap(arguments),
            }
            self.emit(call_func)
        return remoteMethod

    def _setRemote(self, api):
        _remote = API()
        for i in range(len(api)):
            name = api[i]["name"]
            data = api[i]["data"]
            if data is not None:
                if type(data) == 'dict':
                    data2 = {}
                    for key in data:
                        if key in data:
                            if data[key] == "**@@FUNCTION@@**:"+key:
                                data2[key] = self._genRemoteMethod(name+'.'+key)
                            else:
                                data2[key] = data[key]
                    _remote[name] = data2
                else:
                    _remote[name] = data
            else:
                _remote[name] = self._genRemoteMethod(name)
        _remote["ndarray"] = self._ndarray
        _remote["export"] = self._sendInterface
        self._local["api"] = _remote
        return _remote

    def sio_plugin_message(self, data):
        # print('------------------------------------------------', data)
        # sys.stdout.flush()
        if data['type']== 'import':
            self.emit({'type':'importSuccess', 'url': data['url']})
        elif data['type']== 'disconnect':
            sys.exit(0)
        else:
            if data['type'] == 'execute':
                type = data['code']['type']
                content = data['code']['content']
                try:
                    exec(content, self._local)
                    self.emit({'type':'executeSuccess'})
                except Exception as e:
                    print(traceback.format_exc())
                    self.emit({'type':'executeFailure'})
            elif data['type'] == 'message':
                d = data['data']
                if d['type'] == 'getInterface':
                    pass
                elif d['type'] == 'setInterface':
                    self._setRemote(d['api'])
                    self.emit({'type':'interfaceSetAsRemote'})
                    if not self._init:
                        self.emit({'type':'getInterface'})
                        self._init = True

                elif d['type'] == 'interfaceSetAsRemote':
                    #self.emit({'type':'getInterface'})
                    pass
                elif d['type'] == 'method':
                    if d['name'] in self._interface:
                        method = self._interface[d['name']]
                        if 'promise' in d:
                            resolve, reject = self._unwrap(d['promise'], False)
                            try:
                                args = self._unwrap(d['args'], True)
                                result = method(*args)
                                resolve(result)
                            except Exception as e:
                                print(traceback.format_exc())
                                reject(e)
                        else:
                            try:
                                args = self._unwrap(d['args'], True)
                                method(*args)
                            except Exception as e:
                                print(traceback.format_exc())
                                print(e)
                    else:
                        raise Exception('method '+d['name'] +' is not found.')
                elif d['type'] == 'callback':
                    method = self._store.fetch(d['id'])[d['num']]

                    if 'promise' in d:
                        resolve, reject = self._unwrap(d['promise'], False)
                        try:
                            args = self._unwrap(d['args'], True)
                            result = method(*args)
                            resolve(result)
                        except Exception as e:
                            print(traceback.format_exc())
                            reject(e)
                    else:
                        try:
                            args = self._unwrap(d['args'], True)
                            method(*args)
                        except Exception as e:
                            print(traceback.format_exc(), method)
                            print(e)
                sys.stdout.flush()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', type=str, required=True, help='plugin id')
    parser.add_argument('--secret', type=str, required=True, help='plugin secret')
    opt = parser.parse_args()
    pc = PluginConnection(opt.id, opt.secret)
    pc.start()
    gevent.wait()
