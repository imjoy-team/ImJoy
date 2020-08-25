
Vue.component('label-selector', {
  props: ['all-labels'],
  template: document.getElementById('label-selector'),
});


function getThumbnail(url, tsize) {
  return new Promise((resolve, reject) => {
    var myCan = document.createElement('canvas');
    var img = new Image();
    img.src = url;
    img.crossorigin = "anonymous";
    img.onload = function () {
      myCan.width = Number(tsize);
      myCan.height = Number(tsize);
      if (myCan.getContext) {
        var cntxt = myCan.getContext("2d");
        cntxt.drawImage(img, 0, 0, myCan.width, myCan.height);
        var dataURL = myCan.toDataURL();
        resolve(dataURL)
      } else {
        reject('unable to get context')
      }
    }
    img.onerror = reject
  })

}


const _backends = {
  "web-worker": {
    type: "internal",
    name: "Web Worker",
    lang: "javascript",
  },
  iframe: {
    type: "internal",
    name: "IFrame",
    lang: "javascript",
  },
  window: {
    type: "internal",
    name: "Window",
    lang: "javascript",
  },
  "web-python": {
    type: "internal",
    name: "Web Python",
    lang: "web-python",
    icon: "🐍",
  },
  "web-python-window": {
    type: "internal",
    name: "Web Python (window)",
    lang: "web-python",
    icon: "🐍",
  },
  "rpc-window": {
    type: "external",
    name: "RPC Window",
    lang: "*",
    icon: "🌟",
  },
  "rpc-worker": {
    type: "external",
    name: "RPC Worker",
    lang: "*",
    icon: "⚙️",
  },
  collection: {
    type: "-",
    name: "Collection",
    lang: "",
    icon: "",
  },
};

const app = new Vue({
  el: '#app',
  data: {
    plugins: [],
    allLabels: [],
    filters: [],
    selected_plugin: {}
  },
  computed: {
    filteredPlugins: function () {
      const covered = this.plugins.filter((plugin) => plugin.cover_image);
      const plugins = covered.concat(this.plugins.filter((plugin) => !plugin.cover_image))

      return plugins.filter((plugin) =>
        this.filters.every((label) =>
          plugin.allLabels.includes(label)
        )
      );

    }
  },
  created: async function () {
    const that = this;
    const repos = [
      'imjoy-team/imjoy-plugins',
      'imjoy-team/imjoy-demo-plugins',
    ]
    that.plugins = []
    for (let repo of repos) {
      try {
        const repository_url = `https://raw.githubusercontent.com/${repo}/master/manifest.imjoy.json`
        const response = await fetch(repository_url)
        const repo_manifest = JSON.parse(await response.text());
        const plugins = repo_manifest.plugins;
        for (let plugin of plugins) {
          plugin.repo = repo;
          plugin.url = `https://github.com/${repo}/tree/master/${plugin.uri}`;
          plugin.install_url = `/#/app?plugin=${repo}:${plugin.name}`;
          plugin.run_url = `/lite?plugin=${repo}:${plugin.name}`;
          plugin.source_url = `https://raw.githubusercontent.com/${repo}/master/${plugin.uri}`;
        }
        that.plugins = that.plugins.concat(plugins);
      } catch (e) {
        console.error(e)
      }
    }
    that.plugins.forEach((plugin) => {
      plugin.allLabels = plugin.labels || [];
      if (!!plugin.license) {
        plugin.allLabels.push(plugin.license);
      }
      if (typeof plugin.type === 'string') {
        plugin.allLabels.push(plugin.type);
      } else if (typeof plugin.type === 'object') {
        plugin.allLabels.concat(Object.values(plugin.type));
      }
      if (!!plugin.repo) {
        plugin.allLabels.push(plugin.repo);
      }
      if (plugin.tags) {
        plugin.allLabels.concat(plugin.tags);
      }
      if (plugin.cover) {
        if (typeof plugin.cover === 'string') {
          plugin.cover_image = plugin.cover
        } else if (Array.isArray(plugin.cover)) {
          plugin.cover_image = plugin.cover[0]
        }
        plugin.thumbnail = plugin.cover_image;
        // getThumbnail(plugin.cover_image, 500).then((thumbnail) => {
        //   plugin.thumbnail = thumbnail;
        //   that.$forceUpdate();
        // })
      } else {
        plugin.cover_image = ''
      }
      if(_backends[plugin.type]){
        plugin.badges = _backends[plugin.type].icon || '';
      }
      else{
        plugin.badges = '🚀'
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
    if (!this.$refs.plugin_info_dialog.showModal) {
      dialogPolyfill.registerDialog(this.$refs.plugin_info_dialog);
    }
  },
  methods: {
    async getDocs(plugin) {
      if (plugin.docs) return;
      plugin.docs = '@loading...';
      this.$forceUpdate();
      const response = await fetch(plugin.source_url)
      const source_code = await response.text();
      const pluginComp = window.parseComponent(source_code);
      const raw_docs = pluginComp.docs && pluginComp.docs[0] && pluginComp.docs[0].content;
      if (raw_docs && window.marked && window.DOMPurify) {
        plugin.docs = window.DOMPurify.sanitize(window.marked(raw_docs))
        plugin.source_code = source_code;
      } else {
        plugin.docs = null;
        plugin.source_code = null;
      }
      this.$forceUpdate();
    },
    run(plugin) {
      window.open(plugin.run_url, '_blank');
    },
    install(plugin) {
      window.open(plugin.install_url, '_blank');
    },
    share(plugin) {
      prompt('Please copy and paste following URL for sharing:', 'https://imjoy.io' + plugin.install_url)
    },
    showInfo(plugin) {
      this.selected_plugin = plugin;
      this.$refs.plugin_info_dialog.showModal();
      this.getDocs(plugin)
    },
    closeInfo() {
      this.$refs.plugin_info_dialog.close();
    },
    etAl(authors) {
      if (!authors) {
        return ''
      }
      if (authors.length < 3) {
        return authors.join(", ");
      } else {
        return authors.slice(0, 3).join(", ") + " et al.";
      }
    },
    addRemoveToFilters(label) {
      if (this.filters.indexOf(label) === -1) {
        this.filters.push(label);
      } else {
        this.filters = this.filters
          .filter((x) => x !== label);
      }
    },
    checkActive(label) {
      return this.filters.indexOf(label) > -1;
    },
    clearAllFilters() {
      this.filters = [];
    },
    getLabelCount(label) {
      return this.filteredPlugins
        .filter((plugins) => plugins.allLabels.includes(label))
        .length;

    },
    getPluginsCount() {
      return this.filteredPlugins.length
    }
  }
});