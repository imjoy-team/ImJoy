/* eslint-disable */
/*****************

JOY.js: make happy little programs

VERSION 0 (the incredibly clunky first version) (sorry)

Created by Nicky Case http://ncase.me/

*****************/
import DOMPurify from "dompurify";

var _myEditLock = false;
// THE JOY MASTER
function Joy(options) {
  // You can call this as "new Joy()" or just "Joy()"
  var self = this == window ? {} : this;

  // Modules to import?
  if (options.modules) {
    for (var i = 0; i < options.modules.length; i++) {
      Joy.loadModule(options.modules[i]);
    }
  }

  // I'm a Joy.Op!
  Joy.Op.call(self, options);

  // Initialize References
  Joy.initReferences(self);

  // Allow previewing of... ops, numbers, variables?
  if (self.previewOps == undefined) self.previewOps = false;
  if (self.previewNumbers == undefined) self.previewNumbers = false;
  //if(self.previewVariables==undefined) self.previewVariables = false;
  self.activePreview = null;
  self.canPreview = function(type) {
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var allowed = self["preview" + type];
    return allowed && !self.activePreview;
  };

  // And: automatically create MY widget!
  self.createWidget();
  if (self.container) {
    // ...and auto-add my DOM to a container, if provided in options
    if (typeof self.container === "string")
      self.container = document.body.querySelector(self.container);
    self.container.appendChild(self.dom);
  }

  // Initialize UI & Modal
  Joy.ui.init(self);
  Joy.modal.init(self);

  // Return to sender
  return self;
}

Joy.normalizeUI = function(ui) {
  if (!ui) {
    return "";
  }
  let normui = "";
  if (Array.isArray(ui)) {
    for (let it of ui) {
      if (typeof it === "string") normui = normui + it + "<br>";
      else if (typeof it === "object") {
        for (let k in it) {
          if (typeof it[k] === "string")
            normui = normui + k + ": " + it[k] + "<br>";
          else normui = normui + k + ": " + JSON.stringify(it[k]) + "<br>";
        }
      } else normui = normui + JSON.stringify(it) + "<br>";
    }
  } else if (typeof ui === "object") {
    throw "ui can not be an object, you can only use a string or an array.";
  } else if (typeof ui === "string") {
    normui = ui.trim();
  } else {
    normui = "";
    console.log("Warning: removing ui string.");
  }
  return normui;
};

/*****************

ACTORS help the Player, Editor & Data talk to each other.

To create an Op, you need to pass it a "options" object like so:
(ALL the parameters are optional, btw)
{
	id: "steps", // by default, this is opID AND dataID
	dataID: "steps", // ONLY if opID=/=dataID. (e.g. two ops modify same data)
	type: "number", // what Op Template to inherit from, if any
	placeholder: 50 // if no data, what should be the placeholder?
}

*****************/

Joy.Op = function(options, parent, data) {
  var self = this;

  // Meta
  self._class_ = "Op";
  self.options = options;
  self.parent = parent;
  self.top = self.parent ? self.parent.top : self; // if no parent, I'M top dog.

  // Inherit from Op Template, if any. THEN inherit from "options"
  self.type = options.type;
  if (self.type) {
    var opTemplate = Joy.getTemplateByType(self.type);
    _configure(self, opTemplate);
  }
  _configure(self, self.options);

  if (
    parent &&
    typeof parent.onupdate == "object" &&
    parent.onupdate[self.id]
  ) {
    self.onupdate = parent.onupdate[self.id];
  }

  // Adding child ops
  self.children = [];
  self.addChild = function(child, data) {
    //get onupdate for the child
    if (typeof self.onupdate == "object" && self.onupdate[child.id]) {
      child.onupdate = self.onupdate[child.id];
    }
    // If child's not an Op, it's options to create a new Op.
    if (child._class_ != "Op") child = new Joy.Op(child, self, data);
    self.children.push(child);

    // If it has an ID, reference child with ID
    if (child.id) self[child.id] = child;

    // gimme
    return child;
  };
  self.removeChild = function(child) {
    _removeFromArray(self.children, child);
    child.kill();
  };

  // Kill!
  self.onkill = self.onkill || function() {};
  self.kill = function() {
    // Remove my DOM, if any.
    if (self.dom && self.dom.parentNode)
      self.dom.parentNode.removeChild(self.dom);

    // Kill all children, too
    while (self.children.length > 0) {
      self.removeChild(self.children[0]);
    }

    // On Kill?
    self.onkill(self);
  };

  /////////////////////////////////
  // ACTOR <-> DATA: //////////////
  /////////////////////////////////

  // Placeholder... convert to {value:w/e} object.
  if (self.placeholder === undefined) {
    // If nothing, blank object.
    self.placeholder = {};
  }
  if (typeof self.placeholder === "function") {
    // If placeholder's a function, run it!
    self.placeholder = self.placeholder();
  }
  if (typeof self.placeholder !== "object" || Array.isArray(self.placeholder)) {
    // If placeholder value's not an object (or is array)
    self.placeholder = {
      value: _clone(self.placeholder),
    };
  }
  // If data type not already specified, do that!
  if (!self.placeholder.type) {
    self.placeholder.type = self.type;
  }

  // If you didn't already pass in a data object, let's figure it out!
  self.data = self.data || data;

  if (!self.data) {
    var parent = self.parent;
    var dataID = self.dataID;
    if (parent && dataID) {
      // if nothing, put placeholder in parent
      if (!parent.data[dataID]) parent.data[dataID] = _clone(self.placeholder);
      self.data = parent.data[dataID]; // i'm parent's sub-data!
    } else {
      // ...otherwise, I'm standalone data.
      self.data = _clone(self.placeholder);
    }
  }
  // Get & Set!
  self.getData = function(dataID) {
    return self.data[dataID];
  };
  self.setData = function(dataID, newValue, noUpdate) {
    _myEditLock = true; // lock!
    if (newValue === undefined) {
      delete self.data[dataID]; // DELETE the thing!
    } else {
      self.data[dataID] = newValue;
    }
    setTimeout(function() {
      _myEditLock = false;
    }, 1); // some threading issue, i dunno
    if (!noUpdate) self.update();
  };

  /////////////////////////////////
  // ACTOR <-> EDITOR: "WIDGETS" //
  /////////////////////////////////

  self.dom = null; // to be created in "createWidget"!

  // Init & Create Widget (if none, just put a "todo")
  self.initWidget =
    self.initWidget ||
    function() {
      self.dom = document.createElement("span");
      self.dom.innerHTML = "[todo: define ui for '" + self.type + "']";
    };
  self.createWidget = function() {
    self.initWidget(self); // bind
    return self.dom;
  };

  // "Preview Data"
  self.previewData = null;

  /////////////////////////////////
  // ACTOR <-> PLAYER: "TARGETS" //
  /////////////////////////////////

  // Ops can ACT ON targets...
  self.onexecute =
    self.onexecute ||
    function() {
      console.log("no execute function found.");
    };
  self.execute = async function(target, altData) {
    // Real or Preview data?
    var data;
    if (altData) {
      data = _clone(altData);
    } else if (self.previewData) {
      data = _clone(self.previewData);
    } else {
      data = _clone(self.data);
    }

    // Try to pre-evaluate all data beforehand!
    self.children.forEach(function(childOp) {
      var dataID = childOp.dataID;
      if (dataID) {
        var value = childOp.get(target);
        data[dataID] = value;
      }
    });
    // On Execute!
    return await self.onexecute({
      op: self,
      target: target,
      data: data,
    });
  };

  // Update
  self.update = function() {
    // if(self.onchange && typeof self.onchange == 'function') self.onchange({});
    if (self.parent) self.parent.update();
    if (self.onupdate && typeof self.onupdate === "function") {
      // Real or Preview data?
      var data;
      if (self.previewData) {
        data = _clone(self.previewData);
      } else {
        data = _clone(self.data);
      }

      // Try to pre-evaluate all data beforehand!
      self.children.forEach(function(childOp) {
        var dataID = childOp.dataID;
        if (dataID) {
          var value = childOp.get({});
          data[dataID] = value;
        }
      });
      var ret = self.onupdate({ data: data }); // TODO: make consistent with .execute()
      // if(ret instanceof Promise){
      // 	ret.then((res)=>{
      // 		try {
      // 			if(res && res.init){
      // 				// TODO: update the widget
      // 				// self.children = [];
      // 				// replace the entire dom
      // 				// Joy.initializeWithString(self, res.init);
      // 				// self.createWidget();
      // 				// if(self.top && self.top.container){
      // 				// 	self.top.container.innerHTML=""
      // 				// 	self.top.container.appendChild(self.dom);
      // 				// }
      // 				var old_dom = self.dom
      // 				self.children = [];
      // 				Joy.initializeWithString(self, res.init);
      // 				self.createWidget();
      // 				if(self.parent && self.parent.dom){
      // 					self.parent.dom.replaceChild(self.dom, old_dom);
      // 				}
      // 			}
      // 		} catch (e) {
      // 			console.error(e)
      // 		}
      // 	}).catch(()=>{
      // 		console.error('failed to run onupdate function in ' + self.id)
      // 	}); //my
      // }
    }
  };

  self.get_config = function(target) {
    target = target || {};
    // Real or Preview data?
    var data;
    if (self.previewData) {
      data = _clone(self.previewData);
    } else {
      data = _clone(self.data);
    }
    // Try to pre-evaluate all data beforehand!
    self.children.forEach(function(childOp) {
      var dataID = childOp.dataID;
      if (dataID && target) {
        var value = childOp.get(target);
        data[dataID] = value;
      }
    });
    return data;
  };

  // ...or GET INFO from targets.
  self.onget =
    self.onget ||
    function(my) {
      return my.data;
    }; // dy default it returns data (my.config)
  self.get = function(target) {
    // Real or Preview data?
    var data = self.previewData ? self.previewData : self.data;
    data = _clone(data);

    // On Get!
    return self.onget({
      op: self,
      target: target,
      data: data,
    });
  };

  /////////////////////////////////
  // INITIALIZE ///////////////////
  /////////////////////////////////

  // Initialization: string or function?
  if (self.init) {
    if (typeof self.init === "string")
      Joy.initializeWithString(self, self.init);
    if (typeof self.init === "function") self.init(self);
  }
};

/*****************

ACTOR TEMPLATES that future Ops can be made from! Looks like this:

Joy.add({
	name: "Turn turtle", // what the Ops Widget calls it
	type: "turtle/turn", // what it's called in Op & Data
	tags: ["turtle", "op"], // meta tags
	init: "Turn {id:'angle', type:'number', placeholder:10} degrees", // for init'ing op & widget
	onexecute: function(my){
		my.target.turn(my.data.angle);
	}
});

*****************/

// Add Template
Joy.templates = [];
Joy.add = function(template) {
  var duplicated = Joy.templates.filter(function(t) {
    if (t.type === undefined || template.type === undefined) return false;
    else return t.type === template.type;
  });
  if (duplicated.length <= 0) {
    Joy.templates.push(template);
  } else {
    // console.log('replacing template ', template.name, template.type)
    for (var i = 0; i < duplicated.length; i++)
      _removeFromArray(Joy.templates, duplicated[i]);
    Joy.templates.push(template);
  }
};

Joy.remove = function(type) {
  var duplicated = Joy.templates.filter(function(t) {
    if (t.type === type) return true;
  });
  if (duplicated.length > 0) {
    // console.log('replacing template ', template.name, template.type)
    for (var i = 0; i < duplicated.length; i++)
      _removeFromArray(Joy.templates, duplicated[i]);
  }
};

Joy.reset = function() {
  Joy.templates = [];
};

// Get Template
Joy.getTemplateByType = function(type) {
  var template = Joy.templates.find(function(template) {
    return template.type === type;
  });
  if (!template) throw Error("No op template of type '" + type + "'!");
  return template;
};
Joy.getTemplatesByTag = function(tag) {
  return Joy.templates.filter(function(template) {
    return template.tags && template.tags.indexOf(tag) >= 0;
  });
};

// Modify Templates
Joy.modify = function() {
  // Arguments: (type, callback) or (type, rename, callback)
  var type, rename, callback;
  if (arguments.length == 2) {
    type = arguments[0];
    callback = arguments[1];
  } else {
    type = arguments[0];
    rename = arguments[1];
    callback = arguments[2];
  }

  // New Template inherits from old...
  var newTemplate = {};
  var _old = Joy.getTemplateByType(type);
  _configure(newTemplate, _old);

  // Then inherits from modifications
  var modifications = callback(_old);
  _configure(newTemplate, modifications);

  // Then, either RENAME or REMOVE old op template!
  if (rename) {
    _old.type = rename;
  } else {
    _removeFromArray(Joy.templates, _old);
  }

  // And add the new one!
  Joy.add(newTemplate);
};

