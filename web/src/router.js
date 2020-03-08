import Vue from "vue";
import Router from "vue-router";
import Imjoy from "@/components/Imjoy";
import About from "@/components/About";
import Home from "@/components/Home";

Vue.use(Router);

export const router_config = {
  // mode: 'history',
  base: window.location.pathName,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/app",
      name: "app",
      component: Imjoy,
    },
    {
      path: "/:)",
      redirect: { name: "joy" },
    },
    {
      path: "/%F0%9F%98%82",
      name: "joy",
      component: Imjoy,
    },
    {
      path: "/imjoy",
      name: "Imjoy",
      component: Imjoy,
    },
    {
      path: "/about",
      name: "About",
      component: About,
    },
    {
      path: "*",
      redirect: "/404.html",
    },
  ],
};

export default new Router(router_config);
