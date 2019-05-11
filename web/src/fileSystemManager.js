import * as BrowserFS from "browserfs";

const ArrayBufferView = Object.getPrototypeOf(
  Object.getPrototypeOf(new Uint8Array())
).constructor;

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
