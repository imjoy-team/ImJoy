<template>
  <div class="md-toolbar-row">
    <div class="md-toolbar-row" flex>
      <md-button class="site-title" @click="$router.push('/')">
        <img
          class="site-title"
          src="static/img/imjoy-logo-white.svg"
          alt="ImJoy"
        /><span class="superscript">beta</span>
        <!-- <div class="site-title">ImJoy.io </div> -->
      </md-button>

      <span
        v-show="$route.path != '/'"
        class="md-layout-item md-medium-hide subheader-title"
        >Deploying Deep Learning Made Easy!</span
      >

      <div class="md-toolbar-section-end">
        <md-menu md-size="medium" v-if="screenWidth < 600">
          <md-button class="md-primary md-icon-button" md-menu-trigger>
            <md-icon>menu</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item
              class="md-primary md-button menu-button"
              v-show="$route.path != '/'"
              @click="$router.push('/')"
              >Home</md-menu-item
            >
            <md-menu-item
              class="md-primary md-button menu-button"
              v-show="$route.path != '/app'"
              @click="$router.push('/app')"
              >Start ImJoy</md-menu-item
            >
            <md-menu-item
              class="md-primary md-button menu-button"
              href="https://github.com/oeway/ImJoy"
              >Source</md-menu-item
            >
            <md-menu-item class="md-primary md-button menu-button" href="/docs"
              >Docs</md-menu-item
            >
            <!-- <md-menu-item class="md-primary md-button menu-button" href="/static/docs/">Docs</md-menu-item> -->
            <!-- <md-menu-item class="md-primary md-button menu-button" @click="shareOnTwitter">Share</md-menu-item> -->
            <md-menu-item
              class="md-primary md-button menu-button"
              v-show="$route.path != '/about'"
              @click="$router.push('/about')"
              >About</md-menu-item
            >
          </md-menu-content>
        </md-menu>

        <md-button
          v-show="$route.path != '/'"
          class="md-accent"
          v-if="screenWidth >= 600"
          @click="$router.push('/')"
        >
          <md-icon>home</md-icon> Home
          <md-tooltip>Home Page</md-tooltip>
        </md-button>
        &nbsp;
        <md-button
          v-show="$route.path != '/app'"
          class="md-accent"
          v-if="screenWidth >= 600"
          @click="$router.push('/app')"
        >
          <md-icon
            md-src="static/img/imjoy-icon-white.svg"
            class="md-size-1x svg-icon"
          ></md-icon>
          ImJoy App
          <md-tooltip>Start ImJoy App</md-tooltip>
        </md-button>
        &nbsp;
        <md-button
          href="https://github.com/oeway/ImJoy"
          class="md-accent"
          v-if="screenWidth >= 600"
          target="_blank"
        >
          <md-icon
            md-src="static/img/github.svg"
            class="md-size-1x svg-icon"
          ></md-icon
          >source
          <md-tooltip>Source code on Github</md-tooltip>
        </md-button>
        &nbsp;
        <md-button href="/docs" class="md-accent" v-if="screenWidth >= 600">
          <md-icon>library_books</md-icon>Docs
          <md-tooltip>Documentation</md-tooltip>
        </md-button>
        <!-- &nbsp; -->
        <!-- <md-button href="/static/docs/" class="md-accent" v-if="screenWidth>=600">
              <md-icon>library_books</md-icon>docs
              <md-tooltip>Documentation</md-tooltip>
            </md-button> -->
        <!-- &nbsp;
            <md-button @click="shareOnTwitter" class="md-accent" v-if="screenWidth>=600">
              <md-icon md-src="static/img/twitter.svg" class="md-size-1x svg-icon"></md-icon>share
              <md-tooltip>Share ImJoy on Twitter</md-tooltip>
            </md-button> -->
        &nbsp;
        <md-button
          v-show="$route.path != '/about'"
          class="md-accent"
          v-if="screenWidth >= 600"
          @click="$router.push('/about')"
        >
          <md-icon>info</md-icon> About
          <md-tooltip>About ImJoy.io</md-tooltip>
        </md-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "navbar",
  data() {
    return {
      screenWidth: window.innerWidth,
    };
  },
  created() {
    this.event_bus = this.$root.$data.store && this.$root.$data.store.event_bus;
  },
  mounted() {
    this.screenWidth = window.innerWidth;
    this.event_bus.$on("resize", this.updateSize);
  },
  beforeDestroy() {
    this.event_bus.$off("resize", this.updateSize);
  },
  methods: {
    updateSize(e) {
      this.screenWidth = e.width;
    },
    shareOnTwitter() {
      const url = "https://imjoy.io";
      const text = " #ImJoy ";
      window.open(
        "http://twitter.com/share?url=" +
          encodeURIComponent(url) +
          "&text=" +
          encodeURIComponent(text),
        "",
        "left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0"
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.superscript {
  font-size: 16px;
  text-transform: none;
  vertical-align: super;
  color: #ff5253;
}

.subheader-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}
.menu-button {
  text-align: left;
}

.site-title {
  font-size: 35px;
  font-weight: 300;
  height: 48px;
}

@media screen and (max-width: 600px) {
  .site-title {
    font-size: 26px;
    font-weight: 250;
    height: 40px;
  }
}

@media screen and (max-width: 400px) {
  .site-title {
    font-size: 22px;
    font-weight: 220;
    height: 36px;
  }
}

.svg-icon {
  display: inline-block;
}
</style>
