import * as BrowserFS from "browserfs";

import { randId, assert } from "./utils.js";

const ArrayBufferView = Object.getPrototypeOf(
  Object.getPrototypeOf(new Uint8Array())
).constructor;

//TODO: deprecate the file system manager, use the plugin stead
export class FileSystemManager {
  constructor() {
    this.fs = null;
    this.path = null;
    this.buffer = null;
    this.api = {};
  }
  init() {
    return new Promise((resolve, reject) => {
      BrowserFS.configure(
        {
          fs: "MountableFileSystem",
          options: {
            "/tmp": { fs: "InMemory", options: { storeName: "tmp" } },
            "/home": { fs: "IndexedDB", options: { storeName: "home" } },
            // '/mnt/h5': { fs: "HTML5FS", options: {} }
          },
        },
        e => {
          if (e) {
            reject(e);
            return;
          }
          const _fs = BrowserFS.BFSRequire("fs");
          const buffer = BrowserFS.BFSRequire("buffer");

          //convert arraybuffer to Buffer
          var convert = function(fn) {
            return function() {
              console.warn(
                'WARNING: `api.fs` is deprecated since api_version >= 0.1.7, please use `const ps = await api.getPlugin("BrowserFS"); const fs = ps.fs;` instead.'
              );
              const args = Array.prototype.slice.call(arguments);
              const newargs = [];
              for (let arg of args) {
                if (arg instanceof ArrayBuffer) {
                  newargs.push(buffer.Buffer(arg));
                } else if (arg instanceof ArrayBufferView) {
                  newargs.push(buffer.Buffer(arg.buffer));
                } else {
                  newargs.push(arg);
                }
              }
              return fn.apply(this, newargs);
            };
          };

          this.fs = {};
          for (let k in _fs) {
            this.fs[k] = convert(_fs[k]);
          }

          this.path = BrowserFS.BFSRequire("path");
          this.api = { fs: this.fs, path: this.path };

          resolve(this.fs);
        }
      );
    });
  }
  destroy() {}
}

export class FileManager {
  constructor({ event_bus = null, client_id = null }) {
    this.event_bus = event_bus;
    assert(this.event_bus);
    this.client_id = client_id || randId();
    this.fileManagers = [];
  }

  async init() {}

  getFileManagerByName(name) {
    for (let fm of this.fileManagers) {
      if (fm.name === name) {
        return fm;
      }
    }
    return null;
  }

  getFileManagerByUrl(url) {
    for (let fm of this.fileManagers) {
      if (fm.url === url) {
        return fm;
      }
    }
    return null;
  }

  async register(manager_) {
    const manager = Object.assign({}, manager_);
    //backup the manager api
    manager.api = manager_;
    for (let i = 0; i < this.fileManagers.length; i++) {
      if (this.fileManagers[i].name === manager.name) {
        this.fileManagers.splice(i, 1);
        break;
      }
    }
    manager.connected = false;
    const check_connectivity = async () => {
      manager.connected = await manager.heartbeat();
    };
    await check_connectivity();
    manager.heart_beat_timer = setInterval(check_connectivity, 10000);
    this.fileManagers.push(manager);
  }

  unregister(manager) {
    manager = this.getFileManagerByUrl(manager.url);
    const index = this.fileManagers.indexOf(manager);
    if (index > -1) {
      this.fileManagers.splice(index, 1);
    }
    if (manager.heart_beat_timer) {
      clearInterval(manager.heart_beat_timer);
    }
  }

  destroy() {
    for (let e of this.fileManagers) {
      e.destroy();
    }
  }
}
