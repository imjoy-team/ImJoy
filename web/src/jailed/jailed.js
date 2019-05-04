/**
 * @fileoverview Jailed - safe yet flexible sandbox
 * @version 0.3.1
 *
 * @license MIT, see http://github.com/asvd/jailed
 * Copyright (c) 2014 asvd <heliosframework@gmail.com>
 *
 * Main library script, the only one to be loaded by a developer into
 * the application. Other scrips shipped along will be loaded by the
 * library either here (application site), or into the plugin site
 * (Worker/child process):
 *
 *  _JailedSite.js    loaded into both applicaiton and plugin sites
 *  _frame.html       sandboxed frame (web)
 *  _frame.js         sandboxed frame code (web)
 *  _pluginWebWorker.js  platform-dependent plugin routines (web / worker)
 *  _pluginWebIframe.js  platform-dependent plugin routines (web / iframe)
 *  _pluginNode.js    platform-dependent plugin routines (Node.js)
 *  _pluginCore.js    common plugin site protocol implementation
 */


import {
  randId,
  assert,
  compareVersions
} from '../utils.js'


var __jailed__path__;
var __is__node__ = ((typeof process !== 'undefined') &&
                    (!process.browser) &&
                    (process.release.name.search(/node|io.js/) !== -1));
if (__is__node__) {
    // Node.js
    __jailed__path__ = __dirname + '/';
} else {
    // web
    __jailed__path__ = `${location.protocol}//${location.hostname}${location.port?':'+location.port:''}/static/jailed/`
    // var scripts = document.getElementsByTagName("script");
    // __jailed__path__ = scripts[scripts.length-1].src
    //     .split('?')[0]
    //     .split('/')
    //     .slice(0, -1)
    //     .join('/')+'/static/jailed/';
}


/**
 * A special kind of event:
 *  - which can only be emitted once;
 *  - executes a set of subscribed handlers upon emission;
 *  - if a handler is subscribed after the event was emitted, it
 *    will be invoked immideately.
 *
 * Used for the events which only happen once (or do not happen at
 * all) during a single plugin lifecycle - connect, disconnect and
 * connection failure
 */
var Whenable = function() {
    this._emitted = false;
    this._handlers = [];
}


/**
 * Emits the Whenable event, calls all the handlers already
 * subscribed, switches the object to the 'emitted' state (when
 * all future subscibed listeners will be immideately issued
 * instead of being stored)
 */
Whenable.prototype.emit = function(e){
    if (!this._emitted) {
        this._emitted = true;
        this._e = e;
        var handler;
        while((handler = this._handlers.pop())) {
            setTimeout(handler.bind(null, e),0);
        }
    }
}


/**
 * Saves the provided function as a handler for the Whenable
 * event. This handler will then be called upon the event emission
 * (if it has not been emitted yet), or will be scheduled for
 * immediate issue (if the event has already been emmitted before)
 *
 * @param {Function} handler to subscribe for the event
 */
Whenable.prototype.whenEmitted = function(handler){
    handler = this._checkHandler(handler);
    if (this._emitted) {
        setTimeout(handler.bind(null, this._e),0);
    } else {
        this._handlers.push(handler);
    }
}


/**
 * Checks if the provided object is suitable for being subscribed
 * to the event (= is a function), throws an exception if not
 *
 * @param {Object} obj to check for being subscribable
 *
 * @throws {Exception} if object is not suitable for subscription
 *
 * @returns {Object} the provided object if yes
 */
Whenable.prototype._checkHandler = function(handler){
    var type = typeof handler;
    if (type != 'function') {
        var msg =
            'A function may only be subsribed to the event, '
            + type
            + ' was provided instead'
        throw new Error(msg);
    }

    return handler;
}



/**
 * Initializes the library site for Node.js environment (loads
 * _JailedSite.js)
 */
var initNode = function() {
    require('./_JailedSite.js');
}


/**
 * Initializes the library site for web environment (loads
 * _JailedSite.js)
 */
