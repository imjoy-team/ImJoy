<template>
  <li>
    <div>
      <span v-if="isFolder" @click="toggle">[{{ open ? "-" : "+" }}]</span>
      <span
        class="noselect"
        @click="
          (root === selected ||
            (selected &&
              Array.isArray(selected) &&
              selected.indexOf(root) >= 0)) &&
          model.type !== 'file'
            ? load()
            : select({ target: model, path: root }, $event.shiftKey)
        "
        @dblclick="load()"
      >
        <md-icon v-if="model.type === 'file'">insert_drive_file</md-icon>
        <md-icon v-else>folder_open</md-icon>
        <span
          class="noselect"
          :class="{
            bold: isFolder,
            selected:
              root === selected ||
              (selected &&
                Array.isArray(selected) &&
                selected.indexOf(root) >= 0),
          }"
          >{{ isFolder ? root : model.name }}</span
        >
      </span>
      <span
        class="item"
        v-if="isFolder || (model.children && model.children.length === 0)"
        @click="up()"
      >
        <md-icon>arrow_upward</md-icon></span
      >
      <div v-if="model.drives" class="drives">
        <span
          class="noselect"
          @click="
            select({ target: model, path: d });
            load({ target: model, path: d });
          "
          v-for="d in model.drives"
          :key="d"
        >
          <md-icon>storage</md-icon>
          <span
            class="noselect"
            :class="{
              bold: isFolder,
              selected:
                d === selected ||
                (selected &&
                  Array.isArray(selected) &&
                  selected.indexOf(d) >= 0),
            }"
            >{{ d }}</span
          >
        </span>
      </div>
    </div>

    <ul v-if="open && isFolder">
      <file-item
        class="item"
        v-for="model in model.children.slice(0, max_files)"
        :key="model.name"
        :root="root + '/' + model.name"
        :model="model"
        :selected="selected"
        @load="load($event)"
        @select="select($event)"
        @select_append="select($event, true)"
      >
      </file-item>
      <md-button
        v-if="model.children.length > max_files"
        class="md-primary"
        @click="max_files = max_files + 200"
        >Load more ...</md-button
      >
    </ul>
  </li>
</template>
<script>
const DEFAULT_MAX = 200;

export default {
  name: "file-item",
  props: {
    model: Object,
    selected: [String, Array],
    root: { type: String, default: "." },
    file_manager: Object,
  },
  data: function() {
    return {
      open: true,
      max_files: DEFAULT_MAX,
    };
  },
  mounted() {},
  computed: {
    isFolder: function() {
      return this.model.children && this.model.children.length;
    },
  },
  methods: {
    up(m) {
      this.$emit("load", m || { target: this.model, path: this.root + "/../" });
    },
    load(m) {
      this.$emit(
        "load",
        m || {
          target: this.model,
          path: this.root,
          file_manager: this.file_manager,
        }
      );
      this.max_files = DEFAULT_MAX;
    },
    select(m, append) {
      // this.model.selected = !this.model.selected
      if (append) {
        this.$emit(
          "select_append",
          m || { target: this.model, path: this.root + "/" + this.model.name }
        );
      } else {
        this.$emit(
          "select",
          m || { target: this.model, path: this.root + "/" + this.model.name }
        );
      }
    },
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
.selected {
  color: #fa0387;
  background: #53ace087;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

ul {
  list-style-position: outside !important;
  margin: 0.1rem 0 0.1rem 1.2rem;
}

ol li,
ul li {
  margin-top: 0px;
}

.drives {
  margin: 20px;
  display: inline;
}

.drives > span {
  margin: 10px;
}
</style>
