
/**
 * Contains the JailedSite object used both by the application
 * site, and by each plugin
 */

(function(){
    var _dtype2typedarray = {
      int8: 'Int8Array',
      int16: 'Int16Array',
      int32: 'Int32Array',
      uint8: 'Uint8Array',
      uint16: 'Uint16Array',
      uint32: 'Uint32Array',
      float32: 'Float32Array',
      float64: 'Float64Array',
      array: 'Array'
    }
    var _typedarray2dtype = {
      Int8Array: 'int8',
      Int16Array: 'int16',
      Int32Array: 'int32',
      Uint8Array: 'uint8',
      Uint16Array: 'uint16',
      Uint32Array: 'uint32',
      Float32Array: 'float32',
      Float64Array: 'float64',
      Array: 'array'
    };
    var ARRAY_CHUNK = 1000000;
    var ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor;
    var _appendBuffer = function(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    };
    /**
     * JailedSite object represents a single site in the
     * communication protocol between the application and the plugin
     *
     * @param {Object} connection a special object allowing to send
     * and receive messages from the opposite site (basically it
     * should only provide send() and onMessage() methods)
     */
    JailedSite = function(connection, id, lang) {
        this.id = id;
        this.lang = lang;
        this._interface = {};
        this._plugin_interfaces = {};
        this._remote = null;
        this._onclose_callbacks = [];
        this._remoteUpdateHandler = function(){};
        this._getInterfaceHandler = function(){};
        this._interfaceSetAsRemoteHandler = function(){};
        this._disconnectHandler = function(){};
        this._store = new ReferenceStore;
        this._method_refs = new ReferenceStore;
        var me = this;
        this._connection = connection;
        this._connection.onMessage(
            function(data){ me._processMessage(data); }
        );
        this._onclose = (cb)=>{
          this._onclose_callbacks.push(cb)
        }
        this._connection.onDisconnect(
            function(m){
                me._disconnectHandler(m);
            }
        );
    }


    /**
     * Set a handler to be called when the remote site updates its
     * interface
     *
     * @param {Function} handler
     */
    JailedSite.prototype.onRemoteUpdate = function(handler) {
        this._remoteUpdateHandler = handler;
    }


    /**
     * Set a handler to be called when received a responce from the
     * remote site reporting that the previously provided interface
     * has been succesfully set as remote for that site
     *
     * @param {Function} handler
     */
    JailedSite.prototype.onInterfaceSetAsRemote = function(handler) {
        this._interfaceSetAsRemoteHandler = handler;
    }

    JailedSite.prototype.onRemoteReady = function(handler) {
        this._method_refs.onReady(handler);
    }

    JailedSite.prototype.onRemoteBusy = function(handler) {
        this._method_refs.onBusy(handler);
    }

    JailedSite.prototype.getRemoteCallStack = function() {
        return this._method_refs.getStack();
    }
    /**
     * Set a handler to be called when the remote site requests to
     * (re)send the interface. Used to detect an initialzation
     * completion without sending additional request, since in fact
     * 'getInterface' request is only sent by application at the last
     * step of the plugin initialization
     *
     * @param {Function} handler
     */
    JailedSite.prototype.onGetInterface = function(handler) {
        this._getInterfaceHandler = handler;
    }


    /**
     * @returns {Object} set of remote interface methods
     */
    JailedSite.prototype.getRemote = function() {
        return this._remote;
    }


    /**
     * Sets the interface of this site making it available to the
     * remote site by sending a message with a set of methods names
     *
     * @param {Object} _interface to set
     */
    JailedSite.prototype.setInterface = function(_interface) {
        _interface.onclose = this._onclose;
        this._interface = _interface;
        this._sendInterface();
    }


    /**
     * Sends the actual interface to the remote site upon it was
     * updated or by a special request of the remote site
     */
    JailedSite.prototype._sendInterface = function() {
        var names = [];
        for (var name in this._interface) {
            if (this._interface.hasOwnProperty(name)) {
              if(name.startsWith('_')) continue;
              if(typeof this._interface[name] == 'function'){
                names.push({name:name, data: null});
              }
              else{
                var data = this._interface[name];
                if(data !== null && typeof data === 'object'){
                  var data2 = {};
                  for(var k in data){
                    if (data.hasOwnProperty(k)) {
                      if(typeof data[k] == 'function'){
                        data2[k] = "**@@FUNCTION@@**:"+k
                      }
                      else{
                        data2[k] = data[k]
                      }
                    }
                  }
                  names.push({name:name, data: data2});
                }
                else if(Object(data) !== data){
                  names.push({name:name, data: data});
                }

              }
            }
        }
        // add prototypes
        var functions = Object.getOwnPropertyNames(Object.getPrototypeOf(this._interface));
        for(var i=0;i<functions.length;i++){
          var name = functions[i];
          if(name.startsWith('_')) continue;
          if(typeof this._interface[name] == 'function'){
            names.push({name:name, data: null});
          }
        }
        this._connection.send({type:'setInterface', api: names});
    }


    /**
     * Handles a message from the remote site
     */
    // var callback_reg = new RegExp("onupdate|run$")
    JailedSite.prototype._processMessage = function(data) {
         switch(data.type) {
         case 'method':
             var method;
             var interface = this._interface;
             if(data.pid){
               interface = this._plugin_interfaces[data.pid]
               if(!interface){
                 if(data.promise){
                   var [resolve, reject] = this._unwrap(data.promise, false);
                   reject(`plugin api function is not avaialbe in "${data.pid}", the plugin maybe terminated.`)
                 }
                 else{
                  console.error(`plugin api function is not avaialbe in ${data.pid}, the plugin maybe terminated.`)
                 }
                 return
               }
             }
             if(data.name.indexOf('.') !=-1){
               var names = data.name.split('.')
               method = interface[names[0]][names[1]];
             }
             else{
               method = interface[data.name];
             }
             var args = this._unwrap(data.args, true);
             args.push({id: this.id})
             if(data.promise){
               var [resolve, reject] = this._unwrap(data.promise, false);
               try {
                 var result = method.apply(interface, args);
                 if(result instanceof Promise || method.constructor.name === 'AsyncFunction'){
                   result.then(resolve).catch(reject);
                 }
                 else{
                   resolve(result);
                 }
               } catch (e) {
                 reject(e);
               }
             }
             else{
               try {
                 method.apply(interface, args);
               } catch (e) {
                 console.error(e, method, args);
               }
             }

             break;
         case 'callback':
             var method = this._store.fetch(data.id)[data.num];
             var args = this._unwrap(data.args, true);
             args.push({id: this.id})
             if(data.promise){
               var [resolve, reject] = this._unwrap(data.promise, false);
               try {
                 var result = method.apply(null, args);
                 if(result instanceof Promise || method.constructor && method.constructor.name === 'AsyncFunction'){
                   result.then(resolve).catch(reject);
                 }
                 else{
                   resolve(result);
                 }
               } catch (e) {
                 reject(e);
               }
             }
             else{
               try {
                 method.apply(null, args);
               } catch (e) {
                 console.error(e, method, args);
               }
             }
             break;
         case 'setInterface':
             this._setRemote(data.api);
             break;
         case 'getInterface':
             this._sendInterface();
             this._getInterfaceHandler();
             break;
         case 'interfaceSetAsRemote':
             this._interfaceSetAsRemoteHandler();
             break;
         case 'disconnect':
             for(let cb of this._onclose_callbacks){
               try {
                 if(cb) cb()
               } catch (e) {
                 console.error('error in onclose callback.', e)
               }
             }
             this._disconnectHandler();
             this._connection.disconnect();
             break;
         }
    }


    /**
     * Sends a requests to the remote site asking it to provide its
     * current interface
     */
    JailedSite.prototype.requestRemote = function() {
        this._connection.send({type:'getInterface'});
    }

    JailedSite.prototype._ndarray = function(typedArray, shape, dtype) {
      var _dtype = _typedarray2dtype[typedArray.constructor.name]
      if(dtype && dtype != _dtype){
        throw "dtype doesn't match the type of the array: "+_dtype+' != '+dtype
      }
      shape = shape || [typedArray.length]
      return {__jailed_type__: 'ndarray', __value__ : typedArray, __shape__: shape, __dtype__: _dtype}
    };

    /**
     * Sets the new remote interface provided by the other site
     *
     * @param {Array} names list of function names
     */
    JailedSite.prototype._setRemote = function(api) {
        this._remote = {ndarray: this._ndarray};
        var i, name;
        for (i = 0; i < api.length; i++) {
            name = api[i].name;
            data = api[i].data;
            if(data){
              if(typeof data === 'object'){
                var data2 = {}
                for(var key in data){
                  if (data.hasOwnProperty(key)) {
                    if(data[key] == "**@@FUNCTION@@**:"+key){
                      data2[key] = this._genRemoteMethod(name+'.'+key);
                    }
                    else{
                      data2[key] = data[key]
                    }
                  }
                }
                this._remote[name] = data2;
              }
              else{
                this._remote[name] = data
              }
            }
            else{
              this._remote[name] = this._genRemoteMethod(name);
            }
        }

        this._remoteUpdateHandler();
        this._reportRemoteSet();
    }


    /**
     * Generates the wrapped function corresponding to a single remote
     * method. When the generated function is called, it will send the
     * corresponding message to the remote site asking it to execute
     * the particular method of its interface
     *
     * @param {String} name of the remote method
     *
     * @returns {Function} wrapped remote method
     */
    JailedSite.prototype._genRemoteMethod = function(name, plugin_id) {
        var me = this;
        var remoteMethod = function() {
          return new Promise((resolve, reject) => {
            let id = null;
            try {
              id=me._method_refs.put( plugin_id? plugin_id + '/' + name: name)
              var wrapped_resolve = function () {
                if(id!==null) me._method_refs.fetch(id);
                return resolve.apply(this, arguments);
              };
              var wrapped_reject = function () {
                if(id!==null) me._method_refs.fetch(id);
                return reject.apply(this, arguments);
              };
              var args = me._wrap(Array.prototype.slice.call(arguments))
              var transferables = args.args.__transferables__
              if(transferables) delete args.args.__transferables__
              me._connection.send({
                  type: 'method',
                  name: name,
                  pid: plugin_id,
                  args: args,
                  promise: me._wrap([wrapped_resolve, wrapped_reject])
              }, transferables);
            } catch (e) {
              if(id) me._method_refs.fetch(id);
              console.error(e)
            }

          });
        };

        return remoteMethod;
    }


    /**
     * Sends a responce reporting that interface just provided by the
     * remote site was successfully set by this site as remote
     */
    JailedSite.prototype._reportRemoteSet = function() {
        this._connection.send({type:'interfaceSetAsRemote'});
    }

     /**
     * Prepares the provided set of remote method arguments for
     * sending to the remote site, replaces all the callbacks with
     * identifiers
     *
     * @param {Array} args to wrap
     *
     * @returns {Array} wrapped arguments
     */
     JailedSite.prototype._encode = function(aObject, callbacks) {
        var transferables = []
        if (!aObject) {
          return aObject;
        }
        var _transfer = aObject._transfer;
        var bObject, v, k;
        var isarray = Array.isArray(aObject)
        bObject = isarray ? [] : {};
        //skip if already encoded
        if(typeof aObject == 'object' && aObject.hasOwnProperty('__jailed_type__') && aObject.hasOwnProperty('__value__')){
          return aObject
        }

        //encode interfaces
        if(typeof aObject == 'object' && aObject.hasOwnProperty('__id__') && aObject.__jailed_type__ == 'plugin_api'){
          const encoded_interface = {}
          for (k in aObject) {
            v = aObject[k];
            if(typeof v == 'function'){
              bObject[k] = {__jailed_type__: 'plugin_interface', __plugin_id__:aObject['__id__'], __value__ : k, num: null}
              encoded_interface[k] = v
            }
          }
          this._plugin_interfaces[aObject['__id__']] = encoded_interface
          if(aObject.onclose){
            aObject.onclose(()=>{
              delete this._plugin_interfaces[aObject['__id__']]
            })
          }
          return bObject
        }

        for (k in aObject) {
          if (isarray || aObject.hasOwnProperty(k)) {
            v = aObject[k];
            if(typeof v == 'function'){
              let interfaceFuncName = null
              for (var name in this._interface) {
                if (this._interface.hasOwnProperty(name)) {
                  if(name.startsWith('_')) continue;
                  if(this._interface[name] === v){
                    interfaceFuncName = name
                    break
                  }
                }
              }
              // search for prototypes
              var functions = Object.getOwnPropertyNames(Object.getPrototypeOf(this._interface));
              for(var i=0;i<functions.length;i++){
                var name = functions[i];
                if(name.startsWith('_')) continue;
                if(this._interface[name] === v){
                  interfaceFuncName = name
                  break
                }
              }
              if(!interfaceFuncName){
                var id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
                callbacks[id] = v
                bObject[k] = {__jailed_type__: 'callback', __value__ : v.constructor && v.constructor.name || id, num: id}
              }
              else{
                bObject[k] = {__jailed_type__: 'interface', __value__ : interfaceFuncName, num: null}
              }

            }
            else if(typeof tf != 'undefined' && tf.Tensor && v instanceof tf.Tensor){
              const v_buffer = v.dataSync()
              let v_bytes = v_buffer
              if(v_buffer.length > ARRAY_CHUNK){
                v_bytes = []
                const rounds = Math.ceil(v_buffer.length/ARRAY_CHUNK)
                for(let i of _.range(rounds)){
                  v_bytes[i] = v_buffer.slice(i*ARRAY_CHUNK, (i+1)*ARRAY_CHUNK)
                  if(v._transfer || _transfer){
                    transferables.push(v_bytes[i])
                  }
                }
                delete v_buffer
                if(v._transfer){
                  delete v._transfer
                }
              }
              else{
                if(v._transfer || _transfer){
                  transferables.push(v_bytes.buffer)
                  delete v._transfer
                }
              }
              bObject[k] = {__jailed_type__: 'ndarray', __value__ : v_bytes, __shape__: v.shape, __dtype__: v.dtype}
            }
            else if(typeof nj != 'undefined' && nj.NdArray && v instanceof nj.NdArray){
              var dtype = _typedarray2dtype[v.selection.data.constructor.name]
              if(v._transfer || _transfer){
                transferables.push(v.selection.data.buffer)
                delete v._transfer
              }
              bObject[k] = {__jailed_type__: 'ndarray', __value__ : v.selection.data, __shape__: v.shape, __dtype__: dtype}
            }
            else if( v instanceof Error){
              bObject[k] = {__jailed_type__: 'error', __value__ : v.toString()}
            }
            else if(v instanceof File){
              bObject[k] =  {__jailed_type__: 'file', __value__ : v, __relative_path__: v.relativePath || v.webkitRelativePath}
            }
            // send objects supported by structure clone algorithm
            // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
            else if(v !== Object(v) || v instanceof Boolean || v instanceof String || v instanceof Date || v instanceof RegExp || v instanceof Blob || v instanceof FileList || v instanceof ImageData){
              bObject[k] =  {__jailed_type__: 'argument', __value__ : v}
            }
            else if(v instanceof ArrayBuffer){
              if(v._transfer || _transfer){
                transferables.push(v)
                delete v._transfer
              }
              bObject[k] =  {__jailed_type__: 'argument', __value__ : v}
            }
            else if(v instanceof ArrayBufferView){
              if(v._transfer || _transfer){
                transferables.push(v.buffer)
                delete v._transfer
              }
              bObject[k] =  {__jailed_type__: 'argument', __value__ : v}
            }
            //TODO: support also Map and Set
            else if(typeof v == "object" || typeof v == "array"){
              bObject[k] = this._encode(v, callbacks)
              // move transferables to the top level object
              if(bObject[k].__transferables__){
                for(var t=0; t<bObject[k].__transferables__.length; t++){
                  transferables.push(bObject[k].__transferables__[t])
                }
                delete bObject[k].__transferables__
              }
            }
            else{
              throw "Unsupported data type for transferring between the plugin and the main app: "+ k+','+v
            }
          }
        }
        if(transferables.length>0){
          bObject.__transferables__ = transferables;
        }
        return bObject;
     };

     JailedSite.prototype._decode = function(aObject, callbackId, withPromise) {
        if (!aObject) {
          return aObject;
        }
        var bObject, v, k;

        if(aObject.hasOwnProperty('__jailed_type__') && aObject.hasOwnProperty('__value__')){
          if(aObject.__jailed_type__ == 'callback'){
            bObject = this._genRemoteCallback(callbackId, aObject.num, withPromise)
          }
          else if(aObject.__jailed_type__ == 'interface'){
            bObject = this._remote[aObject.__value__] || this._genRemoteMethod(aObject.__value__)
          }
          else if(aObject.__jailed_type__ == 'plugin_interface'){
            bObject = this._genRemoteMethod(aObject.__value__, aObject.__plugin_id__)
          }
          else if(aObject.__jailed_type__ == 'ndarray'){
            //create build array/tensor if used in the plugin
            if(this.id == '__plugin__' && typeof nj != 'undefined' && nj.array){
              if(Array.isArray(aObject.__value__)){
                aObject.__value__ = aObject.__value__.reduce(_appendBuffer)
              }
              bObject = nj.array(aObject.__value__, aObject.__dtype__).reshape(aObject.__shape__)
            }
            else if(this.id == '__plugin__' && typeof tf != 'undefined' && tf.Tensor){
              if(Array.isArray(aObject.__value__)){
                aObject.__value__ = aObject.__value__.reduce(_appendBuffer)
              }
              bObject = tf.tensor(aObject.__value__, aObject.__shape__, aObject.__dtype__)
            }
            else{
              //keep it as regular if transfered to the main app
              bObject = aObject
            }
          }
          else if(aObject.__jailed_type__ == 'error'){
            bObject = new Error(aObject.__value__)
          }
          else if(aObject.__jailed_type__ == 'file'){
             bObject = aObject.__value__
             //patch relativePath
             bObject.relativePath = aObject.__relative_path__
          }
          else if(aObject.__jailed_type__ == 'argument'){
             bObject = aObject.__value__
          }
          return bObject
        }
        else{
           var isarray = Array.isArray(aObject)
           bObject = isarray ? [] : {};
           for (k in aObject) {
            if (isarray || aObject.hasOwnProperty(k)) {
                v = aObject[k];
                if(typeof v == "object" || typeof v == "array"){
                  bObject[k] = this._decode(v, callbackId, withPromise)
                }
             }
           }
           return bObject;
         }
     };

    JailedSite.prototype._wrap = function(args) {
        var callbacks = {};
        var wrapped = this._encode(args, callbacks)
        var result = {args: wrapped};
        if (Object.keys(callbacks).length > 0 && callbacks.constructor === Object) {
            result.callbackId = this._store.put(callbacks);
        }
        return result;
    }


    /**
     * Unwraps the set of arguments delivered from the remote site,
     * replaces all callback identifiers with a function which will
     * initiate sending that callback identifier back to other site
     *
     * @param {Object} args to unwrap
     *
     * @param {Boolean} withPromise is true means this the callback should contain a promise
     *
     * @returns {Array} unwrapped args
     */
    JailedSite.prototype._unwrap = function(args, withPromise) {
        var called = false;

        // wraps each callback so that the only one could be called
        // var once = function(cb) {
        //     return function() {
        //         if (!called) {
        //             called = true;
        //             return cb.apply(this, arguments);
        //         } else {
        //             var msg =
        //               'A callback from this set has already been executed';
        //             throw new Error(msg);
        //         }
        //     };
        // }
        var result = this._decode(args.args, args.callbackId, withPromise)
        return result;
    }


    /**
     * Generates the wrapped function corresponding to a single remote
     * callback. When the generated function is called, it will send
     * the corresponding message to the remote site asking it to
     * execute the particular callback previously saved during a call
     * by the remote site a method from the interface of this site
     *
     * @param {Number} id of the remote callback to execute
     * @param {Number} argNum argument index of the callback
     * @param {Boolean} withPromise is true means this the callback should contain a promise
     *
     * @returns {Function} wrapped remote callback
     */
    JailedSite.prototype._genRemoteCallback = function(id, argNum, withPromise) {
      var me = this;
      if(withPromise){
        var remoteCallback = function() {
          return new Promise((resolve, reject) => {
            var args = me._wrap(Array.prototype.slice.call(arguments));
            var transferables = args.args.__transferables__
            if(transferables) delete args.args.__transferables__
            me._connection.send({
                type : 'callback',
                id   : id,
                num  : argNum,
                args : args,
                // pid :  me.id,
                promise : me._wrap([resolve, reject])
            }, transferables);
          });
        };
        return remoteCallback;
      }
      else{
        var remoteCallback = function() {
            var args = me._wrap(Array.prototype.slice.call(arguments));
            var transferables = args.args.__transferables__
            if(transferables) delete args.args.__transferables__
            return me._connection.send({
                type : 'callback',
                id   : id,
                num  : argNum,
                args : args,
                // pid :  me.id
            }, transferables);
        };
        return remoteCallback;
      }
    }


    /**
     * Sends the notification message and breaks the connection
     */
    JailedSite.prototype.disconnect = function() {
        this._connection.send({type: 'disconnect'});
        setTimeout(this._connection.disconnect, 2000)
    }


    /**
     * Set a handler to be called when received a disconnect message
     * from the remote site
     *
     * @param {Function} handler
     */
    JailedSite.prototype.onDisconnect = function(handler) {
        this._disconnectHandler = handler;
    }




    /**
     * ReferenceStore is a special object which stores other objects
     * and provides the references (number) instead. This reference
     * may then be sent over a json-based communication channel (IPC
     * to another Node.js process or a message to the Worker). Other
     * site may then provide the reference in the responce message
     * implying the given object should be activated.
     *
     * Primary usage for the ReferenceStore is a storage for the
     * callbacks, which therefore makes it possible to initiate a
     * callback execution by the opposite site (which normally cannot
     * directly execute functions over the communication channel).
     *
     * Each stored object can only be fetched once and is not
     * available for the second time. Each stored object must be
     * fetched, since otherwise it will remain stored forever and
     * consume memory.
     *
     * Stored object indeces are simply the numbers, which are however
     * released along with the objects, and are later reused again (in
     * order to postpone the overflow, which should not likely happen,
     * but anyway).
     */
    var ReferenceStore = function() {
        this._store = {};    // stored object
        this._indices = [0]; // smallest available indices
        this._readyHandler = function(){};
        this._busyHandler = function(){};
        this._readyHandler();
    }

    /**
     * call handler when the store is empty
     *
     * @param {FUNCTION} id of a handler
     */
    ReferenceStore.prototype.onReady = function(readyHandler) {
        this._readyHandler = readyHandler || function(){};
    }

    /**
     * call handler when the store is not empty
     *
     * @param {FUNCTION} id of a handler
     */
    ReferenceStore.prototype.onBusy = function(busyHandler) {
        this._busyHandler = busyHandler || function(){};
    }

    /**
     * get the length of the store
     *
     */
    ReferenceStore.prototype.getStack = function() {
        return Object.keys(this._store).length
    }

    /**
     * @function _genId() generates the new reference id
     *
     * @returns {Number} smallest available id and reserves it
     */
    ReferenceStore.prototype._genId = function() {
        var id;
        if (this._indices.length == 1) {
            id = this._indices[0]++;
        } else {
            id = this._indices.shift();
        }

        return id;
    }

    /**
     * Releases the given reference id so that it will be available by
     * another object stored
     *
     * @param {Number} id to release
     */
    ReferenceStore.prototype._releaseId = function(id) {
        for (var i = 0; i < this._indices.length; i++) {
            if (id < this._indices[i]) {
                this._indices.splice(i, 0, id);
                break;
            }
        }

        // cleaning-up the sequence tail
        for (i = this._indices.length-1; i >= 0; i--) {
            if (this._indices[i]-1 == this._indices[i-1]) {
                this._indices.pop();
            } else {
                break;
            }
        }
    }

    /**
     * Stores the given object and returns the refernce id instead
     *
     * @param {Object} obj to store
     *
     * @returns {Number} reference id of the stored object
     */
    ReferenceStore.prototype.put = function(obj) {
        if(this._busyHandler&&Object.keys(this._store).length==0){
          this._busyHandler()
        }
        var id = this._genId();
        this._store[id] = obj;
        return id;
    }

    /**
     * Retrieves previously stored object and releases its reference
     *
     * @param {Number} id of an object to retrieve
     */
    ReferenceStore.prototype.fetch = function(id) {
        var obj = this._store[id];
        this._store[id] = null;
        delete this._store[id];
        this._releaseId(id);
        if(this._readyHandler&&Object.keys(this._store).length==0){
          this._readyHandler()
        }
        return obj;
    }

    /**
     * Retrieves previously stored object
     *
     * @param {Number} id of an object to retrieve
     */
    // ReferenceStore.prototype.retrieve = function(id) {
    //     var obj = this._store[id];
    //     return obj;
    // }

})();
