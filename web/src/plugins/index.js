import WEB_WORKER_PLUGIN_TEMPLATE from "./webWorkerTemplate.imjoy.html";
import WINDOW_PLUGIN_TEMPLATE from "./windowTemplate.imjoy.html";
import NATIVE_PYTHON_PLUGIN_TEMPLATE from "./nativePythonTemplate.imjoy.html";
import WEB_PYTHON_PLUGIN_TEMPLATE from "./webPythonTemplate.imjoy.html";

export const plugin_templates = [
  {
    name: "Default template",
    code: WEB_WORKER_PLUGIN_TEMPLATE,
    icon: "code",
  },
  {
    name: "Web Worker (JS)",
    code: WEB_WORKER_PLUGIN_TEMPLATE,
    icon: "swap_horiz",
  },
  {
    name: "Window (HTML/CSS/JS)",
    code: WINDOW_PLUGIN_TEMPLATE,
    icon: "picture_in_picture",
  },
  {
    name: "Native Python",
    code: NATIVE_PYTHON_PLUGIN_TEMPLATE,
    icon: "🚀",
  },
  // {name: "Iframe(Javascript)", code: IFRAME_PLUGIN_TEMPLATE},
  { name: "Web Python", code: WEB_PYTHON_PLUGIN_TEMPLATE, icon: "🐍" },
];
