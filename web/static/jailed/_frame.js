
/**
 * Contains the code executed in the sandboxed frame under web-browser
 *
 * Tries to create a Web-Worker inside the frame and set up the
 * communication between the worker and the parent window. Some
 * browsers restrict creating a worker inside a sandboxed iframe - if
 * this happens, the plugin initialized right inside the frame (in the
 * same thread)
 */


var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length-1];
var parentNode = thisScript.parentNode;
var __jailed__path__ = thisScript.src
    .split('?')[0]
    .split('/')
    .slice(0, -1)
    .join('/')+'/';
var __pyodide__path__ = thisScript.src
    .split('?')[0]
    .split('/')
    .slice(0, -2)
    .join('/')+'/pyodide/';

var getParamValue = function(paramName) {
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName)
            return pArr[1]; //return value
    }
}

/**
 * Initializes the plugin inside a webworker. May throw an exception
 * in case this was not permitted by the browser.
 */
var initWebworkerPlugin = function() {
    // creating worker as a blob enables import of local files
    var blobCode = [
      ' self.addEventListener("message", function(m){   ',
      '     if (m.data.type == "initImport") {          ',
      '         importScripts(m.data.url);              ',
      '         self.postMessage({                      ',
      '             type : "initialized",               ',
      '             dedicatedThread : true              ',
      '         });                                     ',

      '     }                                           ',
      ' });                                             ',

    ].join('\n');

    var blobUrl = window.URL.createObjectURL(
        new Blob([blobCode])
    );

    var name = getParamValue('name');
    var worker = new Worker(blobUrl, {'name' : name || 'plugin_webworker'});

    // telling worker to load _pluginWebWorker.js (see blob code above)
    worker.postMessage({
        type: 'initImport',
        url: __jailed__path__ + '_pluginWebWorker.js'
    });


    // mixed content warning in Chrome silently skips worker
    // initialization without exception, handling this with timeout
    var fallbackTimeout = setTimeout(function() {
        worker.terminate();
        initIframePlugin();
    }, 2000);

    // forwarding messages between the worker and parent window
    worker.addEventListener('message', function(m) {

        var transferables = undefined;
        if (m.data.type == 'initialized') {
            clearTimeout(fallbackTimeout);
        }
        else if(m.data.type == 'disconnect'){
          worker.terminate();
        }
        else if(m.data.type == 'message'){
          if(m.data.data.__transferables__){
            transferables = m.data.data.__transferables__;
            delete m.data.data.__transferables__;
          }
        }
        parent.postMessage(m.data, '*', transferables);
    });

    window.addEventListener('message', function(m) {
       var transferables = undefined;
       if(m.data.type == 'message'){
        if(m.data.data.__transferables__){
          transferables = m.data.data.__transferables__;
          delete m.data.data.__transferables__;
        }
      }
      worker.postMessage(m.data, transferables);
    });
}


/**
 * Initializes the pyodide plugin inside a webworker. May throw an exception
 * in case this was not permitted by the browser.
 */
var initWebPythonWorkerPlugin = function() {
    // creating worker as a blob enables import of local files
    var blobCode = [
      ' var window = {};                                ',
      ' self.addEventListener("message", function(m){   ',
      '     if (m.data.type == "initImport") {          ',
      '         importScripts(m.data.url);              ',
      '         self.postMessage({                      ',
      '             type : "initialized",               ',
      '             dedicatedThread : true              ',
      '         });                                     ',

      '     }                                           ',
      '     else if (m.data.type == "importScript") {          ',
      '         importScripts(m.data.url);              ',
      '     }                                           ',
      ' });                                             ',

    ].join('\n');

    var blobUrl = window.URL.createObjectURL(
        new Blob([blobCode])
    );

    var name = getParamValue('name');
    var worker = new Worker(blobUrl, {'name' : name || 'plugin_pyodide'});

    worker.postMessage({
        type: 'importScript',
        url: __pyodide__path__ + 'pyodide.js'
    });

    // telling worker to load _pluginWebWorker.js (see blob code above)
    worker.postMessage({
        type: 'initImport',
        url: __jailed__path__ + '_pluginWebPython.js'
    });


    // mixed content warning in Chrome silently skips worker
    // initialization without exception, handling this with timeout
    var fallbackTimeout = setTimeout(function() {
        worker.terminate();
        initWebPythonIframePlugin();
    }, 2000);

    // forwarding messages between the worker and parent window
    worker.addEventListener('message', function(m) {

        var transferables = undefined;
        if (m.data.type == 'initialized') {
            clearTimeout(fallbackTimeout);
        }
        else if(m.data.type == 'disconnect'){
          worker.terminate();
        }
        else if(m.data.type == 'message'){
          if(m.data.data.__transferables__){
            transferables = m.data.data.__transferables__;
            delete m.data.data.__transferables__;
          }
        }
        parent.postMessage(m.data, '*', transferables);
    });

    window.addEventListener('message', function(m) {
       var transferables = undefined;
       if(m.data.type == 'message'){
        if(m.data.data.__transferables__){
          transferables = m.data.data.__transferables__;
          delete m.data.data.__transferables__;
        }
      }
      worker.postMessage(m.data, transferables);
    });
}


