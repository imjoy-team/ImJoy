<template>
  <md-dialog :md-active.sync="show_" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>{{this.options.title || 'ImJoy File Dialog'}}</md-dialog-title>
    <md-dialog-content>
      <md-button v-show="show_all_engines && engine.connected" :key="engine.id" v-for="engine in engines" :class="selected_engine===engine?'md-primary md-raised':'md-raised'" @click="selectEngine(engine)">{{engine.name}}</md-button>
      <h3 v-if="dropping && current_file">Drop files to upload to {{current_file.path}}</h3>
      <p v-if="uploading">{{uploading_text}}</p>
      <ul :class="dropping?'dropping-files': ''" v-if="selected_engine && file_tree">
        <file-item :model="file_tree" :engine="selected_engine" :root="root" :selected="file_tree_selection" @load="loadFile" @select="fileTreeSelected" @select_append="fileTreeSelectedAppend">
        </file-item>
      </ul>
      <div class="loading loading-lg" v-else-if="selected_engine"></div>
      <p v-else>
        No engine available.
      </p>

    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" :disabled="!file_tree_selection" @click="show_=false; resolve(file_tree_selection)">OK <md-tooltip v-if="file_tree_selection">Selected: {{file_tree_selection}}</md-tooltip> </md-button>
      <md-button class="md-primary" @click="show_=false; reject('file dialog canceled by the user.')">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>
<script>


