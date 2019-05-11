<template>
  <md-list class="allow-scroll">
    <md-list-item
      class="md-primary"
      v-if="loaders && w.loaders && Object.keys(w.loaders).length > 0"
      @click="loaders[w.loaders[Object.keys(w.loaders)[0]]](w.data)"
    >
      <span class="md-list-item-text md-primary"
        >Open with "{{ Object.keys(w.loaders)[0] }}"</span
      >
      <md-tooltip
        >click to open with "{{ Object.keys(w.loaders)[0] }}".</md-tooltip
      >
    </md-list-item>
    <md-list-item v-else>
      <span class="md-list-item-text">{{ dataSummary(w) }}</span>
    </md-list-item>
    <md-list-item
      v-for="(v, k) in w.data"
      v-show="
        (!isTypedArray(w.data) &&
          (!k.startsWith || !k.startsWith('_')) &&
          w.data &&
          !w.data.length) ||
          ((w.data.length || w.data.byteLength) &&
            (w.data.length || w.data.byteLength) > 0 &&
            k <= 20)
      "
      :key="k"
    >
      <md-icon>insert_drive_file</md-icon>
      <span class="md-list-item-text" @click="printObject(k, v)">{{ k }}</span>
    </md-list-item>
    <md-list-item
      v-if="
        w.data &&
          (w.data.length || w.data.byteLength) &&
          (w.data.length || w.data.byteLength) > 20
      "
      @click="printObject(w.data)"
    >
      <md-icon>insert_drive_file</md-icon>
      <span class="md-list-item-text">...</span>
      <md-tooltip>click to print the data in your console.</md-tooltip>
    </md-list-item>
  </md-list>
</template>

<script>
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
  methods: {
    dataSummary(w) {
      if (Array.isArray(w.data)) {
        return `${w.type}, ${typeof w.data}, length: ${w.data.length}`;
      } else if (
        w.data.buffer &&
        Object.prototype.toString.call(w.data.buffer) === "[object ArrayBuffer]"
      ) {
        return `${w.type}, typedarray, length: ${w.data.length}`;
      } else if (typeof w.data === "object") {
        return `${w.type}, ${typeof w.data}, length: ${
          Object.keys(w.data).length
        }`;
      } else {
        return `${w.type}`;
      }
    },
    printObject(name, obj, obj2) {
      console.log(name, obj, obj2);
    },
    isTypedArray(obj) {
      return !!obj && obj.byteLength !== undefined;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.allow-scroll {
  overflow: auto !important;
}
</style>
