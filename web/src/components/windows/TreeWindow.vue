<template>
  <div class="tree-window">
    <p style="text-align:center;margin: 2px;" v-if="w.config.name">
      {{ w.config.name }}
    </p>
    <sl-vue-tree
      v-model="w.config.nodes"
      ref="slVueTree"
      :allow-multiselect="allowMultiselect"
      @select="nodeSelected"
      @drop="nodeDropped"
      @toggle="nodeToggled"
      @nodedblclick="nodeDbClick"
    >
      <template slot="title" slot-scope="{ node }">
        <span class="item-icon">
          <md-icon class="small-icon" v-if="node.isLeaf"
            >insert_drive_file</md-icon
          >
          <md-icon class="small-icon" v-else>folder_open</md-icon>
        </span>

        {{ node.title }}
      </template>

      <template slot="toggle" slot-scope="{ node }">
        <span v-if="!node.isLeaf">
          <md-icon class="small-icon" v-if="node.isExpanded"
            >expand_more</md-icon
          >
          <md-icon class="small-icon" v-else>chevron_right</md-icon>
        </span>
      </template>

      <template slot="draginfo">
        {{ selectedNodesTitle }}
      </template>
    </sl-vue-tree>
  </div>
</template>

<script>
import "./sl-vue-tree-light.css";
import SlVueTree from "sl-vue-tree";

export default {
  name: "tree-window",
  type: "imjoy/tree",
  components: { SlVueTree },
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
      lastEvent: "No last event",
      selectedNodesTitle: "",
      allowMultiselect: false,
    };
  },
  created() {
    this.w.config.allow_multi_select = this.allowMultiselect;
  },
  mounted() {
    const me = this;
    const exportedAPI = {
      _rintf: true,
      getNodes() {
        return me.config.nodes;
      },
      clearNodes() {
        me.config.nodes = [];
        me.$forceUpdate();
      },
      setNodes(nodes) {
        me.config.nodes = nodes;
        me.$forceUpdate();
      },
    };
    this.$emit("init", exportedAPI);
  },
  methods: {
    toggleVisibility: function(event, node) {
      const slVueTree = this.$refs.slVueTree;
      event.stopPropagation();
      const visible = !node.data || node.data.visible !== false;
      slVueTree.updateNode(node.path, { data: { visible: !visible } });
      this.lastEvent = `Node ${node.title} is ${
        visible ? "visible" : "invisible"
      } now`;
    },

    async nodeSelected(nodes) {
      this.selectedNodesTitle = nodes.map(node => node.title).join(", ");
      this.lastEvent = `Select nodes: ${this.selectedNodesTitle}`;
      if (this.w.config.node_select_callback) {
        try {
          this.$emit("loading", true);
          await this.w.config.node_select_callback(nodes);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeToggled(node) {
      this.lastEvent = `Node ${node.title} is ${
        node.isExpanded ? "expanded" : "collapsed"
      }`;
      if (this.w.config.node_toggle_callback) {
        try {
          this.$emit("loading", true);
          await this.w.config.node_toggle_callback(node);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeDbClick(node) {
      if (this.w.config.node_dbclick_callback) {
        try {
          this.$emit("loading", true);
          await this.w.config.node_dbclick_callback(node);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeDropped(nodes, position) {
      this.lastEvent = `Nodes: ${nodes
        .map(node => node.title)
        .join(", ")} are dropped ${position.placement} ${position.node.title}`;
      if (this.w.config.node_drop_callback) {
        try {
          this.$emit("loading", true);
          await this.w.config.node_drop_callback(nodes, position);
        } finally {
          this.$emit("loading", false);
        }
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.small-icon > .mdi-24px.mdi:before {
  font-size: 18px !important;
}
.small-icon {
  height: 1rem;
  width: 1rem;
}
</style>
