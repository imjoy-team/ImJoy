document.addEventListener('DOMContentLoaded', function () {
  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('particles-js', 'static/js/particlesjs-config.json', function () {
    console.log('callback - particles.js config loaded');
  });
});


Vue.component('label-selector', {
  props: ['all-labels'],
  template: document.getElementById('label-selector'),
});


const app = new Vue({
  el: '#app',
  data: {
    plugins: [],
    allLabels: [],
    filters: []
  },
  computed: {
    filteredPlugins: function() {
      const covered = this.plugins.filter((plugin) => plugin.cover_image);
      const plugins = covered.concat(this.plugins.filter((plugin) => !plugin.cover_image))

      return plugins.filter((plugin) =>
        this.filters.every((label) =>
          plugin.allLabels.includes(label)
        )
      );

    }
  },
  created: function() {
    const that = this;
    const repository_url = "https://raw.githubusercontent.com/oeway/ImJoy-Plugins/master/manifest.imjoy.json"
    fetch(repository_url)
    .then(response => response.text())
    .then(text => {
      that.repo_manifest = JSON.parse(text);
      that.plugins = that.repo_manifest.plugins;
      that.plugins.forEach((plugin) => {
        that.repo_manifest.uri_root = 
        plugin.url = 'https://github.com/oeway/ImJoy-Plugins/tree/master/' + plugin.uri;
        plugin.install_url = 'https://imjoy.io/#/app?plugin=oeway/ImJoy-Plugins:' + plugin.name;
        plugin.allLabels = plugin.labels || [];
        if (!!plugin.license) {
          plugin.allLabels.push(plugin.license);
        }
        if(plugin.cover){
          if(typeof plugin.cover === 'string'){
            plugin.cover_image = plugin.cover
          }
          else if(Array.isArray(plugin.cover)){
            plugin.cover_image = plugin.cover[0]
          }
        }
        else{
          plugin.cover_image = ''
        }
      });
      that.plugins.forEach((plugin) => {
        plugin.allLabels.forEach((label) => {
          if (that.allLabels.indexOf(label) === -1) {
            that.allLabels.push(label);
          }
        });
      });
      that.allLabels.sort((a, b) =>
        a.toLowerCase() < b.toLowerCase() ? -1 : 1
      );
    });
  },
  methods: {
    etAl: (authors) => {
      if(!authors){
        return ''
      }
      if (authors.length < 3) {
        return authors.join(", ");
      } else {
        return authors.slice(0, 3).join(", ") + " et al.";
      }
    },
    addRemoveToFilters: function(label) {
      if (this.filters.indexOf(label) === -1) {
        this.filters.push(label);
      } else {
        this.filters = this.filters
        .filter((x) => x !== label);
      }
    },
    checkActive: function(label) {
      return this.filters.indexOf(label) > -1;
    },
    clearAllFilters: function() {
      this.filters = [];
    },
    getLabelCount: function(label) {
      return this.filteredPlugins
        .filter((plugins) => plugins.allLabels.includes(label))
        .length;

    },
    getPluginsCount: function(){
      return this.filteredPlugins.length
    }
  }
});
