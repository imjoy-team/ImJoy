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
          '/tmp': { fs: "InMemory", options: {storeName: 'tmp'} },
          '/home': { fs: "IndexedDB", options: {storeName: 'home'} },
          // '/mnt/h5': { fs: "HTML5FS", options: {} }
        }
      }, (e) => {
        if (e) {
          reject(e)
          return
        }
        this.fs = BrowserFS.BFSRequire('fs')
        resolve(this.fs)
      });
    })
  }
  destroy(){

  }
}
