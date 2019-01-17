<template>
  <md-list class="files-window">
    <md-list-item v-for="(f, i) in w.data" :key="f.name+f.relativePath">
      <md-radio v-model="w.data.select" :value="i" />
      <span class="md-list-item-text" style="cursor: pointer;" @click="loaders && f.loaders&&Object.keys(f.loaders).length > 0 && loaders[f.loaders[Object.keys(f.loaders)[0]]](f)">{{f.name}}</span>
      <md-menu md-size="big" md-direction="bottom-end" v-if="f.loaders && Object.keys(f.loaders).length > 0">
        <md-button class="md-icon-button" md-menu-trigger>
          <md-icon>more_horiz</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item v-for="(loader, name) in f.loaders" :key="name" @click="loaders && loaders[loader](f)">
            <span>{{name}}</span>
            <md-icon>play_arrow</md-icon>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </md-list-item>
  </md-list>
</template>

<script>

export default {
  name: 'files-window',
  type: 'imjoy/files',
  props: {
    w: {
      type: Object,
      default: function() {
        return null
      }
    },
    loaders: {
      type: Object,
      default: function() {
        return null
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.files-window {
  overflow: auto;
}
</style>
