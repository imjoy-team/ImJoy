<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="schema-io">
    <div v-for="item in ioPanels" :key="item.id">
      <template v-if="item.type === 'form'">
        <div class="panel-heading" v-if="item.title">{{ item.title }}</div>

        <div
          style="padding-left: 1px; padding-right: 1px; padding-bottom: 10px; overflow: auto"
          v-if="item.description"
          v-html="sanitizedMarked(item.description)"
        ></div>
        <vue-form-generator
          :schema="item.schema"
          :model="item.data"
          :options="item.options"
        ></vue-form-generator>

        <md-button
          :class="val.class"
          v-for="val in item.buttons"
          :key="val.label"
          @click="onSubmit($event, val.event_id, item.data)"
        >
          {{ val.label }}
        </md-button>
      </template>

      <template v-if="item.type === 'vega'">
        <div class="panel-heading" v-if="item.title">{{ item.title }}</div>
        <div class="overflow-auto">
          <div
            style="padding-left: 1px; padding-right: 1px; padding-bottom: 10px; overflow: auto"
            v-if="item.description"
            v-html="sanitizedMarked(item.description)"
          ></div>
          <vega
            :schema="item.schema"
            :options="item.options"
            :ref="item.id"
          ></vega>
          <br />

          <md-button
            :class="val.class"
            v-for="val in item.buttons"
            :key="val.label"
            @click="onSubmit($event, val.event_id, item.data)"
          >
            {{ val.label }}
          </md-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import VueFormGenerator from "vue-form-generator";
import "vue-form-generator/dist/vfg.css";
import Vue from "vue";
import * as vega from "vega";
import vegaEmbed from "vega-embed";
import marked from "marked";
import DOMPurify from "dompurify";

Vue.use(VueFormGenerator);
Vue.component("vega", {
  props: ["schema", "options"],
  mounted() {
    vegaEmbed(this.$el, this.schema, this.options || { actions: false }).then(
      res => {
        this.embed = res;
        this.view = res.view;
      }
    );
  },
  data: () => {
    return {
      view: null,
      embed: null,
    };
  },
  methods: {
    updateView(dataName, data) {
      let changeSet = vega.changeset().insert(data);
      this.view.change(dataName, changeSet).run();
    },
  },
  template: "<div></div>",
});

export default {
  name: "schema-io-window",
  type: "imjoy/schema-io",
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
      ioPanels: [],
    };
  },
  mounted() {
    if (this.w.data) {
      if (Array.isArray(this.w.data)) {
        for (let pd of this.w.data) {
          this.ioPanels.push(pd);
        }
      } else {
        this.ioPanels.push(this.w.data);
      }
    }
    this.$emit("init");
  },
  created() {
    //open link in a new tab
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
      var link = marked.Renderer.prototype.link.call(this, href, title, text);
      return link.replace("<a", "<a target='_blank' ");
    };
    marked.setOptions({
      renderer: renderer,
    });
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    this.sanitizedMarked = mk => {
      return DOMPurify.sanitize(marked(mk));
    };
  },
  methods: {
    async onSubmit(e, event_id, model) {
      e.preventDefault();
      this.w.api.emit(event_id, model);
    },
    append(data) {
      if (Array.isArray(data)) {
        for (let pd of data) {
          this.ioPanels.push(pd);
        }
      } else {
        this.ioPanels.push(data);
      }
    },
    remove(id) {
      this.ioPanels.filter((item, i) => {
        if (item.id === id) {
          this.ioPanels.splice(i, 1);
        }
      });
    },
    appendDataPoint(id, dataName, data) {
      this.$refs[id][0].updateView(dataName, data);
    },
    getData(id) {
      if (id) {
        return this.ioPanels[id].data;
      } else {
        const d = {};
        for (let k in this.ioPanels) {
          d[k] = this.ioPanels[k].data;
        }
        return d;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.schema-io {
  padding: 20px;
}

.panel {
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}
.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;
  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.panel-body {
  padding: 15px;
}
.field-checklist .wrapper {
  width: 100%;
}
.button-container-padding {
  padding: 10px 15px;
}
a {
  font-size: 1.2em;
  text-decoration: none;
  color: #448aff;
}
.overflow-auto {
  overflow: auto;
}
</style>
