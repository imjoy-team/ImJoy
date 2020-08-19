<template>
  <div>
    <div
      style="padding-left: 10px; padding-right: 5px; overflow: auto"
      v-if="w.data && w.data.source && w.data.source.trim() != ''"
      v-html="sanitizedMarked(w.data.source)"
    ></div>
    <h4 v-else>
      Empty markdown source
    </h4>
  </div>
</template>

<script>
import marked from "marked";
import DOMPurify from "dompurify";

export default {
  name: "markdown-window",
  type: "imjoy/markdown",
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
    this.sanitizedMarked = mk => {
      return DOMPurify.sanitize(marked(mk));
    };
  },
  mounted() {
    this.$emit("init");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@media screen and (max-width: 600px) {
  .h2,
  h2 {
    font-size: 1rem;
  }
}
</style>