var platformInit;
var initWeb = function() {
    // loads additional script to the application environment
    var load = function(path, cb) {
        var script = document.createElement('script');
        script.src = path;

        var clear = function() {
            script.onload = null;
            script.onerror = null;
            script.onreadystatechange = null;
            script.parentNode.removeChild(script);
        }

        var success = function() {
            clear();
            cb();
        }

        script.onerror = clear;
        script.onload = success;
        script.onreadystatechange = function() {
            var state = script.readyState;
            if (state==='loaded' || state==='complete') {
                success();
            }
        }

        document.body.appendChild(script);
    }

    platformInit = new Whenable;
    // var origOnload = window.onload || function(){};
    var wload = function(){
        // origOnload();
        load(
            __jailed__path__+'_JailedSite.js',
            function(){ platformInit.emit(); }
        );
    }
    window.addEventListener("load", wload, false)
}


var BasicConnection;

/**
 * Creates the platform-dependent BasicConnection object in the
 * Node.js environment
 */
var basicConnectionNode = function() {
    var childProcess = require('child_process');

    /**
     * Platform-dependent implementation of the BasicConnection
     * object, initializes the plugin site and provides the basic
     * messaging-based connection with it
     *
     * For Node.js the plugin is created as a forked process
     */
    BasicConnection = function(id, type) {
        if(type == 'iframe'){
          throw('You can not use iframe in nodejs.')
        }
        this.id = id;
        // in Node.js always has a subprocess
        this.dedicatedThread = true;
        this._disconnected = false;
        this._messageHandler = function(){};
        this._disconnectHandler = function(){};

        this._process = childProcess.fork(
            __jailed__path__+'_pluginNode.js'
        );

        var me = this;
        this._process.on('message', function(m){
            me._messageHandler(m);
        });

        this._process.on('exit', function(m){
            me._disconnected = true;
            me._disconnectHandler(m);
        });
    }


    /**
     * Sets-up the handler to be called upon the BasicConnection
     * initialization is completed.
     *
     * For Node.js the connection is fully initialized within the
     * constructor, so simply calls the provided handler.
     *
     * @param {Function} handler to be called upon connection init
     */
    BasicConnection.prototype.whenInit = function(handler) {
        handler();
    }


    /**
     * Sends a message to the plugin site
     *
     * @param {Object} data to send
     */
    BasicConnection.prototype.send = function(data, transferables) {
        if (!this._disconnected) {
            this._process.send(data, transferables);
        }
    }


    /**
     * Adds a handler for a message received from the plugin site
     *
     * @param {Function} handler to call upon a message
     */
    BasicConnection.prototype.onMessage = function(handler) {
        this._messageHandler = function(data) {
            // broken stack would break the IPC in Node.js
            try {
                handler(data);
            } catch (e) {
                console.error(e.stack);
            }
        }
    }


    /**
     * Adds a handler for the event of plugin disconnection
     * (= plugin process exit)
     *
     * @param {Function} handler to call upon a disconnect
     */
    BasicConnection.prototype.onDisconnect = function(handler) {
        this._disconnectHandler = handler;
    }


    /**
     * Disconnects the plugin (= kills the forked process)
     */
    BasicConnection.prototype.disconnect = function() {
        this._process.kill('SIGKILL');
        this._disconnected = true;
    }

}


/**
 * Creates the platform-dependent BasicConnection object in the
 * web-browser environment
 */
