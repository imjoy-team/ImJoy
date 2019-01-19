<template>
<div class="imjoy noselect">
  <div style="visibility:hidden; opacity:0" id="dropzone">
    <div id="textnode">Drop files to add data.</div>
  </div>
  <md-app>
    <md-app-toolbar class="md-dense" md-elevation="0">
      <div class="md-toolbar-section-start">
        <md-button v-if="!menuVisible" class="md-primary md-icon-button" @click="menuVisible=true">
          <md-icon>menu</md-icon>
        </md-button>
        <md-button @click="$router.push('/')" v-if="!menuVisible" class="md-small-hide site-title">
          <img class="site-title" src="static/img/imjoy-logo-black.svg" alt="ImJoy">
          <md-tooltip>ImJoy home</md-tooltip>
        </md-button>
        <md-menu v-if="wm.window_mode==='single' && wm.windows.length > 0">
          <md-button class="md-icon-button md-primary" md-menu-trigger>
            <md-icon>picture_in_picture</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="wm.selectWindow(w)" :disabled="wm.selected_window === w" v-for="w in wm.windows" :key="w.id">
              <span>{{w.name.slice(0, 30)+'(#'+w.i+')'}}</span><md-icon>forward</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button v-if="status_text&&status_text.length" class="status-text md-small-hide" @click="showAlert(null, status_text)" :class="status_text.includes('rror')?'error-message':''">
          {{status_text.slice(0,80)+(status_text.length>80?'...':'')}}
        </md-button>
        <span class="subheader-title md-medium-hide" style="flex: 1" v-else>Image Processing with Joy!</span>
      </div>

      <div class="md-toolbar-section-end">
        <md-snackbar :md-position="'center'" class="md-accent" :md-active.sync="show_snackbar" :md-duration="snackbar_duration">
         <span>{{snackbar_info}}</span>
         <md-button class="md-accent" @click="show_snackbar=false">close</md-button>
        </md-snackbar>
        <md-button @click="wm.closeAll()" class="md-icon-button">
          <md-icon>cancel</md-icon>
          <md-tooltip>Close all windows</md-tooltip>
        </md-button>
        <md-button @click="showSettingsDialog=true" :disabled="true" class="md-icon-button">
          <md-icon>settings</md-icon>
        </md-button>
        <md-button @click="showAboutDialog=true" class="md-icon-button">
          <md-icon>info</md-icon>
        </md-button>
        <md-button class="md-icon-button" href="/docs/" target="_blank">
          <md-icon>help</md-icon>
        </md-button>
        <md-button v-if="!em.connected" @click="showPluginEngineInfo = true" class="md-icon-button md-accent">
          <md-icon>🚀</md-icon>
          <md-tooltip>Connect to the Plugin Engine</md-tooltip>
        </md-button>
        <md-menu v-else md-size="big" md-direction="bottom-end">
          <md-button class="md-icon-button" :class="em.connected?'md-primary':'md-accent'" md-menu-trigger @click="em.updateEngineStatus()">
            <md-icon>{{em.connected?'sync':'sync_disabled'}}</md-icon>
            <md-tooltip>Connection to the Plugin Engine</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item :disabled="true">
              <span>🚀{{em.engine_status.connection}}</span>
            </md-menu-item>
            <md-menu-item @click="em.disconnectEngine()">
              <span>Disconnect</span>
              <md-icon>clear</md-icon>
            </md-menu-item>
            <md-menu-item @click="showPluginEngineInfo=true">
              <span>About Plugin Engine</span>
              <md-icon>info</md-icon>
            </md-menu-item>
            <md-divider></md-divider>
            <md-menu-item :disabled="true">
              <span>Plugin Engine Processes</span>
              <md-button @click.stop="em.updateEngineStatus()" class="md-icon-button md-primary">
                <md-icon>autorenew</md-icon>
              </md-button>
            </md-menu-item>
            <md-menu-item v-for="p in em.engine_status.plugin_processes" :key="p.pid">
              <md-button @click.stop="em.killPluginProcess(p)" class="md-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
              {{p.name}} (#{{p.pid}})
            </md-menu-item>
            <md-menu-item :disabled="true" v-if="em.engine_status.plugin_num>1">
              <span>{{em.engine_status.plugin_num}} Running Plugins</span>
              <md-button @click.stop="em.killPluginProcess()" class="md-icon-button md-accent">
                <md-icon>clear</md-icon>
              </md-button>
            </md-menu-item>
            <md-menu-item :disabled="true" v-if="em.engine_status.plugin_num===0">
              <span> No plugin process is running</span>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <form v-show="false" ref="folder_form">
        <input class="md-file" type="file" @change="selectFileChanged" ref="folder_select" webkitdirectory mozdirectory msdirectory odirectory directory multiple />
      </form>
      <form v-show="false" ref="file_form">
        <input class="md-file" type="file" @change="selectFileChanged" ref="file_select" multiple />
      </form>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="site-button site-title" @click="$router.push('/')">
            <img class="site-title" src="static/img/imjoy-logo-black.svg" alt="ImJoy">
          </md-button>
          <span class="superscript md-small-hide">beta</span>
        </div>
        <div class="md-toolbar-section-end" v-if="pm">
          <md-menu>
            <md-button class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>widgets</md-icon>
              <md-tooltip>Current workspace: {{pm.selected_workspace}}</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="switchWorkspace(w)" :disabled="w===pm.selected_workspace" v-for="w in pm.workspace_list" :key="w">
                <span>{{w}}</span><md-icon>forward</md-icon>
                <md-tooltip>Switch to workspace: {{w}} </md-tooltip>
              </md-menu-item>
              <md-divider></md-divider>
              <md-menu-item @click="showWorkspaceDialog=true">
                <md-icon>view_list</md-icon>Workspaces
              </md-menu-item>
            </md-menu-content>
          </md-menu>

          <md-button class="md-icon-button md-dense md-raised" @click="menuVisible = !menuVisible">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </div>
      <br>
      <md-card id="plugin-menu" v-show="plugin_loaded" v-if="pm">
        <md-card-header>
          <md-menu md-size="big">
            <md-button :class="screenWidth>600?'':'md-icon-button'" md-menu-trigger>
              <md-icon>folder_open</md-icon><span class="md-xsmall-hide">Files</span>
            </md-button>
            <md-menu-content>
              <md-menu-item v-if="em.connected" @click="showEngineFileDialog(); files_expand=false" class="md-button">
                <md-icon>add_to_queue</md-icon>Open Engine File
                <md-tooltip>Load files through the Plugin Engine</md-tooltip>
              </md-menu-item>
              <md-menu-item @click="$refs.file_form.reset();$refs.file_select.click(); files_expand=false" class="md-button">
                <md-icon>insert_drive_file</md-icon>Open File
                <md-tooltip>Open a file</md-tooltip>
              </md-menu-item>
              <md-menu-item @click="$refs.folder_form.reset();$refs.folder_select.click(); files_expand=false" class="md-button">
                <md-icon>folder_open</md-icon>Open Folder
                <md-tooltip>Open a folder</md-tooltip>
              </md-menu-item>
            </md-menu-content>
          </md-menu>

          <md-menu md-size="big">
            <md-button :class="screenWidth>600?'':'md-icon-button'" md-menu-trigger>
              <md-icon>format_list_bulleted</md-icon><span class="md-xsmall-hide">Workflow</span>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="clearWorkflow(); workflow_expand=true;">
                <md-icon>playlist_add</md-icon>New Workflow
                <md-tooltip>Create new workflow</md-tooltip>
              </md-menu-item>
              <md-menu-item @click="workflow_expand=true; loadWorkflow(w)" v-for="w in pm.workflow_list" :key="w.name">
                <span>{{w.name}}</span>
                <md-button @click.stop="shareWorkflow(w)" class="md-icon-button">
                  <md-icon>share</md-icon>
                </md-button>
                <md-button @click.stop="pm.removeWorkflow(w)" class="md-icon-button md-accent">
                  <md-icon>clear</md-icon>
                </md-button>
              </md-menu-item>
            </md-menu-content>
          </md-menu>

          <md-button ref="add_plugin_button" :class="pm.installed_plugins.length>0?'':'md-primary'" @click="showPluginManagement()">
            <md-icon>add</md-icon>Plugins
          </md-button>
        </md-card-header>
         <md-card-content>
          <div id="workflow-panel" v-show="workflow_expand" v-if="pm && show_workflow">
            <joy :config="workflow_joy_config" ref="workflow" v-if="plugin_loaded"></joy>
            <p>
              <md-button class="md-button" v-if="plugin_loaded" @click="runWorkflow(workflow_joy_config.joy)">
                <md-icon>play_arrow</md-icon>Run
                <md-tooltip>run the workflow</md-tooltip>
              </md-button>
              <md-button class="md-button" v-if="plugin_loaded" @click="pm.saveWorkflow(workflow_joy_config.joy)">
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
              <md-button class="md-icon-button" :class="plugin.running?'md-accent':''" md-menu-trigger>
                <md-progress-spinner v-if="plugin.initializing" class="md-accent" :md-diameter="20" md-mode="indeterminate"></md-progress-spinner>
                <md-icon v-else-if="plugin.config.icon">{{plugin.config.icon}}</md-icon>
                <md-icon v-else>extension</md-icon>
                <md-tooltip>{{plugin.config.description}}</md-tooltip>
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
                <md-menu-item @click="pm.reloadPlugin(plugin.config)">
                  <md-icon>autorenew</md-icon>Reload
                </md-menu-item>
                <md-menu-item @click="pm.unloadPlugin(plugin)">
                  <md-icon>clear</md-icon>Terminate
                </md-menu-item>
                <md-menu-item v-if="plugin.config.origin" @click="updatePlugin(plugin.id)">
                  <md-icon>cloud_download</md-icon>Update
                </md-menu-item>
                <md-menu-item class="md-accent" @click="plugin2_remove=plugin;showRemoveConfirmation=true">
                  <md-icon>delete_forever</md-icon>Remove
                </md-menu-item>
              </md-menu-content>
            </md-menu>

            <md-button class="joy-run-button" :class="plugin.running?'md-accent':(plugin._disconnected && plugin.type === 'native-python'? 'disconnected-plugin': 'md-primary')" :disabled="plugin._disconnected && plugin.type != 'native-python'" @click="plugin._disconnected?connectPlugin(plugin):runOp(plugin.ops[plugin.name])">
              {{plugin.type === 'native-python'? plugin.name + ' 🚀': ( plugin.type === 'web-python' ? plugin.name + ' 🐍': plugin.name) }}
            </md-button>

            <md-button v-if="plugin._log_history && plugin._log_history.length>0" class="md-icon-button md-xsmall-hide" @click="showLog(plugin)">
              <md-icon v-if="plugin._log_history._error" class="red">error</md-icon>
              <md-icon v-else>info</md-icon>
              <md-tooltip>{{plugin._log_history._error || plugin._log_history._info}}</md-tooltip>
            </md-button>
            <md-button v-else class="md-icon-button md-xsmall-hide" disabled>
            </md-button>

            <md-button v-if="!plugin._disconnected" class="md-icon-button" @click="plugin.panel_expanded=!plugin.panel_expanded; $forceUpdate()">
              <md-icon v-if="!plugin.panel_expanded">expand_more</md-icon>
              <md-icon v-else>expand_less</md-icon>
            </md-button>
            <md-progress-bar md-mode="determinate" v-if="(plugin.running || plugin.initializing)&&plugin._progress" :md-value="plugin._progress"></md-progress-bar>
            <div v-for="(op) in plugin.ops" :key="op.plugin_id + op.name" v-show="plugin.panel_expanded">
              <md-button v-if="op.name != plugin.name" class="md-icon-button" :disabled="true">
                <md-icon>chevron_right</md-icon>
              </md-button>
              <md-button v-if="op.name != plugin.name" class="joy-run-button md-primary op-button" :class="plugin.running?'md-accent':'md-primary'" :disabled="plugin._disconnected" @click="runOp(op)">
                  {{op.name}}
              </md-button>

              <!-- <md-button class="md-icon-button" v-show="plugin.panel_expanded &&  op.name != plugin.name" @click="op.panel_expanded=!op.panel_expanded; $forceUpdate()"> -->
                <!-- <md-icon v-if="!op.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon> -->
              <!-- </md-button> -->

              <joy :config="op" :show="(plugin.panel_expanded || false)"></joy>
              <md-divider></md-divider>
            </div>
          </div>
          <md-divider></md-divider>
          <div>
            <div v-for="plugin in sortedNonRunnablePlugins()" :key="plugin.name">
              <md-menu md-size="medium">
                <md-button class="md-icon-button" :class="plugin.running?'md-accent':''" md-menu-trigger>
                  <md-progress-spinner v-if="plugin.initializing" class="md-accent" :md-diameter="20" md-mode="indeterminate"></md-progress-spinner>
                  <md-icon v-else-if="plugin.config.icon">{{plugin.config.icon}}</md-icon>
                  <md-icon v-else>extension</md-icon>
                  <md-tooltip>{{plugin.config.description}}</md-tooltip>
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
                  <md-menu-item @click="pm.reloadPlugin(plugin.config)">
                    <md-icon>autorenew</md-icon>Reload
                  </md-menu-item>
                  <md-menu-item @click="pm.unloadPlugin(plugin)">
                    <md-icon>clear</md-icon>Terminate
                  </md-menu-item>
                  <md-menu-item v-if="plugin.config.origin" @click="updatePlugin(plugin.id)">
                    <md-icon>cloud_download</md-icon>Update
                  </md-menu-item>
                  <md-menu-item class="md-accent" @click="plugin2_remove=plugin;showRemoveConfirmation=true">
                    <md-icon>delete_forever</md-icon>Remove
                  </md-menu-item>
                </md-menu-content>
              </md-menu>

              <md-button class="joy-run-button" :class="plugin.running?'md-accent':(plugin._disconnected && plugin.type === 'native-python'? 'disconnected-plugin': '')" :disabled="plugin.type != 'native-python' || !plugin._disconnected" @click="connectPlugin(plugin)">
                {{plugin.type === 'native-python'? plugin.name + ' 🚀': plugin.name}}
              </md-button>
              <md-button class="md-icon-button" :disabled="true">
                <md-icon>visibility_off</md-icon>
              </md-button>
              <md-divider></md-divider>
            </div>
          </div>
          <md-divider></md-divider>
          <p v-if="pm.installed_plugins.length<=0">&nbsp;No plugin installed.</p>
        </md-card-content>
      </md-card>
    </md-app-drawer>
    <md-app-content class="whiteboard-content">
      <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      <whiteboard ref="whiteboard" :mode="wm.window_mode" :window-manager="wm"></whiteboard>
    </md-app-content>
  </md-app>

  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="pm.removePlugin(plugin2_remove);plugin2_remove=null;showRemoveConfirmation=false"/>
  <file-dialog ref="file-dialog" :list-files="listEngineDir" :get-file-url="getFileUrl"></file-dialog>
  <md-dialog :md-active.sync="showPluginDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-content>
      <div v-if="plugin_dialog_config">
        <joy :config="plugin_dialog_config" :showHeader="false" :controlButtons="false" ref="plugin_dialog_joy"></joy>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="closePluginDialog(true)">OK</md-button>
      <md-button class="md-primary" @click="closePluginDialog(false)">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showWorkspaceDialog" :md-click-outside-to-close="true">
    <md-dialog-title>Workspace Management</md-dialog-title>
    <md-dialog-content>
      <md-toolbar class="md-dense" md-elevation="0">
        <div class="md-toolbar-section-start">
        <md-field>
          <label for="workspace_name">Workspace Name</label>
          <md-input type="text" v-model="new_workspace_name" placeholder="Create a new workspace" name="workspace_name"></md-input>
        </md-field>
        </div>
        <div class="md-toolbar-section-end">
          <md-button class="md-primary" @click="switchWorkspace(new_workspace_name);showWorkspaceDialog=false;"><md-icon>add</md-icon>New</md-button>
        </div>
      </md-toolbar>
      <md-list class="md-double-line md-dense">
        <md-list-item v-for="w in pm.workspace_list" :key="w">
            <span>{{w}}</span>
            <md-menu>
              <md-button class="md-icon-button md-list-action" md-menu-trigger>
                <md-icon class="md-primary">more_horiz</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item @click="showWorkspaceDialog=false;switchWorkspace(w)">
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
      <md-button class="md-primary" @click="showWorkspaceDialog=false;">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
  <md-dialog-confirm
      :md-active.sync="showPermissionConfirmation"
      md-title="Confirmation Required"
      :md-content="permission_message"
      md-confirm-text="Deny"
      md-cancel-text="Allow"
      @md-cancel="showPermissionConfirmation=false;processPermission(true)"
      @md-confirm="showPermissionConfirmation=false;processPermission(false)" />

  <md-dialog-alert
      :md-active.sync="showShareUrl"
      :md-content="share_url_message"
      md-confirm-text="Close" />

  <md-dialog :md-active.sync="showPluginEngineInfo" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>Using the Python Plugin Engine</md-dialog-title>
    <md-dialog-content>
        <p>
          Python plugins are supported by ImJoy with the Python Plugin Engine. <br><br>
          If this is your first time to use ImJoy Plugin Engine, please <a href="https://github.com/oeway/ImJoy-App/releases" target="_blank">click here</a> to download the ImJoy Desktop App.
          <br> If you have it already, please start the Plugin Engine, and connect to it.<br>
        </p>
        <md-field>
          <label for="engine_url">Plugin Engine URL</label>
          <md-input type="text" v-model="engine_url" @keyup.enter="em.connectEngine(engine_url, connection_token)" name="engine_url"></md-input>
        </md-field>
        <md-field>
          <label for="connection_token">Connection Token</label>
          <md-input type="text" v-model="connection_token" @keyup.enter="em.connectEngine(engine_url, connection_token)" name="connection_token"></md-input>
        </md-field>
        <p>&nbsp;{{em.engine_status.connection}}</p>
        <p>
          If you failed to install or start the Plugin Engine, please consult <a href="https://github.com/oeway/ImJoy-Engine" target="_blank">here</a>, and choose the alternative solution.<br>
        </p>
        <!-- <p v-if="is_https_mode">Please notice that, browsers such as Safari do not allow the connection form a `https` website to the Plugin Engine, in that case please <a href="http://imjoy.io/#/app" target="_blank">Switch to HTTP version</a> of ImJoy. </p> -->
        <!-- <p v-if="is_https_mode">Also notice that data and settings of ImJoy in the HTTP version and HTTPS version are not shared.</p> -->
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showPluginEngineInfo=false;">Cancel</md-button>
      <md-button class="md-primary" @click="showPluginEngineInfo=false; em.connectEngine(engine_url, connection_token)">Connect</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog style="max-width: 800px; width: 100%; height: 100%;" :md-active.sync="showAboutDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>About ImJoy</md-dialog-title>
    <md-dialog-content>
      <about></about>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAboutDialog=false;">OK</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showAddPluginDialog" :md-click-outside-to-close="false">
    <md-dialog-title>ImJoy Plugin Management</md-dialog-title>
    <md-dialog-content>
      <md-card v-if="show_plugin_templates">
        <md-card-header>
          <div class="md-title">Create a New Plugin</div>
        </md-card-header>
        <md-card-content>
          <md-button class="md-primary md-raised centered-button" @click="newPlugin(template.code);showAddPluginDialog=false" v-for="template in plugin_templates" :key="template.name">
            <md-icon>add</md-icon>{{template.name}}
          </md-button>
        </md-card-content>
      </md-card>
      <md-switch v-if="pm.installed_plugins.length>0 && !plugin4install && !downloading_error && !downloading_plugin" v-model="show_installed_plugins">Show Installed Plugins</md-switch>
      <md-card v-if="show_installed_plugins">
        <md-card-header>
          <div class="md-title">Installed Plugins</div>
        </md-card-header>
        <md-card-content>
          <plugin-list display="list" name="Installed Plugins" description="" :plugin-manager="pm" @message="showMessage" :plugins="pm.installed_plugins" :workspace="pm.selected_workspace"></plugin-list>
        </md-card-content>
      </md-card>
      <md-card  v-if="show_plugin_url">
        <md-card-header>
          <div class="md-title">Install from URL</div>
          <md-toolbar md-elevation="0">
            <md-field md-clearable class="md-toolbar-section-start">
              <md-icon>cloud_download</md-icon>
              <md-input placeholder="Please paste the URL here and press enter." type="text" v-model="plugin_url"  @keyup.enter="tag4install=''; getPlugin4Install(plugin_url)" name="plugin_url"></md-input>
              <md-tooltip>Press `Enter` to get the plugin</md-tooltip>
            </md-field>
          </md-toolbar>
        </md-card-header>
      </md-card>
      <md-progress-spinner v-if="downloading_plugin && !plugin4install" class="md-accent" :md-diameter="40" md-mode="indeterminate"></md-progress-spinner>
      <h2 v-if="downloading_error">&nbsp;&nbsp;{{downloading_error}}</h2>
      <md-card  v-if="plugin4install">
        <md-card-header>
          <md-toolbar md-elevation="0">
            <div class="md-toolbar-section-start">
              <h2><md-icon v-if="plugin4install.icon">{{plugin4install.icon}}</md-icon><md-icon v-else>extension</md-icon>
                {{plugin4install.type === 'native-python'? plugin4install.name + ' 🚀': plugin4install.name}}
              </h2>
            </div>
            <div v-if="tag4install" class="md-toolbar-section-end">
              <md-button class="md-button md-primary" @click="installPlugin(plugin4install, tag4install)">
                <md-icon>cloud_download</md-icon>Install
                <md-tooltip>Install {{plugin4install.name}} (tag=`{{tag4install}}`)</md-tooltip>
              </md-button>
            </div>
            <div v-else class="md-toolbar-section-end">
              <md-menu v-if="plugin4install.tags && plugin4install.tags.length>0">
                <md-button class="md-button md-primary" md-menu-trigger>
                  <md-icon>cloud_download</md-icon>Install
                  <md-tooltip>Choose a tag to install {{plugin4install.name}}</md-tooltip>
                </md-button>
                <md-menu-content>
                  <md-menu-item v-for="tag in plugin4install.tags" :key="tag" @click="installPlugin(plugin4install, tag)">
                    <md-icon>cloud_download</md-icon>{{tag}}
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
              <md-button v-else  class="md-button md-primary" @click="installPlugin(plugin4install)">
                <md-icon>cloud_download</md-icon>Install
              </md-button>
            </div>
          </md-toolbar>
        </md-card-header>
        <md-card-content>
          <p>{{plugin4install.description}}</p>
          <md-chip v-for="tag in plugin4install.tags" @click="tag4install=tag" :class="tag4install===tag? 'md-primary':''" :key="tag">{{tag}}</md-chip>
          <!-- <md-button class="md-button md-primary" @click="showCode(plugin4install)">
            <md-icon>code</md-icon>Code
          </md-button> -->
          <br>
          <md-switch v-if="plugin4install.code" v-model="show_plugin_source">Show plugin source code</md-switch>
          <p>This plugin is <strong>NOT</strong> provided by ImJoy.io. Please make sure the plugin is provided by a trusted source, otherwise it may <strong>harm</strong> your computer.
          </p>
          <plugin-editor v-if="show_plugin_source" class="code-editor" v-model="plugin4install.code" :title="plugin4install.name"></plugin-editor>
        </md-card-content>
      </md-card>
      <md-card v-if="show_plugin_store">
        <md-card-header>
          <div class="md-title">Install from the plugin repository</div>
          <md-chips @md-insert="pm.addRepository($event)" @md-delete="pm.removeRepository(getRepository($event))" class="md-primary shake-on-error" v-model="pm.repository_names" md-placeholder="Add a repository url (e.g. GITHUB REPO) and press enter.">
            <template slot="md-chip" slot-scope="{ chip }" >
              <strong class="md-primary" v-if="pm.selected_repository && chip === pm.selected_repository.name">{{ chip }}</strong>
              <div v-else @click="selectRepository(chip)">{{ chip }}</div>
            </template>
            <div class="md-helper-text" v-if="pm.selected_repository">{{pm.selected_repository.name}}: {{pm.selected_repository.description}}</div>
          </md-chips>
        </md-card-header>
        <md-card-content>
          <plugin-list @message="showMessage" :plugin-manager="pm" :init-search="init_plugin_search" display="list" :plugins="pm.available_plugins" :workspace="pm.selected_workspace"></plugin-list>
        </md-card-content>
      </md-card>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAddPluginDialog=false; clearPluginUrl();">Exit</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_plugin$" }]*/
