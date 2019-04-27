<template>
  <div class="file-dialog">
  <md-dialog :md-active.sync="show_" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>{{this.options.title || 'ImJoy File Dialog'}}</md-dialog-title>
    <md-dialog-content>
      <md-button v-if="show_all_engines" v-show="engine.connected" :key="engine.id" v-for="engine in engines" :class="selected_engine===engine?'md-primary md-raised':'md-raised'" @click="selectEngine(engine)">{{engine.name}}</md-button>
      <ul v-if="selected_engine && file_tree">
        <file-item :model="file_tree" :engine="selected_engine" :root="root" :selected="file_tree_selection" @load="loadFile" @select="fileTreeSelected" @select_append="fileTreeSelectedAppend">
        </file-item>
      </ul>
      <div class="loading loading-lg" v-else-if="selected_engine"></div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" :disabled="!file_tree_selection" @click="show_=false; resolve(file_tree_selection)">OK <md-tooltip v-if="file_tree_selection">Selected: {{file_tree_selection}}</md-tooltip> </md-button>
      <md-button class="md-primary" @click="show_=false; reject('file dialog canceled by the user.')">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>
<script>


export default {
  name: 'file-dialog',
  props: {
     getFileUrl: Function,
     listFiles: Function,
     mode: String,
     engines: Array
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
       show_all_engines: true
     }
   },
   mounted(){
     // this.file_tree = this.listFiles()
   },
   computed: {

   },
   methods: {
     fileTreeSelected(f){
       if(this.options.type === 'file' && f.target.type === 'dir')
       return
       this.file_tree_selection = f.path
       this.$forceUpdate()
     },
     fileTreeSelectedAppend(f){
       if(!Array.isArray(this.file_tree_selection)){
         this.file_tree_selection = this.file_tree_selection? [this.file_tree_selection]: []
       }
       this.file_tree_selection.push(f.path)
       this.$forceUpdate()
     },
     loadFile(f){
       if(f.target.type != 'file'){
         // if(f.path === this.root){
         //   f.path = f.path+'/../'
         // }
         this.listFiles(this.selected_engine, f.path, this.options.type, this.options.recursive).then((tree)=>{
           this.root = tree.path
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


ol li, ul li {
  margin-top: 0px;
}
</style>
