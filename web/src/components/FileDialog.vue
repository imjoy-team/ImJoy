<template>
  <div class="file-dialog">
  <md-dialog :md-active.sync="show_" :md-click-outside-to-close="false">
    <md-dialog-title>{{this.options.title || 'ImJoy File Dialog'}}</md-dialog-title>
    <md-dialog-content>
      <ul v-if="file_tree">
        <file-item :model="file_tree" :root="root" :selected="file_tree_selection" @load="loadFile" @select="fileTreeSelected" @select_append="fileTreeSelectedAppend">
        </file-item>
      </ul>
      <p v-if="file_tree_selection">Selected: {{file_tree_selection}}</p>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="show_=false; resolve(file_tree_selection)">OK</md-button>
      <md-button class="md-primary" @click="show_=false; reject()">Cancel</md-button>
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
     }
   },
   mounted(){
     // this.file_tree = this.listFiles()
   },
   computed: {

   },
   methods: {
     fileTreeSelected(f){
       if(this.options.type == 'file' && f.target.type == 'dir')
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
         if(f.path == this.root){
           f.path = f.path+'/../'
         }
         this.listFiles(f.path, this.options.type, this.options.recursive).then((tree)=>{
           this.root = tree.path
           this.file_tree = tree
           this.$forceUpdate()
         })
       }
       else{
         this.show_=false
         if(this.options.mode == 'single' && typeof this.file_tree_selection === "object"){
           this.resolve(this.file_tree_selection[0])
         }
         else if(this.options.mode == 'multiple' && typeof this.file_tree_selection === 'string'){
           this.resolve([this.file_tree_selection])
         }
         else{
           this.resolve(this.file_tree_selection)
         }
       }
     },
     showDialog(options, _plugin){
       this.show_ = true
       this.options = options
       this.options.title = this.options.title || 'ImJoy File Dialog'
       this.options.root = this.options.root || '.'
       this.options.mode = this.options.mode || 'single|multiple'
       this.options.uri_type = this.options.uri_type|| 'path'
       this.file_tree_selection = null
       return new Promise((resolve, reject) => {
         if(this.options.uri_type == 'path'){
           this.resolve = resolve
           this.reject = reject
         }
         else if(this.options.uri_type == 'url'){
           this.reject = reject
           this.resolve = (paths)=>{
              if(typeof paths == 'string'){
                this.getFileUrl(paths, _plugin).then(resolve).catch(reject)
              }
              else{
                  const ps = []
                  for(let path of paths){
                    ps.push(this.getFileUrl(path, _plugin))
                  }
                  Promise.all(ps).then(resolve).catch(reject)
              }
           }
         }
         else{
           reject("unsupported uri_type: " + this.options.uri_type)
         }
         this.root = this.options.root
         this.listFiles(options.root, options.type, options.recursive).then((tree)=>{
           this.root = tree.path
           this.file_tree = tree
           this.$forceUpdate()
         })
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

</style>
