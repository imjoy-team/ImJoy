<template>
<div class="joy">
  <md-button class="md-icon-button" v-if="showHeader" @click="config.expanded=!config.expanded; $forceUpdate()">
    <md-icon v-if="!config.expanded">expand_more</md-icon>
    <md-icon v-else>expand_less</md-icon>
  </md-button>
  <md-button class="run-button md-primary" v-if="showHeader" @click="runJoy()">{{config.name}}</md-button>
    <div class="joy-container" v-show="config.expanded ||!showHeader">
        <div class="joy-editor" ref="editor"></div>
        <md-button class="md-button md-primary" v-if="controlButtons" :disabled="isRunning" @click="runJoy()">
          <md-icon>play_arrow</md-icon>Run
        </md-button>
        <md-button class="md-button md-primary" v-if="controlButtons" :disabled="!isRunning" @click="stopJoy()">
          <md-icon>stop</md-icon>Stop
        </md-button>

      </div>

    </div>
</template>

<script>
export default {
  name: 'joy',
  props: {
    showHeader: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    controlButtons: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      joy: null,
      isRunning: false,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  mounted() {
    setTimeout(this.setupJoy, 500)
  },
  watch: {
    config: (newVal, oldVal) => { // watch it
      console.log('Prop changed: ', newVal, ' | was: ', oldVal)
      this.setupJoy()
    }
  },
  methods: {
    setupJoy() {
      this.$refs.editor.innerHTML = ''
      const joy_config = {
        // Where the Joy editor goes:
        container: this.$refs.editor,

        // The words & ops inside the editor:
        init: this.config.ui || '', //"{id:'localizationWorkflow', type:'ops'} " + // a list of ops
        //"<hr> {type:'save'}", // a save button!

        // Load data from URL, otherwise blank:
        data: this.config.data || Joy.loadFromURL(),

        // Other ops to include, beyond turtle ops:
        modules: this.config.modules || ["instructions", "math", 'random'],

        onexecute: this.config.onexecute
        // What to do when the user makes a change:
        // onupdate: (my) => {
        //   // turtle.start();
        //   // my.turtleInstructions.act(turtle);
        //   // turtle.draw();
        //   console.log('joy updated: ', my)
        //   this.$emit('update', my)
        // }
      }
      for (let c in this.config) {
        if (this.config.hasOwnProperty(c)) {
          if (c.endsWith('onupdate') && typeof this.config[c] == 'function') {
            joy_config[c] = this.config[c]
          }
        }
      }
      console.log('setting up joy ', this.config)
      this.joy = Joy(joy_config);
    },
    runJoy() {
      this.$emit('run', this.joy)
    },
    stopJoy() {
      this.$emit('stop')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.joy-container {
  text-decoration: none;
  margin: 0;
  font-family: Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: block;
}

.joy-editor {
  width: 100%;
  height: 100%;
  float: left;
  /* background: #eee; */
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 1.2em;
  font-weight: 100;
}
.run-button{
  width: 80%;
  text-transform: none;
  font-size: 1.2em;
}

</style>