import Vue from 'vue';
import { saveAs } from 'file-saver';

import WEB_WORKER_PLUGIN_TEMPLATE from '../plugins/webWorkerTemplate.imjoy.html';
import NATIVE_PYTHON_PLUGIN_TEMPLATE from '../plugins/nativePythonTemplate.imjoy.html';
import WEB_PYTHON_PLUGIN_TEMPLATE from '../plugins/webPythonTemplate.imjoy.html';
import WINDOW_PLUGIN_TEMPLATE from '../plugins/windowTemplate.imjoy.html';

import {
  randId,
  url_regex,
  assert
} from '../utils.js'

import {
  PluginManager
} from '../pluginManager.js'

import {
  WindowManager
} from '../windowManager.js'

import {
  EngineManager
} from '../engineManager.js'

import _ from 'lodash'

import {
  Joy
} from '../joy'


import Ajv from 'ajv'
const ajv = new Ajv()

export default {
  name: 'imjoy',
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
      permission_message: 'No permission message.',
      share_url_message: 'No url',
      showShareUrl: false,
      resolve_permission: null,
      reject_permission: null,
      plugin_dialog_config: null,
      plugin_dialog_promise: {},
      plugin2_remove: null,
      is_https_mode: true,
      plugin_url: null,
      downloading_plugin: false,
      downloading_error: '',
      plugin4install: null,
      tag4install: '',
      show_plugin_source: false,
      init_plugin_search: null,
      show_plugin_templates: true,
      show_plugin_store: true,
      show_plugin_url: true,
      show_installed_plugins: false,
      progress: 0,
      status_text: '',
      engine_url: 'http://127.0.0.1:8080',
      connection_token: null,
      engine_session_id: null,
      showPluginEngineInfo: false,
      showWorkspaceDialog: false,
      showWelcomeDialog: false,
      show_file_dialog: false,
      show_workflow: false,
      plugins: null,
      registered: null,
      plugin_api: null,
      plugin_context: null,
      menuVisible: false,
      snackbar_info: '',
      snackbar_duration: 3000,
      show_snackbar: false,
      screenWidth: 1024,
      plugin_loaded: false
    }
  },
  watch: {
    menuVisible() {
      this.wm.resizeAll()
    }
  },
  created() {
    // mocks it for testing if not available
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus || new Vue()
    const imjoy_api = {
      alert: this.showAlert,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      showFileDialog: this.showFileDialog,
      showSnackbar: this.showSnackbar,
      getFileUrl: this.getFileUrl,
      getFilePath: this.getFilePath,
      exportFile: this.exportFile,
      showMessage: (plugin, info, duration) => {this.showMessage(info, duration)},
      log: (plugin, text) => { plugin.log(text); this.$forceUpdate() },
      error: (plugin, text) => { plugin.error(text); this.$forceUpdate() },
      progress: (plugin, text) => { plugin.progress(text); this.$forceUpdate() },
      utils: {$forceUpdate: this.$forceUpdate, openUrl: this.openUrl, sleep: this.sleep, assert: assert},
    }

    // bind this to api functions
    for(let k in this.imjoy_api){
      if(typeof this.imjoy_api[k] === 'function'){
        this.imjoy_api[k] = this.imjoy_api[k].bind(this)
      }
      else if(typeof this.imjoy_api[k] === 'object'){
        for(let u in this.imjoy_api[k]){
          this.imjoy_api[k][u] = this.imjoy_api[k][u].bind(this)
        }
      }
    }

    this.em = new EngineManager({ event_bus: this.event_bus, show_message_callback: this.showMessage, show_engine_callback: this.showEngineConnection.bind(this)})
    this.wm = new WindowManager({ event_bus: this.event_bus, show_message_callback: this.showMessage, add_window_callback: this.addWindow})
    this.pm = new PluginManager({ event_bus: this.event_bus, engine_manager: this.em, window_manager:this.wm, imjoy_api: imjoy_api, show_message_callback: this.showMessage, update_ui_callback: ()=>{this.$forceUpdate()}})

    this.client_id = null
    this.IMJOY_PLUGIN = {
      _id: 'IMJOY_APP'
    }
    this.plugin_templates = [
      {name: "Web Worker (JS)", code: WEB_WORKER_PLUGIN_TEMPLATE},
      {name: "Window (HTML/CSS/JS)", code: WINDOW_PLUGIN_TEMPLATE},
      {name: "Native Python 🚀", code: NATIVE_PYTHON_PLUGIN_TEMPLATE},
      // {name: "Iframe(Javascript)", code: IFRAME_PLUGIN_TEMPLATE},
      {name: "Web Python 🐍", code: WEB_PYTHON_PLUGIN_TEMPLATE}
    ]
    this.new_workspace_name = ''
    this.workflow_joy_config = {
      expanded: true,
      name: "Workflow",
      ui: "{id:'workflow', type:'ops'}"
    }
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "";
      document.querySelector("#dropzone").style.opacity = 1;
      document.querySelector("#textnode").style.fontSize = "48px";
    });
    window.addEventListener("dragenter", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "";
      document.querySelector("#dropzone").style.opacity = 1;
      document.querySelector("#textnode").style.fontSize = "48px";
    });
    window.addEventListener("dragleave", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "hidden";
      document.querySelector("#dropzone").style.opacity = 0;
      document.querySelector("#textnode").style.fontSize = "42px";
    });
    const parseFiles = (e)=>{
      return new Promise((resolve, reject)=>{
        const filelist = []
        let folder_supported = false
        // https://gist.github.com/tiff/3076863
         const traverseFileTree = (item, path, getDataLoaders, end) => {
           path = path || "";
           if (item.isFile) {
             // Get file
             item.file((file)=>{
               file.relativePath = path + file.name
               file.loaders = getDataLoaders(file)
               filelist.push(file);
               if(end) resolve(filelist)
             });
           } else if (item.isDirectory) {
             // Get folder contents
             var dirReader = item.createReader();
             dirReader.readEntries((entries)=>{
               for (var i = 0; i < entries.length; i++) {
                 traverseFileTree(entries[i], path + item.name + "/", getDataLoaders, end && (i===entries.length-1));
               }
             });
           }
           else{
             if(end) resolve(filelist)
           }
        };
        var length = e.dataTransfer.items.length;
        if(length === 0){
          reject()
          return
        }
        for (var i = 0; i < length; i++) {
          if(e.dataTransfer.items[i].webkitGetAsEntry){
            folder_supported = true
            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
            traverseFileTree(entry, null, (f)=>{ return this.wm.getDataLoaders(f) }, i===length-1)
          }
        }
        if(!folder_supported){
          this.selected_files = e.dataTransfer.files;
        }
        else{
          this.selected_files = filelist
        }
      })
    }
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      document.querySelector("#dropzone").style.visibility = "hidden";
      document.querySelector("#dropzone").style.opacity = 0;
      document.querySelector("#textnode").style.fontSize = "42px";
      parseFiles(e).then(this.loadFiles)
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.wm && this.wm.windows.length > 0) {
      const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
  mounted() {

    this.event_bus.$on('resize', this.updateSize)
    this.event_bus.$on('plugin_loaded', ()=>{
      //update the joy workflow if new template added, TODO: preserve settings during reload
      if (this.$refs.workflow && this.$refs.workflow.setupJoy) this.$refs.workflow.setupJoy()
    })
    this.event_bus.$on('op_registered', ()=>{
      //update the joy workflow if new template added, TODO: preserve settings during reload
      if (this.$refs.workflow && this.$refs.workflow.setupJoy) this.$refs.workflow.setupJoy()
    })
    this.event_bus.$on('engine_connected', ()=>{
      this.pm.reloadPythonPlugins()
    })
    this.event_bus.$on('engine_disconnected', ()=>{
      this.pm.unloadPythonPlugins()
    })

    this.updateSize({width: window.innerWidth})

    this.is_https_mode = ('https:' === location.protocol)
    // Make sure the GUI is refreshed
    setInterval(()=>{this.$forceUpdate()}, 5000)
    this.client_id = localStorage.getItem("imjoy_client_id")
    if(!this.client_id){
      this.client_id = 'imjoy_web_'+randId()
      localStorage.setItem("imjoy_client_id", this.client_id);
    }
    this.engine_session_id = randId()
    if(this.$route.query.token || this.$route.query.t){
      this.connection_token = (this.$route.query.token || this.$route.query.t).trim()
      const query = Object.assign({}, this.$route.query);
      delete query.token;
      delete query.t;
      this.$router.replace({ query });
    }
    else{
      this.connection_token = localStorage.getItem("imjoy_connection_token")
    }

    if(this.$route.query.engine || this.$route.query.e){
      this.engine_url = (this.$route.query.engine || this.$route.query.e).trim()
    }
    else{
      this.engine_url = localStorage.getItem("imjoy_engine_url") || 'http://127.0.0.1:8080'
    }

    if(this.welcome){
      this.showWelcomeDialog = true
    }
    else {
      this.startImJoy()
    }

  },
  beforeDestroy() {
    // console.log('terminating plugins')
    this.pm.destroy()
    this.em.destroy()
  },
  methods: {
    startImJoy() {
      this.pm.resetPlugins()
      this.pm.setInputLoaders(this.getDefaultInputLoaders())
      this.pm.loadRepositoryList().then((repository_list)=>{
        this.repository_list = repository_list
        this.pm.selected_repository = this.repository_list[0]
      })

      this.pm.loadWorkspaceList().then((workspace_list)=>{
        this.menuVisible = true
        const selected_workspace = this.$route.query.workspace || this.$route.query.w || workspace_list[0]
        this.pm.loadWorkspace(selected_workspace).then(()=>{
          this.em.connectEngine(this.engine_url, this.connection_token, true)
          this.pm.reloadPlugins().then(()=>{
            this.plugin_loaded = true
            this.$forceUpdate()
            this.event_bus.$emit('plugins_loaded', this.pm.plugins)
            this.pm.reloadRepository().then((manifest)=>{
              this.$forceUpdate()
              this.event_bus.$emit('repositories_loaded', manifest)
            }).finally(()=>{
              const r = (this.$route.query.repo || this.$route.query.r || '').trim()
              if(r){
                this.plugin_url = null
                this.init_plugin_search = null
                this.show_plugin_store = true
                this.show_plugin_url = false
                this.downloading_plugin = true
                this.pm.addRepository(r).then((repo)=>{
                  this.pm.selected_repository = repo
                  this.downloading_plugin = false
                }).catch((e)=>{
                  this.downloading_plugin = false
                  this.downloading_error = "Sorry, the repository URL is invalid: " + e.toString()
                })
                this.show_plugin_templates = false
                this.showAddPluginDialog = true
              }

              const p = (this.$route.query.plugin || this.$route.query.p  || '').trim()
              if(p){
                if (p.match(url_regex) || (p.includes('/') && p.includes(':'))) {
                  this.plugin_url = p
                  this.init_plugin_search = null
                  this.show_plugin_store = false
                  this.show_plugin_url = false
                  this.getPlugin4Install(p)
                }
                else {
                  this.plugin_url = null
                  this.init_plugin_search = p
                  this.show_plugin_store = true
                  this.show_plugin_url = false
                }
                this.show_plugin_templates = false
                this.showAddPluginDialog = true
              }

              this.show_workflow = true
              if(this.$route.query.workflow){
                const data = Joy.decodeWorkflow(this.$route.query.workflow)
                // const query = Object.assign({}, this.$route.query);
                // delete query.workflow;
                // this.$router.replace({ query });
                if(data){
                  this.workflow_joy_config.data = data
                  this.workflow_expand = true
                }
                else{
                  console.log('failed to workflow')
                }
              }

              if(this.$route.query.load || this.$route.query.l){
                const w = {
                  name: "Loaded Url",
                  type: 'imjoy/url_list',
                  scroll: true,
                  data: [this.$route.query.load || this.$route.query.l]
                }
                this.wm.addWindow(w)
              }

              this.$nextTick(() => {
                this.event_bus.$emit('imjoy_ready')
              })
            })
          })
        })
      }).catch((err)=>{
        this.showMessage(err)
        this.status_text = err
      })
    },
    addWindow(w) {
      return new Promise((resolve, reject) => {
        try {
          w.refresh = ()=>{ this.$forceUpdate() }
          this.$nextTick(() => {
            this.$forceUpdate()
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      })
    },
    getDefaultInputLoaders(){
      const code_loader = (file)=>{
        const reader = new FileReader();
        reader.onload = ()=>{
            this.newPlugin(reader.result)
        }
        reader.readAsText(file);
      }
      return [
        {loader_key: 'Code Editor', schema: ajv.compile({properties: {name: {type:"string", "pattern": ".*\\.imjoy.html|\\.html|\\.txt|\\.xml"}, size: {type: 'number'}}, required: ["name", "size"], loader: code_loader})},
      ]
    },
    updateSize(e){
      this.screenWidth = e.width
      if(this.screenWidth > 800){
        this.wm.window_mode = 'grid'
      }
      else{
        this.wm.window_mode = 'single'
      }
    },
    showEngineConnection(show, message, resolve, reject){
      if(message && resolve && reject){
        this.permission_message = resolve
        this.reject_permission = reject
        this.showPermissionConfirmation = true
      }
      else{
        this.showPluginEngineInfo = show
      }

    },
    getRepository(repo_name){
      for(let r of this.pm.repository_list){
        if(r.name === repo_name){
          return r
        }
      }
    },
    selectRepository(repo){
      for(let r of this.pm.repository_list){
        if(r.name === repo){
          this.pm.reloadRepository(r).then(()=>{this.$forceUpdate()})
          return r
        }
      }
    },
    connectPlugin(plugin){
      if(plugin._disconnected){
        if(plugin.type === 'native-python' && !this.em.connected){
          this.em.connectEngine(this.engine_url, this.connection_token)
        }
        else{
          this.pm.reloadPlugin(plugin.config)
        }
      }
    },
    getPlugin4Install(plugin_url){
      this.plugin4install = null
      this.downloading_error = ""
      this.downloading_plugin = true
      this.pm.getPluginFromUrl(plugin_url).then((config)=>{
        this.plugin4install = config
        this.tag4install = config.tag
        this.downloading_plugin = false
      }).catch((e)=>{
        this.downloading_plugin = false
        this.downloading_error = "Sorry, the plugin URL is invalid: " + e.toString()
        this.showMessage("Sorry, the plugin URL is invalid: " + e.toString())
      })
    },
    showPluginManagement(){
      this.plugin4install=null
      this.downloading_error=''
      this.downloading_plugin=false
      this.init_plugin_search=''
      this.show_plugin_templates=true
      this.show_plugin_store=true
      this.show_plugin_url=true
      this.showAddPluginDialog=true
    },
    sortedRunnablePlugins: function() {
        return _.orderBy(this.pm.plugins, 'name').filter((p)=>{return p.config.runnable});
    },

    sortedNonRunnablePlugins: function() {
        return _.orderBy(this.pm.plugins, 'name').filter((p)=>{return !p.config.runnable});
    },
    registerExtension(exts, plugin) {
      for (let i = 0; i < exts.length; i++) {
        exts[i] = exts[i].replace('.', '')
        if (this.registered.extensions[exts[i]]) {
          this.registered.extensions[exts[i]].push(plugin)
        } else {
          this.registered.extensions[exts[i]] = [plugin]
        }
      }
    },
    switchWorkspace(w) {
      // console.log('switch to ', w)
      if(!w || w.trim() == ''){
        this.showMessage("Workspace name should not be empty.")
        throw "Workspace name should not be empty."
      }
      let q = {
        workspace: w
      }
      if (w === 'default') {
        q = null
      }
      this.$router.push({
        name: 'app',
        query: q
      })
      window.location.reload()
    },
    removeWorkspace(w){
      const load_default = this.pm.selected_workspace === w.name
      this.pm.removeWorkspace(w).then(()=>{
        this.showMessage(`Workspace ${w} has been deleted.`)
        // if current workspace is deleted, go to default
        if (load_default) {
          this.$router.replace({
            query: {
              w: 'default'
            }
          })
        }
      }).catch((e)=>{
        this.showMessage(e)
        this.status_text = e
      })
    },
    showMessage(info, duration) {
      this.snackbar_info = info
      if(duration){
        duration = duration * 1000
      }
      this.snackbar_duration = duration || 10000
      this.show_snackbar = true
      this.status_text = info
      this.$forceUpdate()
    },
    showEngineFileDialog(){
      this.showFileDialog(this.IMJOY_PLUGIN, {uri_type: 'url'}).then((selection)=>{
        if(typeof selection === 'string'){
          selection = [selection]
        }
        const urls = []
        for(let u of selection){
          urls.push({href: u, text: u.split('name=')[1]})
        }
        const w = {
          name: "Files",
          type: 'imjoy/url_list',
          scroll: true,
          data: urls
        }
        this.wm.addWindow(w)
      })
    },
    processPermission(allow){
      if(allow && this.resolve_permission){
        this.resolve_permission();
        this.resolve_permission = null;
      }
      else if(this.reject_permission){
        this.reject_permission("Permission Denied!");
        this.reject_permission = null;
      }
      else{
        console.error('permission handler not found.')
      }
    },
    listEngineDir(path, type, recursive){
      return this.em.listEngineDir(path, type, recursive)
    },
    showDoc(pid) {
      const plugin = this.pm.plugins[pid]
      const pconfig = plugin.config
      const w = {
        name: "About " + pconfig.name,
        type: 'imjoy/markdown',
        w: 20,
        h: 10,
        scroll: true,
        data: {
          name: pconfig.name,
          id: plugin.id,
          source: pconfig && pconfig.docs[0] && pconfig.docs[0].content
        }
      }
      this.wm.addWindow(w)
    },
    clearPluginUrl(){
      const query = Object.assign({}, this.$route.query);
      delete query.p;
      delete query.plugin;
      this.$router.replace({ query });
    },
    sharePlugin(pid){
      const plugin = this.pm.plugins[pid]
      const pconfig = plugin.config
      if(pconfig.origin){
        const url = 'https://imjoy.io/#/app?p=' + pconfig.origin
        this.share_url_message = `<h2>Sharing "${plugin.name}"</h2> <br> <a href="${encodeURI(url)}" target="_blank">${url}</a> <br> (Right click on the link and select "Copy Link Address")`
        this.showShareUrl = true
        const query = Object.assign({}, this.$route.query);
        query.p = pconfig.origin;
        this.$router.replace({ query });
      }
      else{
        const filename = plugin.name+"_"+randId()+'.imjoy.html'
        const file = new Blob([pconfig.code], {type: "text/plain;charset=utf-8"})
        saveAs(file, filename);
      }
    },
    installPlugin(plugin4install, tag4install){
      this.pm.installPlugin(plugin4install, tag4install).then(()=>{
        this.showAddPluginDialog = false
        this.clearPluginUrl()
        this.$forceUpdate()
      })
    },
    updatePlugin(pid){
      const plugin = this.pm.plugins[pid]
      const pconfig = plugin.config
      if(pconfig.origin){
        this.pm.installPlugin(pconfig.origin).then(()=>{
          this.$forceUpdate()
        })
      }
      else{
        alert('Origin not found for this plugin.')
      }
    },
    editPlugin(pid) {
      const plugin = this.pm.plugins[pid]
      const pconfig = plugin.config
      const w = {
        name: pconfig.name || 'plugin',
        type: 'imjoy/plugin-editor',
        config: {},
        plugin: plugin,
        plugin_manager: this.pm,
        w: 20,
        h: 10,
        data: {
          name: pconfig.name,
          id: plugin.id,
          code: pconfig.code
        }
      }
      this.wm.addWindow(w)
    },
    newPlugin(code) {
      const w = {
        name: 'New Plugin',
        type: 'imjoy/plugin-editor',
        config: {},
        plugin_manager: this.pm,
        w: 20,
        h: 10,
        plugin: {},
        data: {
          name: 'new plugin',
          id: 'plugin_' + randId(),
          code: JSON.parse(JSON.stringify(code))
        }
      }
      this.wm.addWindow(w)
    },
    closePluginDialog(ok) {
      this.showPluginDialog = false
      let [resolve, reject] = this.plugin_dialog_promise
      if (ok) {
        resolve(this.$refs.plugin_dialog_joy.joy.get_config())
      } else {
        reject()
      }
      this.plugin_dialog_promise = null
    },
    loadFiles(selected_files) {
      if(selected_files.length === 1){
        const file = selected_files[0]
        const loaders = this.wm.getDataLoaders(file)
        const keys = Object.keys(loaders)
        if(keys.length === 1){
          try {
            return this.wm.registered_loaders[loaders[keys[0]]](file)
          } catch (e) {
            console.error(`Failed to load with the matched loader ${loaders[0]}`, e)
          }
        }
      }
      for (let f = 0; f < selected_files.length; f++) {
        const file = selected_files[f]
        file.loaders = file.loaders || this.wm.getDataLoaders(file)
      }
      const w = {
        name: 'Files',
        type: 'imjoy/files',
        config: {},
        select: -1,
        _op: '__file_loader__',
        _source_op: null,
        _workflow_id: 'files_'+randId(),
        _transfer: false,
        data: selected_files
      }
      this.wm.addWindow(w)
    },
    clearWorkflow() {
      this.workflow_joy_config.data = null
      this.$refs.workflow.setupJoy(true)
    },
    runWorkflow(joy) {
      this.status_text = ''
      this.progress = 0
      const w = this.wm.active_windows[this.wm.active_windows.length - 1] || {}
      const mw = this.pm.plugin2joy(w) || {}
      mw.target = mw.target || {}
      mw.target._op = 'workflow'
      mw.target._source_op = null
      // mw.target._transfer = true
      mw.target._workflow_id = mw.target._workflow_id || "workflow_"+randId()
      joy.workflow.execute(mw.target).then((my) => {
        const w = this.pm.joy2plugin(my)
        if(w && w.data && Object.keys(w.data).length>2){
          // console.log('result', w)
          w.name = w.name || 'result'
          w.type = w.type || 'imjoy/generic'
          this.pm.createWindow(null, w)
        }
        this.progress = 100
      }).catch((e) => {
        console.error(e)
        this.status_text = e.toString() || "Error."
        this.showMessage(e || "Error." , 12)
      })
    },

    loadWorkflow(w) {
      this.workflow_joy_config.data = JSON.parse(w.workflow)
      this.$refs.workflow.setupJoy(true)
    },
    shareWorkflow(w) {
      const url = Joy.encodeWorkflow(w.workflow)
      this.share_url_message = `${location.protocol}//${location.hostname}${location.port ? ':'+location.port: ''}/#/app/?workflow=${url}`
      this.showShareUrl = true
    },
    runOp(op) {
      this.status_text = ''
      this.progress = 0
      const w = this.wm.active_windows[this.wm.active_windows.length - 1] || {}
      const mw = this.pm.plugin2joy(w) || {}
      mw.target = mw.target || {}
      mw.target._op = op.name
      mw.target._source_op = null
      // mw.target._transfer = true
      mw.target._workflow_id = mw.target._workflow_id || "op_"+op.name.trim().replace(/ /g, '_')+randId()
      op.joy.__op__.execute(mw.target).then((my) => {
        const w = this.pm.joy2plugin(my)
        if (w) {
          w.name = w.name || 'result'
          w.type = w.type || 'imjoy/generic'
          this.pm.createWindow(null, w)
        }
        this.progress = 100
      }).catch((e) => {
        console.error(e)
        this.status_text = '<' +op.name + '>' + (e.toString() || "Error.")
        this.showMessage(this.status_text, 15)
      })
    },
    selectFileChanged(event) {
      // console.log(event.target.files)
      this.selected_file = event.target.files[0];
      this.selected_files = event.target.files;
      //normalize relative path
      for(let i=0;i<event.target.files.length; i++){
        const file = event.target.files[i];
        file.relativePath = file.webkitRelativePath;
        file.loaders = this.wm.getDataLoaders(file)
      }
      this.loadFiles(this.selected_files)
    },

    //#################ImJoy API functions##################
    showSnackbar(_plugin, msg, duration){
      if(duration){
        duration = duration * 1000
      }
      this.showMessage(msg, duration)
    },
    showFileDialog(_plugin, options){
      assert(typeof options === 'object')
      if(!this.em.connected){
        this.showMessage('File Dialog requires the plugin engine, please connect to the plugin engine.')
        throw "Please connect to the Plugin Engine 🚀."
      }
      if(_plugin && _plugin.id){
        const source_plugin = this.pm.plugins[_plugin.id]
        if(source_plugin || _plugin === this.IMJOY_PLUGIN){
          if(source_plugin){
            options.root = options.root || (source_plugin.config && source_plugin.config.work_dir)
          }
          if(source_plugin && source_plugin.type != 'native-python'){
            options.uri_type = options.uri_type || 'url'
          }
          else{
            options.uri_type = options.uri_type || 'path'
          }
          return this.$refs['file-dialog'].showDialog(_plugin, options)
        }
      }
      else{
        return this.$refs['file-dialog'].showDialog(_plugin, options)
      }
    },
    getFileUrl(_plugin, path){
      return new Promise((resolve, reject) => {
        if(!this.em.connected){
          reject("Please connect to the Plugin Engine 🚀.")
          this.showMessage("Please connect to the Plugin Engine 🚀.")
          return
        }
        if(_plugin !== this.IMJOY_PLUGIN && (!_plugin || !_plugin.id)){
          reject("Plugin not found.")
          return
        }
        const source_plugin = this.pm.plugins[_plugin.id]
        const plugin_name = source_plugin && source_plugin.name
        if(_plugin !== this.IMJOY_PLUGIN && !plugin_name){
          reject("Plugin name not found.")
          return
        }
        if(!this.showPermissionConfirmation){
          let config = path
          if(typeof path === 'string'){
            config = {path: path}
          }
          const resolve_permission = ()=>{
            this.em.getFileUrl(config).then((ret)=>{
              if(ret.success){
                resolve(ret.url)
                this.$forceUpdate()
              }
              else{
                this.showMessage(`Failed to get file url for ${config.path} ${ret.error}`)
                reject(ret.error)
                this.$forceUpdate()
              }
            })
          }
          if(_plugin === this.IMJOY_PLUGIN){
            resolve_permission()
          }
          else{
            this.permission_message = `Plugin <strong>"${plugin_name}"</strong> would like to access your local file at <strong>"${config.path}"</strong><br>This means files and folders under "${config.path}" will be exposed as an url which can be accessed with the url.<br><strong>Please make sure this file path do not contain any confidential or sensitive data.</strong><br>Do you trust this plugin and allow this operation?`
            this.resolve_permission = resolve_permission
            this.reject_permission = reject
            this.showPermissionConfirmation = true
          }
        }
        else{
          reject("There is a pending permission request, please try again later.")
        }
      })
    },
    getFilePath(_plugin, url){
      return new Promise((resolve, reject) => {
        if(!this.em.connected){
          reject("Please connect to the Plugin Engine 🚀.")
          this.showMessage("Please connect to the Plugin Engine 🚀.")
          return
        }
        let config = url
        if(typeof url === 'string'){
          config = {url: url}
        }
        this.em.getFilePath(config).then((ret)=>{
          if(ret.success){
            resolve(ret.path)
            this.$forceUpdate()
          }
          else{
            this.showMessage(`Failed to get file path for ${config.url} ${ret.error}`)
            reject(ret.error)
            this.$forceUpdate()
          }
        })
      })
    },
    exportFile(_plugin, file, name){
      saveAs(file, name || file._name || 'file_export');
    },
    showProgress(_plugin, p) {
      if (p < 1) this.progress = p * 100
      else this.progress = p
      // this.$forceUpdate()
    },
    showStatus(_plugin, s) {
      this.status_text = s
      // this.$forceUpdate()
    },
    showDialog(_plugin, config) {
      assert(config)
      return new Promise((resolve, reject) => {
        this.plugin_dialog_config = config
        this.showPluginDialog = true
        this.plugin_dialog_promise = [resolve, reject]
      })
    },
    showAlert(_plugin, text){
      console.log('alert: ', text)
      alert(text)
    },
    showLog(_plugin){
      const w = {
        name: `Log (${_plugin.name})`,
        type: 'imjoy/log',
        data: {
          log_history: _plugin._log_history
        }
      }
      this.pm.createWindow(null, w)
    },
    openUrl(_plugin, url){
      assert(url)
      Object.assign(document.createElement('a'), { target: '_blank', href: url}).click();
    },
    sleep(_plugin, seconds) {
      assert(seconds)
      return new Promise(resolve => setTimeout(resolve, Math.round(seconds*1000)));
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.site-title {
  font-size: 35px;
  font-weight: 300;
  height: 60px;
  width: 200px;
}

@media screen and (max-width: 600px) {
  .site-title {
    font-size: 26px;
    font-weight: 250;
  }
}

@media screen and (max-width: 400px) {
  .site-title {
    font-size: 22px;
    font-weight: 220;
    height: 40px;
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

/* .md-dialog {
  width: 80%;
  max-width: 700px;
} */

@media screen and (max-width: 700px) {
  .md-dialog {
    width: 100%;
    max-width: 100%;
  }
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
  width: 100%
}

/* Add some top padding to the page content to prevent sudden quick movement (as the header gets a new position at the top of the page (position:fixed and top:0) */

.sticky+.content {
  padding-top: 102px;
}

.error-message {
  color: red;
  user-select: text;
}

div#dropzone {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: visibility 175ms, opacity 175ms;
  display: table;
  text-shadow: 1px 1px 2px #000;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}

div#textnode {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  transition: font-size 175ms;
}

.speed-dial {
  top: 8px !important;
  left: 15px !important;

}

button.md-speed-dial-target {
  background: white!important;
}

.speed-dial-icon {
  color: rgba(0,0,0,0.87)!important;
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

.status-text{
  text-align: center;
  text-transform: none;
}

.centered-button{
  text-align: center;
  text-transform: none;
}

.md-button {
  margin: 1px;
}

.disconnected-plugin{
  color: orange!important;
}

.code-editor {
  height: 500px;
}

.op-button{
  font-weight: 300;
}

.md-icon-button{
  width: 36px;
  min-width: 36px;
  height: 36px;
}

.md-drawer{
  overflow: hidden;
}


#plugin-menu{
  max-height: calc( 100vh - 95px );
  padding: 10px;
}

#plugin-menu > .md-card-content{
  max-height: calc( 100vh - 95px - 86px );
  overflow: auto;
}

#plugin-menu > .md-card-header {
  justify-content: space-between;
  display: flex;
}

#plugin-menu > .md-button{
  padding: 2px;
}

#workflow-panel{
  margin-bottom: 2px;
}

#workflow-panel > p{
  text-align: center;
  margin-top: 10px;
  margin: 5px;
}

@media screen and (max-width: 600px) {
  .md-icon-button{
    width: 32px;
    min-width: 32px;
    height: 32px;
  }
  .md-drawer{
    width: 320px;
  }
}

.md-app {
  height: 100vh;
}

.md-app-content {
  height: calc( 100vh - 65px );
}

.normal-text{
  text-transform: none;
}

.red{
  display: inline-block;
  color: #f44336!important;
  transition: .3s;
}
</style>
