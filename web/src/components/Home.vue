<template>
  <div class="home">
    <div class="topnav" :class="opened ? 'responsive' : ''">
      <a href="#home"
        ><img src="/static/img/imjoy-icon-white.svg?sanitize=true" width="24"
      /></a>
      <a href="/repo" onclick="removeWelcomePage()">Plugins</a>
      <a href="/docs#/user_manual" onclick="removeWelcomePage()">Usage</a>
      <a href="/docs#/development" onclick="removeWelcomePage()">Development</a>
      <a
        href="https://rdcu.be/bYbGO"
        target="_blank"
        onclick="removeWelcomePage()"
        >Publication</a
      >
      <a href="/#/about" onclick="removeWelcomePage()">About</a>
      <a href="javascript:void(0);" class="icon" @click="opened = !opened">
        <md-icon>menu</md-icon>
      </a>
    </div>
    <!-- <a
      href="https://github.com/imjoy-team/ImJoy"
      class="github-corner"
      aria-label="View source on Github"
      ><svg viewBox="0 0 250 250" aria-hidden="true">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          style="transform-origin: 130px 106px;"
          class="octo-arm"
        ></path>
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor"
          class="octo-body"
        ></path></svg
    ></a> -->
    <section class="cover show" style="background: rgb(209, 220, 239);">
      <div class="cover-main">
        <!-- _coverpage.md -->
        <p>
          <img
            src="/static/img/imjoy-logo-black.svg?sanitize=true"
            class="cover-logo"
          />
        </p>
        <h1>Deep Learning Made Easy!</h1>
        <p class="badges">
          <a href="https://github.com/imjoy-team/ImJoy" target="_blank"
            ><img
              :src="
                'https://img.shields.io/badge/ImJoyApp-v' +
                  app_version +
                  '-success.svg'
              "
              alt="ImJoy"
          /></a>
          &nbsp;

          <a href="https://github.com/imjoy-team/ImJoy/actions" target="_blank"
            ><img
              src="https://github.com/imjoy-team/ImJoy/workflows/Build%20Site/badge.svg"
              alt="Build Site"/></a
          >&nbsp;
          <a href="https://github.com/imjoy-team/ImJoy" target="_blank">
            <img
              src="https://img.shields.io/github/license/imjoy-team/imjoy-engine.svg"
              alt="LICENSE"/></a
          >&nbsp;
        </p>
        <div>
          <div class="md-toolbar-row">
            <div class="md-toolbar-section-start"></div>
            <md-autocomplete
              v-model="searchQuery"
              :md-options="featuredPlugins"
            >
              <label>Find plugins</label>
            </md-autocomplete>

            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button">
                <md-icon>search</md-icon>
              </md-button>
            </div>
            <!-- <input type="search" class="form-control" placeholder="Search" name="q" required=""> -->
          </div>
        </div>
        <p>
          <a href="/#/app" onclick="removeWelcomePage()" target="_self"
            >Start ImJoy</a
          >
        </p>

        <!-- background color -->
      </div>

      <div class="mask"></div>
    </section>
    <section>
      <div
        class="md-layout md-gutter md-alignment-center feature-block features"
      >
        <div
          class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
        >
          <i class="md-icon-font">folder_open</i>
          <h3>Open</h3>
          <p class="lead">
            Highly optimised pipelines with excellent reporting. Validated
            releases ensure reproducibility.
          </p>
        </div>
        <div
          class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
        >
          <i class="md-icon-font">supervisor_account</i>
          <h3>Extendable</h3>
          <p class="lead">
            Highly optimised pipelines with excellent reporting. Validated
            releases ensure reproducibility.
          </p>
        </div>
        <div
          class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
        >
          <i class="md-icon-font">stars</i>
          <h3>Powerful</h3>
          <p class="lead">
            Highly optimised pipelines with excellent reporting. Validated
            releases ensure reproducibility.
          </p>
        </div>
      </div>
    </section>
    <section
      class="md-layout md-gutter md-alignment-center  feature-block get-started"
    >
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Browser Computing</div>
            <div class="md-subhead">
              ImJoy plugins runs directly inside the browser
            </div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Support offline</div>
            <div class="md-subhead">
              You can use it without connecting to the internet
            </div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Jupyter Server</div>
            <div class="md-subhead">
              ImJoy can connect to existing Jupyter severs
            </div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <br />
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Develop in Jupyter notebooks</div>
            <div class="md-subhead">Normal size</div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Support Google Colab</div>
            <div class="md-subhead">Normal size</div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <md-card class="md-layout-item">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Remote Procedure Calls</div>
            <div class="md-subhead">Normal size</div>
          </md-card-header-text>

          <md-card-media>
            <img src="/assets/examples/avatar-2.jpg" alt="People" />
          </md-card-media>
        </md-card-header>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
    </section>
    <section class="feature-block groups">
      <h4>ImJoy project is supported by</h4>
      <br />

      <a href="https://cellprofiling.org/" target="_blank">
        <img
          style="width: 160px; margin: 10px;"
          src="static/img/lundberg-lab-logo.png"
          alt="Cell Profiling Group"
        />
      </a>
      <a href="https://kth.se" target="_blank">
        <img
          style="width: 120px; margin: 10px;"
          src="static/img/KTH_Logotyp_RGB_2013_black.png"
          alt="KTH Royal Institue of Technology"
        />
      </a>
      <a href="https://kaw.wallenberg.org/" target="_blank">
        <img
          style="width: 150px; margin: 10px;"
          src="static/img/logga-KAW-300x155.png"
          alt="Knut and Alice Wallenberg Foundation"
        />
      </a>

      <a href="https://www.pasteur.fr" target="_blank">
        <img
          style="height: 60px; margin: 10px;"
          src="static/img/Institut_Pasteur_logo_black.png"
          alt="Institut Pasteur"
        />
      </a>
    </section>

    <section
      class="md-layout md-gutter md-alignment-center feature-block footer"
    >
      <div
        class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
      >
        Source Code
        <img
          src="/static/img/imjoy-logo-black.svg?sanitize=true"
          style="width: 100px;"
        />
        <ul class="footer-list">
          <li>
            <a href="https://github.com/imjoy-team/">Made by ImJoy-Team</a>
          </li>
          <li>
            <a href="https://github.com/imjoy-team/imjoy-rpc/">ImJoy RPC</a>
          </li>
          <li>
            <a href="https://github.com/imjoy-team/imjoy-core/">ImJoy Core</a>
          </li>
          <li>
            <a href="https://github.com/imjoy-team/ImJoy/">ImJoy Web App</a>
          </li>
          <li>
            <a href="https://github.com/imjoy-team/imjoy-engine"
              >ImJoy Plugin Engine</a
            >
          </li>
          <li>
            <a href="https://github.com/imjoy-team/imjoy-plugins"
              >ImJoy Plugin Repository</a
            >
          </li>
        </ul>
      </div>

      <div
        class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100"
      >
        <p>
          Contributors of ImJoy
        </p>
        <a
          href="https://github.com/imjoy-team/ImJoy/graphs/contributors"
          target="_blank"
        >
          <img
            style="width: 1000px;max-width: 50vw;"
            src="https://contributors-img.web.app/image?repo=imjoy-team/ImJoy"
          />
        </a>
      </div>
    </section>
  </div>
