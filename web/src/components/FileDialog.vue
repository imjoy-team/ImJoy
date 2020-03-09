<template>
  <md-dialog
    :md-active.sync="show_"
    :md-click-outside-to-close="false"
    :md-close-on-esc="false"
  >
    <md-dialog-title
      >{{ this.options.title || "ImJoy File Dialog" }}
      <md-button
        class="md-accent"
        style="position:absolute; top:8px; right:5px;"
        @click="
          show_ = false;
          reject('file dialog canceled by the user.');
        "
        ><md-icon>clear</md-icon></md-button
      >
    </md-dialog-title>
    <md-dialog-content>
      <md-button
        style="text-transform: none;"
        v-show="show_all_file_managers && file_manager.connected"
        :key="file_manager.id"
        v-for="file_manager in file_managers"
        :class="selected_file_manager === file_manager ? 'md-raised' : ''"
        @click="selectFileManager(file_manager)"
      >
        {{ file_manager.name }}
      </md-button>
      <div class="loading-info">
        <h5 v-if="dropping">Drop files to upload to {{ root }}</h5>
      </div>
      <ul
        :disabled="!selected_file_manager || !selected_file_manager.connected"
        :class="dropping ? 'dropping-files' : ''"
        v-if="selected_file_manager && file_tree"
      >
        <file-item
          :model="file_tree"
          :file_manager="selected_file_manager"
          :root="root"
          :selected="file_tree_selection"
          @load="loadFile"
          @select="fileTreeSelected"
          @select_append="fileTreeSelectedAppend"
        >
        </file-item>
      </ul>
      <div
        class="loading loading-lg"
        v-else-if="selected_file_manager && selected_file_manager.connected"
      ></div>
      <p v-else>
        No file manager is available.
      </p>
    </md-dialog-content>

    <md-dialog-actions>
      <md-menu style="flex: auto;">
        <md-button class="md-button md-primary" md-menu-trigger>
          <md-icon>menu</md-icon>options
        </md-button>
        <md-menu-content>
          <md-menu-item class="md-primary" @click="go()">
            <md-icon>forward</md-icon> Go to Folder
          </md-menu-item>
          <md-menu-item
            v-show="file_tree_selection_info"
            class="md-primary"
            @click="downloadFiles()"
          >
            <md-icon>cloud_download</md-icon> Download
          </md-menu-item>
          <md-menu-item
            v-show="file_tree_selection_info"
            class="md-accent"
            @click="remove()"
          >
            <md-icon>delete</md-icon> Delete
          </md-menu-item>
        </md-menu-content>
      </md-menu>
      <p style="flex: auto;" class="md-small-hide" v-if="status_text">
        {{ status_text.slice(0, 100) }}
      </p>
      <md-button
        class="md-primary"
        :disabled="!file_tree_selection"
        @click="
          show_ = false;
          resolve(file_tree_selection);
        "
        >OK
        <md-tooltip class="md-small-hide" v-if="file_tree_selection"
          >Selected: {{ file_tree_selection }}</md-tooltip
        >
      </md-button>
      <md-button
        class="md-primary"
        @click="
          show_ = false;
          reject('file dialog canceled by the user.');
        "
        >Cancel</md-button
      >
    </md-dialog-actions>
    <md-progress-bar
      md-mode="determinate"
      v-show="loading"
      :md-value="loading_progress"
    ></md-progress-bar>
  </md-dialog>
</template>
<script>
import { utils  } from "imjoy-core";