var basicConnectionWeb = function() {
    var perm = ['allow-scripts', 'allow-forms'];

    if (__jailed__path__.substr(0,7).toLowerCase() == 'file://') {
        // local instance requires extra permission
        perm.push('allow-same-origin');
    }

    // frame element to be cloned
    var sample = document.createElement('iframe');
    sample.src = __jailed__path__ + '_frame.html';
    sample.sandbox = perm.join(' ');
    sample.frameBorder="0";
    sample.style.width = "100%";
    sample.style.height = "100%";
    sample.style.margin = "0";
    sample.style.padding = "0";
    sample.style.display = 'none';


    /**
     * Platform-dependent implementation of the BasicConnection
     * object, initializes the plugin site and provides the basic
     * messaging-based connection with it
     *
     * For the web-browser environment, the plugin is created as a
     * Worker in a sandbaxed frame
     */
    BasicConnection = function(id, type, config) {
        this._init = new Whenable;
        this._disconnected = false;
        this.id = id;
        var iframe_container = config.iframe_container

        var me = this;
        platformInit.whenEmitted(function() {
            if (!me._disconnected) {
                me._frame = sample.cloneNode(false);
                me._frame.src = me._frame.src+'?type='+type+'&name='+config.name;
                me._frame.id = 'iframe_'+id;
                if(type == 'iframe' || type == 'window' || type == 'web-python-window'){
                  if(typeof iframe_container == 'string'){
                    iframe_container = document.getElementById(iframe_container)
                  }
                  if(iframe_container){
                    me._frame.style.display = 'block';
                    iframe_container.appendChild(me._frame);
                  }
                  else{
                    document.body.appendChild(me._frame);
                  }
                }
                else{
                  document.body.appendChild(me._frame);
                }
                window.addEventListener('message', function (e) {
                    if (e.source === me._frame.contentWindow) {
                        if (e.data.type == 'initialized') {
                            me.dedicatedThread =
                                e.data.dedicatedThread;
                            me._init.emit();
                        } else {
                            me._messageHandler(e.data);
                        }
                    }
                });
            }
        });
    }


    /**
     * Sets-up the handler to be called upon the BasicConnection
     * initialization is completed.
     *
     * For the web-browser environment, the handler is issued when
     * the plugin worker successfully imported and executed the
     * _pluginWebWorker.js or _pluginWebIframe.js, and replied to
     * the application site with the initImprotSuccess message.
     *
     * @param {Function} handler to be called upon connection init
     */
    BasicConnection.prototype.whenInit = function(handler) {
        this._init.whenEmitted(handler);
    }


    /**
     * Sends a message to the plugin site
     *
     * @param {Object} data to send
     */
    BasicConnection.prototype.send = function(data, transferables) {
        this._frame.contentWindow&&this._frame.contentWindow.postMessage(
            {type: 'message', data: data}, '*', transferables
        );
    }


    /**
     * Adds a handler for a message received from the plugin site
     *
     * @param {Function} handler to call upon a message
     */
    BasicConnection.prototype.onMessage = function(handler) {
        this._messageHandler = handler;
    }


    /**
     * Adds a handler for the event of plugin disconnection
     * (not used in case of Worker)
     *
     * @param {Function} handler to call upon a disconnect
     */
    BasicConnection.prototype.onDisconnect = function(){};


    /**
     * Disconnects the plugin (= kills the frame)
     */
    BasicConnection.prototype.disconnect = function() {
        if (!this._disconnected) {
            this._disconnected = true;
            if (typeof this._frame != 'undefined') {
                this._frame.parentNode.removeChild(this._frame);
            }  // otherwise farme is not yet created
        }
    }

}

var SocketioConnection;
/**
 * Creates the platform-dependent SocketioConnection object in the
 * web-browser environment
 */