// Converts a string into an ENTIRE ACTOR
Joy.initializeWithString = function(self, markup) {
  try {
    markup = DOMPurify.sanitize(markup);
  } catch (e) {
    console.log("Failed to sanitize the ui string", e);
  }
  var opOptions = [];
  var html = markup;

  // Split the markup into Op Options & Widget HTML
  var startIndex = -1;
  var endIndex = -1;
  var stack = 0;
  // Go through each character. When you find a top-level "{...}" JSON string,
  // 1) parse it into an Op Option
  // 2) replace it in the markup with a <span> saying where its widget should go
  for (var i = 0; i < html.length; i++) {
    var character = html[i];

    // ONLY the top-level {...}'s...
    if (stack == 0 && character == "{") startIndex = i;
    if (character == "{") stack++;
    if (character == "}") stack--;
    if (stack == 0 && character == "}") {
      endIndex = i + 1;

      // Cut out start to end, save as JSON & replace markup with <span>
      var json = html.slice(startIndex, endIndex);
      json = json.replace(/(\w+)\:/g, "'$1':"); // cleanup: give nameerties quotes
      json = json.replace(/\'/g, '"'); // cleanup: replace ' with "
      json = JSON.parse(json);
      json.dataID = json.dataID || json.id; // cleanup: dataID=id by default
      opOptions.push(json); // remember option!
      html =
        html.substr(0, startIndex) +
        "<span id='widget_" +
        json.id +
        "'></span>" +
        html.substr(endIndex); // replace markup

      // GO BACK TO THE BEGINNING & START OVER
      // because i'm too lazy to calculate where the index should go now
      i = 0;
      startIndex = -1;
      endIndex = -1;
      stack = 0;
    }
  }

  // Create all child Ops
  opOptions.forEach(function(opOption) {
    self.addChild(opOption);
  });

  // Create Widget: html, and replace
  self.createWidget = function() {
    self.dom = document.createElement("span");
    self.dom.innerHTML = html;

    // Replace all <spans> with childrens' widgets.
    self.children.forEach(function(child) {
      // Make child create a widget!
      child.createWidget();

      // Replace <span> with child's widget
      var selector = "#widget_" + child.id;
      var span = self.dom.querySelector(selector);
      self.dom.replaceChild(child.dom, span);
    });

    // Return to sender
    return self.dom;
  };
};

/*****************

JOY MODULES

So that a player can slowly step up the staircase of complexity
(also maybe import Ops in the future?)

*****************/

Joy.modules = {};
Joy.module = function(id, callback) {
  Joy.modules[id] = callback;
};
Joy.loadModule = function(id) {
  var module = Joy.modules[id];
  if (!module) throw Error("There's no module called '" + id + "'!");
  module();
};

/******************************

GETTING & SETTING REFERENCES FROM TOP.DATA

This is so you can sync variables, functions, strings, object names, etc.

Each reference should have: Unique ID, Tag, Data, Watchers
// (when Watchers[].length==0, delete that reference. Garbage day)

******************************/

Joy.initReferences = function(op) {
  // Create if not already
  var topdata = op.top.data;
  if (!topdata._references) topdata._references = {};

  // Zero out all connected, it's a brand new world.
  for (var id in topdata._references) {
    var ref = topdata._references[id];
    ref.connected = 0;
  }
};

Joy.createReference = function(op, tags, data) {
  // The reference
  var topdata = op.top.data;
  var reference = {
    id: _generateUID(topdata._references),
    tags: _forceToArray(tags),
    data: data,
    connected: 0, // tracks how many ops this thing actually depends on
  };
  topdata._references[reference.id] = reference;

  // Gimme
  return reference;
};

Joy.getReferenceById = function(op, refID) {
  var topdata = op.top.data;
  return topdata._references[refID];
};

Joy.getReferencesByTag = function(op, tag) {
  var topdata = op.top.data;
  var refs = [];
  for (var id in topdata._references) {
    var ref = topdata._references[id];
    if (ref.tags.indexOf(tag) >= 0) refs.push(ref);
  }
  return refs;
};

Joy.connectReference = function(op, refID) {
  var ref = Joy.getReferenceById(op, refID);
  ref.connected++;
};

Joy.disconnectReference = function(op, refID) {
  var ref = Joy.getReferenceById(op, refID);
  ref.connected--;
  if (ref.connected == 0) Joy.deleteReference(op, refID);
};

Joy.deleteReference = function(op, refID) {
  var topdata = op.top.data;
  var reference = topdata._references[refID];
  delete topdata._references[refID];
};

/*
Joy.watchReference = function(topdata, id){
	var reference = topdata._references[id];
	reference._creators++;
	return reference;
};

Joy.unwatchReference = function(topdata, id){

	// The reference?
	var reference = topdata._references[id];
	reference._creators--;

	// If no more _creators, DELETE.
	if(reference._creators==0) Joy.deleteReference(topdata, id);

	return reference;

};
*/

/******************************

SAVE & LOAD

No need for a server!
Just compresses JSON with LZ-String and puts it in the URL

******************************/
Joy.encodeWorkflow = function(data) {
  var json = JSON.stringify(data); // Stringify
  var compressed = LZString.compressToEncodedURIComponent(json); // Compress
  return compressed;
};

Joy.decodeWorkflow = function(hash) {
  var decompressed = LZString.decompressFromEncodedURIComponent(hash);
  if (decompressed) {
    var data = JSON.parse(decompressed);
    return data;
  } else {
    return null;
  }
};

Joy.saveToURL = function(data) {
  var json = JSON.stringify(data); // Stringify
  var compressed = LZString.compressToEncodedURIComponent(json); // Compress
  var url =
    window.location.origin +
    window.location.pathname +
    "#/app?workflow=" +
    compressed; // append to current URL
  // TODO: keep # and OTHER query stuff the same, just change ?data
  return url;
};

Joy.loadFromURL = function() {
  var hash = _getParameterByName("workflow");
  var decompressed = LZString.decompressFromEncodedURIComponent(hash);
  if (decompressed) {
    var data = JSON.parse(decompressed);
    return data;
  } else {
    return null;
  }
};
/**********************************

RANDOM CRAP TO MAKE MY LIFE EASIER

TODO: namespace these to avoid conflict

**********************************/

// For true believers
Math.TAU = 2 * Math.PI;

// Deep clone
var _clone = function(json) {
  return JSON.parse(JSON.stringify(json));
};

// "Configure": or just slap all properties of one object onto another
var _configure = function(target, config) {
  for (var key in config) {
    var value = config[key];
    target[key] = value;
  }
};

// Array stuff
var _removeFromArray = function(array, toDelete) {
  var index = array.indexOf(toDelete);
  if (index < 0) return false;
  array.splice(index, 1);
  return true;
};

// Instant space
var _nbsp = function() {
  var span = document.createElement("span");
  span.innerHTML = "&nbsp;";
  return span;
};

// When in Rome, use a completely unuseable numeric system
// from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
var _numberToRoman = function(num) {
  if (!+num) return NaN;
  var digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
  var result = Array(+digits.join("") + 1).join("M") + roman;
  return result.toLowerCase();
};

// Number to Alphabetic Base 26
// from https://stackoverflow.com/a/8604591
var _numberToAlphabet = function(a) {
  var alpha = "abcdefghijklmnopqrstuvwxyz";

  // First figure out how many digits there are.
  var c = 0;
  var x = 1;
  while (a >= x) {
    c++;
    a -= x;
    x *= 26;
  }

  // Now you can do normal base conversion.
  var s = "";
  for (var i = 0; i < c; i++) {
    s = alpha.charAt(a % 26) + s;
    a = Math.floor(a / 26);
  }
  return s;
};

// Helps prevent copy-pasting weird stuff into contenteditable
// see: http://jsfiddle.net/marinagon/1v63t05q/
var _insertTextAtCursor = function(text) {
  var sel, range, html;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
};
var _preventWeirdCopyPaste = function(element) {
  element.addEventListener("paste", function(e) {
    e.preventDefault();
    if (e.clipboardData && e.clipboardData.getData) {
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    } else if (window.clipboardData && window.clipboardData.getData) {
      var text = window.clipboardData.getData("Text");
      _insertTextAtCursor(text);
    }
  });
};
var _selectAll = function(input, collapseToEnd) {
  // select all text in contenteditable
  // see http://stackoverflow.com/a/6150060/145346
  var range = document.createRange();
  range.selectNodeContents(input);
  if (collapseToEnd) range.collapse(false); // total hack
  var selection = window.getSelection();
  selection.removeAllRanges();
  try {
    selection.addRange(range);
  } catch (e) {}
};
var _unselectAll = function() {
  var selection = window.getSelection();
  selection.removeAllRanges();
};
var _fixStringInput = function(input) {
  // Empty? Fix that!
  if (input.innerText == "") {
    input.innerHTML = "&nbsp;"; // Is it empty? Let's fix that.
    _selectAll(input);
  }

  // Line breaks? HECK NO!
  if (input.innerHTML.search("<br>") >= 0) {
    input.innerHTML = input.innerHTML.replace(/(\<br\>)+/g, "&nbsp;");
    _selectAll(input, true);
  }
};
var _blurOnEnter = function(input) {
  input.addEventListener("keypress", function(event) {
    if (event.which === 13) {
      event.preventDefault();
      input.blur();
    }
  });
};

// Find a unique ID within an object
var _generateUID = function(obj) {
  var num = 0;
  var id;
  do {
    //id = Math.floor(Math.random()*1000000)+""; // a MILLION random IDs, hopefully don't go over
    id = "id" + num; // linear time but who cares
    num++;
  } while (obj[id]);
  return id;
};

// Make this an array, if not already
var _forceToArray = function(thing) {
  if (Array.isArray(thing)) return thing;
  else return [thing];
};

// Generate a deterministically pseudo-random color from an ID
// TODO: not looking like crap. same luminance, etc.
//var _generateColor = function(obj){	};

// Remove all children from a DOM
var _emptyDOM = function(node) {
  while (node.hasChildNodes()) node.removeChild(node.lastChild);
};

// Get Query Param
// thx to https://stackoverflow.com/a/901144
var _getParameterByName = function(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

////////////////////////////
// Good Color Shtuff ///////
// thx to: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately/17243070#17243070
////////////////////////////

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
 */
function _HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  h /= 360; // convert, yo.
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function _HSVToRGBString(h, s, v) {
  if (arguments.length === 1) {
    (s = h[1]), (v = h[2]), (h = h[0]); // cast to different vars
  }
  var rgb = _HSVtoRGB(h, s, v);
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}
// well, "random"
var _randomHSVIndex = 0;
var _randomHSVArray = [
  [0, 0.6, 1.0],
  [30, 0.8, 1.0],
  //[120, 0.9, 0.9],
  [210, 0.8, 1.0],
  [260, 0.7, 1.0],
  [310, 0.6, 1.0],
];
function _randomHSV() {
  var hsv = _randomHSVArray[_randomHSVIndex];
  _randomHSVIndex = (_randomHSVIndex + 1) % _randomHSVArray.length;
  //return _HSVToRGBString(hsv[0], hsv[1], hsv[2]);
  return hsv;
}
function _forceToRGB(color) {
  if (Array.isArray(color)) {
    color = _HSVToRGBString(color[0], color[1], color[2]); // HSV
  }
  return color;
}

var LZString = (function() {
  function o(o, r) {
    if (!t[o]) {
      t[o] = {};
      for (var n = 0; n < o.length; n++) t[o][o.charAt(n)] = n;
    }
    return t[o][r];
  }
  var r = String.fromCharCode,
    n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",
    t = {},
    i = {
      compressToBase64: function(o) {
        if (null == o) return "";
        var r = i._compress(o, 6, function(o) {
          return n.charAt(o);
        });
        switch (r.length % 4) {
          default:
          case 0:
            return r;
          case 1:
            return r + "===";
          case 2:
            return r + "==";
          case 3:
            return r + "=";
        }
      },
      decompressFromBase64: function(r) {
        return null == r
          ? ""
          : "" == r
          ? null
          : i._decompress(r.length, 32, function(e) {
              return o(n, r.charAt(e));
            });
      },
      compressToUTF16: function(o) {
        return null == o
          ? ""
          : i._compress(o, 15, function(o) {
              return r(o + 32);
            }) + " ";
      },
      decompressFromUTF16: function(o) {
        return null == o
          ? ""
          : "" == o
          ? null
          : i._decompress(o.length, 16384, function(r) {
              return o.charCodeAt(r) - 32;
            });
      },
      compressToUint8Array: function(o) {
        for (
          var r = i.compress(o),
            n = new Uint8Array(2 * r.length),
            e = 0,
            t = r.length;
          t > e;
          e++
        ) {
          var s = r.charCodeAt(e);
          (n[2 * e] = s >>> 8), (n[2 * e + 1] = s % 256);
        }
        return n;
      },
      decompressFromUint8Array: function(o) {
        if (null === o || void 0 === o) return i.decompress(o);
        for (var n = new Array(o.length / 2), e = 0, t = n.length; t > e; e++)
          n[e] = 256 * o[2 * e] + o[2 * e + 1];
        var s = [];
        return (
          n.forEach(function(o) {
            s.push(r(o));
          }),
          i.decompress(s.join(""))
        );
      },
      compressToEncodedURIComponent: function(o) {
        return null == o
          ? ""
          : i._compress(o, 6, function(o) {
              return e.charAt(o);
            });
      },
      decompressFromEncodedURIComponent: function(r) {
        return null == r
          ? ""
          : "" == r
          ? null
          : ((r = r.replace(/ /g, "+")),
            i._decompress(r.length, 32, function(n) {
              return o(e, r.charAt(n));
            }));
      },
      compress: function(o) {
        return i._compress(o, 16, function(o) {
          return r(o);
        });
      },
      _compress: function(o, r, n) {
        if (null == o) return "";
        var e,
          t,
          i,
          s = {},
          p = {},
          u = "",
          c = "",
          a = "",
          l = 2,
          f = 3,
          h = 2,
          d = [],
          m = 0,
          v = 0;
        for (i = 0; i < o.length; i += 1)
          if (
            ((u = o.charAt(i)),
            Object.prototype.hasOwnProperty.call(s, u) ||
              ((s[u] = f++), (p[u] = !0)),
            (c = a + u),
            Object.prototype.hasOwnProperty.call(s, c))
          )
            a = c;
          else {
            if (Object.prototype.hasOwnProperty.call(p, a)) {
              if (a.charCodeAt(0) < 256) {
                for (e = 0; h > e; e++)
                  (m <<= 1),
                    v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++;
                for (t = a.charCodeAt(0), e = 0; 8 > e; e++)
                  (m = (m << 1) | (1 & t)),
                    v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                    (t >>= 1);
              } else {
                for (t = 1, e = 0; h > e; e++)
                  (m = (m << 1) | t),
                    v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                    (t = 0);
                for (t = a.charCodeAt(0), e = 0; 16 > e; e++)
                  (m = (m << 1) | (1 & t)),
                    v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                    (t >>= 1);
              }
              l--, 0 == l && ((l = Math.pow(2, h)), h++), delete p[a];
            } else
              for (t = s[a], e = 0; h > e; e++)
                (m = (m << 1) | (1 & t)),
                  v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                  (t >>= 1);
            l--,
              0 == l && ((l = Math.pow(2, h)), h++),
              (s[c] = f++),
              (a = String(u));
          }
        if ("" !== a) {
          if (Object.prototype.hasOwnProperty.call(p, a)) {
            if (a.charCodeAt(0) < 256) {
              for (e = 0; h > e; e++)
                (m <<= 1), v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++;
              for (t = a.charCodeAt(0), e = 0; 8 > e; e++)
                (m = (m << 1) | (1 & t)),
                  v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                  (t >>= 1);
            } else {
              for (t = 1, e = 0; h > e; e++)
                (m = (m << 1) | t),
                  v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                  (t = 0);
              for (t = a.charCodeAt(0), e = 0; 16 > e; e++)
                (m = (m << 1) | (1 & t)),
                  v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                  (t >>= 1);
            }
            l--, 0 == l && ((l = Math.pow(2, h)), h++), delete p[a];
          } else
            for (t = s[a], e = 0; h > e; e++)
              (m = (m << 1) | (1 & t)),
                v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
                (t >>= 1);
          l--, 0 == l && ((l = Math.pow(2, h)), h++);
        }
        for (t = 2, e = 0; h > e; e++)
          (m = (m << 1) | (1 & t)),
            v == r - 1 ? ((v = 0), d.push(n(m)), (m = 0)) : v++,
            (t >>= 1);
        for (;;) {
          if (((m <<= 1), v == r - 1)) {
            d.push(n(m));
            break;
          }
          v++;
        }
        return d.join("");
      },
      decompress: function(o) {
        return null == o
          ? ""
          : "" == o
          ? null
          : i._decompress(o.length, 32768, function(r) {
              return o.charCodeAt(r);
            });
      },
      _decompress: function(o, n, e) {
        var t,
          i,
          s,
          p,
          u,
          c,
          a,
          l,
          f = [],
          h = 4,
          d = 4,
          m = 3,
          v = "",
          w = [],
          A = { val: e(0), position: n, index: 1 };
        for (i = 0; 3 > i; i += 1) f[i] = i;
        for (p = 0, c = Math.pow(2, 2), a = 1; a != c; )
          (u = A.val & A.position),
            (A.position >>= 1),
            0 == A.position && ((A.position = n), (A.val = e(A.index++))),
            (p |= (u > 0 ? 1 : 0) * a),
            (a <<= 1);
        switch ((t = p)) {
          case 0:
            for (p = 0, c = Math.pow(2, 8), a = 1; a != c; )
              (u = A.val & A.position),
                (A.position >>= 1),
                0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                (p |= (u > 0 ? 1 : 0) * a),
                (a <<= 1);
            l = r(p);
            break;
          case 1:
            for (p = 0, c = Math.pow(2, 16), a = 1; a != c; )
              (u = A.val & A.position),
                (A.position >>= 1),
                0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                (p |= (u > 0 ? 1 : 0) * a),
                (a <<= 1);
            l = r(p);
            break;
          case 2:
            return "";
        }
        for (f[3] = l, s = l, w.push(l); ; ) {
          if (A.index > o) return "";
          for (p = 0, c = Math.pow(2, m), a = 1; a != c; )
            (u = A.val & A.position),
              (A.position >>= 1),
              0 == A.position && ((A.position = n), (A.val = e(A.index++))),
              (p |= (u > 0 ? 1 : 0) * a),
              (a <<= 1);
          switch ((l = p)) {
            case 0:
              for (p = 0, c = Math.pow(2, 8), a = 1; a != c; )
                (u = A.val & A.position),
                  (A.position >>= 1),
                  0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                  (p |= (u > 0 ? 1 : 0) * a),
                  (a <<= 1);
              (f[d++] = r(p)), (l = d - 1), h--;
              break;
            case 1:
              for (p = 0, c = Math.pow(2, 16), a = 1; a != c; )
                (u = A.val & A.position),
                  (A.position >>= 1),
                  0 == A.position && ((A.position = n), (A.val = e(A.index++))),
                  (p |= (u > 0 ? 1 : 0) * a),
                  (a <<= 1);
              (f[d++] = r(p)), (l = d - 1), h--;
              break;
            case 2:
              return w.join("");
          }
          if ((0 == h && ((h = Math.pow(2, m)), m++), f[l])) v = f[l];
          else {
            if (l !== d) return null;
            v = s + s.charAt(0);
          }
          w.push(v),
            (f[d++] = s + v.charAt(0)),
            h--,
            (s = v),
            0 == h && ((h = Math.pow(2, m)), m++);
        }
      },
    };
  return i;
})();
"function" == typeof define && define.amd
  ? define(function() {
      return LZString;
    })
  : "undefined" != typeof module && null != module;
(function() {
  // SINGLETON
  var ui = {};
  Joy.ui = ui;

  ui.init = function(master) {
    // CSS
    master.dom.classList.add("joy-master");

    // Manual Scroll (to prevent it propagating up...)
    master.container.addEventListener("wheel", function(event) {
      var delta = event.deltaY;
      master.container.scrollTop += delta;
      // event.preventDefault();
      return false;
    });

    // Prevent accidental backspace-history
    // because why the heck is this even a thing, jeez.
    // thx: https://stackoverflow.com/a/2768256
    // document.body.addEventListener('keydown', function(event){
    //     if(event.keyCode === 8) {
    //         var doPrevent = true;
    //         var types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
    //         var d = event.srcElement || event.target;
    //         var disabled = d.getAttribute("readonly") || d.getAttribute("disabled");
    //         if (!disabled) {
    //             if (d.isContentEditable) {
    //                 doPrevent = false;
    //             } else if (d.tagName.toUpperCase() == "INPUT") {
    //                 var type = d.getAttribute("type");
    //                 if (type) {
    //                     type = type.toLowerCase();
    //                 }
    //                 if (types.indexOf(type) > -1) {
    //                     doPrevent = false;
    //                 }
    //             } else if (d.tagName.toUpperCase() == "TEXTAREA") {
    //                 doPrevent = false;
    //             }
    //         }
    //         if (doPrevent) {
    //             event.preventDefault();
    //             return false;
    //         }
    //     }
    // });
  };

  /********************
Button's config:
{
	label: "derp",
	onclick: function(){},
	styles: ["round", "hollow"] // optional
}
********************/
  ui.Button = function(config) {
    var self = this;

    // DOM. Pretty simple.
    var dom = document.createElement("div");
    dom.className = "joy-button";
    self.dom = dom;

    // Setting Label
    config.label = config.label || "";
    self.label = document.createElement("span");
    dom.appendChild(self.label);
    self.setLabel = function(newLabel) {
      self.label.innerHTML = newLabel;
    };
    self.setLabel(config.label);

    // On Click
    dom.onclick = function() {
      config.onclick();
    };

    // Styles
    self.styles = config.styles || [];
    for (var i = 0; i < self.styles.length; i++)
      dom.classList.add(self.styles[i]);
  };

  /********************
ChooserButton's config:
{
	value: [current value], (optional)
	staticLabel: "+", (optional)
	options: options,
	onchange: function(value){},
	position: "left" // optional: for the Joy.modal
	styles: ["round", "hollow"] // optional: for the button
}
********************/
  ui.ChooserButton = function(config) {
    var self = this;

    // Properties
    self.value = config.value;
    self.options = config.options; // expose, coz may change later
    self.onchange = config.onchange;

    // IF NO VALUE, PICK FIRST ONE, WHATEVER
    if (!self.value) {
      self.value = self.options[0].value;
    }

    // This is just a Button that calls Chooser Popup when clicked
    ui.Button.call(self, {
      label: config.staticLabel === undefined ? "" : config.staticLabel,
      onclick: function() {
        // Chooser Modal!
        Joy.modal.Chooser({
          source: self.dom,
          options: self.options,
          onchange: function(value) {
            // Update value & label
            self.value = value;
            _updateLabel();

            // On Select callback
            self.onchange(value);
          },
          position: config.position,
        });
      },
      styles: config.styles,
    });

    // Helper method
    var _updateLabel = function() {
      if (config.staticLabel !== undefined) return; // if static, no.

      // Otherwise, find the corresponding label to my current value & set to that.
      var label = self.options.find(function(pair) {
        return pair.value == self.value;
      }).label;
      self.setLabel(label);
    };
    _updateLabel();
  };

  /********************
Scrubber's config:
{
	min: 0,
	max: 180,
	value: [current value],
	onchange: function(value){}
}
********************/
  ui.Scrubber = function(config) {
    var self = this;

    // Config...
    var min = config.min;
    var max = config.max;
    self.value = config.value;

    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-scrubber";
    self.dom = dom;

    // DOM *is* Label
    self.setLabel = function(newValue) {
      dom.innerHTML = newValue.toFixed(self.sigfigs);
    };

    // On Value Change: make sure it's the right num of sigfigs
    var _onValueChange = function(newValue) {
      newValue = parseFloat(newValue.toFixed(self.sigfigs));
      config.onchange(newValue);
    };

    // DRAG IT, BABY
    var isDragging = false;
    var wasDragging = false;
    var lastDragX, startDragValue;
    var delta = 0;
    var _onmousedown = function(event) {
      isDragging = true;
      lastDragX = event.clientX;
      startDragValue = self.value;
      delta = 0;
      if (config.onstart) config.onstart();
    };
    var _onmousemove = function(event) {
      if (isDragging) {
        wasDragging = true;

        // What's the step?
        var step = Math.pow(0.1, self.sigfigs);
        step = parseFloat(step.toPrecision(1)); // floating point crap

        // Change number
        var velocity = event.clientX - lastDragX;
        lastDragX = event.clientX;
        var multiplier = Math.abs(velocity / 10);
        if (multiplier < 1) multiplier = 1;
        if (multiplier > 3) multiplier = 3;
        delta += velocity * multiplier;
        var dx = Math.floor(delta / 2);
        var newValue = startDragValue + dx * step;
        newValue = _boundNumber(newValue);

        // Only update if ACTUALLY new.
        if (self.value != newValue) {
          self.value = newValue;
          self.setLabel(newValue);
          _onValueChange(newValue);
        }
      }
    };
    var _boundNumber = function(newValue) {
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      return newValue;
    };
    var _onmouseup = function() {
      isDragging = false;
      if (config.onstop) config.onstop();
      setTimeout(function() {
        wasDragging = false; // so can't "click" if let go on scrubber
      }, 1);
    };

    // MOUSE EVENTS
    dom.addEventListener("mousedown", _onmousedown);
    window.addEventListener("mousemove", _onmousemove);
    window.addEventListener("mouseup", _onmouseup);

    // KILL ALL LISTENERS
    self.kill = function() {
      dom.removeEventListener("mousedown", _onmousedown);
      window.removeEventListener("mousemove", _onmousemove);
      window.removeEventListener("mouseup", _onmouseup);
    };

    // On click: edit manually!
    var _manuallyEditing = false;
    dom.onblur = function() {
      if (_manuallyEditing) {
        _manuallyEditing = false;
        dom.contentEditable = false;
        _unselectAll();

        // Done manually updating! The new number!
        _countSigFigs(dom.innerText); // re-calc sigfigs
        self.value = _parseNumber();
        self.setLabel(self.value);
        _onValueChange(self.value);

        // On Stop editing
        if (config.onstop) config.onstop();
      }
    };
    _preventWeirdCopyPaste(dom);
    _blurOnEnter(dom);
    dom.onclick = function() {
      if (wasDragging) return; // can't click if I was just dragging!

      _manuallyEditing = true;

      // Make it editable, and select it!
      dom.contentEditable = true;
      dom.spellcheck = false;
      _selectAll(dom);

      // On Start editing
      if (config.onstart) config.onstart();
    };
    dom.oninput = function(event) {
      if (!_manuallyEditing) return;

      // Also, no non-decimal or numbers
      var regex = /[^0-9.\-]/g;
      if (dom.innerText.match(regex)) {
        dom.innerText = dom.innerText.replace(regex, "");
      }
      _fixStringInput(dom);

      // Show that change!
      _onValueChange(_parseNumber());
    };
    var _parseNumber = function() {
      var num = parseFloat(dom.innerText);
      if (isNaN(num)) num = 0;
      num = _boundNumber(num);
      return num;
    };

    // How many significant digits?
    self.sigfigs = 0;
    var _countSigFigs = function(string) {
      string = string.toString();
      var sigfigs;
      var positionOfPeriod = string.search(/\./);
      if (positionOfPeriod >= 0) {
        // has a period
        sigfigs = string.length - 1 - positionOfPeriod;
      } else {
        sigfigs = 0;
      }
      self.sigfigs = sigfigs;
    };
    _countSigFigs(self.value);

    // Current value...
    self.setLabel(self.value);
  };

  /********************
String's config:
{
	prefix: "[",
	suffix: "]",
	color:"whatever",
	value: data.value,
	onchange: function(value){
		data.value = value;
		self.update();
	},
	styles: ["comment"]
}
********************/
  ui.String = function(config) {
    var self = this;

    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-string";
    self.dom = dom;

    // The Actual Part that's Content Editable
    var input = document.createElement("span");
    input.contentEditable = true;
    input.spellcheck = false;

    // Prefix & Suffix & Color: entirely cosmetic
    var prefixDOM = document.createElement("span");
    var suffixDOM = document.createElement("span");
    prefixDOM.innerHTML = config.prefix || "";
    suffixDOM.innerHTML = config.suffix || "";
    dom.appendChild(prefixDOM);
    dom.appendChild(input);
    dom.appendChild(suffixDOM);

    // On input!
    input.oninput = function(event) {
      _fixStringInput(input);
      var value = input.innerText; // NOT innerHTML
      config.onchange(value); // callback!
    };

    // On focus, select all
    input.onfocus = function() {
      _selectAll(input);
    };
    input.onblur = function() {
      _unselectAll();
    };
    _preventWeirdCopyPaste(input);

    // On pressing <enter>, DON'T line break, just blur
    input.onkeypress = function(e) {
      if (e.which == 13) {
        input.blur();
        return false;
      }
      return true;
    };

    // Set String
    self.setString = function(value) {
      input.innerText = value;
      _fixStringInput(input);
    };

    // Set Color, why not
    self.setColor = function(color) {
      color = _forceToRGB(color);
      dom.style.color = color;
      dom.style.borderColor = color;
    };
    if (config.color) self.setColor(config.color);

    // Styles
    self.styles = config.styles || [];
    for (var i = 0; i < self.styles.length; i++)
      dom.classList.add(self.styles[i]);

    // Start with the current value
    self.setString(config.value);
  };

  /********************
TextLine's config:
{
	multiline: true,
	readonly: true,
	width: number or "[style]",
	onchange: function(newValue){},
	placeholder: "//derp"
	styles: ["box"]
}
********************/
  // TODO: a full WSIYWIG editor?
  // https://hackernoon.com/easily-create-an-html-editor-with-designmode-and-contenteditable-7ed1c465d39b
  ui.TextBox = function(config) {
    var self = this;

    // DOM
    var input;
    if (config.multiline) {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    if (config.placeholder) {
      input.placeholder = config.placeholder;
    }
    input.spellcheck = false;
    input.className = "joy-textbox";
    self.dom = input;
    var dom = self.dom;

    // Config options
    if (config.readonly) {
      input.setAttribute("readonly", 1);
      input.addEventListener("click", function() {
        self.select();
      });
    } else {
      input.oninput = function(event) {
        config.onchange(input.value);
      };
    }
    if (config.width) {
      input.style.width =
        typeof config.width === "number" ? config.width + "px" : config.width;
    }

    // Get & Set Value
    self.getValue = function() {
      return input.value;
    };
    self.setValue = function(value) {
      input.value = value;
    };

    // Select
    self.select = function() {
      input.select();
    };

    // Styles
    self.styles = config.styles || [];
    for (var i = 0; i < self.styles.length; i++)
      dom.classList.add(self.styles[i]);

    // Start
    if (config.value) self.setValue(config.value);

    // If it's multiline, auto-resize!
    // Thanks to this: https://stackoverflow.com/a/25621277
    if (config.multiline) {
      var _onInput = function() {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
      };
      dom.addEventListener("input", _onInput, false);
      setTimeout(function() {
        dom.setAttribute(
          "style",
          "height:" + dom.scrollHeight + "px; overflow-y:hidden;"
        );
      }, 1); // some threading thing?
    }
  };
})(); /********************

MODAL:
Places a big ol' modal dialogue bubble over the editor!

********************/
(function() {
  // SINGLETON
  var modal = {};
  Joy.modal = modal;

  modal.init = function(master) {
    //remove existing model dialog
    var elements = document.querySelectorAll("#joy-modal");
    for (var i = 0; i < elements.length; i++) {
      elements[i].parentNode.removeChild(elements[i]);
    }

    // The main modal container
    modal.dom = document.createElement("div");
    modal.dom.id = "joy-modal";
    document.body.appendChild(modal.dom);

    // Transparent background you click to kill!
    modal.bg = document.createElement("div");
    modal.bg.id = "joy-bg";
    modal.bg.onclick = function() {
      modal.currentUI.kill();
    };
    modal.dom.appendChild(modal.bg);

    // The actual bubble box
    modal.box = document.createElement("div");
    modal.box.id = "joy-box";
    modal.box.className = "arrow_box";
    modal.dom.appendChild(modal.box);

    // NO SCROLL
    modal.dom.addEventListener("wheel", function(event) {
      if (modal.box.style.overflow != "auto") {
        event.preventDefault();
        return false;
      } else {
        return true;
      }
    });
  };
  modal.show = function(ui) {
    modal.dom.style.display = "block"; // hi

    // Remember & add UI
    modal.currentUI = ui;
    modal.box.appendChild(ui.dom);

    // Position the Box
    var position = ui.config.position || "below";
    var boxBounds = modal.box.getBoundingClientRect();
    var sourceBounds = ui.config.source.getBoundingClientRect();
    var bgBounds = modal.bg.getBoundingClientRect();
    var x,
      y,
      margin = 20;
    var overflow = false;
    // HACK: IF BELOW & NO SPACE, do LEFT
    if (position == "below") {
      var y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
      if (y + boxBounds.height > document.body.clientHeight) {
        // below page!
        position = "left";
      }
    }

    modal.box.setAttribute("position", position);
    switch (
      position // TODO: smarter positioning
    ) {
      case "below":
        var x = sourceBounds.left + sourceBounds.width / 2; // x: middle
        var y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
        x -= boxBounds.width / 2;
        break;
      case "left":
        var x = sourceBounds.left - margin; // x: left
        var y = sourceBounds.top + sourceBounds.height / 2; // y: middle
        x -= boxBounds.width;
        y -= boxBounds.height / 2;
        break;
    }
    if (x < 0) x = 1;
    if (y + boxBounds.height > bgBounds.height)
      y = bgBounds.height - boxBounds.height - 1;
    modal.box.style.left = x + "px";
    modal.box.style.top = y + "px";

    // On Open
    if (modal.currentUI.config.onopen) modal.currentUI.config.onopen();
  };
  modal.hide = function() {
    _emptyDOM(modal.box);
    modal.dom.style.display = "none"; // bye

    // On Close
    if (modal.currentUI.config.onclose) modal.currentUI.config.onclose();
  };

  /********************
Chooser's config:
{
	source: [who this modal dialog should be "coming from"]
	value: [currently selected value, if any]
	options: [label-value pairs],
	onchange: function(value){}, // callback
	position: "below" // default is "below"
};
********************/
  modal.Chooser = function(config) {
    var self = {}; // just an obj to scope this stuff

    // Config
    self.config = config;

    // Create DOM
    var dom = document.createElement("div");
    dom.className = "joy-modal-chooser";
    self.dom = dom;

    // Create List DOM
    var list = document.createElement("div");
    dom.appendChild(list);

    // Populate with list of options
    self.options = [];
    self.categories = {};
    var _placeholder_ = "_placeholder_";
    var _makeCategory = function(category) {
      // dom
      var categoryDOM = document.createElement("div");
      list.appendChild(categoryDOM);

      // remember
      self.categories[category] = categoryDOM;
    };
    self.populate = function() {
      // Create categories, if any!
      for (var i = 0; i < config.options.length; i++) {
        var option = config.options[i];
        var category = option.category;
        if (category) {
          // Category doesn't exist yet... make it!
          if (!self.categories[category]) _makeCategory(category);
        } else {
          // Make a placholder if not alredy!
          if (!self.categories[_placeholder_]) _makeCategory(_placeholder_);
        }
      }

      // Create options
      for (var i = 0; i < config.options.length; i++) {
        // Create option
        var option = config.options[i];
        var optionDOM = document.createElement("div");
        optionDOM.innerHTML = option.label;
        if (option.color) {
          optionDOM.style.color = option.color;
        }

        // Put it in its category!
        var category = option.category || _placeholder_;
        self.categories[category].appendChild(optionDOM);

        // On Click!
        (function(option) {
          // TODO: Hover & preview mode?
          optionDOM.onclick = function(event) {
            self.onchange(option.value);
            event.stopPropagation(); // no, don't double-fire
          };
        })(option);
      }
    };
    self.populate();

    // On Select
    self.onchange = function(value) {
      self.kill();
      config.onchange(value); // on select AFTER kill, since can create ANOTHER modal
    };

    // Kill & Remove
    self.kill = function() {
      modal.hide(); // hide modal
    };

    // Show me!
    modal.show(self);
  };

  /********************
Color's config:
{
	source: [who this modal dialog should be "coming from"]
	value: [currently selected value, if any]
	onchange: function(value){}, // callback
	onclose: function(){}
};
********************/
  modal.Color = function(config) {
    var self = {}; // just an obj to scope this stuff

    // Config
    self.config = config;

    // Create DOM
    var dom = document.createElement("div");
    dom.className = "joy-modal-color";
    self.dom = dom;

    // COLOR is HSV.
    config.value = config.value || [0, 1, 1];
    self.h = config.value[0];
    self.s = config.value[1];
    self.v = config.value[2];

    // THREE ELEMENTS:
    // 1. Color Wheel
    // 2. Color Value
    // 3. Color Pickers

    var WHEEL_SIZE = 150;
    var SPECTRUM_WIDTH = 15;
    var MARGIN_1 = 10;
    var MARGIN_2 = 10;
    var MARGIN_3 = 10;

    var FULL_WIDTH =
      MARGIN_1 + WHEEL_SIZE + MARGIN_2 + SPECTRUM_WIDTH + MARGIN_3;
    var FULL_HEIGHT = MARGIN_1 + WHEEL_SIZE + MARGIN_3;

    self.dom.style.width = FULL_WIDTH + "px";
    self.dom.style.height = FULL_HEIGHT + "px";

    /////////////////////////////
    // 1) The Color Wheel ///////
    /////////////////////////////

    var wheelCanvas = document.createElement("canvas");
    wheelCanvas.id = "joy-color-wheel";
    var wheelContext = wheelCanvas.getContext("2d");
    wheelCanvas.width = WHEEL_SIZE * 2;
    wheelCanvas.height = WHEEL_SIZE * 2;
    wheelCanvas.style.width = wheelCanvas.width / 2 + "px";
    wheelCanvas.style.height = wheelCanvas.height / 2 + "px";
    dom.appendChild(wheelCanvas);

    wheelCanvas.style.top = MARGIN_1 + "px";
    wheelCanvas.style.left = MARGIN_1 + "px";

    var _updateWheel = function() {
      // Image Data!
      var ctx = wheelContext;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      var w = wheelCanvas.width;
      var h = wheelCanvas.height;
      var image = ctx.createImageData(w, h);
      var imageData = image.data;

      // Create a circle of colors
      // Thanks to: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
      var cx = w / 2;
      var cy = h / 2;
      var radius = w / 2; // buffer for the crosshair
      var radiusBuffered = radius + 2; // small buffer for clipping
      for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
          var dx = x - cx;
          var dy = y - cy;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < radiusBuffered) {
            // buffer for clipping
            if (distance >= radius) distance = radius;

            // Angle & Distance, re-mapped to [0,1]
            var angle = Math.atan2(dy, dx); // from [-tau/2, tau/2]
            angle = (angle / Math.TAU + 0.5) * 360; // to [0,360]
            distance = distance / radius; // to [0,1]

            // HSV! (capitals, coz already using 'h')
            var H = angle;
            var S = distance;
            var V = self.v;

            // TO RGB
            var rgb = _HSVtoRGB(H, S, V);
            var i = (x + y * w) * 4;
            imageData[i] = rgb[0];
            imageData[i + 1] = rgb[1];
            imageData[i + 2] = rgb[2];
            imageData[i + 3] = 255;
          }
        }
      }
      ctx.putImageData(image, 0, 0);

      // Clip it, for aliasing
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.arc(cx, cy, radius, 0, Math.TAU);
      ctx.fill();
      ctx.restore();
    };
    _updateWheel();

    /////////////////////////////
    // 2) The Value Spectrum ////
    /////////////////////////////

    var spectrumCanvas = document.createElement("canvas");
    spectrumCanvas.id = "joy-color-value";
    var spectrumContext = spectrumCanvas.getContext("2d");
    spectrumCanvas.width = SPECTRUM_WIDTH * 2;
    spectrumCanvas.height = WHEEL_SIZE * 2;
    spectrumCanvas.style.width = spectrumCanvas.width / 2 + "px";
    spectrumCanvas.style.height = spectrumCanvas.height / 2 + "px";
    dom.appendChild(spectrumCanvas);

    spectrumCanvas.style.top = MARGIN_1 + "px";
    spectrumCanvas.style.right = MARGIN_3 + "px";

    var _updateSpectrum = function() {
      // Image data
      var ctx = spectrumContext;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      var w = spectrumCanvas.width;
      var h = spectrumCanvas.height;
      var image = ctx.createImageData(w, h);
      var imageData = image.data;

      // Just a good ol' spectrum of values
      for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
          // HSV! (capitals, coz already using 'h')
          var H = self.h;
          var S = self.s;
          var V = 1 - y / h;

          // TO RGB
          var rgb = _HSVtoRGB(H, S, V);
          var i = (x + y * w) * 4;
          imageData[i] = rgb[0];
          imageData[i + 1] = rgb[1];
          imageData[i + 2] = rgb[2];
          imageData[i + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    };
    _updateSpectrum();

    /////////////////////////////
    // 3) The Color Pickers /////
    /////////////////////////////

    var pickerCanvas = document.createElement("canvas");
    pickerCanvas.id = "joy-color-picker";
    var pickerContext = pickerCanvas.getContext("2d");
    pickerCanvas.width = FULL_WIDTH * 2;
    pickerCanvas.height = FULL_HEIGHT * 2;
    pickerCanvas.style.width = pickerCanvas.width / 2 + "px";
    pickerCanvas.style.height = pickerCanvas.height / 2 + "px";
    dom.appendChild(pickerCanvas);

    var _updatePickers = function() {
      // What's the color?
      var x, y;
      var ctx = pickerContext;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = _HSVToRGBString(self.h, self.s, self.v);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;

      // Draw it on the circle
      var cx = MARGIN_1 * 2 + wheelCanvas.width / 2;
      var cy = MARGIN_1 * 2 + wheelCanvas.height / 2;
      var angle = self.h * (Math.TAU / 360);
      var radius = self.s * (wheelCanvas.width / 2);
      x = cx - Math.cos(angle) * radius;
      y = cy - Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
      ctx.fill();
      ctx.stroke();

      // Draw it on the spectrum
      var sx =
        MARGIN_1 * 2 +
        wheelCanvas.width +
        MARGIN_2 * 2 +
        spectrumCanvas.width / 2;
      var sy = MARGIN_1 * 2;
      x = sx;
      y = sy + spectrumCanvas.height * (1 - self.v);
      ctx.beginPath();
      ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
      ctx.fill();
      ctx.stroke();
    };
    _updatePickers();

    // THE MOUSE EVENTS FOR THE PICKERS
    var editMode;
    var isDragging = false;
    var _update = function(event) {
      if (event.target != pickerCanvas) return; // if outta bounds forget it

      var x = event.offsetX * 2;
      var y = event.offsetY * 2;
      if (editMode == "hs") {
        x -= MARGIN_1 * 2;
        y -= MARGIN_1 * 2;
        _updateHS(x, y);
      } else {
        x -= MARGIN_1 * 2 + wheelCanvas.width + MARGIN_2 * 2;
        y -= MARGIN_1 * 2;
        _updateV(x, y);
      }

      // HEY TELL THE SOURCE
      _updateSource();
    };
    var _updateHS = function(x, y) {
      // get polar
      var radius = wheelCanvas.width / 2;
      var dx = x - radius;
      var dy = y - radius;
      var angle = Math.atan2(dy, dx);
      var distance = Math.sqrt(dx * dx + dy * dy);

      // Re-map
      angle = (angle / Math.TAU + 0.5) * 360; // to [0,360]
      if (angle < 0) angle = 0;
      if (angle > 360) angle = 360;
      distance = distance / radius; // to [0,1]
      if (distance < 0) distance = 0;
      if (distance > 1) distance = 1;

      // update
      self.h = angle;
      self.s = distance;
      _updateSpectrum();
      _updatePickers();
    };
    var _updateV = function(x, y) {
      self.v = 1 - y / spectrumCanvas.height;
      if (self.v < 0) self.v = 0;
      if (self.v > 1) self.v = 1;
      _updateWheel();
      _updatePickers();
    };
    var _onmousedown = function(event) {
      isDragging = true;
      if (event.offsetX * 2 < MARGIN_1 * 2 + wheelCanvas.width + MARGIN_2) {
        editMode = "hs";
      } else {
        editMode = "v";
      }
      _update(event);
    };
    var _onmousemove = function(event) {
      if (isDragging) _update(event);
    };
    var _onmouseup = function() {
      isDragging = false;
    };

    // MOUSE EVENTS
    pickerCanvas.addEventListener("mousedown", _onmousedown);
    window.addEventListener("mousemove", _onmousemove);
    window.addEventListener("mouseup", _onmouseup);

    // UPDATE SOURCE
    var _updateSource = function() {
      var newValue = [self.h, self.s, self.v];
      newValue[0] = parseFloat(newValue[0].toFixed(0));
      newValue[1] = parseFloat(newValue[1].toFixed(2));
      newValue[2] = parseFloat(newValue[2].toFixed(2));
      config.onchange(newValue);
    };

    // Kill
    self.kill = function() {
      // KILL LISTENERS
      dom.removeEventListener("mousedown", _onmousedown);
      window.removeEventListener("mousemove", _onmousemove);
      window.removeEventListener("mouseup", _onmouseup);

      // Hide Modal
      modal.hide();
    };

    // Show me!
    modal.show(self);
  };
})(); /////////////////////////////////////////
// FUNDAMENTAL USER INTERACE ACTORS /////
/////////////////////////////////////////

// TODO: Angle widget

/****************

Raw number widget: JUST the scrubber, no chooser

Widget Options:
{id:'steps', type:'number', placeholder:10, min:0, max:180, step:1}

****************/
Joy.add({
  type: "number",
  tags: ["ui"],
  initWidget: function(self) {
    // Scrubber IS the DOM
    var o = self.options;
    var scrubber = new Joy.ui.Scrubber({
      min: o.min,
      max: o.max,
      step: o.step,
      value: self.getData("value"),
      onstart: function() {
        self.top.activePreview = self;
      },
      onstop: function() {
        self.top.activePreview = null;
      },
      onchange: function(value) {
        self.setData("value", value);
      },
    });
    self.dom = scrubber.dom;

    // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.

    var _ticker = null;
    var _fps = 30;
    self.dom.onmouseenter = function() {
      if (!self.top.canPreview("numbers")) return;

      // Create Preview Data
      self.previewData = _clone(self.data);

      // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
      var _amplitude = Math.abs(self.data.value * 0.05);
      //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
      //if(_amplitude>3) _amplitude=3;
      if (_amplitude == 0) _amplitude = 1; // If it's EXACTLY zero, wiggle with 1, whatever.
      var _timer = 0;
      _ticker = setInterval(function() {
        if (!self.top.canPreview("numbers")) return _stopPreview(); // don't even

        _timer += Math.TAU / _fps / 0.25; // 0.25 seconds
        self.previewData.value =
          self.data.value + Math.sin(_timer) * _amplitude;
        self.update();

        if (_timer > Math.TAU) _stopPreview(); // yer done, son.
      }, 1000 / _fps);
    };
    var _stopPreview = function() {
      if (_ticker) clearInterval(_ticker);
      self.previewData = null;
      // self.update();
    };
    self.dom.onmouseleave = _stopPreview;
  },
  onget: function(my) {
    return my.data.value;
  },
  placeholder: {
    value: 3,
  },
});

/****************

A button widget

Widget Options:
{id:'direction', type:'button', label:'OK'}

When it's clicked, it will call the corresponding onupdate function

****************/

Joy.add({
  type: "button",
  tags: ["ui"],
  initWidget: function(self) {
    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-save";
    self.dom = dom;
    // Save Button
    self.saveButton = new Joy.ui.Button({
      label: self.options.label || "--",
      onclick: function() {
        self.update();
      },
    });
    dom.appendChild(self.saveButton.dom);
  },
});

/****************

A color widget! (for now, same as choose except paints DOM, too)

Widget Options:
{id:'direction', type:'choose', options:['left','right'], placeholder:'left'}

****************/

Joy.add({
  type: "color",
  tags: ["ui"],
  initWidget: function(self) {
    // Color Button IS the DOM
    var colorButton = new Joy.ui.Button({
      label: "&nbsp;",
      onclick: function() {
        Joy.modal.Color({
          // TODO: precision for those floats, y'know
          source: self.dom,
          value: self.getData("value"),
          onchange: function(value) {
            self.setData("value", value);
            _changeLabelColor();
          },
          onopen: function() {
            self.top.activePreview = self;
          },
          onclose: function() {
            self.top.activePreview = null;
          },
        });
      },
      styles: ["joy-color"],
    });
    self.dom = colorButton.dom;

    // Change button color!
    var _changeLabelColor = function() {
      var hsl = self.getData("value");
      colorButton.dom.style.background = _HSVToRGBString(hsl);
    };
    _changeLabelColor();

    // PREVIEW ON HOVER
    // BOUNCE the HSL Value up & down!
    var _ticker = null;
    var _fps = 30;
    var _initialV, _vel, _timer;
    self.dom.onmouseenter = function() {
      if (!self.top.canPreview("numbers")) return; // yeah let's pretend it's a number

      // Create Preview Data
      _initialV = self.data.value[2];
      self.previewData = _clone(self.data);

      // Bounce up & down for HALF a second
      _timer = 0;
      _vel = 2 * (2 / _fps);
      _ticker = setInterval(function() {
        if (!self.top.canPreview("numbers")) return _stopPreview(); // don't

        // Bounce up & down
        var hsl = self.previewData.value;
        hsl[2] += _vel;
        if (hsl[2] > 1) {
          hsl[2] = 1;
          _vel *= -1;
        }
        if (hsl[2] < 0) {
          hsl[2] = 0;
          _vel *= -1;
        }
        self.update();

        // Done!
        _timer += 2 / _fps;
        if (_timer >= 1) _stopPreview();
      }, 1000 / _fps);
    };
    var _stopPreview = function() {
      if (_ticker) clearInterval(_ticker);
      self.previewData = null;
      self.update();
    };
    self.dom.onmouseleave = _stopPreview;
  },
  onget: function(my) {
    return _HSVToRGBString(my.data.value);
  },
  placeholder: function() {
    var hue = Math.floor(Math.random() * 360); // Random color!
    return [hue, 0.8, 1.0];
  },
});

/****************

A choose-y thing

Widget Options:
{name:'direction', type:'choose', options:['left','right'], placeholder:'left'}
// TODO... "options" gets overrided soooo UHHHHH.

****************/
Joy.add({
  type: "choose",
  tags: ["ui"],
  initWidget: function(self) {
    var data = self.data;

    // Options
    var options = self.options;
    for (var i = 0; i < options.length; i++) {
      // convert to label/value if not already
      var o = options[i];
      if (!(o.label !== undefined && o.value !== undefined)) {
        options[i] = {
          label: o.toString(),
          value: o,
        };
      }
    }

    // ChooserButton *IS* DOM
    var chooserButton = new Joy.ui.ChooserButton({
      value: data.value,
      options: options,
      onchange: function(value) {
        data.value = value;
        self.update(); // you oughta know!
      },
      styles: self.styles,
    });
    self.dom = chooserButton.dom;
  },
  onget: function(my) {
    return my.data.value;
  },
});

/****************

A widget to type in strings!

Widget Options:
{name:'name', type:'string', prefix:'&ldquo;', suffix:'&rdquo;', color:"whatever"}

****************/
Joy.add({
  type: "string",
  tags: ["ui"],
  initWidget: function(self) {
    // String *IS* DOM
    var o = self.options;
    self.stringUI = new Joy.ui.String({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color,
      value: self.getData("value"),
      onchange: function(value) {
        self.setData("value", value);
      },
    });
    self.dom = self.stringUI.dom;

    // When data's changed, externally
    self.onDataChange = function() {
      var value = self.getData("value");
      self.stringUI.setString(value);
    };
  },
  onget: function(my) {
    return my.data.value;
  },
  placeholder: "???",
});

/****************

A widget to save data as hash!

Widget Options:
{type:'save'} // NO "id"! It just saves the top-most data.

****************/

Joy.add({
  type: "save",
  tags: ["ui"],
  initWidget: function(self) {
    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-save";
    self.dom = dom;

    // Save Button
    self.saveButton = new Joy.ui.Button({
      label: "save",
      onclick: function() {
        var url = Joy.saveToURL(self.top.data);
        self.url.setValue(url);
        self.url.select();

        // info
        var chars = url.length;
        self.info.innerHTML =
          "P.S: you can shorten your link with <a href='http://tinyurl.com/' target='_blank'>TinyURL</a>!";
      },
    });
    dom.appendChild(self.saveButton.dom);

    // URL TextBox
    self.url = new Joy.ui.TextBox({
      readonly: true,
    });
    dom.appendChild(self.url.dom);

    // Details: chars & tinyurl link
    self.info = document.createElement("div");
    self.info.id = "joy-save-info";
    dom.appendChild(self.info);
  },
});
////////////////////////////////////////////////////////
// THE BIG ACTOR: A "PROGRAMMABLE" LIST OF OPS <3 //
////////////////////////////////////////////////////////

/****************

A nice list of ops.

WidgetConfig:
{type:'ops', name:'ops', resetVariables:false}

****************/
Joy.add({
  type: "ops",
  tags: ["ui"],
  init: function(self) {
    if (self.resetVariables !== undefined)
      self.data.resetVariables = self.resetVariables;

    // TODO: ACTUALLY REFACTOR
    // TODO: Separate out Op code from Widget code
    // so that this can run EVEN WITHOUT WIDGETS.
    // Using messages, probably.
  },
  initWidget: function(self) {
    var data = self.data;
    var ops = data.ops;

    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-ops";
    self.dom = dom;

    // List
    var list = document.createElement("list");
    list.id = "joy-list";
    dom.appendChild(list);

    // Preview Variables?
    /*var varPreview;
		if(self.top.canPreview("variables")){
			varPreview = document.createElement("div");
			varPreview.id = "joy-variables-preview";
			varPreview.innerHTML = "AHHHH";
			dom.appendChild(varPreview);
		}*/

    //////////////////////////////////////////
    // Create Bullet /////////////////////////
    //////////////////////////////////////////

    var bulletOptions = [
      { label: "Add op above", value: "op_above" },
      { label: "Add op below", value: "op_below" },
      { label: "Delete", value: "delete" },
    ];
    var _onBulletChoice = function(entry, choice) {
      // ACTION ABOVE or BELOW
      var newOpWhere = 0;
      if (choice == "op_above") newOpWhere = -1; // above
      if (choice == "op_below") newOpWhere = 1; // below
      if (newOpWhere != 0) {
        // not NOT new op

        var newEntryIndex = self.entries.indexOf(entry);
        if (newOpWhere > 0) newEntryIndex += 1;

        // Chooser Modal!
        Joy.modal.Chooser({
          position: "below",
          source: entry.bullet.dom,
          options: opOptions,
          onchange: function(value) {
            _addOp(value, newEntryIndex);
            self.update(); // You oughta know!
            _updateBullets(); // update the UI, re-number it.
          },
        });
      }

      // DELETE
      if (choice == "delete") {
        _removeFromArray(self.entries, entry); // Delete entry from Entries[]
        _removeFromArray(ops, entry.opData); // Delete op from Data's Ops[]
        self.removeChild(entry.op); // Delete op from Children[]
        list.removeChild(entry.dom); // Delete entry from DOM
        self.update(); // You oughta know!
        _updateBullets(); // update the UI, re-number it.
      }
    };
    var _createBullet = function(entry) {
      var bullet = new Joy.ui.ChooserButton({
        position: "below",
        staticLabel: _getBulletLabel(entry),
        options: bulletOptions,
        onchange: function(choice) {
          _onBulletChoice(entry, choice);
        },
        styles: ["joy-bullet"],
      });
      bullet.dom.id = "joy-bullet";

      return bullet;
    };

    // Get the digit (or letter, or roman) for this bullet...
    var _getBulletLabel = function(entry) {
      // What index am I?
      var index = self.entries.indexOf(entry) + 1;

      // How many levels deep in "ops" am I?
      var levelsDeep = 0;
      var parent = self.parent;
      while (parent) {
        if (parent.type == "ops") levelsDeep++;
        parent = parent.parent;
      }

      // Digit, Letter, or Roman? (Cycle around)
      var label;
      switch (levelsDeep % 3) {
        case 0:
          label = index;
          break; // digits
        case 1:
          label = _numberToAlphabet(index);
          break; // letter
        case 2:
          label = _numberToRoman(index);
          break; // roman
      }

      return label;
    };

    // Re-number ALL these bad boys
    var _updateBullets = function() {
      for (var i = 0; i < self.entries.length; i++) {
        var entry = self.entries[i];
        var bullet = entry.bullet;
        var label = _getBulletLabel(entry);
        bullet.setLabel(label);
      }
    };

    ////////////////////////////////////////////////////////////////////
    // Add Entry: Entries have a Bullet (the number) & actual widget! //
    ////////////////////////////////////////////////////////////////////

    self.entries = [];
    var _addEntry = function(opData, atIndex) {
      // New entry
      var entry = {};
      var entryDOM = document.createElement("div");
      if (atIndex === undefined) atIndex = self.entries.length;
      self.entries.splice(atIndex, 0, entry);
      list.insertBefore(entryDOM, list.children[atIndex]);

      // The Bullet is a Chooser!
      var bullet = _createBullet(entry);
      var bulletContainer = document.createElement("div");
      bulletContainer.id = "joy-bullet-container";
      entryDOM.appendChild(bulletContainer);
      bulletContainer.appendChild(bullet.dom);

      // New Op!
      var newOp = self.addChild({ type: opData.type }, opData);

      // The Widget
      var newWidget = newOp.createWidget();
      newWidget.id = "joy-widget";
      entryDOM.appendChild(newWidget);

      // (Remember all this)
      entry.dom = entryDOM;
      entry.bullet = bullet;
      entry.op = newOp;
      entry.widget = newWidget;
      entry.opData = opData;

      // PREVIEW ON HOVER
      // Also tell the op "_PREVIEW": how far in the op to go?
      var _calculatePreviewParam = function(event) {
        var param = event.offsetY / bullet.dom.getBoundingClientRect().height;
        if (param < 0) param = 0;
        if (param > 1) param = 1;
        _previewOp._PREVIEW = param;
        self.update();
      };
      var _previewOp;
      var _previewStyle;
      bulletContainer.onmouseenter = function(event) {
        if (!self.top.canPreview("ops")) return;

        self.top.activePreview = self;

        // Create Preview Data
        self.previewData = _clone(self.data);
        var opIndex = self.entries.indexOf(entry);
        _previewOp = self.previewData.ops[opIndex];

        // STOP after that op!
        self.previewData.ops.splice(opIndex + 1, 0, { STOP: true });

        // How far to go along op?
        _calculatePreviewParam(event);

        // Add in a style
        _previewStyle = document.createElement("style");
        document.head.appendChild(_previewStyle);
        _previewStyle.sheet.insertRule(
          ".joy-ops.joy-previewing > #joy-list > div:nth-child(n+" +
            (opIndex + 2) +
            ") { opacity:0.1; }"
        );
        _previewStyle.sheet.insertRule(
          ".joy-ops.joy-previewing > div.joy-bullet { opacity:0.1; }"
        );
        dom.classList.add("joy-previewing");
      };
      bulletContainer.onmousemove = function(event) {
        if (self.previewData) _calculatePreviewParam(event);
      };
      bulletContainer.onmouseleave = function() {
        if (self.previewData) {
          self.previewData = null;
          self.top.activePreview = null;
          self.update();
          document.head.removeChild(_previewStyle);
          dom.classList.remove("joy-previewing");
        }
      };

      return entry;
    };
    // add all INITIAL ops as widgets
    for (var i = 0; i < ops.length; i++) _addEntry(ops[i]);

    ///////////////////////////////////////
    // Add Op /////////////////////////
    ///////////////////////////////////////

    // Manually add New Op To Ops + Widgets + DOM
    var _addOp = function(opType, atIndex) {
      // Create that new entry & everything
      var newOp = { type: opType };
      if (atIndex === undefined) {
        ops.push(newOp);
      } else {
        ops.splice(atIndex, 0, newOp);
      }
      var entry = _addEntry(newOp, atIndex);

      // Focus on that entry's widget!
      // entry.widget.focus();
    };

    // Ops you can add:
    // TODO: INCLUDE ALIASED OPS
    var opOptions = [];
    if (self.onlyOps) {
      for (var i = 0; i < self.onlyOps.length; i++) {
        var opType = self.onlyOps[i];
        var opTemplate = Joy.getTemplateByType(opType);
        var notOpTag = opTemplate.tags.filter(function(tag) {
          return tag != "op"; // first tag that's NOT "op"
        })[0];
        opOptions.push({
          label: opTemplate.name,
          value: opType,
          category: notOpTag,
        });
      }
    } else {
      var opOps = Joy.getTemplatesByTag("op");
      for (var i = 0; i < opOps.length; i++) {
        var opOp = opOps[i];
        var notOpTag = opOp.tags.filter(function(tag) {
          return tag != "op";
        })[0];
        opOptions.push({
          label: opOp.name,
          value: opOp.type,
          category: notOpTag,
        });
      }
    }

    // "+" Button: When clicked, prompt what ops to add!
    var addButton = new Joy.ui.ChooserButton({
      staticLabel: "+",
      options: opOptions,
      onchange: function(value) {
        _addOp(value);
        self.update(); // You oughta know!
      },
      styles: ["joy-bullet"],
    });
    dom.appendChild(addButton.dom);
  },

  onexecute: async function(my) {
    // Create _vars, if not already there
    if (!my.target._variables) my.target._variables = {};

    // Reset all of target's variables?
    if (my.data.resetVariables) my.target._variables = {};

    // Do those ops, baby!!!
    for (var i = 0; i < my.data.ops.length; i++) {
      // Stop?
      var opData = my.data.ops[i];
      if (opData.STOP) return "STOP";

      // Run
      var op = my.op.entries[i].op; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT
      var result = await op.execute(my.target, opData); // use ol' op, but GIVEN data.
      if (result && result.target) {
        my.target = result.target;
      } else if (result && result.error) {
        console.error("ops stopped with error: ", result);
        return result;
      } else if (result && result.stop) {
        console.log("ops interrupted at step ", i, result);
        return result;
      } else if (result == "STOP") return result;
    }
    return my;
  },
  placeholder: {
    ops: [],
    resetVariables: true,
  },
});
/////////////////////////////////////////
// LOGIC ACTORS /////////////////////////
/////////////////////////////////////////

Joy.module("instructions", function() {
  Joy.add({
    name: "Repeat the following...",
    type: "instructions/repeat",
    tags: ["instructions", "op"],
    init:
      "Repeat the following {id:'count', type:'number', min:1, placeholder:3} times: " +
      "{id:'ops', type:'ops', resetVariables:false}",
    onexecute: async function(my) {
      // Previewing? How much to preview?
      var param = 1;
      if (my.data._PREVIEW !== undefined) param = my.data._PREVIEW;

      // Loop through it... (as far as preview shows, anyway)
      var loops = Math.floor(my.data.count * param);
      for (var i = 0; i < loops; i++) {
        var result = await my.op.ops.execute(my.target);
        if (result && result.target) {
          my.target = result.target;
        } else if (result.error) {
          console.error("op stopped with error: ", result);
          return result;
        } else if (result.stop) {
          console.log("op interrupted at step ", i, result);
          return result;
        } else if (result == "STOP") return result; // STOP
      }
      return my;
    },
  });

  /*Joy.add({
		name: "If... then...",
		type: "instructions/if",
		tags: ["instructions", "op"],
		init: "If AHHH, then: "+
			  "{id:'ops', type:'ops', resetVariables:false}",
		onexecute: function(my){
			var message = my.op.ops.execute(my.target);
			if(message=="STOP") return message; // STOP
		}
	});*/

  Joy.add({
    name: "// Write a note",
    type: "instructions/comment",
    tags: ["instructions", "op"],
    initWidget: function(self) {
      // DOM
      self.dom = document.createElement("div");

      // Comment Box
      self.box = new Joy.ui.TextBox({
        multiline: true,
        placeholder: "// your notes here",
        value: self.getData("value"),
        onchange: function(value) {
          self.setData("value", value);
        },
        styles: ["box"],
      });
      self.dom.appendChild(self.box.dom);
    },
  });
});
// VARIABLE NAME: you're just a synchronized string, yo.
Joy.add({
  type: "variableName",
  tags: ["ui"],
  init: function(self) {
    var variableType = self.variableType;

    // Unique Variable Name
    var _uniqueVariableName = function() {
      var varnames = Joy.getReferencesByTag(self, variableType).map(function(
        ref
      ) {
        return ref.data.value;
      });
      var highestCount = 0;
      varnames.forEach(function(varname) {
        var num;
        if (varname == "variable") num = 1; // at least 1
        var match = varname.match(/variable\s(\d+)/);
        if (match) num = parseInt(match[1]); // or more
        if (highestCount < num) highestCount = num;
      });
      if (highestCount == 0) return "variable";
      else return "variable " + (highestCount + 1);
    };

    // Create Reference method
    self._createNewReference = function() {
      var refData = {
        value: _uniqueVariableName(),
        color: _randomHSV(),
      };
      var ref = Joy.createReference(self, variableType, refData);
      self.setData("refID", ref.id, true); // Remember Ref ID. And DON'T update.
      Joy.connectReference(self, ref.id); // connect new ref
    };

    // Do I already have a reference? Create one if no.
    var refID = self.getData("refID");
    if (refID) {
      Joy.connectReference(self, refID); // connect this ref
    } else {
      // Well, first try seeing if there are any vars.
      // If so, connect to most recently created one
      var varReferences = Joy.getReferencesByTag(self, variableType);
      // CONFIG: self.startWithExisting!
      if (self.startWithExisting && varReferences.length > 0) {
        var latestReference = varReferences[varReferences.length - 1];
        refID = latestReference.id;
        self.setData("refID", refID, true); // set data
        Joy.connectReference(self, refID); // connect this ref
      } else {
        // Otherwise, make a new one!
        self._createNewReference();
      }
    }

    // Switch reference
    self._switchReference = function(newRefID) {
      var refID = self.getData("refID");
      Joy.disconnectReference(self, refID); // disconnect old ref
      self.setData("refID", newRefID); // DO update this!
      Joy.connectReference(self, newRefID); // connect new ref
    };
  },
  initWidget: function(self) {
    self.dom = document.createElement("span");

    // The String edits my REFERENCE'S data.
    var refID = self.getData("refID");
    var refData = Joy.getReferenceById(self, refID).data;
    var stringOp = self.addChild(
      {
        type: "string",
        prefix: "[",
        suffix: "]",
        color: refData.color,
      },
      refData
    );
    var stringWidget = stringOp.createWidget();
    self.dom.appendChild(stringWidget);

    // This String Op also updates its color
    var _old_stringOp_onDataChange = stringOp.onDataChange;
    stringOp.onDataChange = function() {
      _old_stringOp_onDataChange();
      var color = stringOp.getData("color");
      stringOp.stringUI.setColor(color);
    };

    // Chooser? Can choose to switch to other variables (or make new one)
    var variableType = self.variableType;
    var _showChooser = function() {
      var options = [];

      // Get all references that are of this type
      var refs = Joy.getReferencesByTag(self, variableType);
      var myRefID = self.getData("refID");
      refs.forEach(function(ref) {
        if (ref.id == myRefID) return; // don't show SELF
        var color = ref.data.color;
        color = _HSVToRGBString(color[0], color[1], color[2]);
        options.push({
          label: "[" + ref.data.value + "]",
          value: ref.id,
          color: color,
        });
      });

      // Meta Options:
      options.push({
        category: "meta",
        label: "(+new)",
        value: "NEW",
      });
      options.push({
        category: "meta",
        label: "(change color)",
        value: "CHANGE_COLOR",
      });

      // Show all possible variables!
      Joy.modal.Chooser({
        source: self.dom,
        options: options,
        onchange: function(newRefID) {
          if (newRefID == "CHANGE_COLOR") {
            // Just change color, ha.
            Joy.modal.Color({
              source: self.dom,
              value: stringOp.getData("color"),
              onchange: function(newColor) {
                stringOp.setData("color", newColor);
                stringOp.stringUI.setColor(newColor); // do this again coz edit lock
              },
            });
          } else {
            // Make a new reference? Either way, set refID
            if (newRefID == "NEW") {
              var oldRefID = self.getData("refID");
              Joy.disconnectReference(self, oldRefID); // disconnect old ref
              self._createNewReference();
              self.update(); // update, yo
            } else {
              self._switchReference(newRefID);
            }

            // Make String Widget edit that instead
            var refID = self.getData("refID");
            var ref = Joy.getReferenceById(self, refID);
            stringOp.switchData(ref.data);
          }
        },
      });
    };

    // Show ON CLICK!
    if (!self.noChooser) {
      self.dom.onclick = _showChooser;
    }
  },
  onget: function(my) {
    var refID = my.data.refID;
    var ref = Joy.getReferenceById(my.op, refID);
    return ref.data.value; // returns the variable name
  },
  onkill: function(self) {
    // Disconnect any references I may have
    var refID = self.getData("refID");
    Joy.disconnectReference(self, refID); // disconnect old ref
  },
}); /////////////////////////////////////////
// MATH ACTORS //////////////////////////
/////////////////////////////////////////

Joy.module("math", function() {
  /*********************

	Alright. This is gonna be a big one.
	It needs to be able to chain math elements,
	and each element needs to be able to switch between
	scrubbers, variables, and other number-getter ops.

	Data:
	{
		type: "number",
		chain:[
			{type:"number_raw", value:3},
			{type:"choose", value:"*"},
			{type:"variableName", refID:whatever},
			{type:"choose", value:"+"},
			{type:"turtle/getAngle"}
		]
	}

	*********************/
  Joy.modify("number", "number_raw", function(_old) {
    return {
      init: function(self) {
        // no variables?
        if (self.noVariables) return;

        // Force data to a chain...
        var originalValue = self.getData("value");
        if (typeof originalValue === "number") {
          self.setData("value", undefined, true); // delete "value", no update
          self.setData(
            "chain",
            [
              {
                type: "number_raw",
                min: self.min,
                max: self.max,
                step: self.step,
                value: originalValue,
              },
            ],
            true
          ); // create "chain", no update
        }

        // MAKE A NEW CHAIN ACTOR *AND DATA(?)*
        self._makeNewChainOp = function(chainItem, atIndex) {
          // Make it
          var chainOp;
          var type = chainItem.type;
          switch (type) {
            // Elements
            case "number_raw":
              chainOp = self.addChild(
                {
                  type: type,
                  min: chainItem.min,
                  max: chainItem.max,
                  step: chainItem.step,
                },
                chainItem
              );
              break;
            case "variableName":
              chainOp = self.addChild(
                {
                  type: type,
                  variableType: "number",
                  noChooser: true,
                },
                chainItem
              );
              break;

            // Operand
            case "choose":
              chainOp = self.addChild(
                {
                  type: type,
                  options: [
                    { label: "+", value: "+" },
                    { label: "-", value: "-" },
                    { label: "&times;", value: "*" },
                    { label: "&divide;", value: "/" },
                  ],
                  styles: ["joy-math"],
                },
                chainItem
              );
              break;
          }

          // Add or splice to Chain Ops array! *AND THE DATA*
          var chain = self.getData("chain");
          if (atIndex !== undefined) {
            self.chainOps.splice(atIndex, 0, chainOp);
            chain.splice(atIndex, 0, chainItem);
          } else {
            self.chainOps.push(chainOp);
            chain.push(chainItem);
          }

          // Return
          return chainOp;
        };

        // Create an op for each element in the chain
        self.chainOps = []; // keep a chain parallel to children. this one's in ORDER.
        var realChain = self.getData("chain");
        var chain = _clone(realChain);
        realChain.splice(0, realChain.length); // empty out realChain
        for (var i = 0; i < chain.length; i++) {
          self._makeNewChainOp(chain[i]);
        }

        // REPLACE A CHAIN ACTOR *AND DATA*
        self._replaceChainOp = function(oldChainOp, newItem) {
          // Delete old op, and add new op where it was
          var oldIndex = self._deleteChainOp(oldChainOp);
          var newChainOp = self._makeNewChainOp(newItem, oldIndex);

          // update manually!
          self.update();

          // Return
          return newChainOp;
        };

        // DELETE A CHAIN ACTOR *AND DATA*
        self._deleteChainOp = function(chainOp) {
          // Delete op
          var oldIndex = self.chainOps.indexOf(chainOp);
          _removeFromArray(self.chainOps, chainOp);
          self.removeChild(chainOp);

          // and data!
          var chain = self.getData("chain");
          chain.splice(oldIndex, 1);

          // so can re-use index
          return oldIndex;
        };
      },
      initWidget: function(self) {
        // no variables?
        if (self.noVariables) {
          _old.initWidget(self);
          return;
        }

        // Container!
        self.dom = document.createElement("span");
        self.dom.className = "joy-number";

        // Show Chooser!
        var _showChooser = function(chainOp) {
          var options = [];

          // Show placeholder number (unless i'm a number_raw, or there isn't one)
          if (chainOp.type != "number_raw") {
            var placeholderNumber = self.placeholder.value;
            if (typeof placeholderNumber === "number") {
              options.push({
                label: placeholderNumber,
                value: {
                  type: "number_raw",
                  value: placeholderNumber,
                },
              });
            }
          }

          // Show possible variables (except the current variable)
          var refs = Joy.getReferencesByTag(self, "number");
          var myRefID;
          if (chainOp.type == "variableName")
            myRefID = chainOp.getData("refID");
          refs.forEach(function(ref) {
            if (ref.id == myRefID) return; // don't show SELF
            var color = ref.data.color;
            color = _HSVToRGBString(color[0], color[1], color[2]);
            options.push({
              label: "[" + ref.data.value + "]",
              value: {
                type: "variableName",
                refID: ref.id,
              },
              color: color,
            });
          });

          // Show all these dang options!
          if (options.length > 0) {
            Joy.modal.Chooser({
              source: chainOp.dom,
              options: options,
              onchange: function(newItem) {
                // REPLACE CHAIN ACTOR & ENTRY
                var newChainOp = self._replaceChainOp(chainOp, newItem);
                self._replaceChainEntry(chainOp, newChainOp);
              },
            });
          }
        };

        // THE WAY TO ORGANIZE THIS: ENTRIES that have DOM *and* ACTOR
        self._chainEntries = [];

        // MAKE CHAIN ENTRY
        self._makeChainEntry = function(chainOp, atIndex) {
          // Widget
          var widget = document.createElement("span");
          chainOp.createWidget();
          widget.appendChild(chainOp.dom);

          // Widget chooser, if NOT an operand
          if (chainOp.type != "choose") {
            var entry;
            var moreButton = new Joy.ui.Button({
              onclick: function() {
                _showChainOptions(entry);
              },
              styles: ["joy-more"],
            });
            widget.appendChild(moreButton.dom);
          }

          // Place in widget
          if (atIndex !== undefined) {
            if (atIndex < self.dom.childNodes.length) {
              // replacing NOT at last child...
              var beforeThisWidget = self.dom.childNodes[atIndex];
              self.dom.insertBefore(widget, beforeThisWidget);
            } else {
              // Otherwise just append
              self.dom.appendChild(widget);
            }
          } else {
            self.dom.appendChild(widget);
          }

          // If it's NOT an operand, clicking it reveals options
          if (chainOp.type != "choose") {
            (function(ca) {
              // HACK: click, NOT scrub. detect w/ time frame
              var _mouseDownTime;
              ca.dom.addEventListener("mousedown", function() {
                _mouseDownTime = +new Date();
              });
              ca.dom.addEventListener("mouseup", function() {
                var _time = +new Date();
                if (_time - _mouseDownTime < 500) {
                  _showChooser(ca); // if clicked in less than a half second
                }
              });
            })(chainOp);
          }

          // Entry
          entry = {
            widget: widget,
            op: chainOp,
          };
          if (atIndex !== undefined) {
            self._chainEntries.splice(atIndex, 0, entry);
          } else {
            self._chainEntries.push(entry);
          }
        };

        // DELETE CHAIN ENTRY
        self._deleteChainEntry = function(chainOp) {
          // Get index (so can return later)
          var entry = self._chainEntries.find(function(entry) {
            return entry.op == chainOp;
          });
          var index = self._chainEntries.indexOf(entry);

          // Delete widget & entry (op's already been deleted)
          var widget = entry.widget;
          self.dom.removeChild(widget);
          _removeFromArray(self._chainEntries, entry);

          // Index?
          return index;
        };

        // REPLACE CHAIN ENTRY
        self._replaceChainEntry = function(oldChainOp, newChainOp) {
          var oldIndex = self._deleteChainEntry(oldChainOp);
          self._makeChainEntry(newChainOp, oldIndex);
        };

        // SHOW CHAIN OPTIONS
        var _showChainOptions = function(entry) {
          // Possible operands
          var currentLabel = entry.widget.innerText;
          var options = [
            { label: currentLabel + " + 2", value: "+" },
            { label: currentLabel + " - 2", value: "-" },
            { label: currentLabel + " &times; 2", value: "*" },
            { label: currentLabel + " &divide; 2", value: "/" },
          ];

          // To delete... which operand?
          var elementIndex = self._chainEntries.indexOf(entry);
          if (self._chainEntries.length > 1) {
            // can't delete if just one

            // The operand...
            var operandIndex;
            if (elementIndex == 0) operandIndex = elementIndex + 1;
            // first
            else operandIndex = elementIndex - 1; // not

            // Label
            var label;
            var operandLabel =
              self._chainEntries[operandIndex].widget.innerText;
            if (elementIndex == 0) label = currentLabel + " " + operandLabel;
            // first
            else label = operandLabel + " " + currentLabel; // not

            // Indices to delete
            var indicesToDelete = [elementIndex, operandIndex].sort(); // increasing order

            // Push option!
            options.push({
              category: "meta",
              label: "(delete “" + label + "”)",
              value: indicesToDelete,
            });
          }

          // Choose options!
          Joy.modal.Chooser({
            source: entry.widget,
            options: options,
            onchange: function(operand) {
              // It's an operand...
              if (typeof operand === "string") {
                // Get index of the op...
                var index = self._chainEntries.indexOf(entry);

                // Make the OPERAND op(+data) & entry
                index++;
                var operandOp = self._makeNewChainOp(
                  { type: "choose", value: operand },
                  index
                );
                self._makeChainEntry(operandOp, index);

                // Make the NUMBER op(+data) & entry (just the number 2, why hot)
                index++;
                var numberOp = self._makeNewChainOp(
                  { type: "number_raw", value: 2 },
                  index
                );
                self._makeChainEntry(numberOp, index);
              } else {
                // Otherwise, DELETE ACTOR & ENTRY!
                var indices = operand;
                for (var i = indices.length - 1; i >= 0; i--) {
                  // flip around coz DELETING
                  var indexToDelete = indices[i];
                  var opToDelete = self._chainEntries[indexToDelete].op;
                  self._deleteChainOp(opToDelete);
                  self._deleteChainEntry(opToDelete);
                }
              }

              // Update!
              self.update();
            },
          });
        };

        // For each chain op, put in that entry
        for (var i = 0; i < self.chainOps.length; i++) {
          var chainOp = self.chainOps[i];
          self._makeChainEntry(chainOp);
        }
      },
      onget: function(my) {
        // no variables?
        if (my.op.noVariables) {
          return _old.onget(my);
        }

        ////////////////

        var nums_and_ops = []; // just gets chain of nums & ops

        // EVALUATE EACH ELEMENT FIRST
        for (var i = 0; i < my.data.chain.length; i += 2) {
          // Synched indices!
          var chainOp = my.op.chainOps[i];

          // Evaluate element
          var num;
          switch (chainOp.type) {
            case "number_raw":
              num = chainOp.get(my.target);
              break;
            case "variableName":
              var _variables = my.target._variables;
              var varname = chainOp.get(my.target); // it's just a synchronized string
              num = _variables[varname];
              break;
          }

          // Any operator before it?
          if (i > 0) {
            var operandOp = my.op.chainOps[i - 1];
            var op = operandOp.get();
            nums_and_ops.push(op);
          }

          // Push num
          nums_and_ops.push(num);
        }

        // MULTIPLICATION AND DIVISION FIRST. LEFT-ASSOCIATIVE
        for (var i = 1; i < nums_and_ops.length; i += 2) {
          var op = nums_and_ops[i];
          if (op == "*" || op == "/") {
            // Do math to the two numbers
            var num1 = nums_and_ops[i - 1];
            var num2 = nums_and_ops[i + 1];
            var res;
            if (op == "*") res = num1 * num2;
            else res = num1 / num2;

            // Modify array, and set index back
            // remove 3 items: num1, op, num2
            // replace with 1 item: result
            nums_and_ops.splice(i - 1, 3, res);
            i -= 2;
          } else {
            continue;
          }
        }

        // NOW DO ADDITION AND SUBTRACTION
        for (var i = 1; i < nums_and_ops.length; i += 2) {
          var op = nums_and_ops[i];
          if (op == "+" || op == "-") {
            // Do math to the two numbers
            var num1 = nums_and_ops[i - 1];
            var num2 = nums_and_ops[i + 1];
            var res;
            if (op == "+") res = num1 + num2;
            else res = num1 - num2;

            // Modify array, and set index back
            // remove 3 items: num1, op, num2
            // replace with 1 item: result
            nums_and_ops.splice(i - 1, 3, res);
            i -= 2;
          } else {
            continue;
          }
        }

        return nums_and_ops[0];
      },
    };
  });

  /****************

	Set a variable to some number.

	****************/
  Joy.add({
    name: "Set [number]",
    type: "math/set",
    tags: ["math", "op"],
    init:
      "Set {id:'varname', type:'variableName', variableType:'number'} to {id:'value', type:'number'}",
    onexecute: function(my) {
      var _variables = my.target._variables;
      var varname = my.data.varname; // it's just a synchronized string
      _variables[varname] = my.data.value; // Set the variable
    },
  });

  /****************

	Do math on some variable

	****************/
  Joy.add({
    name: "Do math to [number]",
    type: "math/operation",
    tags: ["math", "op"],

    init:
      JSON.stringify({
        id: "operation",
        type: "choose",
        placeholder: "+",
        options: [
          { label: "+ Increase", value: "+" },
          { label: "- Decrease", value: "-" },
          { label: "&times; Multiply", value: "*" },
          { label: "&divide; Divide", value: "/" },
        ],
      }) +
      " {id:'varname', type:'variableName', variableType:'number', startWithExisting:true}" +
      " by {id:'value', type:'number'}",

    onexecute: function(my) {
      var vars = my.target._variables;
      var varname = my.data.varname;
      if (vars[varname] === undefined) vars[varname] = 0; // Set to 0, if nothing's there.

      switch (my.data.operation) {
        case "+":
          vars[varname] += my.data.value;
          break;
        case "-":
          vars[varname] -= my.data.value;
          break;
        case "*":
          vars[varname] *= my.data.value;
          break;
        case "/":
          vars[varname] /= my.data.value;
          break;
      }
    },
  });

  /****************

	If then... for math

	****************/
  Joy.add({
    name: "If [math] then...",
    type: "math/if",
    tags: ["math", "op"],
    init:
      "If {id:'value1', type:'number'} " +
      "{id:'test', type:'choose', options:['<','≤','=','≥','>'], placeholder:'='} " +
      "{id:'value2', type:'number'}, then: " +
      "{id:'ops', type:'ops', resetVariables:false}",
    onexecute: function(my) {
      var value1 = my.data.value1;
      var value2 = my.data.value2;

      var result;
      switch (my.data.test) {
        case "<":
          result = value1 < value2;
          break;
        case "≤":
          result = value1 <= value2;
          break;
        case "=":
          result = value1 == value2;
          break;
        case "≥":
          result = value1 >= value2;
          break;
        case ">":
          result = value1 > value2;
          break;
      }

      if (result) {
        var message = my.op.ops.execute(my.target);
        if (message == "STOP") return message; // STOP
      }
    },
  });
});
Joy.module("random", function() {
  Joy.add({
    name: "With a X% chance...",
    type: "random/if",
    tags: ["random", "op"],
    init:
      "With a {id:'chance', type:'number', min:0, max:100, placeholder:50}% chance, do:" +
      "{id:'ops', type:'ops', resetVariables:false}",
    onexecute: function(my) {
      var probability = my.data.chance / 100;
      if (Math.random() < probability) {
        var message = my.op.ops.execute(my.target);
        if (message == "STOP") return message; // STOP
      }
    },
  });

  /****************

	Set a variable to some number.

	****************/
  Joy.add({
    name: "Set random [number]",
    type: "random/set",
    tags: ["random", "op"],
    init:
      "Set {id:'varname', type:'variableName', variableType:'number'} to a random " +
      "{id:'numtype', type:'choose', options:['number','integer'], placeholder:'number'} between " +
      "{id:'min', type:'number', placeholder:1} and {id:'max', type:'number', placeholder:100}",
    onexecute: function(my) {
      var _variables = my.target._variables;
      var varname = my.data.varname; // it's just a synchronized string

      var _min = my.data.min;
      var _max = my.data.max;
      var min = Math.min(_min, _max); // just in case
      var max = Math.max(_min, _max); // just in case

      var randomValue;
      if (my.data.numtype == "integer") {
        randomValue = min + Math.floor(Math.random() * (max - min + 1));
      } else {
        randomValue = min + Math.random() * (max - min);
      }
      _variables[varname] = randomValue; // Set the variable
    },
  });
});

export { Joy };