export default {
  name: "file-dialog",
  props: {
    file_managers: Array,
    uploadFileToUrl: Function,
  },
  data: function() {
    return {
      root: null,
      options: {},
      show_: false,
      file_tree_selection: null,
      file_tree_selection_info: null,
      file_tree: null,
      resolve: null,
      reject: null,
      selected_file_manager: null,
      show_all_file_managers: true,
      dropping: false,
      loading: false,
      status_text: "Drag and drop here to upload files",
      loading_progress: 0,
    };
  },
  created() {
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
    if (this.event_bus) {
      this.event_bus.on("drag_upload_enter", this.showDropping);
      this.event_bus.on("drag_upload_leave", this.hideDropping);
      this.event_bus.on("drag_upload", this.uploadFiles);
    }
  },
  beforeDestroy() {
    if (this.event_bus) {
      this.event_bus.off("drag_upload_enter", this.showDropping);
      this.event_bus.off("drag_upload_leave", this.hideDropping);
      this.event_bus.off("drag_upload", this.uploadFiles);
    }
  },
  computed: {
    no_file_manager_available: function() {
      if (!this.file_managers) return true;
      else {
        let file_manager_available = false;
        for (let file_manager of this.file_managers) {
          if (file_manager.connected) {
            file_manager_available = true;
            break;
          }
        }
        return !file_manager_available;
      }
    },
  },
  methods: {
    async upload(f, progress_text) {
      if (!this.show_) {
        return;
      }
      this.status_text = "requesting upload url from the file_manager...";
      const url = await this.selected_file_manager.requestUploadUrl({
        dir: this.root,
        path: f.relativePath,
        overwrite: true,
        file_manager: this.selected_file_manager.url,
      });
      console.log("loading file to url", url);
      this.status_text = progress_text;
      const ret = await this.uploadFileToUrl(null, {
        file: f,
        url: url,
        progress: (uploaded, total) => {
          this.loading_progress = (uploaded * 100) / total;
          this.status_text =
            progress_text + ` (${Math.round(this.loading_progress)}%)`;
          this.$forceUpdate();
        },
      });
      this.status_text = `file uploaded to ${ret.path}.`;
    },
    async uploadFiles(files) {
      this.status_text = "Uploading...";
      this.loading = true;
      try {
        for (let i = 0; i < files.length; i++) {
          if (files[i].name.startsWith(".")) {
            console.log("skipping file: " + files[i].relativePath);
            continue;
          }
          if (this.selected_file_manager.putFile) {
            this.status_text = `Uploading ${i + 1}/${files.length}: ${
              files[i].name
            }`;
            await this.selected_file_manager.putFile(
              files[i],
              utils.pathJoin(this.root, files[i].name)
            );
          } else {
            await this.upload(
              files[i],
              `Uploading ${i + 1}/${files.length}: ${files[i].name}`
            );
          }
        }
        this.status_text = `🎉Uploaded ${files.length} files.`;
      } catch (e) {
        this.status_text =
          "Failed to upload, error:" + (e ? e.toString() : "undefined");
      } finally {
        this.loading = false;
        this.refreshList();
      }
    },
    showDropping() {
      this.dropping = true;
      this.$forceUpdate();
    },
    hideDropping() {
      this.dropping = false;
      this.$forceUpdate();
    },
    fileTreeSelected(f) {
      if (this.options.type === "file" && f.target.type === "dir") return;
      this.file_tree_selection = f.path;
      this.file_tree_selection_info = f;
      this.$forceUpdate();
    },
    fileTreeSelectedAppend(f) {
      if (!Array.isArray(this.file_tree_selection)) {
        this.file_tree_selection = this.file_tree_selection
          ? [this.file_tree_selection]
          : [];
        this.file_tree_selection_info = this.file_tree_selection_info
          ? [this.file_tree_selection_info]
          : [];
      }
      this.file_tree_selection.push(f.path);
      this.file_tree_selection_info.push(f);
      this.$forceUpdate();
    },
    refreshList() {
      this.selected_file_manager
        .listFiles(this.root, this.options.type, this.options.recursive)
        .then(tree => {
          this.root = tree.path;
          this.file_tree = tree;
          this.$forceUpdate();
        });
    },
    go() {
      const path = prompt("Go to the folder", this.root);
      if (!path || path == this.root) return;
      this.selected_file_manager
        .listFiles(path, "dir", false)
        .then(tree => {
          this.root = tree.path;
          this.file_tree = tree;
          this.selected_file_manager
            .listFiles(tree.path, this.options.type, this.options.recursive)
            .then(tree => {
              this.root = tree.path;
              this.file_tree = tree;
              this.$forceUpdate();
            });
          this.$forceUpdate();
        })
        .catch(e => {
          alert(e.toString());
        });
    },
    loadFile(f) {
      if (f.target.type != "file") {
        if (f.path === this.root) {
          this.go();
          return;
        }
        this.selected_file_manager
          .listFiles(f.path, this.options.type, this.options.recursive)
          .then(tree => {
            this.root = tree.path;
            this.file_tree = tree;
            this.$forceUpdate();
          });
      } else {
        this.show_ = false;
        if (
          this.options.mode === "single" &&
          typeof this.file_tree_selection === "object"
        ) {
          this.resolve(this.file_tree_selection[0]);
        } else if (
          this.options.mode === "multiple" &&
          typeof this.file_tree_selection === "string"
        ) {
          this.resolve([this.file_tree_selection]);
        } else {
          this.resolve(this.file_tree_selection);
        }
      }
    },
    showDialog(_plugin, options) {
      this.show_ = true;
      this.options = options;
      this.options.title = this.options.title || "ImJoy File Dialog";
      this.options.root = this.options.root || "./";
      this.options.mode = this.options.mode || "single|multiple";
      this.options.uri_type = this.options.uri_type || "path";
      this.options.return_object =
        this.options.return_object === undefined
          ? true
          : this.options.return_object;
      this.$nextTick(() => {
        if (this.options.file_manager) {
          this.selected_file_manager = this.options.file_manager;
        } else {
          this.selected_file_manager = this.file_managers[0];
        }
        this.refreshList();
      });

      if (this.options.type != "file" && this.options.root) {
        this.file_tree_selection = this.options.root;
      } else {
        this.file_tree_selection = null;
      }
      return new Promise((resolve2, reject2) => {
        if (this.options.uri_type === "path") {
          // user selected
          this.resolve = path => {
            if (this.options.return_object) {
              resolve2({
                path: path,
                file_manager: this.selected_file_manager.url,
              });
            } else {
              resolve2(path);
            }
          };
          // if user cancelled
          this.reject = () => {
            if (this.options.return_object) {
              resolve2(null);
            } else {
              reject2("User cancelled selection.");
            }
          };
        } else if (this.options.uri_type === "url") {
          // if user cancelled
          this.reject = () => {
            if (this.options.return_object) {
              resolve2(null);
            } else {
              reject2("User cancelled selection.");
            }
          };
          // user selected
          this.resolve = paths => {
            if (typeof paths === "string") {
              this.selected_file_manager
                .getFileUrl({
                  path: paths,
                  file_manager: this.selected_file_manager.url,
                })
                .then(url => {
                  if (this.options.return_object) {
                    resolve2({
                      type: "imjoy/url",
                      url: url,
                      file_manager: this.selected_file_manager.url,
                      path: paths,
                    });
                  } else {
                    resolve2(url);
                  }
                })
                .catch(reject2);
            } else {
              const ps = [];
              for (let path of paths) {
                ps.push(
                  this.selected_file_manager.getFileUrl({
                    path: path,
                    file_manager: this.selected_file_manager.url,
                  })
                );
              }
              Promise.all(ps)
                .then(urls => {
                  if (this.options.return_object) {
                    resolve2({
                      type: "imjoy/url",
                      url: urls,
                      file_manager: this.selected_file_manager.url,
                      path: paths,
                    });
                  } else {
                    resolve2(urls);
                  }
                })
                .catch(reject2);
            }
          };
        } else {
          reject2("unsupported uri_type: " + this.options.uri_type);
        }
        this.root = this.options.root;
        if (this.show_all_file_managers) {
          for (let e of this.file_managers) {
            if (e.connected) {
              this.selectFileManager(e);
              break;
            }
          }
        } else {
          this.selectFileManager(this.selected_file_manager);
        }
        this.dropping = false;
        this.loading_progress = 0;
        this.status_text = "Drag and drop here to upload files";
      });
    },
    selectFileManager(file_manager) {
      return new Promise((resolve, reject) => {
        this.selected_file_manager = file_manager;
        this.file_tree = null;
        this.$forceUpdate();
        this.selected_file_manager
          .listFiles(
            this.options.root,
            this.options.type,
            this.options.recursive
          )
          .then(tree => {
            this.root = tree.path;
            this.file_tree = tree;
            this.$forceUpdate();
            resolve();
          })
          .catch(reject);
      });
    },
    async remove() {
      let files = [];
      try {
        if (!this.file_tree_selection_info) {
          throw "no file selected";
        }
        if (Array.isArray(this.file_tree_selection_info)) {
          files = this.file_tree_selection_info;
        } else {
          files = [this.file_tree_selection_info];
        }
        // clear selection
        this.file_tree_selection = null;
        this.file_tree_selection_info = null;
        for (let f of files) {
          await this.selected_file_manager.removeFile(
            f.path,
            f.target.type,
            this.options.recursive
          );
          this.status_text = `"${f.target.name}" has been removed.`;
        }
        this.refreshList();
      } catch (e) {
        this.status_text = `Error occured when removing file or folder: ${e}`;
      }
    },
    async downloadFiles() {
      let files = [];
      if (!this.file_tree_selection_info) {
        throw "no file selected";
      }
      if (Array.isArray(this.file_tree_selection_info)) {
        files = this.file_tree_selection_info;
      } else {
        files = [this.file_tree_selection_info];
      }
      for (let i = 0; i < files.length; i++) {
        if (files[i].target.type === "file") {
          this.download(
            files[i],
            `downloading ${i + 1}/${files.length}: ${files[i].target.name}`
          );
        } else {
          this.status_text =
            "Folder cannot be downloaded, please select files.";
        }
      }
    },
    async download(f, progress_text) {
      if (!this.show_) {
        return;
      }
      this.status_text = "requesting upload url from the file_manager...";
      const url = await this.selected_file_manager.getFileUrl({
        path: f.path,
        file_manager: this.selected_file_manager,
      });
      this.status_text = progress_text;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.download = f.name;
      anchor.click();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-dialog {
  max-width: 1024px;
  min-width: 50%;
}
p {
  margin-bottom: 2px !important;
}
.loading-info {
  margin-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

ul {
  list-style: none outside !important;
  margin: 0.1rem 0 0.1rem 1.2rem;
}

span {
  margin: 3px;
}

.dropping-files {
  background: #cad8ef !important;
}

ol li,
ul li {
  margin-top: 0px;
}
</style>
