var fs = require("fs");
var path = require("path");
var pluginParser = require("./pluginParser");

var repository_dir = "./";
var collections_dir = "./collections";
var manifest_path = "./manifest.imjoy.json";
var repo_version = "0.2.0";

var default_repo_name = "ImJoy Repository";
var default_repo_description = "ImJoy plugin repository.";
var default_uri_root = "";

function parsePlugin(code) {
  var pluginComp = pluginParser.parseComponent(code);
  if (pluginComp && pluginComp.config && pluginComp.config.length > 0) {
    var config = {};
    config = JSON.parse(pluginComp.config[0].content);
    return config;
  } else {
    return null;
  }
}

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {
  var fs = fs || require("fs"),
    files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else if (file.endsWith(".imjoy.html")) {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

function get_plugins(files) {
  var plugin_configs = [];
  // Loop through all the files in the temp directory
  files.forEach(function(file) {
    var plugin_path = path.join(repository_dir, file);
    if (plugin_path.endsWith(".imjoy.html")) {
      // console.log("reading '%s'...", plugin_path);
      var code = fs.readFileSync(plugin_path, "utf8");
      var config = parsePlugin(code);
      config.uri = file;
      plugin_configs.push(config);
    }
  });
  return plugin_configs;
}

function get_collections(collections_dir) {
  return new Promise((resolve, reject) => {
    var collection_configs = [];
    if (!fs.existsSync(collections_dir)) {
      reject("collection folder not exists");
      return;
    }
    // Loop through all the files in the temp directory
    fs.readdir(collections_dir, function(err, files) {
      if (err) {
        console.error("Could not list the directory.", err);
        reject(err);
        return;
      }
      files.forEach(function(file) {
        var collection_path = path.join(collections_dir, file);
        if (collection_path.endsWith(".json")) {
          // console.log("reading '%s'...", plugin_path);
          var coll = fs.readFileSync(collection_path, "utf8");
          coll = JSON.parse(coll);
          coll.plugins.forEach(function(p) {
            var dep = p.split(":");
            var ps = plugin_configs.filter(function(plugin) {
              return plugin.name == dep[0];
            });
            if (ps.length != 1) {
              throw "Plugin does not exits in the repository: '" +
                dep[0] +
                "' plugin from " +
                collection_path;
            }
          });
          collection_configs.push(coll);
          console.log("Adding collection ====>", coll.name);
        }
      });
      resolve(collection_configs);
    });
  });
}

function write_manifest(plugin_configs, collection_configs) {
  console.log(
    "Writing %s plugins into '%s'",
    plugin_configs.length,
    manifest_path
  );
  var repo_manifest = {};
  if (fs.existsSync(manifest_path)) {
    try {
      repo_manifest = JSON.parse(fs.readFileSync(manifest_path));
    } catch (e) {
      console.log(
        "Error occured when reading the old manifest file, please make sure the format is correct or remove the old one. Error: " +
          e.toString()
      );
    }
  }
  repo_manifest.name = repo_manifest.name || default_repo_name;
  repo_manifest.description =
    repo_manifest.description || default_repo_description;
  repo_manifest.uri_root = default_uri_root;
  repo_manifest.version = repo_version;
  repo_manifest.plugins = plugin_configs || [];
  repo_manifest.collections = collection_configs || [];
  var stream = fs.createWriteStream(manifest_path);
  stream.once("open", function() {
    stream.write(JSON.stringify(repo_manifest, null, " "));
    stream.end();
  });
  console.log("manifest file updated!");
}

var files = walkSync(repository_dir);
var plugin_configs = get_plugins(files);

get_collections(collections_dir)
  .then(collection_configs => {
    write_manifest(plugin_configs, collection_configs);
  })
  .catch(() => {
    write_manifest(plugin_configs);
  });