var SocketioConnectionWeb = function() {


    /**
     * Platform-dependent implementation of the BasicConnection
     * object, initializes the plugin site and provides the basic
     * messaging-based connection with it
     *
     * For the web-browser environment, the plugin is created as a
     * Worker in a sandbaxed frame
     */
    SocketioConnection = function(id, type, config) {
        this._init = new Whenable;
        this._disconnected = false;
        this.id = id;
        this.engine = config.engine
        if(!this.engine){
          throw('connection is not established.')
        }
        this._disconnectHandler = ()=>{}
        this._loggingHandler = ()=>{}
        platformInit.whenEmitted(() =>{
          if (!this._disconnected && this.engine && this.engine.socket) {
            const config_ = {api_version: config.api_version, flags: config.flags, tag: config.tag, workspace: config.workspace, env: config.env, requirements: config.requirements, cmd: config.cmd, name: config.name, type: config.type, inputs: config.inputs, outputs: config.outputs}
            // create a plugin here
            this.engine.socket.emit('init_plugin', {id: id, type: type, config: config_}, (result) => {
              // console.log('init_plugin: ', result)
              this.initializing = false;
              if(result.success){
                this._disconnected = false;
                this.secret = result.secret
                config.work_dir = result.work_dir
                config.resumed = result.resumed
                this.engine.socket.on('message_from_plugin_'+this.secret,  (data)=>{
                    // console.log('message_from_plugin_'+this.id, data)
                    if (data.type == 'initialized') {
                        this.dedicatedThread = data.dedicatedThread;
                        this._init.emit();
                    }
                    else if (data.type == 'logging'){
                      this._loggingHandler(data.details)
                    }
                    else if (data.type == 'disconnected'){
                      this._disconnectHandler(data.details)
                    }
                    else {
                        this._messageHandler(data);
                    }
                })
                if(result.initialized){
                  this.dedicatedThread = true;
                  this._init.emit();
                }
              }
              else{
                this._disconnected = true;
                console.error('failed to initialize plugin on the plugin engine')
                throw('failed to initialize plugin on the plugin engine')
              }
            })
          }
          else{
            throw('connection is not established.')
          }
      })
    }


    /**
     * Sets-up the handler to be called upon the SocketioConnection
     * initialization is completed.
     *
     * For the web-browser environment, the handler is issued when
     * the plugin worker successfully imported and executed the
     * _pluginWebWorker.js or _pluginWebIframe.js, and replied to
     * the application site with the initImprotSuccess message.
     *
     * @param {Function} handler to be called upon connection init
     */
    SocketioConnection.prototype.whenInit = function(handler) {
        this._init.whenEmitted(handler);
    }


    /**
     * Sends a message to the plugin site
     *
     * @param {Object} data to send
     */
    SocketioConnection.prototype.send = function(data) {
      if(this.engine && this.engine.socket){
        this.engine.socket.emit('message_to_plugin_'+this.secret,
            {type: 'message', data: data}
        );
        // console.log('message_to_plugin_'+this.id, {type: 'message', data: data})
      }
      else{
        console.error('socketio disconnected.')
      }

    }


    /**
     * Adds a handler for a message received from the plugin site
     *
     * @param {Function} handler to call upon a message
     */
    SocketioConnection.prototype.onMessage = function(handler) {
        this._messageHandler = handler;
    }


    /**
     * Adds a handler for the event of plugin disconnection
     * (not used in case of Worker)
     *
     * @param {Function} handler to call upon a disconnect
     */
    SocketioConnection.prototype.onDisconnect = function(handler){
      this._disconnectHandler = handler;
    };

    /**
     * Adds a handler for the event of plugin logging
     * (not used in case of Worker)
     *
     * @param {Function} handler to call upon event logging
     */
    SocketioConnection.prototype.onLogging = function(handler){
      this._loggingHandler = handler;
    };

    /**
     * Disconnects the plugin (= kills the frame)
     */
    SocketioConnection.prototype.disconnect = function() {
        if (!this._disconnected) {
            this._disconnected = true;
        }
        if(this.engine && this.engine.socket){
          this.engine.socket.emit('kill_plugin',
             {id: this.id}
          );
          // console.log('kill plugin '+this.id)
        }
        this._disconnectHandler()
    }

}


if (__is__node__) {
    initNode();
    basicConnectionNode();
    SocketioConnectionWeb();
} else {
    initWeb();
    basicConnectionWeb();
    SocketioConnectionWeb();
}



/**
 * Application-site Connection object constructon, reuses the
 * platform-dependent BasicConnection declared above in order to
 * communicate with the plugin environment, implements the
 * application-site protocol of the interraction: provides some
 * methods for loading scripts and executing the given code in the
 * plugin
 */
var Connection = function(id, type, config){
    if(type == 'native-python'){
      this._platformConnection = new SocketioConnection(id, type, config);
    }
    else{
      this._platformConnection = new BasicConnection(id, type, config);
    }

    this._importCallbacks = {};
    this._executeSCb = function(){};
    this._executeFCb = function(){};
    this._messageHandler = function(){};

    var me = this;
    this.whenInit = function(cb){
        me._platformConnection.whenInit(cb);
    };

    this._platformConnection.onMessage(function(m) {
        switch(m.type) {
        case 'message':
            me._messageHandler(m.data);
            break;
        case 'importSuccess':
            me._handleImportSuccess(m.url);
            break;
        case 'importFailure':
            me._handleImportFailure(m.url, m.error);
            break;
        case 'executeSuccess':
            me._executeSCb();
            break;
        case 'executeFailure':
            me._executeFCb(m.error);
            break;
        }
    });
}


