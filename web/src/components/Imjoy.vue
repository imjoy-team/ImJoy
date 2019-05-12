<template>
  <div class="imjoy noselect">
    <md-app>
      <md-app-toolbar class="md-dense" md-elevation="0">
        <div class="md-toolbar-section-start">
          <md-button
            v-if="!menuVisible"
            class="md-primary md-icon-button"
            @click="menuVisible = true"
          >
            <md-icon>menu</md-icon>
          </md-button>
          <md-button
            @click="$router.push('/')"
            v-if="!menuVisible"
            class="md-small-hide site-title-small"
          >
            <img
              class="site-title-small"
              src="static/img/imjoy-logo-black.svg"
              alt="ImJoy"
            />
            <md-tooltip>ImJoy home</md-tooltip>
          </md-button>
          <md-button v-if="workspace_dropping" class="status-text">
            Drop files to the workspace.
          </md-button>
          <md-button
            v-else-if="status_text && status_text.length"
            class="status-text md-small-hide"
            @click="showAlert(null, status_text)"
            :class="status_text.includes('rror') ? 'error-message' : ''"
          >
            {{
              status_text.slice(0, 80) + (status_text.length > 80 ? "..." : "")
            }}
          </md-button>
          <span class="subheader-title md-medium-hide" style="flex: 1" v-else
            >Deploying Deep Learning Made Easy!</span
          >
        </div>
        <md-snackbar
          md-position="center"
          class="md-accent"
          :md-active.sync="show_snackbar"
          :md-duration="snackbar_duration"
        >
          <span>{{ snackbar_info }}</span>
          <md-button class="md-accent" @click="show_snackbar = false"
            >close</md-button
          >
        </md-snackbar>

        <div class="md-toolbar-section-end">
          <md-button
            class="md-icon-button md-accent"
            v-if="wm.selected_window && wm.selected_window.standalone"
            @click="wm.closeWindow(wm.selected_window)"
          >
            <md-icon>close</md-icon>
            <md-tooltip
              >Close window:
              {{
                wm.selected_window.name.slice(0, 30) +
                  "(#" +
                  wm.selected_window.index +
                  ")"
              }}</md-tooltip
            >
          </md-button>
          <md-menu
            v-if="
              wm.selected_window &&
                wm.selected_window.standalone &&
                wm.selected_window.loaders.length > 0
            "
            md-size="big"
            md-direction="bottom-end"
          >
            <md-button class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>more_vert</md-icon>
              <md-tooltip
                >Current window:
                {{
                  wm.selected_window.name.slice(0, 30) +
                    "(#" +
                    wm.selected_window.index +
                    ")"
                }}</md-tooltip
              >
            </md-button>
            <md-menu-content>
              <md-menu-item :disabled="true">
                {{
                  wm.selected_window.name.slice(0, 30) +
                    "(#" +
                    wm.selected_window.index +
                    ")"
                }}
              </md-menu-item>
              <!-- <md-menu-item @click.stop="duplicate(wm.selected_window)">
              <span>Duplicate</span>
              <md-icon>filter</md-icon>
            </md-menu-item> -->
              <!-- <md-menu-item @click="wm.closeWindow(wm.selected_window);">
              <span>Close</span>
              <md-icon>close</md-icon>
            </md-menu-item> -->
              <md-menu-item
                v-for="(loader, name) in wm.selected_window.loaders"
                :key="name"
                @click="
                  wm.registered_loaders &&
                    wm.registered_loaders[loader](wm.selected_window.data)
                "
              >
                <span>{{ name }}</span>
                <md-icon>play_arrow</md-icon>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
          <md-button
            @click="wm.selectWindow(w)"
            :disabled="wm.selected_window === w"
            v-for="(w, i) in wm.windows.slice(0, max_window_buttons)"
            :key="w.id"
            class="md-icon-button"
          >
            <md-icon>{{ "filter_" + (i + 1) }}</md-icon>
            <md-tooltip>{{
              w.name.slice(0, 30) + "(#" + w.index + ")"
            }}</md-tooltip>
          </md-button>
          <md-menu v-if="wm.windows.length > max_window_buttons">
            <md-button
              v-if="max_window_buttons >= 9"
              class="md-icon-button md-primary"
              md-menu-trigger
            >
              <md-icon>filter_9_plus</md-icon>
            </md-button>
            <md-button v-else class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>filter</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item
                @click="wm.selectWindow(w)"
                :disabled="wm.selected_window === w"
                v-for="w in wm.windows.slice(max_window_buttons)"
                :key="w.id"
              >
                <span>{{ w.name.slice(0, 30) + "(#" + w.index + ")" }}</span
                ><md-icon>forward</md-icon>
              </md-menu-item>
              <md-divider></md-divider>
              <md-menu-item
                @click="wm.closeAll()"
                v-if="wm.window_mode !== 'grid'"
                class="md-accent"
              >
                <md-icon>cancel</md-icon><span>Close All</span>
                <md-tooltip>Close all windows</md-tooltip>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
          <md-menu v-if="wm.window_mode === 'grid' && wm.windows.length > 0">
            <md-button class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>picture_in_picture</md-icon>
              <md-tooltip>Workspace</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item
                :disabled="!wm.selected_window"
                @click="wm.selected_window = null"
                :class="wm.selected_window ? 'md-primary' : ''"
              >
                <md-icon>picture_in_picture</md-icon><span>Workspace</span>
              </md-menu-item>
              <md-menu-item @click="wm.closeAll()" class="md-accent">
                <md-icon>cancel</md-icon><span>Close All</span>
                <md-tooltip>Close all windows</md-tooltip>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
          <engine-control-panel :engine-manager="em" />
          <md-menu>
            <md-button
              v-if="latest_version && !is_latest_version"
              class="md-icon-button md-accent"
              md-menu-trigger
            >
              <md-icon>error_outline</md-icon>
            </md-button>
            <md-button v-else class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>details</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="showSettingsDialog = true" :disabled="true">
                <md-icon>settings</md-icon>Settings
              </md-menu-item>
              <md-menu-item href="/docs/" target="_blank" class="md-primary">
                <md-icon>library_books</md-icon>Documentation
              </md-menu-item>
              <md-menu-item
                href="https://github.com/oeway/ImJoy"
                target="_blank"
                class="md-primary"
              >
                <md-icon>code</md-icon>Github
              </md-menu-item>
              <md-menu-item
                href="https://forum.image.sc/tags/imjoy"
                target="_blank"
                class="md-primary"
              >
                <md-icon>help</md-icon>Help
              </md-menu-item>
              <md-menu-item @click="showAboutDialog = true" class="md-primary">
                <md-icon>info</md-icon>About
              </md-menu-item>
              <md-menu-item>
                <md-icon v-if="latest_version && is_latest_version"
                  >check</md-icon
                >
                <md-icon v-else>error_outline</md-icon>
                <div
                  @click.stop="checkUpdate"
                  style="width: 100%;cursor: pointer;"
                >
                  <div
                    v-if="checking"
                    style="left: -30px"
                    class="loading loading-lg"
                  ></div>
                  <img v-else-if="version_badge_url" :src="version_badge_url" />
                  <span v-else>ImJoy v{{ imjoy_version }}</span>
                </div>

                <md-tooltip>click to check updates</md-tooltip>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
        </div>
        <form v-show="false" ref="folder_form">
          <input
            class="md-file"
            type="file"
            @change="selectFileChanged"
            ref="folder_select"
            webkitdirectory
            mozdirectory
            msdirectory
            odirectory
            directory
            multiple
          />
        </form>
        <form v-show="false" ref="file_form">
          <input
            class="md-file"
            type="file"
            @change="selectFileChanged"
            ref="file_select"
            multiple
          />
        </form>
      </md-app-toolbar>
      <md-app-drawer
        :md-active.sync="menuVisible"
        @md-closed="wm.resizeAll()"
        @md-opened="wm.resizeAll()"
        md-persistent="full"
      >
        <div class="md-toolbar-row title-bar">
          <div class="md-toolbar-section-start">
            <md-button
              class="site-button site-title"
              @click="$router.push('/')"
            >
              <img
                class="site-title"
                src="static/img/imjoy-logo-black.svg"
                alt="ImJoy"
              />
            </md-button>
            <span class="superscript md-small-hide">beta</span>
          </div>
          <div class="md-toolbar-section-end" v-if="pm">
            <md-menu>
              <md-button class="md-icon-button md-primary" md-menu-trigger>
                <md-icon>widgets</md-icon>
                <md-tooltip
                  >Current workspace: {{ pm.selected_workspace }}</md-tooltip
                >
              </md-button>
              <md-menu-content>
                <md-menu-item
                  @click="switchWorkspace(w)"
                  :disabled="w === pm.selected_workspace"
                  v-for="w in pm.workspace_list"
                  :key="w"
                >
                  <span>{{ w }}</span
                  ><md-icon>forward</md-icon>
                  <md-tooltip>Switch to workspace: {{ w }} </md-tooltip>
                </md-menu-item>
                <md-divider></md-divider>
                <md-menu-item @click="showWorkspaceDialog = true">
                  <md-icon>view_list</md-icon>Workspaces
                </md-menu-item>
              </md-menu-content>
            </md-menu>

            <md-button
              class="md-icon-button md-dense md-raised"
              @click="menuVisible = !menuVisible"
            >
              <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
          </div>
        </div>
        <div
          v-if="!plugin_loaded"
          style="top: 10%;"
          class="loading loading-lg"
        ></div>
        <md-card id="plugin-menu" v-show="plugin_loaded" v-if="pm">
          <md-card-header>
            <md-menu md-size="big">
              <md-button
                :class="screenWidth > 600 ? '' : 'md-icon-button'"
                md-menu-trigger
              >
                <md-icon>folder_open</md-icon
                ><span class="md-xsmall-hide">Files</span>
              </md-button>
              <md-menu-content>
                <md-menu-item
                  @click="
                    showEngineFileDialog();
                    files_expand = false;
                  "
                  :disabled="em.engines.length <= 0"
                  class="md-button"
                >
                  <md-icon>add_to_queue</md-icon>Open Engine File
                  <md-tooltip>Load files through Plugin Engine</md-tooltip>
                </md-menu-item>
                <md-menu-item
                  @click="
                    $refs.file_form.reset();
                    $refs.file_select.click();
                    files_expand = false;
                  "
                  class="md-button"
                >
                  <md-icon>insert_drive_file</md-icon>Open File
                </md-menu-item>
                <md-menu-item
                  @click="
                    $refs.folder_form.reset();
                    $refs.folder_select.click();
                    files_expand = false;
                  "
                  class="md-button"
                >
                  <md-icon>folder_open</md-icon>Open Folder
                </md-menu-item>
              </md-menu-content>
            </md-menu>

            <md-menu md-size="big">
              <md-button
                :class="screenWidth > 600 ? '' : 'md-icon-button'"
                md-menu-trigger
              >
                <md-icon>format_list_bulleted</md-icon
                ><span class="md-xsmall-hide">Workflow</span>
              </md-button>
              <md-menu-content>
                <md-menu-item
                  @click="
                    clearWorkflow();
                    workflow_expand = true;
                  "
                >
                  <md-icon>playlist_add</md-icon>New Workflow
                </md-menu-item>
                <md-menu-item
                  @click="
                    workflow_expand = true;
                    loadWorkflow(w);
                  "
                  v-for="w in pm.workflow_list"
                  :key="w.name"
                >
                  <span>{{ w.name }}</span>
                  <md-button
                    @click.stop="shareWorkflow(w)"
                    class="md-icon-button"
                  >
                    <md-icon>share</md-icon>
                  </md-button>
                  <md-button
                    @click.stop="pm.removeWorkflow(w)"
                    class="md-icon-button md-accent"
                  >
                    <md-icon>clear</md-icon>
                  </md-button>
                </md-menu-item>
              </md-menu-content>
            </md-menu>

            <md-button
              ref="add_plugin_button"
              :class="pm.installed_plugins.length > 0 ? '' : 'md-primary'"
              @click="showPluginManagement()"
            >
              <md-icon>add</md-icon>Plugins
            </md-button>
          </md-card-header>
          <md-card-content>
            <div id="workflow-panel" v-show="workflow_expand" v-if="pm">
              <joy
                :config="workflow_joy_config"
                ref="workflow"
                v-if="plugin_loaded"
              ></joy>
              <p>
                <md-button
                  class="md-button"
                  v-if="plugin_loaded"
                  @click="runWorkflow(workflow_joy_config.joy)"
                >
                  <md-icon>play_arrow</md-icon>Run
                  <md-tooltip>run the workflow</md-tooltip>
                </md-button>
                <md-button
                  class="md-button"
                  v-if="plugin_loaded"
                  @click="pm.saveWorkflow(workflow_joy_config.joy)"
                >
                  <md-icon>save</md-icon>Save
                  <md-tooltip>save the workflow</md-tooltip>
                </md-button>
                <md-button @click="clearWorkflow()" class="md-accent">
                  <md-icon>clear</md-icon>Clear
                  <md-tooltip>Clear workflow</md-tooltip>
                </md-button>
              </p>
            </div>

            <div v-for="plugin in sortedRunnablePlugins()" :key="plugin.name">
              <md-divider></md-divider>
              <md-menu md-size="medium">
                <md-button
                  class="md-icon-button"
                  :class="plugin.running ? 'md-accent' : ''"
                  md-menu-trigger
                >
                  <md-progress-spinner
                    v-if="plugin.initializing"
                    class="md-accent"
                    :md-diameter="20"
                    md-mode="indeterminate"
                  ></md-progress-spinner>
                  <md-icon v-else-if="plugin.config.icon">{{
                    plugin.config.icon
                  }}</md-icon>
                  <md-icon v-else>extension</md-icon>
                  <md-tooltip>{{ plugin.config.description }}</md-tooltip>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click="showDoc(plugin.id)">
                    <md-icon>description</md-icon>Docs
                  </md-menu-item>
                  <md-menu-item
                    v-if="plugin.config.origin"
                    @click="sharePlugin(plugin.id)"
                  >
                    <md-icon>share</md-icon>Share
                  </md-menu-item>
                  <md-menu-item v-else @click="downloadPlugin(plugin.id)">
                    <md-icon>cloud_download</md-icon>Export
                  </md-menu-item>
                  <md-menu-item @click="editPlugin(plugin.id)">
                    <md-icon>edit</md-icon>Edit
                  </md-menu-item>
                  <md-menu-item @click="reloadPlugin(plugin.config)">
                    <md-icon>autorenew</md-icon>Reload
                  </md-menu-item>
                  <md-menu-item @click="unloadPlugin(plugin)">
                    <md-icon>clear</md-icon>Terminate
                  </md-menu-item>
                  <md-menu-item
                    v-if="plugin.config.origin"
                    @click="updatePlugin(plugin.id)"
                  >
                    <md-icon>cloud_download</md-icon>Update
                  </md-menu-item>
                  <md-menu-item
                    class="md-accent"
                    @click="
                      plugin2_remove = plugin;
                      showRemoveConfirmation = true;
                    "
                  >
                    <md-icon>delete_forever</md-icon>Remove
                  </md-menu-item>
                  <div v-if="plugin.config.type === 'native-python'">
                    <md-divider></md-divider>
                    <md-menu-item @click="switchEngine(plugin)">
                      <span v-if="plugin.config.engine_mode === 'auto'">✅</span
                      ><span v-else>🚀</span
                      ><span
                        :class="
                          plugin.config.engine_mode === 'auto' ? 'bold' : ''
                        "
                        >Auto</span
                      >
                    </md-menu-item>
                    <md-menu-item
                      v-for="engine in em.engines"
                      :key="engine.id"
                      @click="switchEngine(plugin, engine)"
                    >
                      <span v-if="plugin.config.engine_mode === engine.id"
                        >✅</span
                      ><span v-else>🚀</span
                      ><span
                        :class="
                          plugin.config.engine &&
                          plugin.config.engine.id === engine.id
                            ? 'bold'
                            : ''
                        "
                        >{{ engine.name }}</span
                      >
                    </md-menu-item>
                    <md-divider></md-divider>
                    <md-menu-item
                      v-for="tag in plugin.config.tags"
                      :key="tag"
                      @click="switchTag(plugin, tag)"
                    >
                      <span v-if="plugin.config.tag === tag">✅</span
                      ><span v-else>🔖</span
                      ><span :class="plugin.config.tag === tag ? 'bold' : ''"
                        >Tag: {{ tag }}</span
                      >
                    </md-menu-item>
                  </div>
                </md-menu-content>
              </md-menu>

              <md-button
                class="joy-run-button"
                :class="
                  plugin.running
                    ? 'busy-plugin'
                    : plugin._disconnected && plugin.type === 'native-python'
                    ? 'md-accent'
                    : 'md-primary'
                "
                :disabled="
                  plugin._disconnected && plugin.type != 'native-python'
                "
                @click="
                  plugin._disconnected
                    ? connectPlugin(plugin)
                    : runOp(plugin.ops[plugin.name])
                "
              >
                {{
                  plugin.type === "native-python"
                    ? plugin.name + " 🚀"
                    : plugin.type === "web-python" ||
                      plugin.type === "web-python-window"
                    ? plugin.name + " 🐍"
                    : plugin.name
                }}
              </md-button>

              <md-button
                v-if="plugin._log_history && plugin._log_history.length > 0"
                class="md-icon-button md-xsmall-hide"
                @click="showLog(plugin)"
              >
                <md-icon v-if="plugin._log_history._error" class="red"
                  >error</md-icon
                >
                <md-icon v-else>info</md-icon>
                <md-tooltip>{{
                  plugin._log_history._error || plugin._log_history._info
                }}</md-tooltip>
              </md-button>
              <md-button v-else class="md-icon-button md-xsmall-hide" disabled>
              </md-button>

              <md-button
                v-if="!plugin._disconnected"
                class="md-icon-button"
                @click="
                  plugin.panel_expanded = !plugin.panel_expanded;
                  $forceUpdate();
                "
              >
                <md-icon v-if="!plugin.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon>
              </md-button>
              <md-progress-bar
                md-mode="determinate"
                v-if="
                  (plugin.running || plugin.initializing) && plugin._progress
                "
                :md-value="plugin._progress"
              ></md-progress-bar>
              <div
                v-for="op in plugin.ops"
                :key="op.plugin_id + op.name"
                v-show="plugin.panel_expanded"
              >
                <md-button
                  v-if="op.name != plugin.name"
                  class="md-icon-button"
                  :disabled="true"
                >
                  <md-icon>chevron_right</md-icon>
                </md-button>
                <md-button
                  v-if="op.name != plugin.name"
                  class="joy-run-button md-primary op-button"
                  :class="plugin.running ? 'md-accent' : 'md-primary'"
                  :disabled="plugin._disconnected"
                  @click="runOp(op)"
                >
                  {{ op.name }}
                </md-button>

                <!-- <md-button class="md-icon-button" v-show="plugin.panel_expanded &&  op.name != plugin.name" @click="op.panel_expanded=!op.panel_expanded; $forceUpdate()"> -->
                <!-- <md-icon v-if="!op.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon> -->
                <!-- </md-button> -->

                <joy :config="op" :show="plugin.panel_expanded || false"></joy>
                <md-divider></md-divider>
              </div>
            </div>
            <md-divider></md-divider>
            <div>
              <div
                v-for="plugin in sortedNonRunnablePlugins()"
                :key="plugin.name"
              >
                <md-menu md-size="medium">
                  <md-button
                    class="md-icon-button"
                    :class="plugin.running ? 'md-accent' : ''"
                    md-menu-trigger
                  >
                    <md-progress-spinner
                      v-if="plugin.initializing"
                      class="md-accent"
                      :md-diameter="20"
                      md-mode="indeterminate"
                    ></md-progress-spinner>
                    <md-icon v-else-if="plugin.config.icon">{{
                      plugin.config.icon
                    }}</md-icon>
                    <md-icon v-else>extension</md-icon>
                    <md-tooltip>{{ plugin.config.description }}</md-tooltip>
                  </md-button>
                  <md-menu-content>
                    <md-menu-item @click="showDoc(plugin.id)">
                      <md-icon>description</md-icon>Docs
                    </md-menu-item>
                    <md-menu-item @click="sharePlugin(plugin.id)">
                      <md-icon>share</md-icon>Share
                    </md-menu-item>
                    <md-menu-item @click="editPlugin(plugin.id)">
                      <md-icon>edit</md-icon>Edit
                    </md-menu-item>
                    <md-menu-item @click="reloadPlugin(plugin.config)">
                      <md-icon>autorenew</md-icon>Reload
                    </md-menu-item>
                    <md-menu-item @click="unloadPlugin(plugin)">
                      <md-icon>clear</md-icon>Terminate
                    </md-menu-item>
                    <md-menu-item
                      v-if="plugin.config.origin"
                      @click="updatePlugin(plugin.id)"
                    >
                      <md-icon>cloud_download</md-icon>Update
                    </md-menu-item>
                    <md-menu-item
                      class="md-accent"
                      @click="
                        plugin2_remove = plugin;
                        showRemoveConfirmation = true;
                      "
                    >
                      <md-icon>delete_forever</md-icon>Remove
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>

                <md-button
                  class="joy-run-button"
                  :class="
                    plugin.running
                      ? 'busy-plugin'
                      : plugin._disconnected && plugin.type === 'native-python'
                      ? 'md-accent'
                      : ''
                  "
                  :disabled="
                    plugin.type != 'native-python' || !plugin._disconnected
                  "
                  @click="connectPlugin(plugin)"
                >
                  {{
                    plugin.type === "native-python"
                      ? plugin.name + " 🚀"
                      : plugin.name
                  }}
                </md-button>
                <md-button class="md-icon-button" :disabled="true">
                  <md-icon>visibility_off</md-icon>
                </md-button>
                <md-divider></md-divider>
              </div>
            </div>
            <md-divider></md-divider>
            <!-- <p v-if="pm.installed_plugins.length<=0">&nbsp;No plugin installed.</p> -->
            <md-empty-state
              id="plugin-empty-state"
              v-if="pm.installed_plugins.length <= 0"
              md-icon="extension"
              md-label="No plugin installed"
              md-description=""
            >
              <md-button
                ref="add_plugin_button"
                class="md-primary md-raised"
                @click="showPluginManagement()"
              >
                <md-icon>add</md-icon>Add Plugins
              </md-button>
            </md-empty-state>
          </md-card-content>
        </md-card>
      </md-app-drawer>
      <md-app-content
        :class="workspace_dropping ? 'file-dropping' : ''"
        class="whiteboard-content"
      >
        <md-progress-bar
          md-mode="determinate"
          :md-value="progress"
        ></md-progress-bar>
        <whiteboard
          v-if="wm"
          id="whiteboard"
          @create="createWindow($event)"
          :mode="wm.window_mode"
          :window-manager="wm"
        ></whiteboard>
      </md-app-content>
    </md-app>
    <md-dialog-confirm
      :md-active.sync="showRemoveConfirmation"
      md-title="Removing Plugin"
      md-content="Do you really want to <strong>delete</strong> this plugin"
      md-confirm-text="Yes"
      md-cancel-text="Cancel"
      @md-cancel="showRemoveConfirmation = false"
      @md-confirm="
        pm.removePlugin(plugin2_remove);
        plugin2_remove = null;
        showRemoveConfirmation = false;
      "
    />
    <md-dialog-alert
      :md-active.sync="alert_config.show"
      :md-title="alert_config.title"
      :md-content="alert_config.content"
      :md-confirm-text="alert_config.confirm_text"
    />

    <md-dialog-confirm
      :md-active.sync="confirm_config.show"
      :md-title="confirm_config.title"
      :md-content="confirm_config.content"
      :md-confirm-text="confirm_config.confirm_text"
      :md-cancel-text="confirm_config.canel_text"
      @md-confirm="confirm_config.confirm"
      @md-cancel="confirm_config.cancel"
    />

    <md-dialog-prompt
      :md-active.sync="prompt_config.show"
      v-model="prompt_config.value"
      :md-title="prompt_config.title"
      :md-content="prompt_config.content"
      md-input-maxlength="100000"
      :md-input-placeholder="prompt_config.placeholder"
      :md-confirm-text="prompt_config.confirm_text"
      @md-confirm="prompt_config.confirm"
      @md-cancel="prompt_config.cancel"
    />

    <file-dialog
      id="engine-file-dialog"
      ref="file-dialog"
      :engines="em.engines"
      :remove-files="removeFiles"
      :list-files="listFiles"
      :get-file-url="getFileUrl"
      :request-upload-url="requestUploadUrl"
      :download-file-from-url="downloadFileFromUrl"
      :upload-file-to-url="uploadFileToUrl"
    ></file-dialog>
    <md-dialog
      :class="
        plugin_dialog_config && plugin_dialog_config.ui ? '' : 'window-dialog'
      "
      :md-active.sync="showPluginDialog"
      :md-click-outside-to-close="false"
      :md-close-on-esc="false"
    >
      <md-dialog-title
        v-if="plugin_dialog_config && plugin_dialog_config.name"
        >{{ plugin_dialog_config.name }}</md-dialog-title
      >
      <md-dialog-actions
        v-if="!plugin_dialog_config || !plugin_dialog_config.ui"
      >
        <md-button class="md-accent" @click="closePluginDialog(true)"
          ><md-icon>clear</md-icon></md-button
        >
      </md-dialog-actions>
      <md-dialog-content>
        <div v-if="plugin_dialog_config && plugin_dialog_config.ui">
          <joy
            :config="plugin_dialog_config"
            :showHeader="false"
            :controlButtons="false"
            ref="plugin_dialog_joy"
          ></joy>
        </div>
        <div v-else id="window_dialog_container" class="plugin-iframe">
          <window
            v-if="plugin_dialog_window_config"
            :w="plugin_dialog_window_config"
            :withDragHandle="false"
            @close="closePluginDialog(true)"
          ></window>
        </div>
      </md-dialog-content>
      <md-dialog-actions v-if="plugin_dialog_config && plugin_dialog_config.ui">
        <md-button class="md-primary" @click="closePluginDialog(true)"
          >OK</md-button
        >
        <md-button class="md-primary" @click="closePluginDialog(false)"
          >Cancel</md-button
        >
      </md-dialog-actions>
    </md-dialog>

    <md-dialog
      :md-active.sync="showWorkspaceDialog"
      :md-click-outside-to-close="true"
    >
      <md-dialog-title>Workspace Management</md-dialog-title>
      <md-dialog-content>
        <md-toolbar class="md-dense" md-elevation="0">
          <div class="md-toolbar-section-start">
            <md-field>
              <label for="workspace_name">Workspace Name</label>
              <md-input
                type="text"
                v-model="new_workspace_name"
                placeholder="Create a new workspace"
                name="workspace_name"
              ></md-input>
            </md-field>
          </div>
          <div class="md-toolbar-section-end">
            <md-button
              class="md-primary"
              @click="
                switchWorkspace(new_workspace_name);
                showWorkspaceDialog = false;
              "
              ><md-icon>add</md-icon>New</md-button
            >
          </div>
        </md-toolbar>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="w in pm.workspace_list" :key="w">
            <span>{{ w }}</span>
            <md-menu>
              <md-button class="md-icon-button md-list-action" md-menu-trigger>
                <md-icon class="md-primary">more_horiz</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item
                  @click="
                    showWorkspaceDialog = false;
                    switchWorkspace(w);
                  "
                >
                  <md-icon>forward</md-icon> Switch
                </md-menu-item>
                <md-menu-item class="md-accent" @click="removeWorkspace(w)">
                  <md-icon>delete</md-icon> Delete
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </md-list-item>
        </md-list>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showWorkspaceDialog = false"
          >OK</md-button
        >
      </md-dialog-actions>
    </md-dialog>
    <md-dialog-confirm
      :md-active.sync="showPermissionConfirmation"
      md-title="Confirmation Required"
      :md-content="permission_message"
      md-confirm-text="Deny"
      md-cancel-text="Allow"
      @md-cancel="
        showPermissionConfirmation = false;
        processPermission(true);
      "
      @md-confirm="
        showPermissionConfirmation = false;
        processPermission(false);
      "
    />

    <md-dialog :md-active.sync="showShareUrl">
      <md-dialog-title>Sharing Workflow</md-dialog-title>
      <md-dialog-content>
        <a
          :href="share_url_message"
          style="word-wrap: break-word;"
          target="_blank"
          >{{ share_url_message }}
        </a>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showShareUrl = false"
          >OK</md-button
        >
      </md-dialog-actions>
    </md-dialog>

    <md-dialog
      style="max-width: 800px; width: 100%; height: 100%;"
      :md-active.sync="showAboutDialog"
      :md-click-outside-to-close="false"
      :md-close-on-esc="false"
    >
      <md-dialog-title>About ImJoy</md-dialog-title>
      <md-dialog-content>
        <about></about>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showAboutDialog = false"
          >OK</md-button
        >
      </md-dialog-actions>
    </md-dialog>

    <md-dialog
      class="plugin-dialog"
      :md-active.sync="showAddPluginDialog"
      :md-click-outside-to-close="false"
    >
      <md-dialog-title>{{
        plugin4install ? "Plugin Installation" : "ImJoy Plugin Management"
      }}</md-dialog-title>
      <md-dialog-content>
        <md-card v-if="show_plugin_templates">
          <md-card-header>
            <div class="md-title">Create a New Plugin</div>
          </md-card-header>
          <md-card-content>
            <md-button
              class="md-primary md-raised centered-button"
              @click="
                newPlugin(template.code);
                showAddPluginDialog = false;
              "
              v-for="template in plugin_templates"
              :key="template.name"
            >
              <md-icon>add</md-icon>{{ template.name }}
            </md-button>
          </md-card-content>
        </md-card>
        <!-- <md-switch v-if="pm.installed_plugins.length>0 && !plugin4install && !downloading_error && !downloading_plugin" v-model="show_installed_plugins">Show Installed Plugins</md-switch> -->
        <!-- <md-card v-if="show_installed_plugins">
        <md-card-header>
          <div class="md-title">Installed Plugins</div>
        </md-card-header>
        <md-card-content>
          <plugin-list display="list" name="Installed Plugins" description="" v-if="pm" :plugin-manager="pm" @message="showMessage" :plugins="pm.installed_plugins" :workspace="pm.selected_workspace"></plugin-list>
        </md-card-content>
      </md-card> -->
        <md-card v-if="show_plugin_url">
          <md-card-header>
            <div class="md-title">Install from URL</div>
            <md-toolbar md-elevation="0">
              <md-field md-clearable class="md-toolbar-section-start">
                <md-icon>cloud_download</md-icon>
                <md-input
                  placeholder="Please paste the URL here and press enter."
                  type="text"
                  v-model="plugin_url"
                  @keyup.enter="
                    tag4install = '';
                    getPlugin4Install(plugin_url);
                  "
                  name="plugin_url"
                ></md-input>
                <md-tooltip>Press `Enter` to get the plugin</md-tooltip>
              </md-field>
            </md-toolbar>
          </md-card-header>
        </md-card>
        <div
          v-if="downloading_plugin && !plugin4install"
          class="md-toolbar-section-center"
        >
          <div style="padding-right: 30px;" class="loading loading-lg"></div>
        </div>
        <h2 v-if="downloading_error">&nbsp;&nbsp;{{ downloading_error }}</h2>
        <md-card v-if="plugin4install">
          <md-card-media
            v-if="
              plugin4install.cover && typeof plugin4install.cover === 'string'
            "
            md-ratio="16:9"
          >
            <img :src="plugin4install.cover" alt="plugin-cover" />
          </md-card-media>
          <div class="carousel" v-else-if="plugin4install.cover">
            <!-- carousel locator -->
            <input
              class="carousel-locator"
              v-for="(c, k) in plugin4install.cover"
              :key="k"
              :id="'slide-' + k"
              type="radio"
              name="carousel-radio"
              hidden=""
            />
            <!-- carousel container -->
            <div class="carousel-container">
              <!-- carousel item -->
              <figure
                class="carousel-item"
                v-for="(c, k) in plugin4install.cover"
                :key="k"
              >
                <img
                  class="img-responsive rounded"
                  :src="c"
                  alt="plugin cover"
                />
              </figure>
            </div>
            <!-- carousel navigation -->
            <div class="carousel-nav">
              <label
                class="nav-item text-hide c-hand"
                v-for="(c, k) in plugin4install.cover"
                :key="k"
                :for="'slide-' + k"
                >{{ k }}</label
              >
            </div>
          </div>
          <md-card-header>
            <md-toolbar md-elevation="0">
              <div>
                <h2>
                  <md-icon v-if="plugin4install.icon">{{
                    plugin4install.icon
                  }}</md-icon
                  ><md-icon v-else>extension</md-icon>
                  {{
                    plugin4install.type === "native-python"
                      ? plugin4install.name + " 🚀"
                      : plugin4install.name
                  }}
                </h2>
              </div>
              <div v-if="installing" class="md-toolbar-section-end">
                <div
                  style="padding-right: 30px;"
                  class="loading loading-lg"
                ></div>
              </div>
              <div v-else-if="tag4install" class="md-toolbar-section-end">
                <md-button
                  class="md-button md-primary"
                  @click="installPlugin(plugin4install, tag4install)"
                >
                  <md-icon>cloud_download</md-icon
                  >{{ plugin4install._installation_text || "Install" }}
                  <md-tooltip
                    >Install {{ plugin4install.name }} (tag=`{{
                      tag4install
                    }}`)</md-tooltip
                  >
                </md-button>
              </div>
              <div v-else class="md-toolbar-section-end">
                <md-menu
                  v-if="plugin4install.tags && plugin4install.tags.length > 0"
                >
                  <md-button class="md-button md-primary" md-menu-trigger>
                    <md-icon>cloud_download</md-icon
                    >{{ plugin4install._installation_text || "Install" }}
                    <md-tooltip
                      >Choose a tag to install
                      {{ plugin4install.name }}</md-tooltip
                    >
                  </md-button>
                  <md-menu-content>
                    <md-menu-item
                      v-for="tag in plugin4install.tags"
                      :key="tag"
                      @click="installPlugin(plugin4install, tag)"
                    >
                      <md-icon>cloud_download</md-icon>{{ tag }}
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
                <md-button
                  v-else
                  class="md-button md-primary"
                  @click="installPlugin(plugin4install)"
                >
                  <md-icon>cloud_download</md-icon
                  >{{ plugin4install._installation_text || "Install" }}
                </md-button>
              </div>
            </md-toolbar>
          </md-card-header>
          <md-card-content>
            <p>Version: {{ plugin4install.version }}</p>
            <p>{{ plugin4install.description }}</p>
            <md-chip
              v-for="tag in plugin4install.tags"
              @click="tag4install = tag"
              :class="tag4install === tag ? 'md-primary' : ''"
              :key="tag"
              >{{ tag }}</md-chip
            >
            <!-- <md-button class="md-button md-primary" @click="showCode(plugin4install)">
            <md-icon>code</md-icon>Code
          </md-button> -->
            <br />
            <md-switch v-if="plugin4install.code" v-model="show_plugin_source"
              >Show plugin source code</md-switch
            >
            <p>
              This plugin is <strong>NOT</strong> provided by ImJoy.io. Please
              make sure the plugin is provided by a trusted source, otherwise it
              may <strong>harm</strong> your computer.
            </p>
            <plugin-editor
              v-if="show_plugin_source"
              class="code-editor"
              v-model="plugin4install.code"
              :title="plugin4install.name"
            ></plugin-editor>
          </md-card-content>
        </md-card>
        <md-card v-if="show_plugin_store">
          <md-card-header>
            <div class="md-title">Install from the plugin repository</div>
            <md-chips
              @md-insert="pm.addRepository($event)"
              @md-delete="pm.removeRepository(getRepository($event))"
              class="md-primary shake-on-error"
              v-model="pm.repository_names"
              md-placeholder="Add a repository url (e.g. GITHUB REPO) and press enter."
            >
              <template slot="md-chip" slot-scope="{ chip }">
                <strong
                  class="md-primary"
                  v-if="
                    pm.selected_repository &&
                      chip === pm.selected_repository.name
                  "
                  >{{ chip }}</strong
                >
                <div v-else @click="selectRepository(chip)">{{ chip }}</div>
              </template>
              <div class="md-helper-text" v-if="pm.selected_repository">
                {{ pm.selected_repository.name }}:
                {{ pm.selected_repository.description }}
              </div>
            </md-chips>
          </md-card-header>
          <md-card-content>
            <plugin-list
              @message="showMessage"
              v-if="pm"
              :plugin-manager="pm"
              :init-search="init_plugin_search"
              display="list"
              :plugins="pm.available_plugins"
              :workspace="pm.selected_workspace"
            ></plugin-list>
          </md-card-content>
        </md-card>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button
          class="md-primary"
          @click="
            showAddPluginDialog = false;
            clearPluginUrl();
          "
          >Exit</md-button
        >
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_plugin$" }]*/
import Vue from "vue";

