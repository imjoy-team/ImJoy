<template>
  <li>
    <div>
      <span v-if="isFolder" @click="toggle">[{{ open ? '-' : '+' }}]</span>
      <span @click="select({target: model, path: root}, $event.shiftKey)" @dblclick="load()">
        <md-icon v-if="model.type=='file'">insert_drive_file</md-icon> <md-icon v-else>folder_open</md-icon>
        <span class="noselect" :class="{bold: isFolder, selected: (root)==selected || (selected && Array.isArray(selected) && selected.indexOf(root)>=0)}">{{ model.name }}</span>
      </span>
      <md-icon-button v-if="isFolder" @click="load()"><md-icon>arrow_upward</md-icon></md-icon-button>
    </div>

    <ul v-if="open&&isFolder">
      <file-item
        class="item"
        v-for="(model, index) in model.children.slice(0, 300)"
        :key="index"
        :root="root+'/'+model.name"
        :model="model"
        :selected="selected"
        @load="load($event)"
        @select="select($event)"
        @select_append="select($event, true)">
      </file-item>
    </ul>
  </li>
</template>
<script>


export default {
  name: 'file-item',
  props: {
     model: Object,
     selected: [String,Array],
     root: {type: String, default: '.'},
   },
   data: function () {
     return {
       open: true
     }
   },
   mounted(){
   },
   computed: {
     isFolder: function () {
       return this.model.children &&
         this.model.children.length
     }
   },
   methods: {
     load(m){
       this.$emit('load', m || {target: this.model, path: this.root})
     },
     select(m, append){
       // this.model.selected = !this.model.selected
       if(append){
          this.$emit('select_append', m || {target: this.model, path: this.root+'/'+this.model.name })
       }
       else{
         this.$emit('select', m || {target: this.model, path: this.root+'/'+this.model.name })
       }
     },
     toggle() {
       if (this.isFolder) {
         this.open = !this.open
       }
     },
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
.selected {
  color: #FA0387;
  background: #53ace087;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}
</style>
