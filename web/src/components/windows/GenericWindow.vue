<template>
  <div class="generic-window">
    <object-view-item
      :class="[{ 'root-item': true, dark: false }]"
      :data="w.data"
      :maxDepth="maxDepth"
      :depth="-1"
      path=""
      @selected="itemSelected"
      @openMenu="openMenu"
      :canSelect="hasSelectedListener"
    />
  </div>
</template>

<script>
import Vue from "vue";
import ObjectViewItem from "./ObjectViewItem.vue";
Vue.component("object-view-item", ObjectViewItem);

export default {
  name: "generic-window",
  type: "imjoy/generic",
  props: {
    w: {
      type: Object,
      default: function() {
        return null;
      },
    },
    loaders: {
      type: Object,
      default: function() {
        return null;
      },
    },
  },
  data() {
    return {
      colorScheme: "light",
      maxDepth: 1,
      rootKey: "__root__",
    };
  },
  mounted() {
    this.$emit("init");
  },
  computed: {
    hasSelectedListener() {
      return Boolean(this.$listeners && this.$listeners.selected);
    },
  },
  methods: {
    openMenu: function(event) {
      const loaders = this.w.getDataLoaders(event.data);
      if (event.target) {
        event.target.setLoaders(loaders);
      }
    },
    isObject: function(val) {
      return typeof val === "object" && val !== null && !this.isArray(val);
    },
    isArray: function(val) {
      return Array.isArray(val);
    },
    itemSelected: function(data) {
      console.log(data);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.generic-window > button {
  margin-left: 0px !important;
}
.allow-scroll {
  overflow: auto !important;
}
.root-item {
  --vjc-key-color: #448aff;
  --vjc-valueKey-color: #448aff;
  --vjc-string-color: #268bd2;
  --vjc-number-color: #2aa198;
  --vjc-boolean-color: #cb4b16;
  --vjc-null-color: #6c71c4;
  --vjc-arrow-size: 7px;
  --vjc-arrow-color: #268bd2;
  --vjc-hover-color: rgba(0, 0, 0, 0.2);
  margin-left: 0;
  width: 100%;
  height: auto;
}

.root-item.dark {
  --vjc-key-color: #80d8ff;
  --vjc-valueKey-color: #fdf6e3;
  --vjc-hover-color: rgba(255, 255, 255, 0.2);
  --vjc-arrow-color: #fdf6e3;
}
</style>
