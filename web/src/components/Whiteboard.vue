<template>
  <div class="whiteboard">
    <div class="md-layout md-gutter md-alignment-center-center">
      <md-empty-state flex
       v-if="!cards"
       md-icon="static/img/anna-palm-icon-circle-animation.svg"
       md-label="SHARELOC.XYZ"
       md-description="">
      </md-empty-state>
    </div>
  </div>
</template>

<script>
export default {
  name: 'whiteboard',
  props: {
    cards: {
      type: Object,
      default: function () {
          return null
      }
    }
  },
  data () {
    return {
      router: this.$root.$data.router,
      store: this.$root.$data.store,
      api: this.$root.$data.store.api
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
