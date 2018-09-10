<template>
  <div>
  <md-dialog :md-active.sync="show_" :md-click-outside-to-close="false">
    <md-dialog-content>
      <ul v-if="file_tree">
        <file-item :model="file_tree" :selected="file_tree_selection" @select="fileTreeSelected">
        </file-item>
      </ul>
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
     listFiles: Function,
     mode: String,
   },
   data: function () {
     return {
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
       this.file_tree_selection = f.path
       this.$forceUpdate()
     },
     showDialog(){
       this.show_ = true
       return new Promise((resolve, reject) => {
         this.resolve = resolve
         this.reject = reject
         this.listFiles().then((tree)=>{
           this.file_tree = tree
           this.$forceUpdate()
           console.log(this.file_tree)
         })

       })
     }
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
