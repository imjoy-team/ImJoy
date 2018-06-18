<template>
  <div class="faq">
    <!-- <md-subheader>Options</md-subheader> -->
    <md-subheader>FREQUENTLY ASKED QUESTIONS</md-subheader>
    <md-card>
      <md-card-header>
       </md-card-header>
      <md-card-content>
        <div v-html="compiledMarkdown"></div>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import { source } from '../faq.md'
import marked from 'marked';
export default {
  name: 'faq',
  data () {
    return {
      source: source,
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
    }
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.source, { sanitize: true })
    }
  },
  mounted(){

  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
