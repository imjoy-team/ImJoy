<template>
  <div class="about">
    <a href="https://github.com/imjoy-team/ImJoy" target="_blank"
      ><img
        :src="
          'https://img.shields.io/badge/ImJoyApp-v' +
            app_version +
            '-success.svg'
        "
        alt="ImJoy"/></a
    >&nbsp;
    <a href="https://github.com/imjoy-team/imjoy-core" target="_blank"
      ><img
        :src="
          'https://img.shields.io/badge/ImJoyCore-v' +
            core_version +
            '-success.svg'
        "
        alt="ImJoy Core"/></a
    >&nbsp;
    <a href="https://github.com/imjoy-team/ImJoy/actions" target="_blank"
      ><img
        src="https://github.com/imjoy-team/ImJoy/workflows/Build%20Site/badge.svg"
        alt="Build Site"/></a
    >&nbsp;

    <a href="https://zenodo.org/badge/latestdoi/137741898" target="_blank"
      ><img src="https://zenodo.org/badge/137741898.svg" alt="DOI"/></a
    >&nbsp;
    <a href="https://github.com/imjoy-team/ImJoy" target="_blank"
      ><img
        src="https://img.shields.io/github/license/imjoy-team/imjoy-engine.svg"
        alt="LICENSE"/></a
    >&nbsp;
    <br />
    <br />
    <img style="width: 300px" src="static/img/imjoy-logo-black.svg" />
    <br />
    <md-button
      class="normal-text"
      href="https://github.com/imjoy-team"
      target="_blank"
      >Version: {{ app_version }} <br />
      Made by the ImJoy-Team with <span class="red">❤</span></md-button
    >
    <br />
    <br />
    <p>
      The ImJoy project was originally carried out in
      <a
        href="https://research.pasteur.fr/en/team/imaging-and-modeling/"
        target="_blank"
        >Imaging and Modeling Unit</a
      >
      at Institut Pasteur.
    </p>
    <p>
      Ongoing development of ImJoy is mainly supported by the
      <a href="https://cellprofiling.org/" target="_blank"
        >Cell Profiling Group</a
      >
      headed by Emma Lundberg at
      <a href="https://www.scilifelab.se/" target="_blank">SciLifeLab</a>.
    </p>
    <p>Main Contributors:</p>
    <ul>
      <li>Wei OUYANG</li>
      <li>Florian MUELLER</li>
      <li>Martin HJELMARE</li>
    </ul>
    <p>
      We also thank
      <a
        href="https://sites.google.com/site/imagingandmodeling/people"
        target="_blank"
        >all the team members</a
      >
      from the Imaging and Modeling Unit and people who have been using,
      testing, contributing valuable feedbacks and suggestions for improving
      ImJoy.
    </p>
    <p>This project is mainly funded by</p>
    <p>
      <a href="https://www.pasteur.fr" target="_blank">
        <img
          style="width: 150px; margin: 10px;"
          src="static/img/Institut_Pasteur_logo.svg"
          alt="Institut Pasteur"
        />
        &nbsp;&nbsp;
        <img
          style="width: 150px; margin: 10px;"
          src="static/img/logga-KAW-300x155.png"
        />
      </a>
    </p>
  </div>
</template>

<script>
import { version } from "../../package.json";
import { version as core_version } from "imjoy-core";

export default {
  name: "about",
  created() {
    this.app_version = version;
    this.core_version = core_version;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.about {
  padding: 10px 30px;
  overflow-y: auto !important;
  max-width: 800px;
  position: absolute;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 0%);
}
.centered-fixed {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.normal-text {
  text-transform: none;
}
.red {
  display: inline-block;
  color: #f44336;
  transition: 0.3s;
}
</style>
