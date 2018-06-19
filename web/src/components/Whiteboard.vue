<template>
<div class="whiteboard"  @click="unselect()">
  <div class="md-layout md-gutter md-alignment-top-left">
    <md-empty-state v-if="!windows" md-icon="static/img/anna-palm-icon-circle-animation.svg" md-label="IMJOY.IO" md-description="">
    </md-empty-state>

      <md-card v-for="(window, wi) in windows" :class="window.selected?'md-primary':''" class="md-layout-item md-large-size-30 md-medium-size-40 md-small-size-50 md-xsmall-size-100" :key="wi">
        <md-card-header>
            <div class="md-toolbar-row md-primary" @click.stop.prevent="select(wi)">
              <div class="md-toolbar-section-start">
                <h2>{{window.name}}</h2>
              </div>
              <div class="md-toolbar-section-end">
                <md-menu md-size="big" md-direction="bottom-end" v-if="window.selected">
                 <md-button class="md-icon-button" md-menu-trigger>
                   <md-icon>more_vert</md-icon>
                 </md-button>

                 <md-menu-content>
                   <md-menu-item @click="close(wi)">
                     <span>Close</span>
                     <md-icon>close</md-icon>
                   </md-menu-item>

                   <!-- <md-menu-item @click="sendMessage">
                     <span>Send a message</span>
                     <md-icon>message</md-icon>
                   </md-menu-item> -->
                 </md-menu-content>
               </md-menu>
              </div>
            </div>


        </md-card-header>
        <md-card-content>
          <md-empty-state v-if="window.type=='empty'" md-icon="hourglass_empty" md-label="IMJOY.IO" md-description="">
          </md-empty-state>
          <div v-if="window.type=='files'">
            <md-chip v-for="f in window.data.files" :key="f.name">{{f.name}}</md-chip>
          </div>
        </md-card-content>
      </md-card>
  </div>
</div>
</template>

<script>
export default {
  name: 'whiteboard',
  props: {
    windows: {
      type: Array,
      default: function() {
        return null
      }
    }
  },
  data() {
    return {
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {

  },
  methods: {
    close(wi){
      console.log('close', wi)
      this.windows.splice(wi, 1)
    },
    select(wi, hold){
      if(!hold){
        for(let i=0;i<this.windows.length;i++){
          this.windows[i].selected = false
        }
      }
      this.windows[wi].selected = true
      this.$emit('select', this.windows[wi])
      this.$forceUpdate()
    },
    unselect(){
      console.log('unselect all')
      for(let i=0;i<this.windows.length;i++){
        this.windows[i].selected = false
      }
      this.$forceUpdate()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.whiteboard {
  height: 100%;
  position: relative;
}

.md-empty-state {
  position: absolute;
  top: 39%;
  transform: translateY(-50%);
  height: 100%;
}

.md-card {
  /* width: 450px;
  height: 300px; */
  margin-top: 20px;
}
</style>
