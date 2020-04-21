<!-- This file adapted from: https://github.com/tylerkrupicka/vue-json-component/blob/master/src/JSONViewItem.vue -->
<!-- License: MIT, Original author: Tyler Krupicka (@tylerkrupicka) -->
<template>
  <div class="object-view-item">
    <!-- Handle files -->
    <div
      class="value-key can-select"
      style="justify-content: space-between;display: flex;"
      v-on:click="clickEvent(data)"
      @keyup.enter="clickEvent(data)"
      @keyup.space="clickEvent(data)"
      :role="canSelect ? 'button' : undefined"
      :tabindex="canSelect ? '0' : undefined"
      v-if="isFile(data)"
    >
      <div style="line-height: 36px;">
        <span class="value-key" v-if="dataKey">{{ dataKey }}: </span>
        <span :style="getValueStyle(data)">
          <md-icon>insert_drive_file</md-icon>
          {{ data.name }}
        </span>
      </div>
      <md-button class="md-primary md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>
    </div>
    <!-- Handle Objects and Arrays-->
    <div v-else-if="typeof data === 'object' || typeof data === 'array'">
      <div
        v-if="dataKey"
        class="data-key"
        :aria-expanded="open ? 'true' : 'false'"
      >
        <div @click.stop="toggleOpen">
          <div :class="classes"></div>
          {{ dataKey }}
          <span class="properties">{{ lengthString }}</span>
        </div>
        <md-button class="md-primary md-icon-button">
          <md-icon>menu</md-icon>
        </md-button>
      </div>
      <template v-for="(child, key) in dataValues">
        <object-view-item
          :class="[{ 'root-item': !dataKey }]"
          v-on:selected="bubbleSelected"
          :key="key"
          :dataKey="key"
          :data="child"
          v-if="open"
          :path="path + '.' + key"
          :maxDepth="maxDepth"
          :depth="depth + 1"
          :canSelect="canSelect"
        />
      </template>
      <div
        class="data-key"
        style="margin-left: 40px;"
        v-if="open && dataLength > maxLength"
        @click="loadMore()"
      >
        + more items
      </div>
    </div>

    <!-- Handle other types -->
    <div
      :class="valueClasses"
      v-on:click="clickEvent(data)"
      @keyup.enter="clickEvent(data)"
      @keyup.space="clickEvent(data)"
      :role="canSelect ? 'button' : undefined"
      :tabindex="canSelect ? '0' : undefined"
      v-else
    >
      <div>
        <span class="value-key">{{ dataKey }}: </span>
        <span :style="getValueStyle(data)">
          {{ data }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
const ArrayBufferView = Object.getPrototypeOf(
  Object.getPrototypeOf(new Uint8Array())
).constructor;

export default Vue.extend({
  name: "object-view-item",
  data: function() {
    return {
      open: this.depth < this.maxDepth,
      maxLength: 100,
    };
  },
  props: {
    path: {
      required: true,
      type: String,
    },
    depth: {
      required: true,
      type: Number,
    },
    dataKey: {
      required: false,
      type: [String, Number],
    },
    data: {
      required: true,
    },
    maxDepth: {
      type: Number,
      required: false,
      default: 1,
    },
    canSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    isFile: function(data) {
      return data instanceof File;
    },
    loadMore: function() {
      this.maxLength = this.maxLength * 2;
    },
    toggleOpen: function() {
      this.open = !this.open;
    },
    clickEvent: function(data) {
      this.$emit("selected", {
        key: this.dataKey,
        value: data,
        path: this.path,
      });
    },
    bubbleSelected: function(data) {
      this.$emit("selected", data);
    },
    getValueStyle: function(value) {
      const type = typeof value;
      switch (type) {
        case "string":
          return { color: "var(--vjc-string-color)" };
        case "number":
          return { color: "var(--vjc-number-color)" };
        case "boolean":
          return { color: "var(--vjc-boolean-color)" };
        case "object":
          return { color: "var(--vjc-null-color)" };
        case "undefined":
          return { color: "var(--vjc-null-color)" };
        default:
          return { color: "var(--vjc-valueKey-color)" };
      }
    },
  },
  computed: {
    dataValues: function() {
      if (Array.isArray(this.data) || this.data instanceof ArrayBufferView) {
        return this.data.slice(0, this.maxLength);
      } else {
        return Object.fromEntries(
          Object.entries(this.data).slice(0, this.maxLength)
        );
      }
    },
    dataLength: function() {
      if (Array.isArray(this.data)) {
        return this.data.length;
      } else {
        return Object.keys(this.data).length;
      }
    },
    classes: function() {
      return {
        "chevron-arrow": true,
        opened: this.open,
      };
    },
    valueClasses: function() {
      return {
        "value-key": true,
        "can-select": true,
      };
    },
    lengthString: function() {
      if (Array.isArray(this.data)) {
        return this.data.length === 1
          ? this.data.length + " element, array"
          : this.data.length + " elements, array";
      }
      if (this.data instanceof ArrayBufferView) {
        return this.data.length === 1
          ? this.data.length + " element, typedArray"
          : this.data.length + " elements, typedArray";
      }
      const keyLength = Object.keys(this.data).length;
      return keyLength === 1
        ? keyLength + " property"
        : keyLength + " properties";
    },
    dataValue: function() {
      if (typeof this.data === "undefined") {
        return "undefined";
      }
      return JSON.stringify(this.data);
    },
  },
});
</script>

<style lang="css" scoped>
.object-view-item:not(.root-item) {
  margin-left: 15px;
}

.value-key {
  color: var(--vjc-valueKey-color);
  font-weight: 600;
  margin-left: 10px;
  border-radius: 2px;
  white-space: nowrap;
  padding: 5px 5px 5px 10px;
}
.value-key.can-select {
  cursor: pointer;
}
.value-key.can-select:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
.value-key.can-select:focus {
  outline: 2px solid var(--vjc-hover-color);
}

.data-key {
  justify-content: space-between;
  font-size: 0.8rem;
  font-family: inherit;
  border: 0;
  padding: 0;
  background-color: transparent;
  width: 100%;
  color: var(--vjc-key-color);
  display: flex;
  align-items: center;
  border-radius: 2px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  padding-left: 5px;
  padding-right: 5px;
}
.data-key:hover {
  background-color: var(--vjc-hover-color);
}
.data-key:focus {
  outline: 2px solid var(--vjc-hover-color);
}
.data-key::-moz-focus-inner {
  border: 0;
}
.properties {
  color:white;
  vertical-align: sup;
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.9;
  margin-left: 4px;
  user-select: none;
}

.chevron-arrow {
  display: inline-block;
  flex-shrink: 0;
  border-right: 4px solid var(--vjc-arrow-color);
  border-bottom: 4px solid var(--vjc-arrow-color);
  width: var(--vjc-arrow-size);
  height: var(--vjc-arrow-size);
  margin-right: 20px;
  margin-left: 5px;
  transform: rotate(-45deg);
}
.chevron-arrow.opened {
  margin-top: -3px;
  transform: rotate(45deg);
}
</style>