export default {
  name: 'file-dialog',
  props: {
     getFileUrl: Function,
     listFiles: Function,
     mode: String,
     engines: Array,
     requestUploadUrl: Function,
     uploadFileToUrl: Function
   },
   data: function () {
     return {
       root: null,
       options: {},
       show_: false,
       file_tree_selection: null,
       file_tree: null,
       resolve: null,
       reject: null,
       selected_engine: null,
       show_all_engines: true,
       dropping: false,
       uploading: false,
       current_file: null,
       uploading_text: ''
     }
   },
   created(){
     this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus
     if(this.event_bus){
       this.event_bus.$on('drag_upload_enter', this.showDropping)
       this.event_bus.$on('drag_upload_leave', this.hideDropping)
       this.event_bus.$on('drag_upload', this.upload)
     }

   },
   mounted(){
     // this.file_tree = this.listFiles()
   },
   beforeDestroy(){
     if(this.event_bus){
       this.event_bus.$off('drag_upload_enter', this.showDropping)
       this.event_bus.$off('drag_upload_leave', this.hideDropping)
       this.event_bus.$off('drag_upload', this.upload)
     }
   },
   computed: {
   },
   methods: {
     async upload(files){
       this.uploading_text = 'uploading'
       this.uploading = true
       if(!this.current_file){
         alert('please select a target folder for uploading.')
         return
       }
       if(this.current_file.type === 'dir'){
         for(let f of files){
           this.uploading_text = 'requesting url...'
           const url = await this.requestUploadUrl(null, {'dir': this.root, 'path': f.relativePath, 'overwrite': true, 'engine': this.selected_engine.url})
           console.log('uploading file to url', url)
           this.uploading_text = 'uploading file ' + f.relativePath + ' to ' + url
           const ret = await this.uploadFileToUrl(null, {file: f, url: url})
           this.uploading_text = 'file uploaded to ' + ret.path
         }
       }
       else{
         if(files.length>1){
           alert('Please select a target folder for uploading')
         }
         else{
           const f = files[0]
           const url = await this.requestUploadUrl(null, {'dir': this.root, 'path': f.relativePath, 'overwrite': true, 'engine': this.selected_engine.url})
           console.log('uploading file to url', url)
           this.uploading_text = 'uploading file ' + f.relativePath + ' to ' + url
           const ret = await this.uploadFileToUrl(null, {file: f, url: url})
           this.uploading_text = 'file uploaded to ' + ret.path
         }
       }
       this.refreshList()
     },
     showDropping(){
       this.dropping = true
       this.$forceUpdate()
     },
     hideDropping(){
       this.dropping = false
       this.$forceUpdate()
     },
     fileTreeSelected(f){
       if(this.options.type === 'file' && f.target.type === 'dir')
       return
       this.file_tree_selection = f.path
       this.current_file = {path: f.path, type: f.target.type}
       this.$forceUpdate()
     },
     fileTreeSelectedAppend(f){
       if(!Array.isArray(this.file_tree_selection)){
         this.file_tree_selection = this.file_tree_selection? [this.file_tree_selection]: []
       }
       this.file_tree_selection.push(f.path)
       this.$forceUpdate()
     },
     refreshList(){
       this.listFiles(this.selected_engine, this.root, this.options.type, this.options.recursive).then((tree)=>{
         this.root = tree.path
         this.current_file = {path: this.root, type: 'dir'}
         this.file_tree = tree
         this.$forceUpdate()
       })
     },
     loadFile(f){
       if(f.target.type != 'file'){
         // if(f.path === this.root){
         //   f.path = f.path+'/../'
         // }
         this.listFiles(this.selected_engine, f.path, this.options.type, this.options.recursive).then((tree)=>{
           this.root = tree.path
           this.current_file = {path: this.root, type: 'dir'}
           this.file_tree = tree
           this.$forceUpdate()
         })
       }
       else{
         this.show_=false
         if(this.options.mode === 'single' && typeof this.file_tree_selection === "object"){
           this.resolve(this.file_tree_selection[0])
         }
         else if(this.options.mode === 'multiple' && typeof this.file_tree_selection === 'string'){
           this.resolve([this.file_tree_selection])
         }
         else{
           this.resolve(this.file_tree_selection)
         }
       }
     },
     showDialog(_plugin, options){
       this.show_ = true
       this.options = options
       this.options.title = this.options.title || 'ImJoy File Dialog'
       this.options.root = this.options.root || '~'
       this.options.mode = this.options.mode || 'single|multiple'
       this.options.uri_type = this.options.uri_type|| 'path'
       if(this.options.engine){
         this.show_all_engines = false
         this.selected_engine = this.options.engine
       }
       else{
         this.show_all_engines = true
       }
       if(this.options.type != 'file' && this.options.root){
         this.file_tree_selection = this.options.root
       }
       else{
         this.file_tree_selection = null
       }
       this.current_file = {path: this.options.root, type: 'dir'}

       return new Promise((resolve, reject) => {
         if(this.options.uri_type === 'path'){
           this.resolve = resolve
           this.reject = reject
         }
         else if(this.options.uri_type === 'url'){
           this.reject = reject
           this.resolve = (paths)=>{
              if(typeof paths === 'string'){
                this.getFileUrl(_plugin, {path: paths, engine: this.selected_engine}).then(resolve).catch(reject)
              }
              else{
                  const ps = []
                  for(let path of paths){
                    ps.push(this.getFileUrl(_plugin, {path: path, engine: this.selected_engine}))
                  }
                  Promise.all(ps).then(resolve).catch(reject)
              }
           }
         }
         else{
           reject("unsupported uri_type: " + this.options.uri_type)
         }
         this.root = this.options.root
         if(this.show_all_engines){
           for(let e of this.engines){
             if(e.connected){
               this.selectEngine(e)
               break
             }
           }
         }
         else{
           this.selectEngine(this.selected_engine)
         }

       })
     },
     selectEngine(engine){
       return new Promise((resolve, reject) => {
         this.selected_engine = engine
         this.file_tree = null
         this.$forceUpdate()
         this.listFiles(this.selected_engine, this.options.root, this.options.type, this.options.recursive).then((tree)=>{
           this.root = tree.path
           this.file_tree = tree
           this.$forceUpdate()
           resolve()
         }).catch(reject)
       })
     }
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-dialog {
  max-width: 1024px;
  min-width: 50%;
}

ul {
  list-style-position: outside !important;
  margin: .1rem 0 .1rem 1.2rem;
}

.dropping-files{
  background: #cad8ef!important;
}

ol li, ul li {
  margin-top: 0px;
}
</style>
