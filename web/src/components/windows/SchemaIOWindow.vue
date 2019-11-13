<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="schema-io">
    <div class="panel panel-default" v-for="item in ioPanels" :key="item.id">
      <template v-if="item.type === 'form'">
        <div class="panel-heading">{{ item.title }}</div>
        <div class="panel-body">
          <p v-if="item.description">{{ item.description }}</p>
          <vue-form-generator
            :schema="item.schema"
            :model="item.data"
            :options="item.options"
          ></vue-form-generator>
          <div class="button-container-padding">
            <input
              type="button"
              class="submit-button"
              v-for="val in item.buttons"
              :key="val.name"
              :value="val.name"
              @click="onSubmit($event, val.callback, item.data)"
            />
          </div>
        </div>
      </template>

      <template v-if="item.type === 'vega'">
        <div class="panel-heading">{{ item.title }}</div>
        <div class="panel-body overflow-auto">
          <p v-if="item.description">{{ item.description }}</p>
          <vega
            :schema="item.schema"
            :options="item.options"
            :ref="item.id"
          ></vega>
          <br />
          <div class="button-container-padding">
            <input
              type="button"
              class="submit-button"
              v-for="val in item.buttons"
              :key="val.name"
              :value="val.name"
              @click="onSubmit($event, val.callback, item.data)"
            />
          </div>
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
        this.ioPanels.push(this.w.data);
      } else {
        this.ioPanels.push(this.w.data);
      }
    }
    this.$emit("init");
  },
  methods: {
    async onSubmit(e, callback, model) {
      e.preventDefault();
      await callback(model);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.panel {
  margin-bottom: 20px;
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
.submit-button {
  padding: 10px 20px;
  font-size: 1.1em;
  border: 1px solid #448aff;
  color: white;
  background-color: #448aff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
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