import { saveAs } from "file-saver";
import axios from "axios";
import PouchDB from "pouchdb-browser";

import WEB_WORKER_PLUGIN_TEMPLATE from "../plugins/webWorkerTemplate.imjoy.html";
import NATIVE_PYTHON_PLUGIN_TEMPLATE from "../plugins/nativePythonTemplate.imjoy.html";
import WEB_PYTHON_PLUGIN_TEMPLATE from "../plugins/webPythonTemplate.imjoy.html";
import WINDOW_PLUGIN_TEMPLATE from "../plugins/windowTemplate.imjoy.html";

import { version } from "../../package.json";

import {
  randId,
  url_regex,
  assert,
  _clone,
  compareVersions,
  HtmlWhitelistedSanitizer,
} from "../utils.js";

import { PluginManager } from "../pluginManager.js";

import { WindowManager } from "../windowManager.js";

import { Engine, EngineManager } from "../engineManager.js";

import { FileSystemManager } from "../fileSystemManager.js";

import _ from "lodash";

import { Joy } from "../joy";

import Ajv from "ajv";
const ajv = new Ajv();

const sanitizer = new HtmlWhitelistedSanitizer(true);

export default {
  name: "imjoy",
  data() {
    return {
      pm: null, //plugin_manager
      em: null, //engine_manager
      wm: null, //window_manager
      workflow_expand: false,
      file_select: null,
      folder_select: null,
      selected_file: null,
      selected_files: null,
      showPluginDialog: false,
      showSettingsDialog: false,
      showAboutDialog: false,
      showAddPluginDialog: false,
      showRemoveConfirmation: false,
      showPermissionConfirmation: false,
      permission_message: "No permission message.",
      share_url_message: "No url",
      showShareUrl: false,
      resolve_permission: null,
      reject_permission: null,
      plugin_dialog_config: null,
      plugin_dialog_promise: {},
      plugin2_remove: null,
      is_https_mode: true,
      plugin_url: null,
      downloading_plugin: false,
      downloading_error: "",
      plugin4install: null,
      tag4install: "",
      show_plugin_source: false,
      init_plugin_search: null,
      show_plugin_templates: true,
      show_plugin_store: true,
      show_plugin_url: true,
      show_installed_plugins: false,
      progress: 0,
      status_text: "",
      showWorkspaceDialog: false,
      showWelcomeDialog: false,
      show_file_dialog: false,
      plugins: null,
      registered: null,
      menuVisible: false,
      snackbar_info: "",
      snackbar_duration: 3000,
      show_snackbar: false,
      screenWidth: 1024,
      plugin_loaded: false,
      new_workspace_name: "",
      workspace_dropping: false,
      max_window_buttons: 9,
      installing: false,
      plugin_dialog_window_config: null,
      latest_version: null,
      is_latest_version: false,
      checking: false,
      alert_config: { show: false },
      confirm_config: { show: false, confirm: () => {}, cancel: () => {} },
      prompt_config: { show: false, confirm: () => {}, cancel: () => {} },
    };
  },
  watch: {
    // menuVisible() {
    //   this.wm.resizeAll();
    // },
  },
  computed: {
    version_badge_url: function() {
      if (this.latest_version) {
        const color = this.is_latest_version ? "success" : "orange";
        return (
          "https://img.shields.io/badge/imjoy-v" +
          this.imjoy_version +
          "-" +
          color +
          ".svg"
        );
      } else {
        return null;
      }
    },
  },
  created() {
    this.imjoy_version = version;
    // mocks it for testing if not available
    this.event_bus =
      (this.$root.$data.store && this.$root.$data.store.event_bus) || new Vue();
    const imjoy_api = {
      alert: this.showAlert,
      prompt: this.showPrompt,
      confirm: this.showConfirm,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      showFileDialog: this.showFileDialog,
      requestUploadUrl: this.requestUploadUrl,
      showSnackbar: this.showSnackbar,
      uploadFileToUrl: this.uploadFileToUrl,
      downloadFileFromUrl: this.downloadFileFromUrl,
      getFileUrl: this.getFileUrl,
      getFilePath: this.getFilePath,
      exportFile: this.exportFile,
      showMessage: (plugin, info, duration) => {
        this.showMessage(info, duration);
      },
      log: (plugin, text) => {
        plugin.log(text);
        this.$forceUpdate();
      },
      error: (plugin, text) => {
        plugin.error(text);
        this.$forceUpdate();
      },
      progress: (plugin, text) => {
        plugin.progress(text);
        this.$forceUpdate();
      },
      utils: {
        $forceUpdate: this.$forceUpdate,
        openUrl: this.openUrl,
        sleep: this.sleep,
        assert: assert,
      },
    };

    // bind this to api functions
    for (let k in this.imjoy_api) {
      if (typeof this.imjoy_api[k] === "function") {
        this.imjoy_api[k] = this.imjoy_api[k].bind(this);
      } else if (typeof this.imjoy_api[k] === "object") {
        for (let u in this.imjoy_api[k]) {
          this.imjoy_api[k][u] = this.imjoy_api[k][u].bind(this);
        }
      }
    }

    const config_db = new PouchDB("imjoy_config", {
      revs_limit: 2,
      auto_compaction: true,
    });

    this.client_id = localStorage.getItem("imjoy_client_id");
    if (!this.client_id) {
      this.client_id = "imjoy_web_" + randId();
      localStorage.setItem("imjoy_client_id", this.client_id);
    }

    this.em = new EngineManager({
      event_bus: this.event_bus,
      config_db: config_db,
      show_message_callback: this.showMessage,
      show_engine_callback: (show, engine) => {
        this.showEngineConnection(show, engine);
      },
      client_id: this.client_id,
    });
    this.wm = new WindowManager({
      event_bus: this.event_bus,
      show_message_callback: this.showMessage,
      add_window_callback: this.addWindowCallback,
    });
    this.fm = new FileSystemManager();
    this.pm = new PluginManager({
      event_bus: this.event_bus,
      config_db: config_db,
      engine_manager: this.em,
      window_manager: this.wm,
      file_system_manager: this.fm,
      imjoy_api: imjoy_api,
      show_message_callback: this.showMessage,
      update_ui_callback: () => {
        this.$forceUpdate();
      },
    });

    this.IMJOY_PLUGIN = {
      _id: "IMJOY_APP",
    };
    this.plugin_templates = [
      { name: "Web Worker (JS)", code: WEB_WORKER_PLUGIN_TEMPLATE },
      { name: "Window (HTML/CSS/JS)", code: WINDOW_PLUGIN_TEMPLATE },
      { name: "Native Python 🚀", code: NATIVE_PYTHON_PLUGIN_TEMPLATE },
      // {name: "Iframe(Javascript)", code: IFRAME_PLUGIN_TEMPLATE},
      { name: "Web Python 🐍", code: WEB_PYTHON_PLUGIN_TEMPLATE },
    ];
    this.workflow_joy_config = {
      expanded: true,
      name: "Workflow",
      ui: "{id:'workflow', type:'ops'}",
    };
    const insideWhiteboard = target => {
      const whiteboard = document.getElementById("whiteboard");
      return target && whiteboard && whiteboard.contains(target);
    };
    const insideFileDialog = target => {
      const dialog = document.getElementById("engine-file-dialog");
      return target && dialog && dialog.contains(target);
    };
    document.addEventListener("dragover", e => {
      e.preventDefault();
      e.stopPropagation();
      if (insideWhiteboard(e.target)) {
        if (!this.workspace_dropping) {
          this.workspace_dropping = true;
          this.$forceUpdate();
        }
      }
      if (insideFileDialog(e.target)) {
        this.event_bus.$emit("drag_upload_enter");
      }
    });
    document.addEventListener("dragenter", e => {
      e.preventDefault();
      e.stopPropagation();
      if (insideWhiteboard(e.target)) {
        this.workspace_dropping = true;
        this.$forceUpdate();
      }
      if (insideFileDialog(e.target)) {
        this.event_bus.$emit("drag_upload_enter");
      }
    });
    document.addEventListener("dragleave", e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.workspace_dropping) {
        this.workspace_dropping = false;
        this.$forceUpdate();
      }
      if (!insideFileDialog(e.target)) {
        this.event_bus.$emit("drag_upload_leave");
      }
    });
    const parseFiles = e => {
      return new Promise((resolve, reject) => {
        const filelist = [];
        let folder_supported = false;
        // https://gist.github.com/tiff/3076863
        const traverseFileTree = (item, path, getDataLoaders, end) => {
          path = path || "";
          if (item && item.isFile) {
            // Get file
            item.file(file => {
              file.relativePath = path + file.name;
              file.loaders = getDataLoaders(file);
              filelist.push(file);
              if (end) resolve(filelist);
            });
          } else if (item && item.isDirectory) {
            // Get folder contents
            var dirReader = item.createReader();
            dirReader.readEntries(entries => {
              for (var i = 0; i < entries.length; i++) {
                traverseFileTree(
                  entries[i],
                  path + item.name + "/",
                  getDataLoaders,
                  end && i === entries.length - 1
                );
              }
            });
          } else {
            if (end) resolve(filelist);
          }
        };
        var length = e.dataTransfer.items.length;
        if (length === 0) {
          reject();
          return;
        }
        for (var i = 0; i < length; i++) {
          if (e.dataTransfer.items[i].webkitGetAsEntry) {
            folder_supported = true;
            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
            traverseFileTree(
              entry,
              null,
              f => {
                return this.wm.getDataLoaders(f);
              },
              i === length - 1
            );
          }
        }
        if (!folder_supported) {
          this.selected_files = e.dataTransfer.files;
        } else {
          this.selected_files = filelist;
        }
      });
    };
    document.addEventListener("drop", e => {
      e.preventDefault();
      if (insideWhiteboard(e.target)) {
        parseFiles(e).then(this.loadFiles);
        this.workspace_dropping = false;
        this.$forceUpdate();
      } else if (insideFileDialog(e.target)) {
        this.event_bus.$emit("drag_upload_leave");
        parseFiles(e).then(files => {
          this.event_bus.$emit("drag_upload", files);
        });
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.wm && this.wm.windows.length > 0) {
      const answer = window.confirm(
        "Do you really want to leave? you have unsaved changes!"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  mounted() {
    this.event_bus.$on("resize", this.updateSize);
    this.event_bus.$on("plugin_loaded", () => {
      //update the joy workflow if new template added, TODO: preserve settings during reload
      if (this.$refs.workflow && this.$refs.workflow.setupJoy)
        this.$refs.workflow.setupJoy();
    });
    this.event_bus.$on("op_registered", () => {
      //update the joy workflow if new template added, TODO: preserve settings during reload
      if (this.$refs.workflow && this.$refs.workflow.setupJoy)
        this.$refs.workflow.setupJoy();
    });
    this.event_bus.$on("engine_connected", engine => {
      if (this.pm) this.pm.reloadPythonPlugins(engine);
    });
    this.event_bus.$on("engine_disconnected", engine => {
      if (this.pm) this.pm.unloadPythonPlugins(engine);
    });

    this.updateSize({ width: window.innerWidth });

    this.is_https_mode = "https:" === location.protocol;
    // Make sure the GUI is refreshed
    setInterval(() => {
      this.$forceUpdate();
    }, 5000);

    if (this.welcome) {
      this.showWelcomeDialog = true;
    } else {
      this.startImJoy().then(() => {
        /* global window */
        if (window.gtag) {
          // CAREFUL: DO NOT SEND ANY QUERY STRING, ONLY LOCATION AND PATH
          window.gtag("config", "UA-134837258-1", {
            page_location: location.href.split("#")[0],
            page_path: "/#/app",
          });
        }
      });
    }
  },
  beforeDestroy() {
    // console.log('terminating plugins')
    this.pm.destroy();
    this.em.destroy();
  },
  methods: {
    async startImJoy() {
      try {
        await this.fm.init();
        console.log("Successfully initialized the file system.");
      } catch (e) {
        console.error(e);
        this.showMessage("Failed to initialize file system: " + e.toString());
      }
      this.pm.init();
      try {
        await this.em.init();

        console.log("Successfully initialized the engine manager.");
      } catch (e) {
        console.error(e);
        this.showMessage(
          "Failed to initialize the engine manager: " + e.toString()
        );
      }

      for (let inputs of this.getDefaultInputLoaders()) {
        this.wm.registerInputLoader(inputs.loader_key, inputs, inputs.loader);
      }
      this.repository_list = await this.pm.loadRepositoryList();
      this.pm.selected_repository = this.repository_list[0];

      try {
        const workspace_list = await this.pm.loadWorkspaceList();
        if (this.$route.query.start || this.$route.query.s) {
          this.menuVisible = false;
        } else {
          this.menuVisible = true;
        }

        const selected_workspace =
          this.$route.query.workspace ||
          this.$route.query.w ||
          workspace_list[0];
        await this.pm.loadWorkspace(selected_workspace);
        await this.pm.reloadPlugins(true);
        const connections = this.em.connectAll(true);
        try {
          await connections;
        } catch (e) {
          console.error(e);
        }

        if (this.$route.query.engine && this.$route.query.start) {
          const en = this.em.getEngineByUrl(this.$route.query.engine);
          const pl = this.pm.installed_plugins[this.$route.query.start];
          if (en && pl) {
            console.log(`setting plugin engine of ${pl.name} to ${en.name}`);
            pl.engine_mode = en;
            pl.config.engine_mode = en;
          }
          if (!en) {
            this.showMessage(
              `Plugin engine ${this.$route.query.engine} not found.`
            );
          }
          if (!pl) {
            this.showMessage(`Plugin ${this.$route.query.start} not found.`);
          }
        }

        let connection_token = null;
        if (this.$route.query.token || this.$route.query.t) {
          connection_token = (
            this.$route.query.token || this.$route.query.t
          ).trim();
          const query = Object.assign({}, this.$route.query);
          delete query.token;
          delete query.t;
          this.$router.replace({ query });
        }
        if (this.$route.query.engine || this.$route.query.e) {
          const engine_url = (
            this.$route.query.engine || this.$route.query.e
          ).trim();
          this.em
            .addEngine(
              { type: "default", url: engine_url, token: connection_token },
              false
            )
            .finally(() => {
              this.em.getEngineByUrl(engine_url).connect();
              this.$forceUpdate();
            });
        }

        this.plugin_loaded = true;
        this.event_bus.$emit("plugins_loaded", this.pm.plugins);
        try {
          const manifest = this.pm.reloadRepository();
          this.event_bus.$emit("repositories_loaded", manifest);
        } finally {
          const r = (
            this.$route.query.repo ||
            this.$route.query.r ||
            ""
          ).trim();
          if (r) {
            this.plugin_url = null;
            this.init_plugin_search = null;
            this.show_plugin_store = true;
            this.show_plugin_url = false;
            this.downloading_plugin = true;
            this.pm
              .addRepository(r)
              .then(repo => {
                this.pm.selected_repository = repo;
                this.downloading_plugin = false;
              })
              .catch(e => {
                this.downloading_plugin = false;
                this.downloading_error =
                  "Sorry, the repository URL is invalid: " + e.toString();
              });
            this.show_plugin_templates = false;
            this.showAddPluginDialog = true;
          }

          const p = (
            this.$route.query.plugin ||
            this.$route.query.p ||
            ""
          ).trim();
          let plugin_config = null;
          if (p) {
            if (p.match(url_regex) || (p.includes("/") && p.includes(":"))) {
              this.plugin_url = p;
              this.init_plugin_search = null;
              this.show_plugin_store = false;
              this.show_plugin_url = false;
              try {
                plugin_config = await this.getPlugin4Install(p);
                //check if the same plugin is already installed
                if (
                  !this.pm.plugin_names[plugin_config.name] ||
                  this.$route.query.upgrade ||
                  plugin_config.version !==
                    this.pm.plugin_names[plugin_config.name].config.version
                ) {
                  this.show_plugin_templates = false;
                  this.showAddPluginDialog = true;
                } else {
                  this.showMessage(
                    `Plugin "${plugin_config.name}" is already installed.`
                  );
                }
              } catch (e) {
                console.error(e);
              }
            } else {
              this.plugin_url = null;
              this.init_plugin_search = p;
              this.show_plugin_store = true;
              this.show_plugin_url = false;
              this.show_plugin_templates = false;
              this.showAddPluginDialog = true;
            }
          } else {
            if (this.$route.query.workflow) {
              this.loadWorkfowFromUrl();
            }
          }

          if (this.$route.query.start || this.$route.query.s) {
            const pname = this.$route.query.start || this.$route.query.s;
            const ps = this.pm.installed_plugins.filter(p => {
              return p.name === pname;
            });
            if (!this.showAddPluginDialog && ps.length <= 0) {
              alert(`Plugin "${pname}" cannot be started, please install it.`);
            } else {
              const data = _clone(this.$route.query);
              const load_data = this.$route.query.load || this.$route.query.l;
              if (load_data) {
                try {
                  const response = await axios.get(load_data);
                  data.loaded = response.data;
                } catch (e) {
                  console.error(e);
                  this.showMessage(
                    "Failed to load data from:" +
                      load_data +
                      " Error:" +
                      e.toString()
                  );
                  data.loaded = null;
                }
              }
              //load data
              if (
                !this.showAddPluginDialog &&
                (this.pm.registered.windows[pname] ||
                  pname.startsWith("imjoy/"))
              ) {
                try {
                  const template = this.pm.registered.windows[pname] || {};
                  const c = _clone(template.defaults) || {};
                  c.type = pname;
                  c.name = pname;
                  c.w = c.w || this.$route.query.w;
                  c.h = c.h || this.$route.query.h;
                  c.tag = template.tag;
                  c.fullscreen =
                    this.$route.query.fullscreen || c.fullscreen || false;
                  c.standalone =
                    this.$route.query.standalone || c.standalone || false;
                  c.data = data;
                  c.config = {};
                  await this.createWindow(c);
                } catch (e) {
                  console.error(`Plugin ${pname} failed to load data.`, e);
                }
              } else {
                let started_plugin = null;
                const plugin_loaded_handler = plugin => {
                  if (plugin.name === pname) {
                    try {
                      plugin.api.run({ data: data, config: {} });
                    } catch (e) {
                      console.error(`Plugin ${pname} failed to load data.`, e);
                    }
                    this.event_bus.$off("plugin_loaded", plugin_loaded_handler);
                  }
                  // close it if it already started.
                  if (started_plugin && started_plugin.api.close) {
                    started_plugin.api.close();
                  }
                  started_plugin = plugin;
                };
                const start_when_loaded = p => {
                  if (p.name !== pname) {
                    return;
                  }
                  this.event_bus.$on("plugin_loaded", plugin_loaded_handler);
                  this.event_bus.$off("plugin_installed", start_when_loaded);
                };
                this.event_bus.$on("plugin_installed", start_when_loaded);
              }
            }
          }

          this.$nextTick(() => {
            this.event_bus.$emit("imjoy_ready");
          });
        }
      } catch (e) {
        this.showMessage(e.toString());
      }
      this.$forceUpdate();
      this.$nextTick(() => {
        this.checkUpdate();
        //check for update every 20 minutes
        window.setInterval(() => {
          this.checkUpdate(true);
        }, 1200000);
      });
    },
    addWindowCallback(w) {
      return new Promise((resolve, reject) => {
        if (!this.wm.window_ids[w.id]) {
          reject("window was closed");
          return;
        }
        try {
          w.onRefresh(() => {
            this.$forceUpdate();
          });
          //move refresh to next tick
          const _refresh = w.refresh;
          if (_refresh) {
            w.refresh = () => {
              this.$nextTick(() => {
                _refresh();
              });
            };
          }
          this.$nextTick(() => {
            this.$forceUpdate();
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    },
    createWindow(w) {
      return this.pm.createWindow(null, w);
    },
    async checkUpdate(quiet) {
      this.checking = true;
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/oeway/ImJoy/master/web/package.json?" +
            randId()
        );
        if (!response || !response.data) {
          this.showMessage("failed to fetch imjoy version information");
          return;
        }
        const obj = response.data;
        if (obj && obj.version) {
          this.latest_version = obj.version;
          this.is_latest_version = compareVersions(
            this.imjoy_version,
            ">=",
            obj.version
          );
          if (this.is_latest_version) {
            if (!quiet) {
              if (compareVersions(this.imjoy_version, ">", obj.version)) {
                this.showMessage(
                  `🍻 Your ImJoy (v${
                    this.imjoy_version
                  }) is newer than the release (v${this.latest_version}).`
                );
              } else {
                this.showMessage(
                  `🎉 ImJoy is up to date (version ${this.latest_version}).`
                );
              }
            }
          } else {
            this.showMessage(
              `📣 A newer version of ImJoy (version ${
                this.latest_version
              }) is available, please refresh your browser.`
            );
          }
        } else {
          this.latest_version = null;
        }
      } catch (e) {
        this.showMessage("failed to fetch imjoy version information");
      } finally {
        this.checking = false;
      }
    },
    getDefaultInputLoaders() {
      const image_loader = file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.createWindow({
            name: file.name,
            type: "imjoy/image",
            data: { src: reader.result, _file: file },
          });
        };
        reader.readAsDataURL(file);
      };

      const code_loader = file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.newPlugin(reader.result);
        };
        reader.readAsText(file);
      };
      return [
        {
          loader_key: "Code Editor",
          schema: ajv.compile({
            properties: {
              name: { type: "string", pattern: ".*\\.imjoy.html$" },
              size: { type: "number" },
            },
            required: ["name", "size"],
          }),
          loader: code_loader,
        },
        {
          loader_key: "Image",
          schema: ajv.compile({
            properties: {
              type: {
                type: "string",
                enum: ["image/jpeg", "image/png", "image/gif"],
              },
              size: { type: "number" },
            },
            required: ["type", "size"],
          }),
          loader: image_loader,
        },
      ];
    },
    updateSize(e) {
      this.screenWidth = e.width;
      if (this.screenWidth > 800) {
        this.wm.window_mode = "grid";
        this.max_window_buttons = 9;
      } else {
        this.wm.window_mode = "single";
        this.max_window_buttons = parseInt(this.screenWidth / 36 - 4);
        if (this.max_window_buttons > 9) this.max_window_buttons = 9;
      }
      this.wm.resizeAll();
    },
    showEngineConnection(show, engine) {
      // if(message && resolve && reject){
      //   this.permission_message = message
      //   this.resolve_permission = resolve
      //   this.reject_permission = reject
      //   this.showPermissionConfirmation = true
      // }
      this.event_bus.$emit("show_engine_dialog", {
        show: show,
        engine: engine,
      });
    },
    getRepository(repo_name) {
      for (let r of this.pm.repository_list) {
        if (r.name === repo_name) {
          return r;
        }
      }
    },
    selectRepository(repo) {
      for (let r of this.pm.repository_list) {
        if (r.name === repo) {
          this.pm.reloadRepository(r).then(() => {
            this.$forceUpdate();
          });
          return r;
        }
      }
    },
    switchEngine(plugin, engine) {
      plugin.config.engine_mode = (engine && engine.id) || "auto";
      this.pm
        .savePlugin(plugin.config)
        .then(p => {
          this.pm.reloadPlugin(p);
        })
        .catch(e => {
          this.showMessage("Failed to save settings: " + e.toString());
        });
    },
    switchTag(plugin, tag) {
      plugin.config.tag = tag;
      this.pm
        .savePlugin(plugin.config)
        .then(p => {
          this.pm.reloadPlugin(p);
        })
        .catch(e => {
          this.showMessage("Failed to save settings: " + e.toString());
        });
    },
    connectPlugin(plugin) {
      if (plugin._disconnected) {
        if (
          plugin.type === "native-python" &&
          plugin.config.engine &&
          !plugin.config.engine.connected
        ) {
          plugin.config.engine.connect();
        } else {
          this.pm.reloadPlugin(plugin.config);
        }
      }
    },
    async getPlugin4Install(plugin_url) {
      this.plugin4install = null;
      this.downloading_error = "";
      this.downloading_plugin = true;
      try {
        const config = await this.pm.getPluginFromUrl(plugin_url);
        if (this.pm.plugin_names[config.name]) {
          if (
            compareVersions(
              config.version,
              ">",
              this.pm.plugin_names[config.name].config.version
            )
          ) {
            config._installation_text = "Upgrade";
          } else if (
            compareVersions(
              config.version,
              "<",
              this.pm.plugin_names[config.name].config.version
            )
          ) {
            config._installation_text = "Downgrade";
          }
        }
        this.plugin4install = config;
        this.tag4install = config.tag;
        this.downloading_plugin = false;
        return config;
      } catch (e) {
        this.downloading_plugin = false;
        this.downloading_error =
          "Sorry, the plugin URL is invalid: " + e.toString();
        this.showMessage("Sorry, the plugin URL is invalid: " + e.toString());
        throw e;
      }
    },
    showPluginManagement() {
      this.plugin4install = null;
      this.downloading_error = "";
      this.downloading_plugin = false;
      this.init_plugin_search = "";
      this.show_plugin_templates = true;
      this.show_plugin_store = true;
      this.show_plugin_url = true;
      this.showAddPluginDialog = true;
      //select ImJoy repo as default
      for (let repo of this.pm.repository_list) {
        if (repo.name === this.pm.default_repository_list[0].name) {
          this.selectRepository(repo.name);
        }
      }
    },
    sortedRunnablePlugins: function() {
      return _.orderBy(this.pm.plugins, "name").filter(p => {
        return p.config.runnable;
      });
    },

    sortedNonRunnablePlugins: function() {
      return _.orderBy(this.pm.plugins, "name").filter(p => {
        return !p.config.runnable;
      });
    },
    registerExtension(exts, plugin) {
      for (let i = 0; i < exts.length; i++) {
        exts[i] = exts[i].replace(".", "");
        if (this.registered.extensions[exts[i]]) {
          this.registered.extensions[exts[i]].push(plugin);
        } else {
          this.registered.extensions[exts[i]] = [plugin];
        }
      }
    },
    switchWorkspace(w) {
      // console.log('switch to ', w)
      if (!w || w.trim() == "") {
        this.showMessage("Workspace name should not be empty.");
        throw "Workspace name should not be empty.";
      }
      let q = {
        workspace: w,
      };
      if (w === "default") {
        q = null;
      }
      this.$router.push({
        name: "app",
        query: q,
      });
      window.location.reload();
    },
    removeWorkspace(w) {
      const load_default = this.pm.selected_workspace === w.name;
      this.pm
        .removeWorkspace(w)
        .then(() => {
          this.showMessage(`Workspace ${w} has been deleted.`);
          // if current workspace is deleted, go to default
          if (load_default) {
            this.$router.replace({
              query: {
                w: "default",
              },
            });
          }
        })
        .catch(e => {
          this.showMessage(e.toString());
        });
    },
    showMessage(info, duration) {
      assert(typeof info === "string");
      this.snackbar_info = info.slice(0, 120);
      if (duration) {
        duration = duration * 1000;
      }
      this.snackbar_duration = duration || 10000;
      this.show_snackbar = true;
      this.status_text = info;
      this.$forceUpdate();
    },
    showEngineFileDialog() {
      this.showFileDialog(this.IMJOY_PLUGIN, {
        uri_type: "url",
        root: "./",
      }).then(selection => {
        if (!Array.isArray(selection)) {
          selection = [selection];
        }
        const urls = [];
        for (let u of selection) {
          if (u.url) {
            urls.push({ href: u.url, path: u.path, engine: u.engine });
          } else {
            urls.push({ href: u });
          }
        }
        const w = {
          name: "Files",
          type: "imjoy/url_list",
          scroll: true,
          data: urls,
        };
        this.createWindow(w);
      });
    },
    processPermission(allow) {
      if (allow && this.resolve_permission) {
        this.resolve_permission();
        this.resolve_permission = null;
      } else if (this.reject_permission) {
        this.reject_permission("Permission Denied!");
        this.reject_permission = null;
      } else {
        console.error("permission handler not found.");
      }
    },
    showDoc(pid) {
      const plugin = this.pm.plugins[pid];
      const pconfig = plugin.config;
      const w = {
        name: "About " + pconfig.name,
        type: "imjoy/markdown",
        w: 20,
        h: 10,
        scroll: true,
        data: {
          name: pconfig.name,
          id: plugin.id,
          plugin_info: pconfig,
          source: pconfig && pconfig.docs[0] && pconfig.docs[0].content,
        },
      };
      this.createWindow(w);
    },
    clearPluginUrl() {
      const query = Object.assign({}, this.$route.query);
      // delete query.p;
      // delete query.plugin;
      delete query.upgrade;
      this.$router.replace({ query });
    },
    sharePlugin(pid) {
      const plugin = this.pm.plugins[pid];
      const pconfig = plugin.config;
      const url = "https://imjoy.io/#/app?p=" + pconfig.origin;
      this.share_url_message = `<h2>Sharing "${
        plugin.name
      }"</h2> <br> <a href="${encodeURI(
        url
      )}" target="_blank">${url}</a> <br> (Right click on the link and select "Copy Link Address")`;
      this.showShareUrl = true;
      const query = Object.assign({}, this.$route.query);
      query.p = pconfig.origin;
      this.$router.replace({ query });
    },
    downloadPlugin(pid) {
      const plugin = this.pm.plugins[pid];
      const pconfig = plugin.config;
      const filename = plugin.name + "_" + randId() + ".imjoy.html";
      const file = new Blob([pconfig.code], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(file, filename);
    },
    installPlugin(plugin4install, tag4install) {
      this.installing = true;
      this.pm
        .installPlugin(plugin4install, tag4install)
        .then(template => {
          this.showAddPluginDialog = false;
          this.clearPluginUrl(template);
          this.$forceUpdate();
        })
        .finally(() => {
          this.installing = false;
        });
    },
    updatePlugin(pid) {
      const plugin = this.pm.plugins[pid];
      const pconfig = plugin.config;
      if (pconfig.origin) {
        this.installing = true;
        this.pm
          .installPlugin(pconfig.origin)
          .then(() => {
            this.$forceUpdate();
          })
          .finally(() => {
            this.installing = false;
          });
      } else {
        alert("Origin not found for this plugin.");
      }
    },
    reloadPlugin(config) {
      this.pm.reloadPlugin(config).finally(() => {
        this.$forceUpdate();
      });
    },
    unloadPlugin(plugin) {
      this.pm.unloadPlugin(plugin);
    },
    editPlugin(pid) {
      const plugin = this.pm.plugins[pid];
      const pconfig = plugin.config;
      const w = {
        name: "Edit-" + pconfig.name || "plugin",
        type: "imjoy/plugin-editor",
        config: {},
        plugin: plugin,
        plugin_manager: this.pm,
        engine_manager: this.em,
        w: 20,
        h: 10,
        standalone: this.screenWidth < 1200,
        data: {
          name: pconfig.name,
          id: plugin.id,
          code: pconfig.code,
        },
      };
      this.createWindow(w);
    },
    newPlugin(code) {
      const w = {
        name: "New Plugin",
        type: "imjoy/plugin-editor",
        config: {},
        plugin_manager: this.pm,
        engine_manager: this.em,
        w: 20,
        h: 10,
        standalone: this.screenWidth < 1200,
        plugin: {},
        data: {
          name: "new plugin",
          id: "plugin_" + randId(),
          code: JSON.parse(JSON.stringify(code)),
        },
      };
      this.createWindow(w);
    },
    closePluginDialog(ok) {
      this.showPluginDialog = false;
      this.plugin_dialog_window_config = null;
      if (this.plugin_dialog_promise) {
        let [resolve, reject] = this.plugin_dialog_promise;
        if (ok) {
          resolve();
        } else {
          reject();
        }
        this.plugin_dialog_promise = null;
      }
    },
    loadFiles(selected_files) {
      console.log(selected_files);
      if (selected_files.length === 1) {
        const file = selected_files[0];
        const loaders = this.wm.getDataLoaders(file);
        const keys = Object.keys(loaders);
        console.log(selected_files, loaders, keys);
        if (keys.length === 1) {
          try {
            return this.wm.registered_loaders[loaders[keys[0]]](file);
          } catch (e) {
            console.error(
              `Failed to load with the matched loader ${loaders[0]}`,
              e
            );
          }
        }
      }
      for (let f = 0; f < selected_files.length; f++) {
        const file = selected_files[f];
        file.loaders = file.loaders || this.wm.getDataLoaders(file);
      }
      const w = {
        name: "Files",
        type: "imjoy/files",
        config: {},
        select: -1,
        _op: "__file_loader__",
        _source_op: null,
        _workflow_id: "files_" + randId(),
        _transfer: false,
        data: selected_files,
      };
      this.createWindow(w);
    },
    clearWorkflow() {
      this.workflow_joy_config.data = null;
      this.$refs.workflow.setupJoy(true);
    },
    runWorkflow(joy) {
      this.status_text = "";
      this.progress = 0;
      const w = this.wm.active_windows[this.wm.active_windows.length - 1] || {};
      const mw = this.pm.plugin2joy(w) || {};
      mw.target = mw.target || {};
      mw.target._op = "workflow";
      mw.target._source_op = null;
      // mw.target._transfer = true
      mw.target._workflow_id = mw.target._workflow_id || "workflow_" + randId();
      joy.workflow.execute(mw.target).catch(e => {
        console.error(e);
        this.showMessage((e && e.toString()) || "Error.", 12);
      });
    },
    loadWorkflow(w) {
      this.workflow_joy_config.data = JSON.parse(w.workflow);
      this.$refs.workflow.setupJoy(true);
    },
    loadWorkfowFromUrl() {
      const data = Joy.decodeWorkflow(this.$route.query.workflow);
      if (data) {
        try {
          this.workflow_expand = true;
          this.workflow_joy_config.data = JSON.parse(data);
          this.$nextTick(() => {
            try {
              this.$refs.workflow.setupJoy(true);
              const query = Object.assign({}, this.$route.query);
              delete query.workflow;
              this.$router.replace({ query });
            } catch (e) {
              console.error(e);
              this.showMessage("Failed to load workflow: " + e);
            }
          });
        } catch (e) {
          console.error(e);
          this.showMessage("Failed to parse workflow: " + e);
        }
      } else {
        console.log("failed to workflow");
      }
    },
    shareWorkflow(w) {
      const url = Joy.encodeWorkflow(w.workflow);
      this.share_url_message = `${location.protocol}//${location.hostname}${
        location.port ? ":" + location.port : ""
      }/#/app/?workflow=${url}`;
      this.showShareUrl = true;
    },
    runOp(op) {
      if (!op || !op.name) {
        throw "op not found.";
      }
      this.status_text = "";
      this.progress = 0;
      const w = this.wm.active_windows[this.wm.active_windows.length - 1] || {};
      const mw = this.pm.plugin2joy(w) || {};
      mw.target = mw.target || {};
      mw.target._op = op.name;
      mw.target._source_op = null;
      // mw.target._transfer = true
      mw.target._workflow_id =
        mw.target._workflow_id ||
        "op_" + op.name.trim().replace(/ /g, "_") + randId();
      op.joy.__op__
        .execute(mw.target)
        .then(my => {
          const w = this.pm.joy2plugin(my);
          if (w && !my.__jailed_type__) {
            w.name = w.name || "result";
            w.type = w.type || "imjoy/generic";
            this.createWindow(w);
          }
          this.progress = 100;
        })
        .catch(e => {
          this.showMessage(
            "<" + op.name + ">" + ((e && e.toString()) || "Error."),
            15
          );
        });

      if (this.screenWidth <= 800) {
        this.menuVisible = false;
      }
    },
    selectFileChanged(event) {
      // console.log(event.target.files)
      this.selected_file = event.target.files[0];
      this.selected_files = event.target.files;
      //normalize relative path
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        file.relativePath = file.webkitRelativePath;
        file.loaders = this.wm.getDataLoaders(file);
      }
      this.loadFiles(this.selected_files);
    },

    //#################ImJoy API functions##################
    showSnackbar(_plugin, msg, duration) {
      this.snackbar_info = msg;
      if (duration) {
        duration = duration * 1000;
      }
      this.snackbar_duration = duration || 10000;
      this.show_snackbar = true;
      this.$forceUpdate();
    },
    listFiles(engine, path, type, recursive) {
      if (engine) {
        return engine.listFiles(path, type, recursive);
      } else {
        throw "No plugin engine selected.";
      }
    },
    removeFiles(engine, path, type, recursive) {
      if (engine) {
        return engine.removeFiles(path, type, recursive);
      } else {
        throw "No plugin engine selected.";
      }
    },
    showFileDialog(_plugin, config) {
      config = config || {};
      if (_plugin && _plugin.id) {
        config.engine =
          config.engine === undefined ? _plugin.config.engine : config.engine;
        config.engine =
          config.engine instanceof Engine
            ? config.engine
            : this.em.getEngineByUrl(config.engine);
        config.root =
          config.root || (_plugin.config && _plugin.config.work_dir);
        if (_plugin.type != "native-python") {
          config.uri_type = config.uri_type || "url";
        } else {
          config.uri_type = config.uri_type || "path";
        }
        //TODO: remove this in the future
        if (
          _plugin.config.api_version &&
          compareVersions(_plugin.config.api_version, "<=", "0.1.3")
        ) {
          config.return_engine = config.return_engine || false;
        } else {
          config.return_engine = config.return_engine || true;
        }
        return this.$refs["file-dialog"].showDialog(_plugin, config);
      } else {
        return this.$refs["file-dialog"].showDialog(_plugin, config);
      }
    },
    requestUploadUrl(_plugin, config) {
      if (typeof config !== "object") {
        throw "You must pass an object contains keys named `engine` and `path` (or `dir`, optionally `overwrite`)";
      }
      _plugin = _plugin || this.IMJOY_PLUGIN;
      config.engine =
        config.engine === undefined ? _plugin.config.engine : config.engine;
      const engine =
        config.engine instanceof Engine
          ? config.engine
          : this.em.getEngineByUrl(config.engine);
      delete config.engine;
      return new Promise((resolve, reject) => {
        if (!engine) {
          reject("Please specify an engine");
          return;
        }
        if (!engine.connected) {
          reject("Please connect to the Plugin Engine 🚀.");
          this.showMessage("Please connect to the Plugin Engine 🚀.");
          return;
        }

        engine
          .requestUploadUrl({
            path: config.path,
            overwrite: config.overwrite,
            dir: config.dir,
          })
          .then(ret => {
            ret = ret || {};
            if (ret.success) {
              if (_plugin.log) _plugin.log(`Uploaded url created: ${ret.url}`);
              resolve(ret.url);
              this.$forceUpdate();
            } else {
              ret.error = ret.error || "UNKNOWN";
              this.showMessage(
                `Failed to request file url, Error: ${ret.error}`
              );
              reject(`Failed to request file url, Error: ${ret.error}`);
              this.$forceUpdate();
            }
          })
          .catch(reject);
      });
    },
    uploadFileToUrl(_plugin, config) {
      if (typeof config !== "object" || !config.file || !config.url) {
        throw "You must pass an object contains keys named `file` and `url`";
      }
      _plugin = _plugin || {};
      return new Promise((resolve, reject) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", config.file);
        this.showMessage("Uploading a file to " + config.url);
        let totalLength = null;
        axios({
          method: "post",
          url: config.url,
          data: bodyFormData,
          headers: config.headers || { "Content-Type": "multipart/form-data" },
          onUploadProgress: progressEvent => {
            totalLength =
              totalLength || progressEvent.lengthComputable
                ? progressEvent.total
                : progressEvent.target.getResponseHeader("content-length") ||
                  progressEvent.target.getResponseHeader(
                    "x-decompressed-content-length"
                  );
            if (totalLength !== null) {
              const p = (progressEvent.loaded * 100) / totalLength;
              if (parseInt(p) % 5 == 0) {
                this.showProgress(null, p);
                this.$forceUpdate();
              }
            }
            if (config.progress) {
              config.progress(progressEvent.loaded, totalLength);
            }
          },
        })
          .then(response => {
            if (response.status !== 200) {
              console.error(response);
              reject(response.statusText);
            } else {
              this.showMessage(`File uploaded to ${config.url}`);
              if (_plugin.log) _plugin.log(`File uploaded to ${config.url}`);
              resolve(response.data);
            }
          })
          .catch(response => {
            this.showMessage(
              `failed to upload files, error: ${response.statusText}`
            );
            console.error(response);
            reject(response.statusText);
          });
      });
    },
    downloadFileFromUrl(_plugin, config) {
      if (typeof config !== "object" || !config.url) {
        throw "You must pass an object contains keys named `url`";
      }
      return new Promise((resolve, reject) => {
        this.showMessage("Downloading from " + config.url);
        let totalLength = null;
        axios
          .get(config.url, {
            onDownloadProgress: progressEvent => {
              totalLength =
                totalLength || progressEvent.lengthComputable
                  ? progressEvent.total
                  : progressEvent.target.getResponseHeader("content-length") ||
                    progressEvent.target.getResponseHeader(
                      "x-decompressed-content-length"
                    );
              if (totalLength !== null) {
                const p = (progressEvent.loaded * 100) / totalLength;
                if (parseInt(p) % 5 == 0) {
                  this.showProgress(null, p);
                  this.$forceUpdate();
                }
              }
              if (config.progress) {
                config.progress(progressEvent.loaded, totalLength);
              }
            },
          })
          .then(response => {
            if (response.status !== 200) {
              console.error(response);
              reject(response.statusText);
            } else {
              this.showMessage(`File downloaded from ${config.url}`);
              resolve(response.data);
            }
          })
          .catch(response => {
            this.showMessage(
              `failed to download files, error: ${response.statusText}`
            );
            console.error(response);
            reject(response.statusText);
          });
      });
    },
    getFileUrl(_plugin, config) {
      if (typeof config !== "object" || !config.path) {
        throw "You must pass an object contains keys named `path` and `engine`";
      }
      _plugin = _plugin || {};
      config.engine =
        config.engine === undefined ? _plugin.config.engine : config.engine;
      const engine =
        config.engine instanceof Engine
          ? config.engine
          : this.em.getEngineByUrl(config.engine);
      delete config.engine;
      return new Promise((resolve, reject) => {
        if (!engine) {
          reject("Please specify an engine");
          return;
        }
        if (!engine.connected) {
          reject("Please connect to the Plugin Engine 🚀.");
          this.showMessage("Please connect to the Plugin Engine 🚀.");
          return;
        }
        engine
          .getFileUrl(config)
          .then(ret => {
            ret = ret || {};
            if (ret.success) {
              if (_plugin.log)
                _plugin.log(`File url created ${config.path}: ${ret.url}`);
              resolve(ret.url);
              this.$forceUpdate();
            } else {
              ret.error = ret.error || "";
              this.showMessage(
                `Failed to get file url for ${config.path} ${ret.error}`
              );
              reject(`Failed to get file url for ${config.path} ${ret.error}`);
              this.$forceUpdate();
            }
          })
          .catch(reject);
      });
    },
    getFilePath(_plugin, config) {
      if (typeof config !== "object" || !config.url) {
        throw "You must pass an object contains keys named `url` and `engine`";
      }
      _plugin = _plugin || {};
      config.engine =
        config.engine === undefined ? _plugin.config.engine : config.engine;
      const engine =
        config.engine instanceof Engine
          ? config.engine
          : this.em.getEngineByUrl(config.engine);
      delete config.engine;
      return new Promise((resolve, reject) => {
        if (!engine) {
          reject("Please specify an engine");
          return;
        }
        if (!engine.connected) {
          reject("Please connect to the Plugin Engine 🚀.");
          this.showMessage("Please connect to the Plugin Engine 🚀.");
          return;
        }
        engine
          .getFilePath(config)
          .then(ret => {
            ret = ret || {};
            if (ret.success) {
              resolve(ret.path);
              this.$forceUpdate();
            } else {
              ret.error = ret.error || "";
              this.showMessage(
                `Failed to get file path for ${config.url} ${ret.error}`
              );
              reject(`Failed to get file path for ${config.url} ${ret.error}`);
              this.$forceUpdate();
            }
          })
          .catch(reject);
      });
    },
    exportFile(_plugin, file, name) {
      if (typeof file === "string") {
        file = new Blob([file], { type: "text/plain;charset=utf-8" });
      }
      saveAs(file, name || file._name || "file_export");
    },
    showProgress(_plugin, p) {
      if (p < 1) this.progress = p * 100;
      else this.progress = p;
      // this.$forceUpdate()
    },
    showStatus(_plugin, s) {
      this.status_text = s;
      // this.$forceUpdate()
    },
    showDialog(_plugin, config) {
      assert(config, "Please pass config to showDialog.");
      return new Promise((resolve, reject) => {
        this.plugin_dialog_config = null;
        this.plugin_dialog_promise = null;
        if (config.ui) {
          this.plugin_dialog_config = config;
          this.showPluginDialog = true;
          this.plugin_dialog_promise = [
            () => {
              if (this.$refs.plugin_dialog_joy.joy) {
                resolve(this.$refs.plugin_dialog_joy.joy.get_config());
              } else {
                reject("joy not found.");
              }
            },
            reject,
          ];
        } else if (config.type) {
          config.window_container = "window_dialog_container";
          config.standalone = true;
          this.plugin_dialog_window_config = null;
          if (config.type.startsWith("imjoy/")) {
            config.render = wconfig => {
              this.plugin_dialog_window_config = wconfig;
              this.$forceUpdate();
            };
          }
          this.showPluginDialog = true;
          this.createWindow(config)
            .then(api => {
              const _close = api.close;
              this.plugin_dialog_promise = [api.close, api.close];
              api.close = async () => {
                await _close();
                this.showPluginDialog = false;
                this.plugin_dialog_promise = null;
              };
              resolve(api);
            })
            .catch(reject);
        } else {
          this.showMessage("Unsupported dialog type.");
        }
      });
    },
    showAlert(_plugin, text) {
      console.log("alert: ", text);
      if (typeof text === "string") {
        this.alert_config.title = null;
        this.alert_config.content = sanitizer.sanitizeString(text);
        this.alert_config.confirm_text = "OK";
      } else if (typeof text === "object") {
        this.alert_config.title = text.title;
        this.alert_config.content =
          sanitizer.sanitizeString(text.content) || "undefined";
        this.alert_config.confirm_text = text.confirm_text || "OK";
      } else {
        throw "unsupported alert arguments";
      }

      this.alert_config.show = true;
      this.$forceUpdate();
      //alert(text);
    },
    showPrompt(_plugin, text, defaultText) {
      return new Promise((resolve, reject) => {
        if (typeof text === "string") {
          this.prompt_config.title = null;
          this.prompt_config.content = sanitizer.sanitizeString(text);
          this.prompt_config.placeholder = defaultText;
          this.prompt_config.cancel_text = "Cancel";
          this.prompt_config.confirm_text = "Done";
        } else if (typeof text === "object") {
          this.prompt_config.title = text.title;
          this.prompt_config.content =
            sanitizer.sanitizeString(text.content) || "undefined";
          this.prompt_config.placeholder = text.placeholder || null;
          this.prompt_config.cancel_text = text.cancel_text || "Cancel";
          this.prompt_config.confirm_text = text.confirm_text || "Done";
        } else {
          reject("unsupported prompt arguments");
          throw "unsupported prompt arguments";
        }
        this.prompt_config.confirm = () => {
          resolve(this.prompt_config.value || this.prompt_config.placeholder);
        };
        this.prompt_config.cancel = () => {
          reject();
        };
        this.prompt_config.show = true;
      });
      //return prompt(text, defaultText);
    },
    showConfirm(_plugin, text) {
      return new Promise((resolve, reject) => {
        if (typeof text === "string") {
          this.confirm_config.title = null;
          this.confirm_config.content = sanitizer.sanitizeString(text);
          this.confirm_config.cancel_text = "Cancel";
          this.confirm_config.confirm_text = "Done";
        } else if (typeof text === "object") {
          this.confirm_config.title = text.title;
          this.confirm_config.content =
            sanitizer.sanitizeString(text.content) || "undefined";
          this.confirm_config.cancel_text = text.cancel_text || "Cancel";
          this.confirm_config.confirm_text = text.confirm_text || "Done";
        } else {
          reject("unsupported prompt arguments");
          throw "unsupported prompt arguments";
        }
        this.confirm_config.confirm = () => {
          resolve();
        };
        this.confirm_config.cancel = () => {
          reject();
        };
        this.confirm_config.show = true;
      });
      //return confirm(text);
    },
    showLog(_plugin) {
      const w = {
        name: `Log (${_plugin.name})`,
        type: "imjoy/log",
        data: {
          plugins: this.pm.plugin_names,
          name: _plugin.name,
        },
      };
      this.createWindow(w);
    },
    openUrl(_plugin, url) {
      assert(url);
      Object.assign(document.createElement("a"), {
        target: "_blank",
        href: url,
      }).click();
    },
    sleep(_plugin, seconds) {
      assert(seconds);
      return new Promise(resolve =>
        setTimeout(resolve, Math.round(seconds * 1000))
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.site-title {
  height: 65px;
}

@media screen and (max-height: 768px) {
  .site-title {
    height: 55px;
  }
}

.site-title-small {
  height: 55px;
}

@media screen and (max-height: 768px) {
  .site-title-small {
    height: 45px;
  }
}

.subheader-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  text-transform: none;
}

.subheader-emoji {
  font-size: 20px;
  font-weight: 500;
  text-transform: none;
}
.superscript {
  font-size: 16px;
  text-transform: none;
  vertical-align: super;
  color: #ff5253;
}

.md-empty-state {
  height: 100%;
  width: 100%;
}

.md-content {
  overflow-x: hidden;
}

.imjoy {
  height: 100%;
}

.plugin-dialog {
  width: 80%;
  max-width: 800px;
  max-height: 90%;
}

@media screen and (max-width: 800px) {
  .md-dialog {
    width: 100%;
    max-width: 800px;
  }
  .window-dialog {
    width: 100% !important;
    max-width: 800px;
  }
}
@media screen and (min-height: 500px) {
  #engine-file-dialog {
    min-height: 400px !important;
  }
}

#engine-file-dialog {
  z-index: 999;
}

@media screen and (max-height: 900px) {
  .plugin-dialog {
    max-height: 100%;
  }
}

@media screen and (max-height: 700px) {
  .window-dialog {
    height: 100% !important;
    min-height: 100%;
  }
}

.window-dialog {
  margin: 0px;
  min-width: 400px;
  min-height: 500px;
  width: 95%;
  height: 95%;
  max-width: 1000px;
  max-height: 900px;
}

#window_dialog_container {
  height: 100%;
  width: 100%;
}
.md-card {
  /* width: 100%; */
  /* height: 300px; */
  margin-bottom: 20px;
}

.whiteboard-content {
  padding: 0px;
}

.panel-header {
  padding-left: 20px;
  height: 40px;
  min-height: 20px;
}

.panel-title {
  font-size: 1.4em;
}

/* The sticky class is added to the header with JS when it reaches its scroll position */

.sticky {
  position: fixed;
  top: 0;
  width: 100%;
}

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

.sticky + .content {
  padding-top: 102px;
}

.error-message {
  color: red;
  user-select: text;
}

.speed-dial {
  top: 8px !important;
  left: 15px !important;
}

button.md-speed-dial-target {
  background: white !important;
}

.speed-dial-icon {
  color: rgba(0, 0, 0, 0.87) !important;
}

.md-speed-dial-content {
  left: 40px !important;
  top: -17px !important;
  display: flex;
  flex-direction: row;
}

.site-button {
  left: 10px;
  top: 6px;
}

.fullscreen {
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-height: 100%;
}

.status-text {
  text-align: center;
  text-transform: none;
}

.centered-button {
  text-align: center;
  text-transform: none;
}

.md-button {
  margin: 1px;
}

.busy-plugin {
  color: orange !important;
}

.code-editor {
  height: 500px;
}

.op-button {
  font-weight: 300;
}

.md-icon-button {
  width: 36px;
  min-width: 36px;
  height: 36px;
}

.md-drawer {
  overflow: hidden;
}

#plugin-menu {
  height: 100%;
  max-height: calc(100vh - 95px);
  padding: 10px;
}