/**
 * @returns {Boolean} true if a connection obtained a dedicated
 * thread (subprocess in Node.js or a subworker in browser) and
 * therefore will not hang up on the infinite loop in the
 * untrusted code
 */
Connection.prototype.hasDedicatedThread = function() {
    return this._platformConnection.dedicatedThread;
}


/**
 * Tells the plugin to load a script with the given path, and to
 * execute it. Callbacks executed upon the corresponding responce
 * message from the plugin site
 *
 * @param {String} path of a script to load
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.importScript = function(path, sCb, fCb) {
    var f = function(){};
    this._importCallbacks[path] = {sCb: sCb||f, fCb: fCb||f};
    this._platformConnection.send({type: 'import', url: path});
}


/**
 * Tells the plugin to load a script with the given path, and to
 * execute it in the JAILED environment. Callbacks executed upon
 * the corresponding responce message from the plugin site
 *
 * @param {String} path of a script to load
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.importJailedScript = function(path, sCb, fCb) {
    var f = function(){};
    this._importCallbacks[path] = {sCb: sCb||f, fCb: fCb||f};
    this._platformConnection.send({type: 'importJailed', url: path});
}


/**
 * Sends the code to the plugin site in order to have it executed
 * in the JAILED enviroment. Assuming the execution may only be
 * requested once by the Plugin object, which means a single set
 * of callbacks is enough (unlike importing additional scripts)
 *
 * @param {String} code code to execute
 * @param {Function} sCb to call upon success
 * @param {Function} fCb to call upon failure
 */
Connection.prototype.execute = function(code) {
  return new Promise((resolve, reject)=>{
    this._executeSCb = resolve
    this._executeFCb = reject
    this._platformConnection.send({type: 'execute', code: code});
  })
}


/**
 * Adds a handler for a message received from the plugin site
 *
 * @param {Function} handler to call upon a message
 */
Connection.prototype.onMessage = function(handler) {
    this._messageHandler = handler;
}


/**
 * Adds a handler for a disconnect message received from the
 * plugin site
 *
 * @param {Function} handler to call upon disconnect
 */
Connection.prototype.onDisconnect = function(handler) {
    this._platformConnection.onDisconnect(handler);
}


/**
 * Sends a message to the plugin
 *
 * @param {Object} data of the message to send
 */
Connection.prototype.send = function(data, transferables) {
    this._platformConnection.send({
        type: 'message',
        data: data
    }, transferables);
}


/**
 * Handles import succeeded message from the plugin
 *
 * @param {String} url of a script loaded by the plugin
 */
Connection.prototype._handleImportSuccess = function(url) {
    var sCb = this._importCallbacks[url].sCb;
    this._importCallbacks[url] = null;
    delete this._importCallbacks[url];
    sCb();
}


/**
 * Handles import failure message from the plugin
 *
 * @param {String} url of a script loaded by the plugin
 */
Connection.prototype._handleImportFailure = function(url, error) {
    var fCb = this._importCallbacks[url].fCb;
    this._importCallbacks[url] = null;
    delete this._importCallbacks[url];
    fCb(error);
}


/**
 * Disconnects the plugin when it is not needed anymore
 */
Connection.prototype.disconnect = function() {
    if(this._platformConnection){
      this._platformConnection.disconnect();
    }
}




/**
 * Plugin constructor, represents a plugin initialized by a script
 * with the given path
 *
 * @param {String} url of a plugin source
 * @param {Object} _interface to provide for the plugin
 */
var Plugin = function( config, _interface, _fs_api, is_proxy) {
    this.config = config
    this.id = config.id || randId();
    this._id = config._id;
    this.name = config.name;
    this.type = config.type;
    this.tag = config.tag;
    this.tags = config.tags;
    this.type = config.type || 'web-worker';
    this._path = config.url;
    this._disconnected = true
    this.initializing = false;
    this.running = false;
    this._log_history = []
    this._onclose_callbacks = []
    this._updateUI = _interface && _interface.utils && _interface.utils.$forceUpdate || function(){}
    if(is_proxy){
      this._disconnected = false;
    }
    else{
      this._disconnected = true;
      this._bindInterface(_interface);
      for(let k in _fs_api) this._initialInterface[k] = _fs_api[k];
      this._connect();
    }
    this._updateUI()
};


