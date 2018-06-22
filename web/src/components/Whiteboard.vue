<template>
<div class="whiteboard" @click="unselect()">
  <div class="md-layout md-gutter md-alignment-top-left">
    <div v-for="(window, wi) in windows" :key="wi" @click.stop.prevent="select(wi)" class="md-layout-item md-large-size-50 md-medium-size-60 md-small-size-80 md-xsmall-size-100">
      <md-card>
        <md-card-expand>
          <md-card-actions md-alignment="space-between" :class="window.selected?'window-selected':''" class="window-header">
            <md-card-expand-trigger v-if="window.panel">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>
            <div v-if="!window.panel"></div>
            <div>  <span class="window-title">{{window.name}}</span></div>
            <div>

              <!-- <md-button>Action</md-button>
              <md-button>Action</md-button> -->
              <md-menu md-size="big" md-direction="bottom-end">
                <md-button class="md-icon-button" md-menu-trigger>
                  <md-icon>more_vert</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click="close(wi)">
                    <span>Close</span>
                    <md-icon>close</md-icon>
                  </md-menu-item>
                  <md-menu-item @click="fullScreen(wi)">
                    <span>Fullscreen</span>
                    <md-icon>fullscreen</md-icon>
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
            </div>
          </md-card-actions>
          <md-card-expand-content v-if="window.panel">
            <md-card-content>
              <joy :config="window.panel"></joy>
            </md-card-content>
          </md-card-expand-content>
        </md-card-expand>
        <md-card-header>
          <!-- <div class="md-toolbar-row md-primary" @click.stop.prevent="select(wi)">
            <div class="md-toolbar-section-start">

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
                  <md-menu-item @click="fullScreen(wi)">
                    <span>Fullscreen</span>
                    <md-icon>fullscreen</md-icon>
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
            </div>
          </div> -->
        </md-card-header>
        <md-card-content>
          <md-empty-state v-if="window.type=='empty'" md-icon="hourglass_empty" md-label="IMJOY.IO" md-description="">
          </md-empty-state>
          <div v-if="window.type=='files'">
            <md-chip v-for="f in window.data.files" :key="f.name">{{f.name}}</md-chip>
          </div>
          <div :id="window.window_id"></div>
        </md-card-content>

      </md-card>
    </div>
  </div>
  <div class="md-layout md-gutter md-alignment-top-left">
    <md-empty-state v-if="!windows" md-icon="static/img/anna-palm-icon-circle-animation.svg" md-label="IMJOY.IO" md-description="">
    </md-empty-state>
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
    close(wi) {
      console.log('close', wi)
      this.windows.splice(wi, 1)
    },
    fullScreen(wi) {

    },
    select(wi, hold) {
      if (!hold) {
        for (let i = 0; i < this.windows.length; i++) {
          this.windows[i].selected = false
        }
      }
      this.windows[wi].selected = true
      this.$emit('select', this.windows[wi])
      this.$forceUpdate()
    },
    unselect() {
      console.log('unselect all')
      for (let i = 0; i < this.windows.length; i++) {
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

.window-selected {
  color: var(--md-theme-default-text-primary-on-primary, #fff) !important;
  background-color: var(--md-theme-default-primary, #448aff) !important;
}

.window-header{
  height: 40px;
}

.window-title{
  font-size: 1.4em;
}
</style>