/**
 * Creates plugin right in this iframe
 */
var initWebPythonIframePlugin = function() {
    // loads additional script into the frame
    window.loadScript = function(path, sCb, fCb) {
        var script = document.createElement('script');
        script.src = path;

        var clear = function() {
            script.onload = null;
            script.onerror = null;
            script.onreadystatechange = null;
            script.parentNode.removeChild(script);
            currentErrorHandler = function(){};
        }

        var success = function() {
            clear();
            sCb();
        }

        var failure = function() {
            clear();
            fCb();
        }

        currentErrorHandler = failure;

        script.onerror = failure;
        script.onload = success;
        script.onreadystatechange = function() {
            var state = script.readyState;
            if (state==='loaded' || state==='complete') {
                success();
            }
        }

        parentNode.appendChild(script);
    }


    // handles script loading error
    // (assuming scripts are loaded one by one in the iframe)
    var currentErrorHandler = function(){};
    window.addEventListener('error', function(message) {
        currentErrorHandler();
    });

    window.loadScript(
        __pyodide__path__ + 'pyodide.js',
        function(){
          languagePluginLoader.then(() => {
            // pyodide is now ready to use...
            console.log(pyodide.runPython('import sys\nsys.version'));
            window.loadScript(
                __jailed__path__ + '_pluginWebPython.js',
                function(){
                  console.log("initialized.....")
                }, function(){}
            );
          });
        }, function(){
        }
    );



}

/**
 * Creates plugin right in this iframe
 */
var initIframePlugin = function() {
    // loads additional script into the frame
    window.loadScript = function(path, sCb, fCb) {
        var script = document.createElement('script');
        script.src = path;

        var clear = function() {
            script.onload = null;
            script.onerror = null;
            script.onreadystatechange = null;
            script.parentNode.removeChild(script);
            currentErrorHandler = function(){};
        }

        var success = function() {
            clear();
            sCb();
        }

        var failure = function() {
            clear();
            fCb();
        }

        currentErrorHandler = failure;

        script.onerror = failure;
        script.onload = success;
        script.onreadystatechange = function() {
            var state = script.readyState;
            if (state==='loaded' || state==='complete') {
                success();
            }
        }

        parentNode.appendChild(script);
    }


    // handles script loading error
    // (assuming scripts are loaded one by one in the iframe)
    var currentErrorHandler = function(){};
    window.addEventListener('error', function(message) {
        currentErrorHandler();
    });


    window.loadScript(
        __jailed__path__ + '_pluginWebIframe.js',
        function(){}, function(){}
    );
}

var plugin_mode = getParamValue('mode');
if(plugin_mode =='webworker'){
  try {
      initWebworkerPlugin();
  } catch(e) {
      // fallback to iframe
      initIframePlugin();
  }
}
else if(plugin_mode =='webpython'){
  initWebPythonIframePlugin();
}
else if(plugin_mode=='iframe' || plugin_mode=='window'){
  initIframePlugin();
}
else{
  console.error("Unsupported plugin type: "+ plugin_mode)
  throw "Unsupported plugin type: "+ plugin_mode
}
