import { randId, assert } from "./utils.js";

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
