<template>
  <div>
  <md-card  v-if="plugin_info">
    <md-card-media v-if="plugin_info.cover&&(typeof plugin_info.cover === 'string')" md-ratio="16:9">
     <img :src="plugin_info.cover" alt="plugin-cover">
    </md-card-media>
    <div class="carousel" v-else-if="plugin_info.cover">
      <!-- carousel locator -->
      <input class="carousel-locator" v-for="(c, k) in plugin_info.cover" :key="k" :id="'slide-'+k" type="radio" name="carousel-radio" hidden="">
      <!-- carousel container -->
      <div class="carousel-container">
        <!-- carousel item -->
        <figure class="carousel-item" v-for="(c,k) in plugin_info.cover" :key="k">
          <img class="img-responsive rounded" :src="c" alt="plugin cover">
        </figure>
      </div>
      <!-- carousel navigation -->
      <div class="carousel-nav">
        <label class="nav-item text-hide c-hand" v-for="(c, k) in plugin_info.cover" :key="k" :for="'slide-'+k">{{k}}</label>
      </div>
    </div>
    <md-card-header>
      <md-toolbar md-elevation="0">
        <div>
          <h2><md-icon v-if="plugin_info.icon">{{plugin_info.icon}}</md-icon><md-icon v-else>extension</md-icon>
            {{plugin_info.type === 'native-python'? plugin_info.name + ' 🚀': plugin_info.name}}
          </h2>
        </div>
        <div class="md-toolbar-section-end">
          <p>version:{{plugin_info.version}}</p>
        </div>

      </md-toolbar>
    </md-card-header>
    <md-card-content>

      <div style="padding-left: 10px; padding-right: 5px; overflow: auto" v-if="w.data && w.data.source && w.data.source.trim() !='' " v-html="marked(w.data.source, { sanitize: true })"></div>
      <h4 v-else>
        {{plugin_info && plugin_info.description}}
        <br>
         This plugin has no documentation!
      </h4>
    </md-card-content>
  </md-card>

</div>
</template>

<script>
import marked from 'marked';
export default {
  name: 'markdown-window',
  type: 'imjoy/markdown',
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
  },
  data () {
    return {
      plugin_info: null
    }
  },
  created(){
    this.marked = marked
  },
  mounted(){
    this.plugin_info = this.w && this.w.data && this.w.data.plugin_info
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@media screen and (max-width: 600px) {
  .h2, h2 {
      font-size: 1.0rem;
  }
}
</style>