/**
 * DynamicPlugin constructor, represents a plugin initialized by a
 * string containing the code to be executed
 *
 * @param {String} code of the plugin
 * @param {Object} _interface to provide to the plugin
 */
var DynamicPlugin = function(config, _interface, _fs_api, is_proxy) {
    this.config = config
    if(!this.config.script){
      throw "you must specify the script for the plugin to run."
    }
    this.id = config.id || randId();
    this._id = config._id;
    this.name = config.name;
    this.type = config.type;
    this.tag = config.tag;
    this.tags = config.tags;
    this.type = config.type || 'web-worker';
    this.initializing = false;
    this.running = false;
    this._log_history = []
    this._onclose_callbacks = []
    this._is_proxy = is_proxy
    this._updateUI = _interface && _interface.utils && _interface.utils.$forceUpdate || function(){}
    if(is_proxy){
      this._disconnected = false;
    }
    else{
      this._disconnected = true;
      this._bindInterface(_interface);
      for(let k in _fs_api) this._initialInterface[k] = _fs_api[k];
      this._connect();
    }
    this._updateUI()
};
/**
 * Set the plugin engine
 */
DynamicPlugin.prototype.setEngine =
       Plugin.prototype.setEngine = function(engine) {
    this.config.engine = engine;
}
/**
 * Bind the first argument of all the interface functions to this plugin
 */
DynamicPlugin.prototype._bindInterface =
       Plugin.prototype._bindInterface = function(_interface) {
   _interface = _interface || {}
   this._initialInterface = {}
   // bind this plugin to api functions
   for(var k in _interface){
     if(typeof _interface[k] === 'function'){
       this._initialInterface[k] = _interface[k].bind(null, this)
     }
     else if(typeof _interface[k] === 'object'){
       var utils = {}
       for(var u in _interface[k]){
         if(typeof _interface[k][u] === 'function'){
           utils[u] = _interface[k][u].bind(null, this)
         }
       }
       this._initialInterface[k] = utils
     }
     else{
       this._initialInterface[k] = _interface[k]
     }
   }

}
/**
 * Creates the connection to the plugin site
 */
DynamicPlugin.prototype._connect =
       Plugin.prototype._connect = function() {
    this.remote = null;
    this.api = null;

    this._connect    = new Whenable;
    this._fail       = new Whenable;
    this._disconnect = new Whenable;

    var me = this;

    // binded failure callback
    this._fCb = function(error){
        me._fail.emit(error);
        me.disconnect();
        me.initializing = false;
        if(error) me.error(error.toString())
        me._updateUI()
    }
    if(this.type == 'native-python' && (!this.config.engine || !this.config.engine.socket)){
      me._fail.emit('Please connect to the Plugin Engine 🚀.');
      me._connection = null
    }
    else{
      me._connection = new Connection(me.id, me.type, me.config);
      me.initializing = true;
      me._updateUI()
      me._connection.whenInit(function(){
          me._init();
      });
      if(this.type == 'native-python'){
        me._connection._platformConnection.onLogging(function(details){
          if(details.type === 'error'){
            me.error(details.value)
          }
          else if(details.type === 'progress'){
            me.progress(details.value)
          }
          else if(details.type === 'info'){
            me.log(details.value)
          }
          else{
            console.log(details.value)
          }
        })
      }
      me._connection.onDisconnect(function (details){
        if(details){
          if(details.success){
            me.log(details.message)
          }
          else{
            me.error(details.message)
          }
        }
        if(me._connection._platformConnection._frame){
          var iframe_container = document.getElementById(me._connection._platformConnection._frame.id)
          iframe_container.parentNode.removeChild(iframe_container)
        }
        me._set_disconnected()
        // me.terminate()
      })
    }
}


/**
 * Creates the Site object for the plugin, and then loads the
 * common routines (_JailedSite.js)
 */
