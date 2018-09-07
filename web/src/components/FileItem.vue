<template>
  <li>
    <div>
      <span @click="select(model)" :class="{bold: isFolder, selected: model==selected || (selected && selected.length && selected.indexOf(model)>=0)}">{{ model.name }}</span>
      <span v-if="isFolder" @click="toggle">[{{ open ? '-' : '+' }}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <file-item
        class="item"
        v-for="(model, index) in model.children.slice(0, 300)"
        :key="index"
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
     selected: Object,
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
       this.$emit('select', m||this.model)
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
