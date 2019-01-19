import * as BrowserFS from 'browserfs'

export class FileSystemManager {
  constructor(){
    this.fs = null
  }
  init(){
    return new Promise((resolve, reject)=>{
      BrowserFS.configure({
        fs: "MountableFileSystem",
        options: {
          '/tmp': { fs: "InMemory" },
          '/home': { fs: "IndexedDB" },
          '/mnt/h5': { fs: "HTML5FS" }
        }
      }, function(e) {
        if (e) {
          reject(e)
        }
        const fs = BrowserFS.BFSRequire('fs');
        resolve(fs)
      });
    })
  }
}
