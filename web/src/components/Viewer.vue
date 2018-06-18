<template>
<div class="viewer">
  <div class="md-title">{{title}}</div>
  <!-- <md-card >
        <md-card-content > -->
  <md-app class="viewer-content">
    <md-app-toolbar class="md-transparent md-dense" md-elevation="0" v-if="!menuVisible">
      <div class="md-toolbar-row" flex>
        <md-button class="md-fab md-primary" @click="menuVisible=true" v-if="!menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
      </div>

    </md-app-toolbar>
    <md-app-drawer :md-active.sync="menuVisible" md-persistent="full">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button class="md-fab md-primary" @click="showImportDialog=true">
            <md-icon>add</md-icon>
          </md-button>
        </div>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button md-dense md-raised" @click="menuVisible = !menuVisible">
            <md-icon>keyboard_arrow_left</md-icon>
          </md-button>
        </div>
      </div>
      <md-card>
        <md-card-header>
          <!-- <div class="md-toolbar-row" flex>
            <div class="md-toolbar-section-start">
              <md-button class="md-icon-button md-primary" @click="">
                <md-icon>refresh</md-icon>
              </md-button>
            </div>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-primary" @click="runJoy()">
                <md-icon>play_arrow</md-icon>
              </md-button>
            </div>
          </div> -->
        </md-card-header>
        <md-card-content>
          <joy init="{id:'analysis_workflow', type:'actions'}"></joy>
        </md-card-content>
        <md-card-actions>

        </md-card-actions>
      </md-card>

    </md-app-drawer>

    <md-app-content class="viewer-content">
      <whiteboard :cards="cards"></whiteboard>
    </md-app-content>
  </md-app>
  <!-- </md-card-content> -->


  <md-dialog :md-active.sync="showImportDialog">
    <md-dialog-content>
      <div class="md-layout-row md-gutter">
        <div class="md-flex">
          <md-field>
            <label>load a file/folder</label>
            <md-file v-model="select_file" @md-change="selectFileChanged" />
          </md-field>
        </div>
        <joy init="{id:'file_load_workflow', type:'actions'}"></joy>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="loadFile(); showImportDialog=false">OK</md-button>
      <md-button class="md-primary" @click="showImportDialog=false">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>

<script>
import {
  saveAs
} from 'file-saver';


function getBase64Image(img) {
  // Create an empty canvas element
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  // Copy the image contents to the canvas
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Get the data-URL formatted image
  // Firefox supports PNG and JPEG. You could check img.src to
  // guess the original format, but be aware the using "image/jpg"
  // will re-encode the image.
  var dataURL = canvas.toDataURL("image/png");

  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function dataURItoBlob(dataURI) {
  if (typeof dataURI !== 'string') {
    throw new Error('Invalid argument: dataURI must be a string');
  }
  dataURI = dataURI.split(',');
  var type = dataURI[0].split(':')[1].split(';')[0],
    byteString = atob(dataURI[1]),
    byteStringLength = byteString.length,
    arrayBuffer = new ArrayBuffer(byteStringLength),
    intArray = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteStringLength; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([intArray], {
    type: type
  });
}

export default {
  name: 'viewer',
  props: ['title'],
  data() {
    return {
      select_file: null,
      selected_file: null,
      showImportDialog: false,
      cards: null,
      _action: null,
      plugin_api: {
        alert: alert
      },
      plugin: null,
      menuVisible: true,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api,
    }
  },
  watch: {
    menuVisible() {

    }
  },
  mounted() {
    const root = location.protocol + '//' + location.host
    // this.plugin = this.loadPlugin(root + '/static/plugins/filter.js')
    this.plugin = this.loadPlugin(root + '/static/plugins/textFilePlugin.js')

    this.store.event_bus.$on('message', this.messageHandler)
  },
  methods: {
    messageHandler(e){
      const data = e.data
      console.log('recieved message from ', e.origin, ' data: ',  data)
    },
    selectFileChanged(file_list) {
      this.selected_file = file_list[0]
    },
    updateProgress(p) {
      console.log(p)
    },
    test() {

      //   const my={
      //     data:{filter_expression: 'transactions <= 5 and abs(profit) > 20.5'},
      //     target: {transactions:3, profit:100}
      //   }
      //   this.plugin.api.run(my).then((res)=>{console.log('result', res)
      //
      //   }).catch(()=>{
      //
      //   })
      //
      //   this.plugin.api.register().then((res)=>{
      //     console.log('register return : ', res)
      //     res.onexecute(my).then((res)=>{console.log('result on act: ', res, my)})
      //
      // }).catch((e)=>{console.error('--->',e)})


      // this.plugin.api.gui_config.onexecute({sfs:1158}).then((joy)=>{console.log('return from',joy)})
    },
    loadPlugin(path) {
      // exported methods, will be available to the plugin
      this.plugin_api.kk = 999
      this.plugin_api.get_kk = async () => {
        return new ArrayBuffer(1200400)
      }
      const plugin = new jailed.Plugin(path, this.plugin_api);
      plugin.whenConnected(() => {
        if (!plugin.api) {
          console.error('error occured when loading plugins.')
        }
        console.log(plugin.api)

        plugin.api.register().then((plugin_config) => {
          console.log('register plugin: ', plugin_config)
          const onexecute = async (my) => {
            return await plugin.api.run({
              op: {
                name: my.op.name,
                type: my.op.type
              },
              config: my.data,
              data: my.target,
              progress: this.updateProgress
            })
          }

          for (var i = 0; i < plugin_config.ops.length; i++) {
            const op_config = plugin_config.ops[i]
            // res.onexecute()
            op_config.onexecute = onexecute
            Joy.add(op_config);
          }
          // this.setupJoy();
        }).catch((e) => {
          console.error('error when loading plugin--->', e)
        })

      });
      plugin.whenFailed((e) => {

      });
      return plugin
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-empty-state {
  width: 60%;
  max-width: 80%;
}

@media screen and (max-width: 800px) {
  .md-empty-state {
    width: 90%;
    max-width: 100%;
  }
}

.md-content {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 90vh;
}

.viewer-content {
  min-height: 90vh;
}

.md-dialog {
  width: 768px;
}

.app-content {
  overflow-y: hidden;
}
</style>