</template>

<script>
import { version } from "../../package.json";

export default {
  name: "home",
  created() {
    this.app_version = version;
  },
  data() {
    return {
      opened: false,
      featuredPlugins: [],
      searchQuery: "",
    };
  },
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.space-holder {
  height: 40px;
}
.badges > a > img {
  width: unset;
}

/* Add a black background color to the top navigation */
.topnav {
  overflow: hidden;
  position: fixed;
  background-color: #448affea;
  text-align: center;
  width: 100%;
  position: absolute;
  z-index: 10;
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  display: block;
  color: white !important;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 18px;
  font-weight: 400;
  padding-left: 30px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #448aff;
  color: black !important;
}

/* Add an active class to highlight the current page */
.topnav a.active {
  background-color: #4caf50;
  color: white;
}

/* Hide the link that should open and close the topnav on small screens */
.topnav .icon {
  display: none;
}

.cover-logo {
  height: 100px;
}
/* When the screen is less than 660 pixels wide, hide all links, except for the first one ("Home"). Show the link that contains should open and close the topnav (.icon) */
@media screen and (max-width: 660px) {
  .topnav a:not(:first-child) {
    display: none;
  }
  .topnav a.icon {
    float: right;
    display: block;
  }
}

/* The "responsive" class is added to the topnav with JavaScript when the user clicks on the icon. This class makes the topnav look good on small screens (display the links vertically instead of horizontally) */
@media screen and (max-width: 660px) {
  .topnav.responsive {
    position: absolute;
  }
  .topnav.responsive a.icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  .topnav.responsive a {
    float: none;
    display: block;
    text-align: left;
    background-color: #448affda;
  }
  .topnav.responsive a:hover {
    background-color: #448afffa;
    color: white;
  }
  .cover-logo {
    height: 60px;
  }
  .feature-block {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
}

section.cover {
  padding-top: 60px;
  padding-bottom: 10px !important;
  height: 500px;
  min-height: 300px;
}

.feature-block {
  text-align: center;

  padding-top: 50px;
  padding-bottom: 30px;
  padding-left: 100px;
  padding-right: 100px;
}

.features {
  background-color: #a0a0a2ea;
  color: white;
}

.get-started {
  background-color: white;
  color: #448affea;
}

.groups {
  background-color: rgb(235, 235, 235);
  color: black;
}

.features > div > i {
  font-size: 60px;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  direction: ltr;
  font-family: Material Icons;
  -webkit-font-feature-settings: "liga";
  font-feature-settings: "liga";
  font-style: normal;
  letter-spacing: normal;
  line-height: 1;
  text-rendering: optimizeLegibility;
  text-transform: none;
  word-wrap: normal;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}
.features > div > h3 {
  font-family: "Maven Pro", sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
}

.features > div > p {
  font-size: 1rem;
  line-height: 1.8rem;
}
.search-bar {
  max-width: 600px;
  text-align: center;
}
.footer-list {
  list-style-type: none;
  text-align: left;
  padding-left: 80px;
}
</style>
