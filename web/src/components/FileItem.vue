<template>
  <li>
    <div>
      <span @click="select({target: model, path: root})" :class="{bold: isFolder, selected: (root)==selected || (selected && Array.isArray(selected) && selected.indexOf(root)>=0)}">{{ model.name }}</span>
      <span v-if="isFolder" @click="toggle">[{{ open ? '-' : '+' }}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <file-item
        class="item"
        v-for="(model, index) in model.children.slice(0, 300)"
        :key="index"
        :root="root+'/'+model.name"
        :model="model" :selected="selected" @select="select($event)">
      </file-item>
    </ul>
  </li>
</template>
<script>


export default {
  name: 'file-item',
  props: {
     model: Object,
     selected: String,
     root: {type: String, default: '.'},
   },
   data: function () {
     return {
       open: false
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
     select: function(m){
       // this.model.selected = !this.model.selected
       this.$emit('select', m || {target: this.model, path: this.root+'/'+this.model.name })
     },
     toggle: function () {
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
</style>
