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
          <!-- <md-tooltip>show sidebar</md-tooltip> -->
        </md-button>
        <md-button @click="$router.push('/')" v-if="!menuVisible" class="md-medium-hide">
          <div class="site-title">ImJoy.io<span class="superscript md-small-hide">alpha</span></div>
          <md-tooltip>ImJoy home</md-tooltip>
        </md-button>
        <md-button v-if="status_text&&status_text.length"class="status-text md-small-hide" @click="showAlert(status_text)" :class="status_text.includes('rror')?'error-message':''">
          {{status_text.slice(0,80)+(status_text.length>80?'...':'')}}
        </md-button>
        <span class="subheader-title md-small-hide" style="flex: 1" v-else>Image Processing with <span class="subheader-emoji">😁</span></span>
      </div>

      <div class="md-toolbar-section-end">
        <md-snackbar :md-position="'center'" class="md-accent" :md-active.sync="show_snackbar" :md-duration="snackbar_duration">
         <span>{{snackbar_info}}</span>
         <md-button class="md-accent" @click="show_snackbar=false">close</md-button>
        </md-snackbar>
        <md-button @click="closeAll" class="md-icon-button">
          <md-icon>cancel</md-icon>
          <md-tooltip>Close all windows</md-tooltip>
        </md-button>
        <md-button :disabled="true" class="md-icon-button">
          <md-icon>save</md-icon>
          <md-tooltip>Save all windows</md-tooltip>
        </md-button>
        <!-- <md-button @click="showSettingsDialog=true" class="md-icon-button">
          <md-icon>settings</md-icon>
        </md-button> -->
        <md-button class="md-icon-button" href="/docs/" target="_blank">
          <md-icon>help</md-icon>
          <!-- <md-tooltip>Open help information.</md-tooltip> -->
        </md-button>
        <md-button v-if="!engine_connected" @click="showPluginEngineInfo = true" class="md-icon-button md-accent">
          <md-icon>🚀</md-icon>
          <md-tooltip>Connect to the Plugin Engine</md-tooltip>
        </md-button>
        <md-menu v-else md-size="big" md-direction="bottom-end">
          <md-button class="md-icon-button" :class="engine_connected?'md-primary':'md-accent'" md-menu-trigger>
            <md-icon>{{engine_connected?'sync':'sync_disabled'}}</md-icon>
            <md-tooltip>Connection to the Plugin Engine</md-tooltip>
          </md-button>
          <md-menu-content>
            <md-menu-item :disabled="true">
              <span>🚀{{engine_status}}</span>
            </md-menu-item>
            <!-- <md-menu-item @click="connectEngine(engine_url)">
              <span>Connect</span>
              <md-icon>settings_ethernet</md-icon>
            </md-menu-item> -->
            <md-menu-item @click="disconnectEngine()">
              <span>Disconnect</span>
              <md-icon>clear</md-icon>
            </md-menu-item>
            <md-menu-item @click="showPluginEngineInfo=true">
              <span>About Plugin Engine</span>
              <md-icon>info</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <form v-show="false" ref="folder_form">
        <input class="md-file" type="file" @change="selectFileChanged" ref="folder_select" webkitdirectory mozdirectory msdirectory odirectory directory multiple></input>
      </form>
      <form v-show="false" ref="file_form">
        <input class="md-file" type="file" @change="selectFileChanged" ref="file_select" multiple></input>
      </form>
    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <!-- <md-app-toolbar class="md-primary md-dense"> -->
      <md-speed-dial class="md-top-left speed-dial" md-event="hover" md-effect="scale" md-direction="bottom">
        <md-speed-dial-target class="md-primary">
          <md-icon>add</md-icon>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button v-if="engine_connected" @click="showEngineFileDialog()" class="md-icon-button md-primary">
            <md-icon>add_to_queue</md-icon>
            <md-tooltip>Load files through the Python Plugin Engine</md-tooltip>
          </md-button>
          <md-button @click="$refs.file_form.reset();$refs.file_select.click()" class="md-icon-button md-primary">
            <md-icon>insert_drive_file</md-icon>
            <md-tooltip>Open a file</md-tooltip>
          </md-button>
          <md-button @click="$refs.folder_form.reset();$refs.folder_select.click()" class="md-icon-button md-primary">
            <md-icon>folder_open</md-icon>
            <md-tooltip>Open a folder</md-tooltip>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="site-button" @click="$router.push('/')">
            <div class="site-title">ImJoy.io<span class="superscript">alpha</span></div>
          </md-button>
        </div>
        <div class="md-toolbar-section-end">
          <md-menu>
            <md-button class="md-icon-button md-primary" md-menu-trigger>
              <md-icon>widgets</md-icon>
              <md-tooltip>Current workspace: {{selected_workspace}}</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="switchWorkspace(w)" :disabled="w==selected_workspace" v-for="w in workspace_list" :key="w">
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
            <!-- <md-tooltip>Hide sidebar</md-tooltip> -->
          </md-button>
        </div>
      </div>
      <br>
      <md-card>
        <md-card-header>
          <div class="md-layout md-gutter md-alignment-center-space-between">
            <div class="md-layout-item md-size-70">
              <md-button @click="workflow_expand=!workflow_expand" :class="workflow_expand?'': 'md-primary'"><span class="md-subheading"><md-icon>format_list_bulleted</md-icon>Workflow</span></md-button>
            </div>
            <div v-show="workflow_expand" class="md-layout-item">
              <md-button @click="clearWorkflow()" class="md-icon-button">
                <md-icon>clear</md-icon>
                <md-tooltip>Clear workflow</md-tooltip>
              </md-button>
            </div>
          </div>
        </md-card-header>
        <md-card-content v-show="workflow_expand">
          <joy :config="workflow_joy_config" ref="workflow" v-if="plugin_loaded && !updating_workflow"></joy>
          <md-button class="md-button md-primary" v-if="plugin_loaded" @click="runWorkflow(workflow_joy_config.joy)">
            <md-icon>play_arrow</md-icon>Run
            <md-tooltip>run the workflow</md-tooltip>
          </md-button>

          <md-button class="md-button md-primary" v-if="plugin_loaded" @click="saveWorkflow(workflow_joy_config.joy)">
            <md-icon>save</md-icon>Save
            <md-tooltip>save the workflow</md-tooltip>
          </md-button>

          <md-menu md-size="big">
            <md-button class="md-button md-primary" :disabled="workflow_list.length==0" md-menu-trigger>
              <md-icon>more_horiz</md-icon> Load
              <md-tooltip>load a workflow</md-tooltip>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="loadWorkflow(w)" v-for="w in workflow_list" :key="w.name">
                <span>{{w.name}}</span>
                <md-button @click.stop="shareWorkflow(w)" class="md-icon-button">
                  <md-icon>share</md-icon>
                </md-button>
                <md-button @click.stop="removeWorkflow(w)" class="md-icon-button md-accent">
                  <md-icon>clear</md-icon>
                </md-button>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
        </md-card-content>
      </md-card>
      <div v-if="plugin_loaded">
        <md-card>
          <md-card-header>
            <div class="md-layout md-gutter md-alignment-center-space-between">
              <div class="md-layout-item md-size-70">
                <!-- <span class="md-subheading">Plugins</span> -->
                <md-button class="md-raised" :class="installed_plugins.length>0?'':'md-primary'" @click="showPluginManagement()">
                  <md-icon>add</md-icon>Plugins
                </md-button>
              </div>
              <div class="md-layout-item">
                <md-button @click="reloadPlugins()" class="md-icon-button">
                  <md-icon>autorenew</md-icon>
                  <md-tooltip>Reload/restart all the plugins</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-card-header>
          <md-card-content>
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
                  <md-menu-item @click="editPlugin(plugin.id)">
                    <md-icon>edit</md-icon>Edit
                  </md-menu-item>
                  <md-menu-item @click="reloadPlugin(plugin.config)">
                    <md-icon>autorenew</md-icon>Reload
                  </md-menu-item>
                  <md-menu-item @click="unloadPlugin(plugin)">
                    <md-icon>clear</md-icon>Terminate
                  </md-menu-item>
                  <md-menu-item class="md-accent" @click="_plugin2_remove=plugin;showRemoveConfirmation=true">
                    <md-icon>delete_forever</md-icon>Remove
                  </md-menu-item>
                </md-menu-content>
              </md-menu>

              <md-button class="joy-run-button" :class="plugin.running?'md-accent':(plugin._disconnected && plugin.mode == 'pyworker'? 'disconnected-plugin': 'md-primary')" :disabled="plugin._disconnected && plugin.mode != 'pyworker'" @click="plugin._disconnected?connectPlugin(plugin):runOp(plugin.ops[plugin.name])">
                {{plugin.mode == 'pyworker'? plugin.name + ' 🚀': plugin.name}}
              </md-button>
              <md-button v-if="!plugin._disconnected" class="md-icon-button" @click="plugin.panel_expanded=!plugin.panel_expanded; $forceUpdate()">
                <md-icon v-if="!plugin.panel_expanded">expand_more</md-icon>
                <md-icon v-else>expand_less</md-icon>
              </md-button>
              <md-progress-bar md-mode="determinate" v-if="plugin.running&&plugin.progress" :md-value="plugin.progress"></md-progress-bar>
              <p v-if="plugin.running&&plugin.status_text">{{plugin.status_text}}</p>
              <div v-for="(op, n) in plugin.ops" :key="op.plugin_id + op.name">
                <md-button class="md-icon-button" v-show="plugin.panel_expanded && op.name != plugin.name" :disabled="true">
                  <md-icon>chevron_right</md-icon>
                </md-button>
                <md-button class="joy-run-button md-primary op-button" :class="plugin.running?'md-accent':'md-primary'" :disabled="plugin._disconnected" v-show="plugin.panel_expanded && op.name != plugin.name" @click="runOp(op)">
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
              <!-- <md-button class="md-icon-button" @click="non_runnable_panel_expanded=!non_runnable_panel_expanded; $forceUpdate()">
                <md-icon v-if="!non_runnable_panel_expanded">add</md-icon>
                <md-icon v-else>remove</md-icon>
              </md-button> -->
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
                    <md-menu-item @click="editPlugin(plugin.id)">
                      <md-icon>edit</md-icon>Edit
                    </md-menu-item>
                    <md-menu-item @click="reloadPlugin(plugin.config)">
                      <md-icon>autorenew</md-icon>Reload
                    </md-menu-item>
                    <md-menu-item @click="unloadPlugin(plugin)">
                      <md-icon>clear</md-icon>Terminate
                    </md-menu-item>
                    <md-menu-item class="md-accent" @click="_plugin2_remove=plugin;showRemoveConfirmation=true">
                      <md-icon>delete_forever</md-icon>Remove
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>

                <md-button class="joy-run-button" :class="plugin.running?'md-accent':(plugin._disconnected && plugin.mode == 'pyworker'? 'disconnected-plugin': '')" :disabled="plugin.mode != 'pyworker' || !plugin._disconnected" @click="connectPlugin(plugin)">
                  {{plugin.mode == 'pyworker'? plugin.name + ' 🚀': plugin.name}}
                </md-button>
                <md-divider></md-divider>
              </div>
            </div>
            <md-divider></md-divider>
            <p v-if="installed_plugins.length<=0">&nbsp;No plugin installed.</p>
          </md-card-content>
        </md-card>
      </div>

    </md-app-drawer>
    <md-app-content class="whiteboard-content">
      <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      <whiteboard :windows="windows" :loaders="registered&&registered.loaders" @add="windowAdded" @close="windowClosed" @select="windowSelected"></whiteboard>
    </md-app-content>
  </md-app>

  <md-dialog-confirm :md-active.sync="showRemoveConfirmation" md-title="Removing Plugin" md-content="Do you really want to <strong>delete</strong> this plugin" md-confirm-text="Yes" md-cancel-text="Cancel" @md-cancel="showRemoveConfirmation=false" @md-confirm="removePlugin(_plugin2_remove);_plugin2_remove=null;showRemoveConfirmation=false"/>
  <!-- </md-card-content> -->
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
        <md-list-item v-for="w in workspace_list" :key="w">
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
          If this is your first time to use ImJoy Plugin Engine, please <a href="https://github.com/oeway/ImJoy-Engine/releases" target="_blank">click here</a> to download the ImJoy Plugin Engine.
          <br> If you have it already, please start the Plugin Engine, and connect to it.<br>
        </p>
        <md-field>
          <label for="engine_url">Plugin Engine URL</label>
          <md-input type="text" v-model="engine_url" @keyup.enter="connectEngine(engine_url)" name="engine_url"></md-input>
        </md-field>
        <md-field>
          <label for="connection_token">Connection Token</label>
          <md-input type="text" v-model="connection_token" @keyup.enter="connectEngine(engine_url)" name="connection_token"></md-input>
        </md-field>
        <p>&nbsp;{{engine_status}}</p>
        <p>
          If you failed to install or start the Plugin Engine, please consult <a href="https://github.com/oeway/ImJoy-Engine" target="_blank">here</a>, and choose the alternative solution.<br>
        </p>
        <!-- <p v-if="is_https_mode">Please notice that, browsers such as Safari do not allow the connection form a `https` website to the Plugin Engine, in that case please <a href="http://imjoy.io/#/app" target="_blank">Switch to HTTP version</a> of ImJoy. </p> -->
        <!-- <p v-if="is_https_mode">Also notice that data and settings of ImJoy in the HTTP version and HTTPS version are not shared.</p> -->
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showPluginEngineInfo=false;">Cancel</md-button>
      <md-button class="md-primary" @click="showPluginEngineInfo=false; connectEngine(engine_url)">Connect</md-button>
    </md-dialog-actions>
  </md-dialog>

  <md-dialog :md-active.sync="showSettingsDialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>General Settings</md-dialog-title>
    <md-dialog-content>
      <md-divider></md-divider>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showSettingsDialog=false;">OK</md-button>
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
          <md-button class="md-primary md-raised centered-button" @click="newPlugin(template);showAddPluginDialog=false" v-for="(template, k) in plugin_templates" :key="k">
            <md-icon>add</md-icon>{{k}}
          </md-button>
        </md-card-content>
      </md-card>
      <md-switch v-if="installed_plugins.length>0 && !plugin4install && !downloading_error && !downloading_plugin" v-model="show_installed_plugins">Show Installed Plugins</md-switch>
      <md-card v-if="show_installed_plugins">
        <md-card-header>
          <div class="md-title">Installed Plugins</div>
        </md-card-header>
        <md-card-content>
          <plugin-list display="list" name="Installed Plugins" description="" :database="db" :install-plugin="installPlugin" :remove-plugin="removePlugin" @message="showMessage" :plugins="installed_plugins" :workspace="selected_workspace"></plugin-list>
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
                {{plugin4install.mode == 'pyworker'? plugin4install.name + ' 🚀': plugin4install.name}}
              </h2>
            </div>
            <div v-if="tag4install" class="md-toolbar-section-end">
              <md-button class="md-button md-primary" @click="installPlugin(plugin4install, tag4install); showAddPluginDialog = false">
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
                  <md-menu-item v-for="tag in plugin4install.tags" :key="tag" @click="installPlugin(plugin4install, tag); showAddPluginDialog = false">
                    <md-icon>cloud_download</md-icon>{{tag}}
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
              <md-button v-else  class="md-button md-primary"@click="installPlugin(plugin4install); showAddPluginDialog = false">
                <md-icon>cloud_download</md-icon>Install
              </md-button>
            </div>
          </md-toolbar>
        </md-card-header>
        <md-card-content>
          <p>{{plugin4install.description}}</p>
          <md-chip v-for="tag in plugin4install.tags" @click="tag4install=tag" :class="tag4install==tag? 'md-primary':''" :key="tag">{{tag}}</md-chip>
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
          <md-chips @md-insert="addRepository" @md-delete="removeRepository(getRepository($event))" class="md-primary shake-on-error" v-model="repository_names" md-placeholder="Add a repository url (e.g. GITHUB REPO) and press enter.">
            <template slot="md-chip" slot-scope="{ chip }" >
              <strong class="md-primary" v-if="selected_repository && chip === selected_repository.name">{{ chip }}</strong>
              <div v-else @click="selectRepository(chip)">{{ chip }}</div>
            </template>
            <div class="md-helper-text" v-if="selected_repository">{{selected_repository.name}}: {{selected_repository.description}}</div>
          </md-chips>
          <!-- <md-chip v-for="repo in repository_list" @click="selected_repository=repo" :class="selected_repository.url==repo.url? 'md-primary':''" :key="repo.url">{{repo.name}}</md-chip> -->
        </md-card-header>
        <md-card-content>
          <plugin-list @message="showMessage" :database="db" :install-plugin="installPlugin" :remove-plugin="removePlugin" :init-search="init_plugin_search" display="list" :plugins="available_plugins" :workspace="selected_workspace"></plugin-list>
        </md-card-content>
      </md-card>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showAddPluginDialog=false;">Exit</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import axios from 'axios';