DynamicPlugin.prototype._init =
       Plugin.prototype._init = function() {
    var lang;
    if(this.type == 'native-python'){
      lang = 'python'
    }
    else if(this.type == 'web-python'){
      lang = 'web-python'
    }
    else if(this.type == 'web-python-window'){
      lang = 'web-python'
    }
    else{
      lang = 'javascript'
    }
    /*global JailedSite*/
    this._site = new JailedSite(this._connection, this.id, lang);


    var me = this;
    this._site.onDisconnect(function(details) {
        me._disconnect.emit();
        if(details){
          if(details.success){
            me.log(details.message)
          }
          else{
            me.error(details.message)
          }
        }
        me._set_disconnected()
    });

    this._site.onRemoteReady(function() {
      if(me.running){
        me.running = false;
        me._updateUI()
      }
    });

    this._site.onRemoteBusy(function() {
        if(!me._disconnected && !me.running){
          me.running = true;
          me._updateUI()
        }
    });

    this.getRemoteCallStack = this._site.getRemoteCallStack;

    if(this.type == 'native-python'){
      this._sendInterface();
    }
    else{
      var sCb = function() {
          me._loadCore();
      }
      this._connection.importScript(
          __jailed__path__+'_JailedSite.js', sCb, this._fCb
      );
    }
}


/**
 * Loads the core scirpt into the plugin
 */
DynamicPlugin.prototype._loadCore =
       Plugin.prototype._loadCore = function() {
    var me = this;
    var sCb = function() {
        me._sendInterface();
    }

    this._connection.importScript(
        __jailed__path__+'_pluginCore.js', sCb, this._fCb
    );
}


/**
 * Sends to the remote site a signature of the interface provided
 * upon the Plugin creation
 */
DynamicPlugin.prototype._sendInterface =
       Plugin.prototype._sendInterface = function() {
    var me = this;
    this._site.onInterfaceSetAsRemote(function() {
        if (!me._connected) {
            me._loadPlugin();
        }
    });

    this._site.setInterface(this._initialInterface);
}


/**
 * Loads the plugin body (loads the plugin url in case of the
 * Plugin)
 */
Plugin.prototype._loadPlugin = function() {
  this._requestRemote();
  var me = this;
  var sCb = function() {
      me._requestRemote();
  }

  this._connection.importJailedScript(this._path, sCb, this._fCb);
}


/**
 * Loads the plugin body (executes the code in case of the
 * DynamicPlugin)
 */
DynamicPlugin.prototype._loadPlugin = async function() {
    try{
      if(this.config.type === 'native-python' && this.config.engine && this.config.engine.engine_info){
        if(this.config.engine.engine_info.api_version && compareVersions(this.config.engine.engine_info.api_version, ">", '0.1.0')){
          await this._connection.execute({type: 'requirements', lang: this.config.lang, requirements: this.config.requirements, env: this.config.env});
          for (let i = 0; i < this.config.scripts.length; i++) {
            await this._connection.execute({type: 'script', content: this.config.scripts[i].content, lang: this.config.scripts[i].attrs.lang, src: this.config.scripts[i].attrs.src});
          }
        }
        else{
          assert(this.config.scripts.length === 1, 'only 1 script block is supported')
          await this._connection.execute({type: 'script', main: true, content: this.config.scripts[0].content, lang: this.config.lang, requirements: this.config.requirements, env: this.config.env});
        }
      }
      else{
        await this._connection.execute({type: 'requirements', lang: this.config.lang, requirements: this.config.requirements, env: this.config.env});
        if(this.config.type === 'iframe' || this.config.type === 'window' || this.config.type === 'web-python-window'){
          for (let i = 0; i < this.config.styles.length; i++) {
            await this._connection.execute({type: 'style', content: this.config.styles[i].content, src: this.config.styles[i].attrs.src});
          }
          for (let i = 0; i < this.config.links.length; i++) {
            await this._connection.execute({type: 'link', rel: this.config.links[i].attrs.rel, type_: this.config.links[i].attrs.type, href: this.config.links[i].attrs.href });
          }
          for (let i = 0; i < this.config.windows.length; i++) {
            await this._connection.execute({type: 'html', content: this.config.windows[i].content});
          }
        }
        for (let i = 0; i < this.config.scripts.length; i++) {
          await this._connection.execute({type: 'script', content: this.config.scripts[i].content, lang: this.config.scripts[i].attrs.lang, src: this.config.scripts[i].attrs.src});
        }
      }
      this._requestRemote();
    }
    catch(e){
      this._fCb((e && e.toString())|| 'Error') 
    }
}