#plugin-menu > .md-card-content {
  max-height: calc(100vh - 95px - 86px);
  overflow: auto;
}

#plugin-menu > .md-card-header {
  justify-content: space-between;
  display: flex;
}

@media screen and (max-height: 900px) {
  #plugin-menu > .md-card-header {
    padding: 5px;
  }
}

#plugin-menu > .md-button {
  padding: 2px;
}

#workflow-panel {
  margin-bottom: 2px;
}

#workflow-panel > p {
  text-align: center;
  margin-top: 10px;
  margin: 5px;
}

@media screen and (max-width: 600px) {
  .md-icon-button {
    width: 32px;
    min-width: 32px;
    height: 32px;
  }
  .md-drawer {
    width: 320px;
  }
  .h2,
  h2 {
    font-size: 1rem;
  }
}

.md-app {
  height: 100%;
}

.md-app-content {
  height: calc(100%);
}

.normal-text {
  text-transform: none;
}

.red {
  display: inline-block;
  color: #f44336 !important;
  transition: 0.3s;
}

.bold {
  font-weight: bold;
}

.carousel .carousel-nav .nav-item {
  color: rgba(165, 162, 162, 0.5);
}

.carousel
  .carousel-locator:nth-of-type(1):checked
  ~ .carousel-nav
  .nav-item:nth-of-type(1) {
  color: #92add0;
}

.file-dropping {
  background: #cad8ef !important;
}

.md-list-item-content > .md-icon:last-child {
  margin-left: 1px !important;
}

.md-list-item-content > .md-icon:first-child {
  margin-right: 15px !important;
}

.md-toolbar {
  height: 58px !important;
}

@media screen and (max-height: 786px) {
  .md-toolbar {
    height: 42px !important;
  }
}

.title-bar {
  margin-bottom: 10px;
}
</style>
1