import {
  REGISTER_SCHEMA,
  WINDOW_SCHEMA,
  OP_SCHEMA,
  PLUGIN_SCHEMA,
  PYWORKER_PLUGIN_TEMPLATE,
  WEBWORKER_PLUGIN_TEMPLATE,
  WEBPYTHON_PLUGIN_TEMPLATE,
  IFRAME_PLUGIN_TEMPLATE,
  WINDOW_PLUGIN_TEMPLATE,
  CONFIGURABLE_FIELDS,
  SUPPORTED_PLUGIN_MODES
} from '../api.js'

import {
  _clone,
  randId,
  debounce,
  url_regex,
  githubImJoyManifest,
  githubUrlRaw,
  assert
} from '../utils.js'
import {
  parseComponent
} from '../pluginParser.js'

import io from 'socket.io-client'

import _ from 'lodash'

import {
  Joy
} from '../joy'

import schema from 'js-schema'

export default {
  name: 'imjoy',
  props: ['title'],
  data() {
    return {
      workflow_expand: false,
      // file_selector_expand: false,
      // file_tree_selection: null,
      // file_tree: null,
      file_select: null,
      folder_select: null,
      selected_file: null,
      selected_files: null,
      showPluginDialog: false,
      showSettingsDialog: false,
      showAddPluginDialog: false,
      showRemoveConfirmation: false,
      showPermissionConfirmation: false,
      permission_message: 'No permission message.',
      share_url_message: 'No url',
      showShareUrl: false,
      resolve_permission: null,
      reject_permission: null,
      plugin_dialog_config: null,
      _plugin_dialog_promise: {},
      _plugin2_remove: null,
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
      loading: false,
      progress: 0,
      status_text: '',
      engine_status: 'Disconnected',
      engine_connected: false,
      engine_url: 'http://127.0.0.1:8080',
      windows: [],
      active_windows: [],
      selected_workspace: null,
      connection_token: null,
      engine_session_id: null,
      showPluginEngineInfo: false,
      workspace_list: [],
      workflow_list: [],
      repository_list: [],
      repository_names: [],
      selected_repository: null,
      showWorkspaceDialog: false,
      show_file_dialog: false,
      plugins: null,
      registered: null,
      updating_workflow: false,
      installed_plugins: [],
      available_plugins: [],
      plugin_api: null,
      plugin_context: null,
      plugin_loaded: false,
      menuVisible: true,
      snackbar_info: '',
      snackbar_duration: 3000,
      show_snackbar: false,
    }
  },
  watch: {
    menuVisible() {

    }
  },
  created() {
    this.store = this.$root.$data.store
    this.window_ids = {}
    this.plugin_names = null
    this.db = null
    this.client_id = null
    this.IMJOY_PLUGIN = {
      _id: 'IMJOY_APP'
    }
    this.plugin_templates = {
      "Webworker(Javascript)": WEBWORKER_PLUGIN_TEMPLATE,
      "PyWorker(Python)": PYWORKER_PLUGIN_TEMPLATE,
      // "Iframe(Javascript)": IFRAME_PLUGIN_TEMPLATE,
      "Window(Javascript and HTML)": WINDOW_PLUGIN_TEMPLATE,
      "WebPython(experimental)": WEBPYTHON_PLUGIN_TEMPLATE
    }
    this.default_window_pos = {
      i: 0,
      x: 0,
      y: 0,
      w: 5,
      h: 5
    }
    this.new_workspace_name = '',
    // this.preload_main = ['/static/tfjs/tfjs.js', 'https://rawgit.com/nicolaspanel/numjs/893016ec40e62eaaa126e1024dbe250aafb3014b/dist/numjs.min.js'],
    this.workflow_joy_config = {
      expanded: true,
      name: "Workflow",
      ui: "{id:'workflow', type:'ops'}",
      // onupdate: this.workflowOnchange
    },

    window.onbeforeunload = s => modified ? "" : null;
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
                 traverseFileTree(entries[i], path + item.name + "/", getDataLoaders, end && (i==entries.length-1));
               }
             });
           }
           else{
             if(end) resolve(filelist)
           }
        };
        var length = e.dataTransfer.items.length;
        for (var i = 0; i < length; i++) {
          if(e.dataTransfer.items[i].webkitGetAsEntry){
            folder_supported = true
            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
            traverseFileTree(entry, null, this.getDataLoaders, i==length-1)
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
    if (this.windows && this.windows.length > 0) {
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
    this.is_https_mode = ('https:' == location.protocol)
    // Make sure the GUI is refreshed
    setInterval(()=>{this.$forceUpdate()}, 5000)
    this.client_id = localStorage.getItem("imjoy_client_id")
    if(!this.client_id){
      this.client_id = 'imjoy_web_'+randId()
      localStorage.setItem("imjoy_client_id", this.client_id);
    }
    this.engine_session_id = randId()
    if(this.$route.query.token){
      this.connection_token = this.$route.query.token
      const query = Object.assign({}, this.$route.query);
      delete query.token;
      this.$router.replace({ query });
    }
    else{
      this.connection_token = localStorage.getItem("imjoy_connection_token")
    }

    if(this.$route.query.engine){
      this.engine_url = this.$route.query.engine.trim()
    }
    else{
      this.engine_url = localStorage.getItem("imjoy_engine_url") || 'http://127.0.0.1:8080'
    }



    this.plugin_api = {
      alert: this.showAlert,
      register: this.register,
      createWindow: this.createWindow,
      updateWindow: this.updateWindow,
      showDialog: this.showDialog,
      showProgress: this.showProgress,
      showStatus: this.showStatus,
      run: this.runPlugin,
      call: this.callPlugin,
      showPluginProgress: this.showPluginProgress,
      showPluginStatus: this.showPluginStatus,
      showFileDialog: this.showFileDialog,
      showSnackbar: this.showSnackbar,
      setConfig: this.setPluginConfig,
      getConfig: this.getPluginConfig,
      getAttachment: this.getAttachment,
      getFileUrl: this.getFileUrl,
      getFilePath: this.getFilePath,
      utils: {$forceUpdate: this.$forceUpdate, openUrl: this.openUrl},
    }

    this.resetPlugins()
    this.pluing_context = {}
    this.plugin_loaded = false
    this.loading = true
    this.config_db = new PouchDB('imjoy_config', {
      revs_limit: 2,
      auto_compaction: true
    })

    this.default_repository_list = [{name: 'ImJoy Repository', url: "https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.imjoy.json", description: 'The official plugin repository provided by ImJoy.io.'},
                                    {name: 'ImJoy Demos', url: 'https://raw.githubusercontent.com/oeway/ImJoy-Demo-Plugins/master/manifest.imjoy.json', description: 'A set of demo plugins provided by ImJoy.io'}
    ]
    // console.log('loading workspace: ', this.$route.query.w)
    this.config_db.get('repository_list').then((doc) => {
      this.repository_list = doc.list
      for(let drep of this.default_repository_list){
        let found = false
        for(let repo of this.repository_list){
          if(repo.url == drep.url && repo.name == drep.name){
            found = repo
            break
          }
        }
        if(!found){
          this.addRepository(drep)
        }
      }

    }).catch((err) => {
      if(err.name != 'not_found'){
        console.error("Database Error", err)
      }
      this.repository_list = this.default_repository_list
      this.config_db.put({
        _id: 'repository_list',
        list: this.repository_list
      })
    }).then(() => {
      this.repository_names = []
      for(let r of this.repository_list){
        this.repository_names.push(r.name)
      }
      if(this.$route.query.repo){
        const ret = this.addRepository(this.$route.query.repo)
        if(ret){
          this.selected_repository = ret
        }
      }
      else{
        this.selected_repository = this.repository_list[0]
      }
    })

    let default_ws = null
    this.config_db.get('workspace_list').then((doc) => {
      this.workspace_list = doc.list
      default_ws = doc.default
    }).catch((err) => {
      if(err.name != 'not_found'){
        // this.showMessage("Database Error:" + err.toString())
        // this.status_text = "Database Error:" + err.toString()
        console.error("Database Error", err)
      }
      this.config_db.put({
        _id: 'workspace_list',
        list: ['default'],
        default: 'default'
      })
      this.workspace_list = ['default']
      default_ws = 'default'
    }).then(() => {
      this.selected_workspace = this.$route.query.w || default_ws
      if (!this.workspace_list.includes(this.selected_workspace) || this.selected_workspace != default_ws) {
        if (!this.workspace_list.includes(this.selected_workspace)) {
          this.workspace_list.push(this.selected_workspace)
        }
        this.config_db.get('workspace_list').then((doc) => {
          this.config_db.put({
            _id: doc._id,
            _rev: doc._rev,
            list: this.workspace_list,
            default: 'default'
          })
        }).catch((err) => {
          this.showMessage("Database Error:" + err.toString())
          this.status_text = "Database Error:" + err.toString()
        })
      }
      // if (this.selected_workspace != 'default') {
      //   const query = Object.assign({}, this.$route.query);
      //   query.w = this.selected_workspace
      //   this.$router.replace({ query });
      // }
      this.db = new PouchDB(this.selected_workspace + '_workspace', {
        revs_limit: 2,
        auto_compaction: true
      })

      this.connectEngine(this.engine_url, true)

    }).then(() => {
      this.reloadPlugins().then(()=>{
        this.reloadRepository().finally(()=>{
          if(this.$route.query.plugin){
            const p = this.$route.query.plugin.trim()
            if (p.match(url_regex) || (p.includes('/') && p.includes(':'))) {
              this.plugin_url = p
              this.init_plugin_search = null
              this.show_plugin_store = false
              this.show_plugin_url = false
              this.getPlugin4Install(p)
            } else {
              this.plugin_url = null
              this.init_plugin_search = p
              this.show_plugin_store = true
              this.show_plugin_url = false
            }

            // remove plugin url from the query
            const query = Object.assign({}, this.$route.query);
            delete query.plugin;
            this.$router.replace({ query });

            this.show_plugin_templates = false
            this.showAddPluginDialog = true
          }

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

          if(this.$route.query.load){
            const w = {
              name: "Loaded Url",
              type: 'imjoy/url_list',
              scroll: true,
              data: [this.$route.query.load]
            }
            this.addWindow(w)
          }

        })
      })
    })
  },
  beforeDestroy() {
    // console.log('terminating plugins')
    for (let k in this.plugins) {
      if (this.plugins.hasOwnProperty(k)) {
        const plugin = this.plugins[k]
        try {
          if (typeof plugin.terminate == 'function') plugin.terminate()
        } catch (e) {

        }
      }
    }
    this.plugins = null
    this.plugin_names = null
    this.disconnectEngine()
  },
  methods: {
    getRepository(repo_name){
      for(let r of this.repository_list){
        if(r.name == repo_name){
          return r
        }
      }
    },
    selectRepository(repo){
      for(let r of this.repository_list){
        if(r.name == repo){
          this.selected_repository = r
          this.reloadRepository()
          return r
        }
      }
    },
    getRepoManifest(url, hashtag){
      return new Promise((resolve, reject)=>{
        const re = new RegExp('^[^/.]+/[^/.]+$')
        let repository_url
        if(url.match(re)){
          if(hashtag){
            url = url + '/tree/'+ hashtag
          }
          repository_url = githubImJoyManifest('https://github.com/'+url)
        }
        else if(url.includes('github') && url.includes('/blob/')){
          repository_url = githubImJoyManifest(url)
        }
        else{
          repository_url = url
        }
        axios.get(repository_url).then(response => {
          if (response && response.data && response.data.plugins) {
            const manifest = response.data
            manifest.plugins = manifest.plugins.filter((p) => {
              return !p.disabled
            })
            if(!manifest.uri_root.startsWith('http')){
              manifest.uri_root = repository_url.replace(new RegExp('manifest.imjoy.json$'), _.trim(manifest.uri_root, '/'));
            }
            for (let i = 0; i < manifest.plugins.length; i++) {
                const p = manifest.plugins[i]
                p.uri = p.uri || p.name + '.html'
                if (!p.uri.startsWith(manifest.uri_root) && !p.uri.startsWith('http')) {
                  p.uri = manifest.uri_root + '/' + p.uri
                }
                p._id = p._id || p.name.replace(/ /g, '_')
            }
            resolve(manifest)
          }
          else{
            reject('failed to load url: ' + repository_url)
          }
        }).catch(reject)
      })
    },
    reloadRepository(repo){
      repo = repo || this.selected_repository
      return new Promise((resolve, reject)=>{
          this.getRepoManifest(repo.url).then((manifest)=>{
            this.available_plugins = manifest.plugins

            for (let i = 0; i < this.available_plugins.length; i++) {
              const ap = this.available_plugins[i]
              const ps = this.installed_plugins.filter((p) => {
                return ap.name == p.name
              })
              // mark as installed
              if(ps.length>0){
                ap.installed = true
                ap.tag = ps[0].tag
              }
            }
            this.$forceUpdate()
            resolve(manifest)
          }).catch(reject)
      })
    },
    addRepository(repo){
      if(typeof repo == 'string'){
        repo = {name: repo, url: repo, description: repo}
      }
      assert(repo.name && repo.url)
      this.reloadRepository(repo).then((manifest)=>{
        repo.name = manifest.name || repo.name
        repo.description = manifest.description || repo.description
        // use repo url if name exists
        for(let r of this.repository_list){
          if(r.name == repo.name){
            repo.name = repo.url.replace('https://github.com/', '').replace('http://github.com/', '')
            break
          }
        }
        //remove existing repo if same url already exists
        for(let r of this.repository_list){
          if(r.url == repo.url){
            // remove it if already exists
            this.repository_list.splice( this.repository_list.indexOf(r), 1 )
            this.showMessage("Repository with the same url already exists.")
            break
          }
        }

        this.repository_list.push(repo)
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }
        this.config_db.get('repository_list').then((doc) => {
          this.config_db.put({
            _id: doc._id,
            _rev: doc._rev,
            list: this.repository_list,
          })
        }).catch((err) => {
          this.showMessage("Failed to save repository, database Error:" + err.toString())
          this.status_text = "Failed to save repository, database Error:" + err.toString()
        })
      }).catch(()=>{
        if(this.repository_names.indexOf(repo.name)>=0)
          this.repository_names.splice(this.repository_names.indexOf(repo.name), 1)
        this.showMessage("Failed to load repository from: " + repo.url)
      })
    },
    removeRepository(repo) {
      if(!repo) return;
      let found = false
      for(let r of this.repository_list){
        if(r.url == repo.url || r.name == repo.name){
          found = r
        }
      }
      if (found) {
        const index = this.repository_list.indexOf(found)
        this.repository_list.splice(index, 1)
        this.repository_names = []
        for(let r of this.repository_list){
          this.repository_names.push(r.name)
        }
        this.config_db.get('repository_list').then((doc) => {
          this.config_db.put({
            _id: doc._id,
            _rev: doc._rev,
            list: this.repository_list
          }).then(()=>{
            this.showMessage(`Repository has been deleted.`)
          }).catch(()=>{
            this.showMessage(`Error occured when removing repository.`)
          })
        })
        .catch((err) => {
          this.showMessage("Failed to save repository, database Error:" + err.toString())
          this.status_text = "Failed to save repository, database Error:" + err.toString()
        })
        // if current workspace is deleted, go to default
        if (this.selected_repository == found.name) {
          this.$router.replace({
            query: {
              w: 'default'
            }
          })
        }
      }
    },
    setPluginConfig(name, value, _plugin){
      const plugin = this.plugins[_plugin.id]
      if(!plugin) throw "setConfig Error: Plugin not found."
      if(name.startsWith('_') && plugin.config.hasOwnProperty(name.slice(1))){
        throw `'${name.slice(1)}' is a readonly field defined in <config> block, please avoid using it`
      }
      if(value){
        return localStorage.setItem("config_"+plugin.name+'_'+name, value)
      }
      else{
        return localStorage.removeItem("config_"+plugin.name+'_'+name)
      }
    },
    getPluginConfig(name, _plugin){
      const plugin = this.plugins[_plugin.id]
      if(!plugin) throw "getConfig Error: Plugin not found."
      if(name.startsWith('_') && plugin.config.hasOwnProperty(name.slice(1))){
        return plugin.config[name.slice(1)]
      }
      else{
        return localStorage.getItem("config_"+plugin.name+'_'+name)
      }
    },
    getAttachment(name, _plugin){
      const plugin = this.plugins[_plugin.id]
      if(plugin.attachments){
        for (let i = 0; i < plugin.attachments.length; i++) {
          if (plugin.attachments[i].attrs.name == name) {
            return plugin.attachments[i].content
          }
        }
      }
      else{
        return null
      }
    },
    showSnackbar(msg, duration, _plugin){
      if(!_plugin){
        _plugin = duration
        duration = null
      }
      this.showMessage(msg, duration)
    },
    showFileDialog(options, _plugin){
      if(!this.engine_connected){
        this.showMessage('File Dialog requires the plugin engine, please connect to the plugin engine.')
        throw "Please connect to the Plugin Engine 🚀."
      }
      if(!_plugin){
        _plugin = options
        options = {}
      }
      if(_plugin && _plugin.id){
        const source_plugin = this.plugins[_plugin.id]
        if(source_plugin || _plugin === this.IMJOY_PLUGIN){
          if(source_plugin){
            options.root = options.root || (source_plugin.config && source_plugin.config.work_dir)
          }
          if(source_plugin && source_plugin.mode != 'pyworker'){
            options.uri_type = options.uri_type || 'url'
          }
          else{
            options.uri_type = options.uri_type || 'path'
          }
          return this.$refs['file-dialog'].showDialog(options, _plugin)
        }
      }
      else{
        return this.$refs['file-dialog'].showDialog(options, _plugin)
      }
    },
    connectPlugin(plugin){
      if(plugin._disconnected){
        if(plugin.mode == 'pyworker' && !this.engine_connected){
          this.connectEngine(this.engine_url)
        }
        else{
          this.reloadPlugin(plugin.config)
        }
      }
    },
    // installPluginFromUrl(plugin_url){
    //   this.permission_message = `This plugin is <strong>not</strong> provided by ImJoy.io. <br> Please make sure the plugin is provided by a trusted source, otherwise it may <strong>harm</strong> your computer. <br> <a href="${plugin_url}" target="_blank">View source code</a><br><br>Do you allow this plugin to be installed?`
    //   const backup_addplugin = this.showAddPluginDialog
    //   this.resolve_permission = ()=>{
    //     this.installPlugin(plugin_url).then(()=>{
    //       this.showAddPluginDialog = false
    //     }).catch(()=>{
    //       this.showAddPluginDialog = backup_addplugin
    //     })
    //   }
    //   this.reject_permission = ()=>{
    //     this.showAddPluginDialog = backup_addplugin
    //   }
    //   this.showPluginEngineInfo = false
    //   this.showAddPluginDialog = false
    //   this.showPermissionConfirmation = true
    // },
    getPlugin4Install(plugin_url){
      this.plugin4install = null
      if(plugin_url.includes('github') && plugin_url.includes('/blob/')){
        plugin_url = githubUrlRaw(plugin_url)
      }
      this.downloading_error = ""
      this.downloading_plugin = true
      this.getPluginFromUrl(plugin_url).then((config)=>{
        this.plugin4install = config
        this.tag4install = config.tag
        this.downloading_plugin = false
      }).catch((e)=>{
        this.downloading_plugin = false
        this.downloading_error = "Sorry, the plugin URL is invalid: " + e.toString()
        this.showMessage("Sorry, the plugin URL is invalid: " + e.toString())
      })
    },
    async getPluginFromUrl(uri, scoped_plugins){
      scoped_plugins = scoped_plugins || this.available_plugins
      let selected_tag
      // if the uri format is REPO_NAME:PLUGIN_NAME
      if(!uri.startsWith('http') && uri.includes('/') && uri.includes(':')){
        let [repo_name, plugin_name] = uri.split(':')
        selected_tag = plugin_name.split('@')[1]
        plugin_name = plugin_name.split('@')[0]
        plugin_name = plugin_name.trim()
        const repo_hashtag = repo_name.split('@')[1]
        repo_name = repo_name.split('@')[0]
        repo_name = repo_name.trim()
        assert(repo_name && plugin_name, 'Wrong URI format, it must be "REPO_NAME:PLUGIN_NAME"')
        const manifest = await this.getRepoManifest(repo_name, repo_hashtag)
        let found = null
        for(let p of manifest.plugins){
          if(p.name == plugin_name){
            found = p
            break
          }
        }
        if(!found){
          throw(`plugin not found ${repo_name}:${plugin_name}`)
        }
        uri = found.uri
        scoped_plugins = manifest.plugins
      }
      else if(!uri.match(url_regex)){
        let dep = uri.split('@')
        selected_tag = dep[1]
        const ps = scoped_plugins.filter((p) => {
          return dep[0] && p.name == dep[0].trim()
        });
        if (ps.length <= 0) {
          throw `Plugin "${dep[0]}" cannot be found in the repository.`
        }
        else{
          uri = ps[0].uri
        }
      }
      else{
        selected_tag = uri.split('.imjoy.html@')[1]
        if(selected_tag){
          uri = uri.split('@'+selected_tag)[0]
        }
      }
      if(!uri.split('?')[0].endsWith('.imjoy.html')){
        throw 'Plugin url must be ends with ".imjoy.html"'
      }
      const response = await axios.get(uri)
      if (!response || !response.data || response.data == '') {
        alert('failed to get plugin code from ' + uri)
        throw 'failed to get code.'
      }
      const code = response.data
      let config = this.parsePluginCode(code, {tag: selected_tag})
      config.uri = uri
      config.scoped_plugins = scoped_plugins
      return config
    },
    installPlugin(pconfig, tag){
      // pconfig = "oeway/ImJoy-Demo-Plugins:3D Demos"
      return new Promise((resolve, reject) => {
        let uri = typeof pconfig == 'string' ? pconfig : pconfig.uri
        let scoped_plugins = pconfig.scoped_plugins || this.available_plugins
        //use the has tag in the uri if no hash tag is defined.
        if(!uri){
          reject('No url found for plugin ' + pconfig.name)
          return
        }
        // tag = tag || uri.split('@')[1]
        // uri = uri.split('@')[0]

        this.getPluginFromUrl(uri, scoped_plugins).then((config)=>{
          if (!config) {
            console.error('Failed to parse the plugin code.', code)
            reject('Failed to parse the plugin code.')
            return
          }
          if (!SUPPORTED_PLUGIN_MODES.includes(config.mode)){
            reject('Unsupported plugin mode: '+config.mode)
            return
          }
          config.tag = tag || config.tag
          config._id = config.name && config.name.replace(/ /g, '_') || randId()
          config.dependencies = config.dependencies || []
          const _deps = []
          for (let i = 0; i < config.dependencies.length; i++) {
              _deps.push(this.installPlugin({uri: config.dependencies[i], scoped_plugins: config.scoped_plugins || scoped_plugins}))
          }
          Promise.all(_deps).then(()=>{
            this.savePlugin(config).then((template)=>{
              for (let p of this.available_plugins) {
                if(p.name == template.name && !p.installed){
                  p.installed = true
                  p.tag = tag
                }
              }
              this.showMessage(`Plugin "${template.name}" has been successfully installed.`)
              this.$forceUpdate()
              resolve()
              this.reloadPlugin(template)
            }).catch(()=>{
              reject(`Failed to save the plugin ${template.name}`)
            })
          }).catch((error)=>{
            alert(`Failed to install dependencies for ${config.name}: ${error}`)
            throw `Failed to install dependencies for ${config.name}: ${error}`
          })

        }).catch((e)=>{
          console.error(e)
          this.showMessage('Failed to download, if you download from github, please use the url to the raw file', 6000)
          reject(e)
        })
      })
    },
    removePlugin(plugin){
      return new Promise((resolve, reject) => {
        // remove if exists
        this.db.get(plugin._id).then((doc) => {
          return this.db.remove(doc);
        }).then((result) => {

          for (let i = 0; i < this.installed_plugins.length; i++) {
            if(this.installed_plugins[i].name == plugin.name){
              this.installed_plugins.splice(i, 1)
            }
          }
          for (let p of this.available_plugins) {
              if(p.name == plugin.name){
                p.installed = false
                p.tag = null
              }
          }
          this.unloadPlugin(plugin, true)
          // console.log('plugin has been removed')
          this.showMessage(`"${plugin.name}" has been removed.`)
          this.$forceUpdate()
          resolve()
        }).catch((err) => {
          this.status_text = err.toString() || "Error occured."
          this.showMessage(this.status_text)
          console.error('error occured when removing ', plugin, err)
          reject(err)
        });
      });
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
        return _.orderBy(this.plugins, 'name').filter((p)=>{return p.config.runnable});
    },
    sortedNonRunnablePlugins: function() {
        return _.orderBy(this.plugins, 'name').filter((p)=>{return !p.config.runnable});
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
        w: w
      }
      if (w == 'default') {
        q = null
      }
      this.$router.push({
        name: 'app',
        query: q
      })
      window.location.reload()
    },
    removeWorkspace(w) {
      if (this.workspace_list.includes(w)) {
        const index = this.workspace_list.indexOf(w)
        this.workspace_list.splice(index, 1)
        this.config_db.get('workspace_list').then((doc) => {
          this.config_db.put({
            _id: doc._id,
            _rev: doc._rev,
            list: this.workspace_list,
            default: 'default'
          }).then(()=>{
            this.showMessage(`Workspace ${w} has been deleted.`)
          }).catch(()=>{
            this.showMessage(`Error occured when removing workspace ${w}.`)
          })
        })
        .catch((err) => {
          this.showMessage("Failed to save workspace, database Error:" + err.toString())
          this.status_text = "Failed to save workspace, database Error:" + err.toString()
        })

      }
      // if current workspace is deleted, go to default
      if (this.selected_workspace == w.name) {
        this.$router.replace({
          query: {
            w: 'default'
          }
        })
      }
    },
    showMessage(info, duration) {
      this.snackbar_info = info
      this.snackbar_duration = duration || 10000
      this.show_snackbar = true
    },
    connectEngine(url, auto) {
      if (this.socket&&this.engine_connected) {
        return
        //this.socket.disconnect()
      }
      //enforcing 127.0.0.1 for avoid security restrictions
      url = url.replace('localhost', '127.0.0.1')
      this.engine_status = 'Connecting...'
      if(!auto) this.showMessage('Trying to connect to the plugin engine...')
      const socket = io(url);
      const timer = setTimeout(() => {
        if (!this.engine_connected) {
          this.engine_status = 'Plugin Engine is not connected.'
          if(!auto) this.showMessage('Failed to connect, please make sure you have started the plugin engine.')

          if(auto) socket.disconnect()
        }
      }, 2500)

      if(!auto) this.showPluginEngineInfo = true

      socket.on('connect', (d) => {
        clearTimeout(timer)
        this.connection_token = this.connection_token && this.connection_token.trim()
        socket.emit('register_client', {id: this.client_id, token: this.connection_token, session_id: this.engine_session_id}, (ret)=>{
          if(ret.success){
            const connect_client = ()=>{
              this.socket = socket
              this.pluing_context.socket = socket
              this.engine_connected = true
              this.showPluginEngineInfo = false
              this.engine_status = 'Connected.'
              localStorage.setItem("imjoy_connection_token", this.connection_token);
              localStorage.setItem("imjoy_engine_url", url)
              this.showMessage('Plugin Engine is connected.')
              // console.log('plugin engine connected.')
              this.store.event_bus.$emit('engine_connected', d)
              this.reloadPythonPlugins()
            }

            if(ret.message && ret.confirmation){
              this.permission_message = ret.message
              this.resolve_permission = connect_client
              this.reject_permission = ()=>{
                socket.disconnect()
                console.log('you canceled the connection.')
              }
              this.showPluginEngineInfo = false
              this.showPermissionConfirmation = true
            }
            else{
              connect_client()
            }
            // this.listEngineDir()
          }
          else{
            socket.disconnect()
            if(ret.no_retry && ret.reason){
              this.showStatus('Failed to connect: ' + ret.reason)
              this.showMessage('Failed to connect: ' + ret.reason)
            }
            else{
              this.showPluginEngineInfo = true
              if(ret.reason) this.showMessage('Failed to connect: ' + ret.reason)
              console.error('failed to connect.', ret.reason)
            }
          }
        })

      })
      socket.on('disconnect', () => {
        // console.log('plugin engine disconnected.')
        this.engine_connected = false
        this.showMessage('Plugin Engine disconnected.')
        this.engine_status = 'Disconnected.'
        this.socket = null
        this.pluing_context.socket = null
        // this.pluing_context.socket = null
        this.removePythonPlugins()
      });
      this.socket = socket

    },
    disconnectEngine() {
      if (this.socket) {
        this.socket.disconnect()
      }
    },
    listEngineDir(path, type, recursive){
      return new Promise((resolve, reject) => {
        this.socket.emit('list_dir', {path: path || '~', type: type || 'file', recursive: recursive || false}, (ret)=>{
          if(ret.success){
            resolve(ret)
            this.$forceUpdate()
          }
          else{
            this.showMessage(`Failed to list dir: ${path} ${ret.error}`)
            reject(ret.error)
            this.$forceUpdate()
          }
        })
      })
    },
    showEngineFileDialog(){
      this.showFileDialog({uri_type: 'url'}, this.IMJOY_PLUGIN).then((selection)=>{
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
        this.addWindow(w)
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
    getFileUrl(path, _plugin){
      return new Promise((resolve, reject) => {
        if(!this.engine_connected){
          reject("Please connect to the Plugin Engine 🚀.")
          this.showMessage("Please connect to the Plugin Engine 🚀.")
          return
        }
        if(_plugin !== this.IMJOY_PLUGIN && (!_plugin || !_plugin.id)){
          reject("Plugin not found.")
          return
        }
        const source_plugin = this.plugins[_plugin.id]
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
            this.socket.emit('get_file_url', config, (ret)=>{
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
    getFilePath(url, _plugin){
      return new Promise((resolve, reject) => {
        if(!this.engine_connected){
          reject("Please connect to the Plugin Engine 🚀.")
          this.showMessage("Please connect to the Plugin Engine 🚀.")
          return
        }
        let config = url
        if(typeof url === 'string'){
          config = {url: url}
        }
        this.socket.emit('get_file_path', config, (ret)=>{
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
    importScript(url) {
      //url is URL of external file, implementationCode is the code
      //to be called from the file, location is the location to
      //insert the <script> element
      return new Promise((resolve, reject) => {
        var scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.onload = resolve;
        scriptTag.onreadystatechange = resolve;
        scriptTag.onerror = reject;
        document.head.appendChild(scriptTag);
      })
    },
    async importScripts() {
      var args = Array.prototype.slice.call(arguments),
        len = args.length,
        i = 0;
      for (; i < len; i++) {
        await this.importScript(args[i])
      }
    },
    showDoc(pid) {
      const plugin = this.plugins[pid]
      const pconfig = plugin.config
      const w = {
        name: "About " + pconfig.name,
        type: 'imjoy/markdown',
        w: 7,
        h: 10,
        scroll: true,
        data: {
          name: pconfig.name,
          id: plugin.id,
          source: pconfig && pconfig.docs[0] && pconfig.docs[0].content
        }
      }
      this.addWindow(w)
    },
    editPlugin(pid) {
      const plugin = this.plugins[pid]
      const pconfig = plugin.config
      const w = {
        name: pconfig.name,
        type: 'imjoy/plugin-editor',
        config: {},
        plugin: plugin,
        reload: this.reloadPlugin,
        save: this.savePlugin,
        remove: this.removePlugin,
        w: 10,
        h: 10,
        data: {
          name: pconfig.name,
          id: plugin.id,
          code: pconfig.code
        }
      }
      this.addWindow(w)
    },
    newPlugin(template) {
      const w = {
        name: 'New Plugin',
        type: 'imjoy/plugin-editor',
        config: {},
        reload: this.reloadPlugin,
        save: this.savePlugin,
        w: 10,
        h: 10,
        plugin: {},
        data: {
          name: 'new plugin',
          id: 'plugin_' + randId(),
          code: JSON.parse(JSON.stringify(template))
        }
      }
      this.addWindow(w)
    },
    unloadPlugin(plugin, temp_remove){
      const name = plugin.name
      for (let k in this.plugins) {
        if (this.plugins.hasOwnProperty(k)) {
          const plugin = this.plugins[k]
          if(plugin.name == name){
              try {
                if(temp_remove){
                  delete this.plugins[k]
                  delete this.plugin_names[name]
                }
                Joy.remove(name)
                // console.log('terminating ',plugin)
                if (typeof plugin.terminate == 'function') {
                  plugin.terminate()
                }
              } catch (e) {
                console.error(e)
              }
          }
        }
      }
      this.$forceUpdate()
    },
    reloadPlugin(pconfig) {
      return new Promise((resolve, reject) => {
        try {
          this.unloadPlugin(pconfig, true)
          // console.log('reloading plugin ', pconfig)
          const template = this.parsePluginCode(pconfig.code, pconfig)
          template._id = pconfig._id
          if(template.mode == 'collection'){
            return
          }
          this.unloadPlugin(template, true)
          let p

          if (template.mode == 'window') {
            p = this.preLoadPlugin(template)
          } else {
            p = this.loadPlugin(template)
          }
          p.then((plugin) => {
            // console.log('new plugin loaded', plugin)
            plugin._id = pconfig._id
            pconfig.name = plugin.name
            pconfig.type = plugin.type
            pconfig.plugin = plugin
            if (this.$refs.workflow) this.$refs.workflow.setupJoy()
            this.$forceUpdate()
            resolve(plugin)
          }).catch((e) => {
            pconfig.plugin = null
            this.$forceUpdate()
            reject(e)
          })
        } catch (e) {
          this.status_text = e || "Error."
          this.showMessage(e || "Error.", 15000)
          reject(e)
        }
      })
    },
    savePlugin(pconfig) {
      return new Promise((resolve, reject) => {
        console.log('saving plugin ', pconfig)
        const code = pconfig.code
        try {
          const template = this.parsePluginCode(code, {tag: pconfig.tag})
          template.code = code
          template._id = template.name.replace(/ /g, '_')
          const addPlugin = () => {
            this.db.put(template, {
              force: true
            }).then((result) => {
              for (let i = 0; i < this.installed_plugins.length; i++) {
                if(this.installed_plugins[i].name == template.name){
                  this.installed_plugins.splice(i, 1)
                }
              }
              template.installed = true
              this.installed_plugins.push(template)
              resolve(template)
              // console.log('Successfully saved!');
              this.showMessage(`${template.name } has been successfully saved.`)
            }).catch((err) => {
              this.showMessage('Failed to save the plugin.', 15000)
              console.error(err)
              reject('failed to save')
            })
          }
          // remove if exists
          this.db.get(template._id).then((doc) => {
            return this.db.remove(doc);
          }).then((result) => {
            addPlugin()
          }).catch((err) => {
            addPlugin()
          });
        } catch (e) {
          this.status_text = e || "Error."
          this.showMessage( e || "Error.", 15000)
          reject(e)
        }
      })
    },
    reloadPythonPlugins(){
      for(let p of this.installed_plugins){
        if(p.mode == 'pyworker'){
          this.reloadPlugin(p)
        }
      }
    },
    removePythonPlugins(){
      for (let k in this.plugins) {
        if (this.plugins.hasOwnProperty(k)) {
          const plugin = this.plugins[k]
          if(plugin.mode == 'pyworker'){
            try {
              Joy.remove(plugin.config.type)
              // console.log('terminating ',plugin)
              if (typeof plugin.terminate == 'function') {
                plugin.terminate()
              }
              // delete this.plugins[k]
              // delete this.plugin_names[plugin.config.name]
            } catch (e) {

            }
          }
        }
      }
    },
    resetPlugins(){
      this.plugins = {}
      this.plugin_names = {}
      this.registered = {
        ops: {},
        windows: {},
        extensions: {},
        inputs: {},
        outputs: {},
        loaders: {}
      }
      this.registered.internal_inputs = {
        'Image': { schema: schema({type: ['image/jpeg', 'image/png', 'image/gif'], size: Number})},
      }
      this.registered.loaders['Image'] = (file)=>{
        var fr = new FileReader();
        fr.onload =  () => {
          this.createWindow({
            name: file.name,
            type: 'imjoy/image',
            data: {src: fr.result}
          })
        }
        fr.readAsDataURL(file);
      }
    },
    reloadDB(){
      return new Promise((resolve, reject) => {
        if(this.db){
          try {
              this.db.close().finally(()=>{
                this.db = new PouchDB(this.selected_workspace + '_workspace', {
                  revs_limit: 2,
                  auto_compaction: true
                })
                resolve()
              })
          } catch (e) {
            console.error('failed to reload database: ', e)
            this.db = new PouchDB(this.selected_workspace + '_workspace', {
              revs_limit: 2,
              auto_compaction: true
            })
            resolve()
          }
        }
        else{
          this.db = new PouchDB(this.selected_workspace + '_workspace', {
            revs_limit: 2,
            auto_compaction: true
          })
          resolve()
        }
      })
    },
    reloadPlugins() {
      return new Promise((resolve, reject) => {
        if (this.plugins) {
          for (let k in this.plugins) {
            if (this.plugins.hasOwnProperty(k)) {
              const plugin = this.plugins[k]
              if (typeof plugin.terminate == 'function') {
                try {
                  plugin.terminate()
                } catch (e) {
                  console.error(e)
                }
              }
              this.plugins[k] = null
              this.plugin_names[plugin.name] = null
            }
          }
        }
        this.resetPlugins()
        this.reloadDB().then(()=>{
          this.db.allDocs({
            include_docs: true,
            attachments: true,
            sort: 'name'
          }).then((result) => {
            const promises = []
            this.workflow_list = []
            this.installed_plugins = []
            for (let i = 0; i < result.total_rows; i++) {
              const config = result.rows[i].doc
              if (config.workflow) {
                this.workflow_list.push(config)
              } else {
                config.installed = true
                this.installed_plugins.push(config)
                this.reloadPlugin(config).catch((e)=>{
                  console.error(config, e)
                  this.showSnackbar(`<${config.name}>: ${e.toString()}` )
                  if(!e.toString().includes('Please connect to the Plugin Engine 🚀.')){
                      this.showMessage(`<${config.name}>: ${e.toString()}`)
                  }
                })
              }
            }
            this.plugin_loaded = true
            this.loading = false
            resolve()
            this.$forceUpdate()
          }).catch((err) => {
            console.error(err)
            this.loading = false
            reject()
          });
        })
      })
    },
    closeAll() {
      this.default_window_pos = {
        i: 0,
        x: 0,
        y: 0,
        w: 5,
        h: 5
      }
      this.status_text = ''

      for (var i = this.windows.length; i--;) {
        if (this.windows[i].type != 'imjoy/plugin-editor') {
            delete this.window_ids[this.windows[i].id]
            this.windows.splice(i, 1);
        }
      }

    },
    showProgress(p) {
      if (p < 1) this.progress = p * 100
      else this.progress = p
      // this.$forceUpdate()
    },
    showStatus(s) {
      this.status_text = s
      // this.$forceUpdate()
    },
    showPluginProgress(p, _plugin){
      if(_plugin && _plugin.id){
        const source_plugin = this.plugins[_plugin.id]
        if(source_plugin){
          if (p < 1) source_plugin.progress = p * 100
          else source_plugin.progress = p
          this.$forceUpdate()
        }
      }
    },
    showPluginStatus(s, _plugin){
      if(_plugin && _plugin.id){
        const source_plugin = this.plugins[_plugin.id]
        if(source_plugin){
          source_plugin.status_text = s
          this.$forceUpdate()
        }
      }
    },
    addWindow(w) {
      w.id = w.id || w.name + randId()
      w.loaders = this.getDataLoaders(w.data)
      this.generateGridPosition(w)
      this.windows.push(w)
      this.window_ids[w.id] = w
      this.store.event_bus.$emit('add_window', w)
      return w.id
    },
    closePluginDialog(ok) {
      this.showPluginDialog = false
      let [resolve, reject] = this._plugin_dialog_promise
      if (ok) {
        resolve(this.$refs.plugin_dialog_joy.joy.get_config())
      } else {
        reject()
      }
      this._plugin_dialog_promise = null
    },
    // workflowOnchange() {
    //   // console.log('workflow changed ...')
    // },
    windowSelected(ws) {
      console.log('activate window: ', ws)
      this.active_windows = ws
    },
    windowClosed(ws) {
      delete this.window_ids[ws.id]
    },
    windowAdded(ws) {
      this.window_ids[ws.id] = ws
    },
    generateGridPosition(config) {
      config.i = this.default_window_pos.i.toString()
      config.w = config.w || this.default_window_pos.w
      config.h = config.h || this.default_window_pos.h
      config.x = this.default_window_pos.x
      config.y = this.default_window_pos.y
      this.default_window_pos.x = this.default_window_pos.x + this.default_window_pos.w
      if (this.default_window_pos.x >= 20) {
        this.default_window_pos.x = 0
        this.default_window_pos.y = this.default_window_pos.y + this.default_window_pos.h
      }
      this.default_window_pos.i = this.default_window_pos.i + 1
    },
    validatePluginConfig(config){
      if(config.name.indexOf('/')<0){
        return true
      }
      else{
        throw "Plugin name should not contain '/'."
      }
    },
    getDataLoaders(data){
      const loaders = {}
      for (let k in this.registered.internal_inputs) {
        if (this.registered.internal_inputs.hasOwnProperty(k)) {
          // console.log(k, this.registered.internal_inputs[k])
          if (this.registered.internal_inputs[k].schema(data)) {
            loaders[k] = k
          }
        }
      }
      // find all the plugins registered for this type
      for (let k in this.registered.inputs) {
        if (this.registered.inputs.hasOwnProperty(k)) {
          // const error = this.registered.inputs[k].schema.errors(data)
          // console.error("schema mismatch: ", data, error)
          try {
            if (this.registered.inputs[k].schema(data)) {
              const plugin_name = this.registered.inputs[k].plugin_name
              const op_name = this.registered.inputs[k].op_name
              const plugin = this.plugin_names[plugin_name]
              if(plugin && this.registered.loaders[plugin_name+'/'+op_name]){
                // console.log('associate data with ', plugin_name, op_name )
                loaders[op_name] = plugin_name+'/'+op_name
              }
            }
          } catch (e) {
            // console.error('error with validation with', k, e)
          }
        }
      }
      return loaders
    },
    loadFiles() {
      if(this.selected_files.length == 1 && this.selected_files[0].name.endsWith('.imjoy.html')){
        const reader = new FileReader();
        reader.onload = ()=>{
            this.newPlugin(reader.result)
        }
        reader.readAsText(this.selected_files[0]);
        return
      }
      for (let f = 0; f < this.selected_files.length; f++) {
        const file = this.selected_files[f]
        const tmp = file.name.split('.')
        const ext = tmp[tmp.length - 1]
        file.loaders = file.loaders || this.getDataLoaders(file)
        // console.log('loaders', file.loaders)
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
        data: this.selected_files
      }
      this.addWindow(w)
    },
    clearWorkflow() {
      this.workflow_joy_config.data = null
      this.$refs.workflow.setupJoy(true)
    },
    runWorkflow(joy) {
      // console.log('run workflow.', this.active_windows)
      const w = this.active_windows[this.active_windows.length - 1] || {}
      this.status_text = ''
      this.progress = 0
      const mw = this.plugin2joy(w.data) || {}
      mw.target = mw.target || {}
      mw.target._op = 'workflow'
      mw.target._source_op = null
      // mw.target._transfer = true
      mw.target._workflow_id = mw.target._workflow_id || "workflow_"+randId()
      joy.workflow.execute(mw.target).then((my) => {
        const w = this.joy2plugin(my)
        if (w) {
          // console.log('result', w)
          w.name = 'result'
          w.type = 'imjoy/generic'
          if(w.data.length > 3){
            this.createWindow(w)
          }
        }
        this.progress = 100
      }).catch((e) => {
        console.error(e)
        this.status_text = e.toString() || "Error."
        this.showMessage(e || "Error." , 12000)
      })
    },
    saveWorkflow(joy) {
      // remove if exists
      const name = prompt("Please enter a name for the workflow", "default");
      if (name == null) {
        return
      }
      const data = {}
      data.name = name
      data._id = name + '_workflow'
      // delete data._references
      data.workflow = JSON.stringify(joy.top.data)
      // console.log('saving workflow: ', data)
      this.db.put(data, {
        force: true
      }).then((result) => {
        // console.log('Successfully saved!');
        this.workflow_list.push(data)
        this.showMessage(name + ' has been successfully saved.')
      }).catch((err) => {
        this.showMessage('Failed to save the workflow.')
        console.error(err)
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
    removeWorkflow(w) {
      // console.log('removing: ', w)
      this.db.get(w._id).then((doc) => {
        return this.db.remove(doc);
      }).then((result) => {
        var index = this.workflow_list.indexOf(w);
        if (index > -1) {
          this.workflow_list.splice(index, 1);
        }
        // console.log('Successfully removed!');
        this.showMessage(name + ' has been successfully removed.')
      }).catch((err) => {
        this.showMessage('Failed to remove the workflow.')
        console.error(err)
      })
    },
    runOp(op) {
      // console.log('run op.', this.active_windows)
      this.status_text = ''
      this.progress = 0
      const w = this.active_windows[this.active_windows.length - 1] || {}
      const mw = this.plugin2joy(w) || {}
      mw.target = mw.target || {}
      mw.target._op = '__op__'
      mw.target._source_op = null
      // mw.target._transfer = true
      mw.target._workflow_id = mw.target._workflow_id || "op_"+op.name.trim().replace(/ /g, '_')+randId()
      op.joy.__op__.execute(mw.target).then((my) => {
        const w = this.joy2plugin(my)
        if (w) {
          console.log('result', w)
          w.name = 'result'
          w.type = 'imjoy/generic'
          this.createWindow(w)
        }
        this.progress = 100
      }).catch((e) => {
        console.error(e)
        this.status_text = '<' +op.name + '>' + (e.toString() || "Error.")
        this.showMessage(this.status_text, 15000)
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
        file.loaders = this.getDataLoaders(file)
      }
      this.loadFiles()
    },
    closePanel(panel) {

    },
    parsePluginCode(code, config) {
      config = config || {}
      const uri = config.uri
      const tag = config.tag
      try {
        if (uri && uri.endsWith('.js')) {
          config.lang = config.lang || 'javascript'
          config.script = code
          config.style = null
          config.window = null
          config.tag = tag || null
        } else {
          // console.log('parsing the plugin file')
          const pluginComp = parseComponent(code)
          // console.log('code parsed from', pluginComp)
          let c = null
          config = JSON.parse(pluginComp.config[0].content)
          config.scripts = []
          for (let i = 0; i < pluginComp.script.length; i++) {
            if (pluginComp.script[i].attrs.lang) {
              config.script = pluginComp.script[i].content
              config.lang = pluginComp.script[i].attrs.lang || 'javascript'
            }
            else{
              config.scripts.push(pluginComp.script[i])
            }
          }
          if(!config.script){
            config.script = pluginComp.script[0].content
            config.lang = pluginComp.script[0].attrs.lang || 'javascript'
          }
          config.tag = tag || config.tags && config.tags[0]
          // try to match the script with current tag
          for (let i = 0; i < pluginComp.script.length; i++) {
            if (pluginComp.script[i].attrs.tag == config.tag) {
              config.script = pluginComp.script[i].content
              config.lang = pluginComp.script[i].attrs.lang || 'javascript'
              break
            }
          }
          config.links = pluginComp.link || null
          config.windows = pluginComp.window || null
          config.styles = pluginComp.style || null
          config.docs = pluginComp.docs || null
          config.attachments = pluginComp.attachment || null
        }
        config.type = config.type || config.name
        config._id = config._id || null
        config.uri = uri
        config.code = code
        config.id = config.name.trim().replace(/ /g, '_') + '_' + randId()
        config.runnable = config.runnable === false ? false : true

        for (let i = 0; i < CONFIGURABLE_FIELDS.length; i++) {
            const obj = config[CONFIGURABLE_FIELDS[i]]
            if(obj && typeof obj === 'object' && !(obj instanceof Array)){
              if(config.tag){
                config[CONFIGURABLE_FIELDS[i]] = obj[config.tag]
                if(!obj.hasOwnProperty(config.tag)){
                  console.log("WARNING: " + CONFIGURABLE_FIELDS[i] + " do not contain a tag named: " + config.tag)
                }
              }
              else{
                throw "You must use 'tags' with configurable fields."
              }
            }
        }
        if (!PLUGIN_SCHEMA(config)) {
          const error = PLUGIN_SCHEMA.errors(config)
          console.error("Invalid plugin config: " + config.name, error)
          throw error
        }
      } catch (e) {
        throw "Failed to parse the content of the plugin."
      }
      return config
    },
    preLoadPlugin(template, rplugin) {
      const config = {
        name: template.name,
        mode: template.mode,
        type: template.type,
        ui: template.ui,
        tag: template.tag,
        inputs: template.inputs,
        outputs: template.outputs,
        _id: template._id
      }
      this.validatePluginConfig(config)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        if(!rplugin){
          config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
          config.initialized = false
        }
        else{
          config.id = rplugin.id
          config.initialized = true
        }
        const tconfig = _.assign({}, template, config)
        const plugin = {
          _id: config._id,
          id: config.id,
          name: config.name,
          type: config.type,
          config: tconfig,
          mode: template.mode,
          docs: template.docs,
          tag: template.tag,
          attachments: template.attachments,
          terminate: function(){ this._disconnected = true }
        }
        this.plugins[plugin.id] = plugin
        this.plugin_names[plugin.name] = plugin
        config.click2load = false
        plugin.api = {
          run: async (my) => {
            const c = _clone(template.defaults) || {}
            c.type = template.type
            c.name = template.name
            c.tag = template.tag
            // c.op = my.op
            c.data = my.data
            c.config = my.config
            await this.createWindow(c)
          }
        }
        this.register(config, {
          id: config.id
        })
        // console.log('successfully preloaded plugin: ', plugin)
        resolve(plugin)
      })
    },
    loadPlugin(template, rplugin) {
      this.status_text = ''
      template = _clone(template)
      this.validatePluginConfig(template)
      //generate a random id for the plugin
      return new Promise((resolve, reject) => {
        const config = {}
        if(!rplugin){
          config.id = template.name.trim().replace(/ /g, '_') + '_' + randId()
          config.initialized = false
        }
        else{
          config.id = rplugin.id
          config.initialized = true
        }
        config._id = template._id
        config.context = this.pluing_context
        if (template.mode == 'pyworker') {
          if (!this.socket) {
            console.error("Please connect to the Plugin Engine 🚀.")
          }
        }
        const tconfig = _.assign({}, template, config)
        tconfig.workspace = this.selected_workspace
        const plugin = new jailed.DynamicPlugin(tconfig, _.assign({TAG: tconfig.tag, WORKSPACE: this.selected_workspace}, this.plugin_api))
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('Error occured when loading plugin.')
            this.showMessage('Error occured when loading plugin.')
            throw 'Error occured when loading plugin.'
          }

          if (template.type) {
            this.register(template, {
              id: plugin.id
            })
          }
          if (template.extensions && template.extensions.length > 0) {
            this.registerExtension(template.extensions, plugin)
          }
          // if(!config.initialized){
            plugin.api.setup().then((result) => {
              // console.log('successfully setup plugin: ', plugin)
              resolve(plugin)
            }).catch((e) => {
              console.error('error occured when loading plugin ' + template.name + ": ", e)
              this.showMessage(`<${template.name}>: ${e}`, 15000)
              reject(e)
              plugin.terminate()
            })
          // }
          // else{
          //   resolve(plugin)
          // }
        });
        plugin.whenFailed((e) => {
          if(e){
            this.status_text = `<${template.name}> ${e.toString()}`
            this.showMessage(`<${template.name}>: ${e}`)
          }
          else{
            this.status_text = `Error occured when loading ${template.name}.`
            this.showMessage(`Error occured when loading ${template.name}.`)
          }
          console.error('error occured when loading ' + template.name + ": ", e)
          plugin.terminate()
          reject(e)
        });
        plugin.docs = template.docs
        plugin.attachments = template.attachments
        this.plugins[plugin.id] = plugin
        this.plugin_names[plugin.name] = plugin
      })
    },
    async callPlugin(plugin_name, function_name) {
      const target_plugin = this.plugin_names[plugin_name]
      if(target_plugin){
        return await target_plugin.api[function_name].apply(null, Array.prototype.slice.call(arguments, 2, arguments.length-1))
      }
      else{
        throw 'plugin with type '+plugin_name+ ' not found.'
      }
    },
    async runPlugin(plugin_name, my, _plugin) {
      let source_plugin
      if(_plugin && _plugin.id){
        source_plugin = this.plugins[_plugin.id]
      }
      else{
        source_plugin = this.plugins[my.id]
        my = null
      }
      const target_plugin = this.plugin_names[plugin_name]
      if(target_plugin){
        my = my || {}
        my.op = {type: source_plugin.type, name:source_plugin.name}
        my.config = my.config || {}
        my.data = my.data || {}
        my.data._op = plugin_name
        my.data._source_op = source_plugin.name
        my.data._workflow_id = my.data._workflow_id || null
        my.data._transfer = false
        return await target_plugin.api.run(this.filter4plugin(my))
      }
      else{
        throw 'plugin with type '+plugin_name+ ' not found.'
      }
    },
    plugin2joy(my){
      if(!my) return null
      //conver config--> data  data-->target
      const res = {}
      if(my.data && my.config){
        res.data = my.config
        res.target = my.data
      }
      else{
        res.data = null
        res.target = my
      }
      res.target = res.target || {}
      if(Array.isArray(res.target) && res.target.length>0){
        if(my.select !== undefined && res.target[my.select]){
          res.target = res.target[my.select]
        }
      }
      if(typeof res.target === 'object'){
        res.target._variables = my._variables || {}
        res.target._workflow_id = my._workflow_id || null
        res.target._op = my._op || null
        res.target._source_op = my._source_op || null
        res.target._transfer = my._transfer || false
        if(Object.keys(res.target).length>4){
          // console.log('returning', res)
          return res
        }
        else{
          return null
        }
      }
      else {
        return res
      }
    },
    filter4plugin(my){
      return my && {
        _variables: my._variables || null,
        _op: my._op,
        _source_op: my._source_op,
        _transfer: my._transfer,
        _workflow_id: my._workflow_id,
        config: my.config,
        data: my.data,
      }
    },
    joy2plugin(my){
      //conver data-->config target--> data
      if(!my) return null;
      const ret = {
        _variables: my.target && my.target._variables || null,
        _op: my.target && my.target._op,
        _source_op: my.target && my.target._source_op,
        _transfer: my.target && my.target._transfer,
        _workflow_id: my.target && my.target._workflow_id,
        config: my.data,
        data: my.target,
      }
      if(my.target){
        delete my.target._op
        delete my.target._workflow_id
        delete my.target._variables
        delete my.target._source_op
        delete my.target._transfer
      }
      return ret
    },
    normalizeUI(ui){
      if(!ui){
        return ''
      }
      let normui = ''
      if(Array.isArray(ui)){
        for(let it of ui){
          if(typeof it === 'string')
            normui =  normui + it + '<br>'
          else if(typeof it === 'object'){
            for(let k in it){
              if(typeof it[k] === 'string')
                normui =  normui + k + ': ' + it[k] + '<br>'
              else
                normui =  normui + k + ': ' + JSON.stringify(it[k])+ '<br>'
            }
          }
          else
            normui =  normui + JSON.stringify(it) + '<br>'
        }
      }
      else if(typeof ui === 'object'){
        throw "ui can not be an object, you can only use a string or an array."
      }
      else if(typeof ui === 'string'){
        normui = ui.trim()
      }
      else{
        normui = ''
        console.log('Warining: removing ui string.')
      }
      return normui
    },
    register(config, _plugin) {
      try {
        const plugin = this.plugins[_plugin.id]
        if(!plugin) throw "Plugin not found."
        config = _clone(config)
        config.name = config.name || plugin.name
        config.type = config.type || config.name
        config.show_panel = config.show_panel || false
        config.ui = this.normalizeUI(config.ui) || ''
        config.tags = ["op", "plugin"]
        config.inputs = config.inputs || null
        config.outputs = config.outputs || null
        if(config.mode == 'window'){
          config.tags.push('window')
        }
        else if(config.mode == 'pyworker'){
          config.tags.push('python')
        }
        else if(config.mode == 'webworker'){
          config.tags.push('webworker')
        }
        else if(config.mode == 'webpython'){
          config.tags.push('webpython')
        }
        else if(config.mode == 'iframe'){
          config.tags.push('iframe')
        }
        // console.log('registering op', config)
        if (!REGISTER_SCHEMA(config)) {
          const error = REGISTER_SCHEMA.errors(config)
          console.error("Error occured during registering " + config.name, error)
          throw error
        }
        // if (this.registered.ops[config.type]) {
        //   console.log('plugin already registered')
        //   return
        // }
        // console.log('creating Op: ', config, plugin)
        let run = null
        if(config.run && typeof config.run == 'function'){
          run = config.run
        }
        else{
          run = plugin && plugin.api && plugin.api.run
        }

        if (!plugin || !run) {
          console.log("WARNING: no run function found in the config, this op won't be able to do anything: " + config.name)
          config.onexecute = () => {
            console.log("WARNING: no run function defined.")
          }
        } else {
          const onexecute = async (my) => {
            // my.target._workflow_id = null;
            const result = await run(this.joy2plugin(my))
            return this.plugin2joy(result)
          }
          config.onexecute = onexecute
        }

        if(config.update && typeof config.update == 'function'){
          const onupdate = async (my) => {
            // my.target._workflow_id = null;
            const result = await config.update(this.joy2plugin(my))
            return this.plugin2joy(result)
          }
          config.onupdate = debounce(onupdate, 300)
        }
        else if(plugin && plugin.api && plugin.api.update){
          const onupdate = async (my) => {
            // my.target._workflow_id = null;
            const result = await plugin.api.update(this.joy2plugin(my))
            return this.plugin2joy(result)
          }
          config.onupdate = debounce(onupdate, 300)
        }
        // console.log('adding joy op', config)
        const joy_template = config

        joy_template.init = joy_template.ui || ''
        // joy_template.ui = null
        Joy.add(joy_template);

        // plugin.type = config.type
        // plugin.name = config.name
        // console.log('register op plugin: ', plugin.config)
        const op_config = {
          plugin_id: _plugin.id,
          name: config.name,
          ui: "{id: '__op__', type: '" + config.type + "'}",
          onexecute: config.onexecute
        }
        plugin.ops = plugin.ops || {}
        plugin.ops[config.name] = op_config

        if (config.inputs){
          try {
            if((config.inputs.type != 'object' || !config.inputs.properties) && (config.inputs.type != 'array' || !config.inputs.items)){
              if(typeof config.inputs == 'object'){
                config.inputs = {properties: config.inputs, type: 'object'}
              }
              else{
                throw "inputs schema must be an object."
              }
            }
            const sch = schema.fromJSON(config.inputs)
            // console.log('inputs schema:-->', plugin.name, config.name, sch.toJSON())
            const plugin_name = plugin.name
            const op_name = config.name
            this.registered.inputs[plugin_name+'/'+op_name] =  {op_name: op_name, plugin_name: plugin_name, schema: sch}
            this.registered.loaders[plugin_name+'/'+op_name] = async (target) => {
                let config = {}
                if (plugin.config && plugin.config.ui) {
                  config = await this.showDialog(plugin.config)
                }
                target.transfer = target.transfer || false
                target._source_op = target._op
                target._op = op_name
                target._workflow_id = target._workflow_id || 'data_loader_'+op_name.trim().replace(/ /g, '_')+randId()
                const my = {op:{name: op_name}, target: target, data: config}
                const result = await plugin.api.run(this.joy2plugin(my))
                if(result){
                  // console.log('result', result)
                  const res = this.plugin2joy(result)
                  if (res) {
                    const w = {}
                    w.name = 'result'
                    w.type = 'imjoy/generic'
                    w.config = res.data
                    w.data = res.target
                    await this.createWindow(w)
                  }
                }
            }

          } catch (e) {
            console.error(`something went wrong with the input schema for ${config.name}`, e)
          }
        }
        if (config.outputs){
          try {
            if(config.outputs.type != 'object' || !config.outputs.properties){
              if(typeof config.outputs == 'object'){
                config.outputs = {properties: config.outputs, type: 'object'}
              }
              else{
                throw "inputs schema must be an object."
              }
            }
            const sch = schema.fromJSON(config.outputs)
            this.registered.outputs[plugin.name+'/'+config.name] =  {op_name: config.name, plugin_name: plugin.name, schema: sch}
          } catch (e) {
            console.error(`something went wrong with the output schema for ${config.name}`, config.outputs)
          }
        }

        this.registered.ops[plugin.name+'/'+config.name] = op_config

        //update the joy workflow if new template added, TODO: preserve settings during reload
        if (this.$refs.workflow) this.$refs.workflow.setupJoy()

        // console.log('creating panel: ', op_config)
        this.$forceUpdate()

        // if (config.mode != 'window') {
        //   throw 'Window plugin must be with type "window"'
        // }

        // console.log('register window plugin: ', plugin.config)
        this.registered.windows[config.name] = plugin.config

        return true
      } catch (e) {
        console.error(e)
        throw e
      }

    },
    renderWindow(pconfig) {
      return new Promise((resolve, reject) => {
        // console.log('rendering window', pconfig)
        const tconfig = _.assign({}, pconfig.plugin, pconfig)
        tconfig.workspace = this.selected_workspace
        const plugin = new jailed.DynamicPlugin(tconfig, _.assign({TAG: pconfig.tag, WORKSPACE: this.selected_workspace}, this.plugin_api))
        plugin.whenConnected(() => {
          if (!plugin.api) {
            console.error('the window plugin seems not ready.')
            reject(e)
            return
          }
          // this.plugins[plugin.id] = plugin
          plugin.api.setup().then((result) => {
            // console.log('successfully setup the window plugin: ', plugin, pconfig)
            //asuming the data._op is passed from last op
            pconfig.data = pconfig.data || {}
            pconfig.data._source_op = pconfig.data && pconfig.data._op
            pconfig.data._op = plugin.name
            pconfig.data._workflow_id = pconfig.data && pconfig.data._workflow_id
            pconfig.plugin = plugin
            pconfig.update = plugin.api.run
            plugin.api.run(this.filter4plugin(pconfig)).then((result)=>{
              if(result){
                for(let k in result){
                  pconfig[k] = result[k]
                }
              }
              resolve()
              this.$forceUpdate()
            }).catch((e) => {
              this.status_text = '<' + plugin.name + '>' + (e.toString() || "Error.")
              console.error('Error in the run function of plugin ' + plugin.name, e)
              this.showMessage(this.status_text)
              reject(e)
            })
          }).catch((e) => {
            console.error('Error occured when loading the window plugin ' + pconfig.name + ": ", e)
            this.status_text = 'Error occured when loading the window plugin ' + pconfig.name + ": " + e
            plugin.terminate()
            this.showMessage('Error occured when loading the window plugin ' + pconfig.name + ": " + e)
            reject(e)
          })
        });
        plugin.whenFailed((e) => {
          console.error('error occured when loading ' + pconfig.name + ":", e)
          this.status_text = `Error occured when loading ${pconfig.name}: ${e}.`
          this.showMessage(`Error occured when loading ${pconfig.name}: ${e}.`)
          plugin.terminate()
          reject(e)
        });
      })
    },
    async updateWindow(wconfig, _plugin){
      const wid = wconfig.id
      if(!wid) throw "You must provide a window id for updating."
      const w = this.window_ids[wid]
      if(w){
        if(w.update){
          const ret = await w.update(wconfig)
          if(ret){
            for(let k in ret){
              w[k] = ret[k]
            }
          }
        }
        else{
          for(let k in wconfig){
            w[k] = wconfig[k]
          }
        }
        return wid
      }
      else if(wconfig.name && wconfig.type){
        return await this.createWindow(wconfig, _plugin)
      }
      else{
        throw `Window (id=${wid}) not found`
      }
    },
    async createWindow(wconfig, _plugin) {
      wconfig.config = wconfig.config || {}
      wconfig.data = wconfig.data || null
      wconfig.click2load = wconfig.click2load || false
      wconfig.panel = wconfig.panel || null
      if (!WINDOW_SCHEMA(wconfig)) {
        const error = WINDOW_SCHEMA.errors(wconfig)
        console.error("Error occured during creating window " + wconfig.name, error)
        throw error
      }
      // console.log('window config', wconfig)
      if (wconfig.type && wconfig.type.startsWith('imjoy')) {
        // console.log('creating imjoy window', wconfig)
        wconfig.id = 'imjoy_'+randId()
        return this.addWindow(wconfig)
      } else {
        const window_config = this.registered.windows[wconfig.type]
        // console.log(window_config)
        if (!window_config) {
          console.error('no plugin registered for window type: ', wconfig.type)
          throw 'no plugin registered for window type: ', wconfig.type
        }
        // console.log(window_config)
        const pconfig = wconfig //_clone(window_config)
        //generate a new window id
        pconfig.mode = window_config.mode
        pconfig.id = window_config.id + '_' + randId()//window_config.name.trim().replace(/ /g, '_') + '_' + randId()
        // console.log('creating window: ', pconfig)
        if (pconfig.mode != 'window') {
          throw 'Window plugin must be with mode "window"'
        }
        // this is a unique id for the iframe to attach
        pconfig.iframe_container = 'plugin_window_' + pconfig.id + randId()
        // console.log('changing id...')
        pconfig.iframe_window = null
        pconfig.plugin = window_config
        pconfig.context = this.pluing_context
        if (!pconfig.click2load) {
          this.showPluginWindow(pconfig)
          await this.renderWindow(pconfig)
        } else {
          pconfig.renderWindow = this.renderWindow
          this.showPluginWindow(pconfig)
        }
        return pconfig.id
      }
    },
    showDialog(config, _plugin) {
      return new Promise((resolve, reject) => {
        this.plugin_dialog_config = config
        this.showPluginDialog = true
        this._plugin_dialog_promise = [resolve, reject]
      })
    },
    showPluginWindow(config) {
      config.type = config.type
      config.data = config.data || null
      config.config = config.config || {}
      config.panel = config.panel || null
      if (!WINDOW_SCHEMA(config)) {
        const error = WINDOW_SCHEMA.errors(config)
        console.error("Error occured during creating window " + config.name, error)
        throw error
      }
      // console.log('creating plugin window: ', config)
      return this.addWindow(config)
    },
    showAlert(text){
      console.log('alert: ', text)
      alert(text)
    },
    openUrl(url){
      Object.assign(document.createElement('a'), { target: '_blank', href: url}).click();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.site-title {
  font-size: 35px;
  font-weight: 300;
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

.floating-fab {
  margin-top: 40px;
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

.md-speed-dial-content {
  left: 40px !important;
  top: -17px !important;
  display: flex;
  flex-direction: row;
}

.site-button {
  left: 80px;
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

@media screen and (max-height: 600px) {
  .md-icon-button{
    width: 32px;
    min-width: 32px;
    height: 32px;
  }
  .md-drawer{
    width: 320px;
  }
}

</style>
