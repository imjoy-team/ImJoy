
/**
 * Contains the routines loaded by the plugin iframe under web-browser
 * in case when worker failed to initialize
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */


window.application = {};
window.connection = {};
window.api = null;

// Create a new, plain <span> element
function _htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

var _importScript = function(url) {
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to
    //insert the <script> element
    return new Promise((resolve, reject) => {
        var scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.onload = resolve;
        scriptTag.onreadystatechange = resolve;
        scriptTag.onerror = reject;
        document.head.appendChild(scriptTag);
    })
};

// support importScripts outside webworker

async function importScripts () {
  var args = Array.prototype.slice.call(arguments), len = args.length, i = 0;
  for (; i < len; i++) {
    await _importScript(args[i])
  }
};



// event listener for the plugin message
window.addEventListener('message', function(e) {
    var m = e.data.data;
    switch (m.type) {
    case 'import':
    case 'importJailed':  // already jailed in the iframe
        importScript(m.url);
        break;
    case 'execute':
        execute(m.code);
        break;
    case 'message':
        conn._messageHandler(m.data);
        break;
    }
});


// loads and executes the javascript file with the given url
var importScript = function(url) {
    var success = function() {
        parent.postMessage({
            type : 'importSuccess',
            url  : url
        }, '*');
    }

    var failure = function() {
       parent.postMessage({
           type : 'importFailure',
           url  : url
       }, '*');
    }

    var error = null;
    try {
        window.loadScript(url, success, failure);
    } catch (e) {
        error = e;
    }

    if (error) {
        throw error;
        failure();
    }
}


// evaluates the provided string
var execute = function(code) {
    if(code.type == 'script'){
      try {
          eval(code.content);
      } catch (e) {
          console.error(e.message, e.stack)
          parent.postMessage({type : 'executeFailure', error: e.toString()}, '*');
          throw e;
      }
    }
    else if (code.type == 'style'){
        var style_node = document.createElement('style');
        style_node.innerHTML = code.content;
        document.head.appendChild(style_node)
    }
    else if (code.type == 'html'){
         document.body.appendChild(_htmlToElement(code.content));
    }
    else{
      throw "unsupported code type."
    }
    parent.postMessage({type : 'executeSuccess'}, '*');
}


// connection object for the JailedSite constructor
var conn = {
    disconnect : function() {},
    send: function(data, transferables) {
        parent.postMessage({type: 'message', data: data}, '*', transferables);
    },
    onMessage: function(h){ conn._messageHandler = h },
    _messageHandler: function(){},
    onDisconnect: function(){}
};

window.connection = conn;

parent.postMessage({
    type : 'initialized',
    dedicatedThread : false
}, '*');