/**
 * Requests the remote interface from the plugin (which was
 * probably set by the plugin during its initialization), emits
 * the connect event when done, then the plugin is fully usable
 * (meaning both the plugin and the application can use the
 * interfaces provided to each other)
 */
DynamicPlugin.prototype._requestRemote =
       Plugin.prototype._requestRemote = function() {
    var me = this;
    this._site.onRemoteUpdate(function(){
        me.remote = me._site.getRemote();
        me.api = me.remote;
        me.api.__jailed_type__ = 'plugin_api';
        me.api.__id__ = me.id;
        me._disconnected = false
        me.initializing = false
        me._updateUI()
        me._connect.emit();
    });

    this._site.requestRemote();
}


/**
 * @returns {Boolean} true if a plugin runs on a dedicated thread
 * (subprocess in Node.js or a subworker in browser) and therefore
 * will not hang up on the infinite loop in the untrusted code
 */
DynamicPlugin.prototype.hasDedicatedThread =
       Plugin.prototype.hasDedicatedThread = function() {
    return this._connection.hasDedicatedThread();
}


/**
 * Disconnects the plugin immideately
 */
DynamicPlugin.prototype.disconnect =
       Plugin.prototype.disconnect = function() {
    this._connection.disconnect();
    this._disconnect.emit();
}


/**
 * Saves the provided function as a handler for the connection
 * failure Whenable event
 *
 * @param {Function} handler to be issued upon disconnect
 */
DynamicPlugin.prototype.whenFailed =
       Plugin.prototype.whenFailed = function(handler) {
    this._fail.whenEmitted(handler);
}


/**
 * Saves the provided function as a handler for the connection
 * success Whenable event
 *
 * @param {Function} handler to be issued upon connection
 */
DynamicPlugin.prototype.whenConnected =
       Plugin.prototype.whenConnected = function(handler) {
    this._connect.whenEmitted(handler);

}


/**
 * Saves the provided function as a handler for the connection
 * failure Whenable event
 *
 * @param {Function} handler to be issued upon connection failure
 */
DynamicPlugin.prototype.whenDisconnected =
       Plugin.prototype.whenDisconnected = function(handler) {
    this._disconnect.whenEmitted(handler);
}

DynamicPlugin.prototype._set_disconnected =
       Plugin.prototype._set_disconnected = function() {
    this._disconnected = true
    this.running = false
    this.initializing = false
    this._updateUI()
}

DynamicPlugin.prototype.terminate =
       Plugin.prototype.terminate = async function() {
    if(this._disconnected){
      this._set_disconnected()
      return
    }

    try {
      await Promise.all(this._onclose_callbacks.map(item => item()))
    } catch (e) {
      console.error(e)
    }

    try {
      if(this.api && this.api.exit && typeof this.api.exit == 'function'){
        await this.api.exit()
      }
    } catch (e) {
      console.error('error occured when terminating the plugin',e)
    }
    finally{
      this._set_disconnected()
      if(this._site) {this._site.disconnect(); this._site = null }
      if(this._connection) {this._connection.disconnect(); this._connection = null }
    }

}

DynamicPlugin.prototype.onClose =
       Plugin.prototype.onClose = function(cb) {
    this._onclose_callbacks.push(cb)
}


DynamicPlugin.prototype.log =
       Plugin.prototype.log = function(msg) {
    if(typeof msg === 'object'){
      this._log_history.push(msg)
      console.log(`Plugin ${this.id}:`, msg)
    }
    else{
      this._log_history._info = msg
      this._log_history.push({type: 'info', value: msg})
      console.log(`Plugin ${this.id}: ${msg}`)
    }
}

DynamicPlugin.prototype.error =
       Plugin.prototype.error = function(msg) {
    this._log_history._error = msg
    this._log_history.push({type: 'error', value: msg})
    console.error(`Error in Plugin ${this.id}: ${msg}`)
}

DynamicPlugin.prototype.progress =
       Plugin.prototype.progress = function(p) {
   if (p < 1) this._progress = p * 100
   else this._progress = p
}

export { DynamicPlugin, Plugin }
