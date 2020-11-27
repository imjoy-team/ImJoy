document.getElementById("imjoy-app").style.display = "none";

require.config({
    baseUrl: "js",
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
        imjoyLoader: "https://lib.imjoy.io/imjoy-loader",
        vue: "https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min",
        "vue-js-modal": "https://imjoy-team.github.io/vue-js-modal/index",
        snackbar: "https://cdnjs.cloudflare.com/ajax/libs/snackbarjs/1.1.0/snackbar.min"
    },
    waitSeconds: 30 // optional
});

require(['jquery'], function () {
    $.getStylesheet = function (href) {
        var $d = $.Deferred();
        var $link = $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: href
        }).appendTo("head");
        $d.resolve($link);
        return $d.promise();
    };

    $.getStylesheet(
        "https://imjoy-team.github.io/vue-js-modal/styles.css"
    );
    $.getStylesheet(
        "https://fezvrasta.github.io/snackbarjs/themes-css/material.css"
    );

    $.getStylesheet(
        "https://fezvrasta.github.io/snackbarjs/dist/snackbar.min.css"
    );

    $.getStylesheet("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/regular.min.css")


    function randId() {
        return Math.random()
            .toString(36)
            .substr(2, 10);
    }


    class MessageEmitter {
        constructor(debug) {
            this._event_handlers = {};
            this._once_handlers = {};
            this._debug = debug;
        }
        emit() {
            throw new Error("emit is not implemented");
        }
        on(event, handler) {
            if (!this._event_handlers[event]) {
                this._event_handlers[event] = [];
            }
            this._event_handlers[event].push(handler);
        }
        once(event, handler) {
            handler.___event_run_once = true;
            this.on(event, handler);
        }
        off(event, handler) {
            if (!event && !handler) {
                // remove all events handlers
                this._event_handlers = {};
            } else if (event && !handler) {
                // remove all hanlders for the event
                if (this._event_handlers[event]) this._event_handlers[event] = [];
            } else {
                // remove a specific handler
                if (this._event_handlers[event]) {
                    const idx = this._event_handlers[event].indexOf(handler);
                    if (idx >= 0) {
                        this._event_handlers[event].splice(idx, 1);
                    }
                }
            }
        }
        _fire(event, data) {
            if (this._event_handlers[event]) {
                var i = this._event_handlers[event].length;
                while (i--) {
                    const handler = this._event_handlers[event][i];
                    try {
                        handler(data);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        if (handler.___event_run_once) {
                            this._event_handlers[event].splice(i, 1);
                        }
                    }
                }
            } else {
                if (this._debug) {
                    console.warn("unhandled event", event, data);
                }
            }
        }
    }

    function initPlugin(config) {
        config = config || {};
        const targetOrigin = config.target_origin || "*";
        const peer_id = randId();
        const pluginConfig = {
            allow_execution: false,
            version: "0.1.1",
            api_version: "0.2.3",
            dedicated_thread: true,
            description: "Jupyter notebook",
            id: "jupyter_" + randId(),
            lang: "python",
            name: "Jupyter Notebook",
            type: "rpc-window",
            origin: window.location.origin,
            defaults: {
                fullscreen: true
            }
        };
        parent.postMessage({
                type: "initialized",
                config: pluginConfig,
                peer_id: peer_id
            },
            targetOrigin
        );
    }


    class Connection extends MessageEmitter {
        constructor(config) {
            super(config && config.debug);
            google.colab.kernel.comms.open('imjoy_rpc', {}).then((comm) => {
                setTimeout(async () => {
                    for await (const msg of comm.messages) {
                        const data = msg.data;
                        const buffer_paths = data.__buffer_paths__ || [];
                        delete data.__buffer_paths__;
                        put_buffers(data, buffer_paths, msg.buffers || []);
                        if (data.type === "log" || data.type === "info") {
                            console.log(data.message);
                        } else if (data.type === "error") {
                            console.error(data.message);
                        } else {
                            if (data.peer_id) {
                                this._peer_id = data.peer_id
                            }
                            this._fire(data.type, data);
                        }
                    }
                }, 0)
                this.comm = comm;
            }).catch((e) => {
                console.error("failed to connect to imjoy plugin")
                document.getElementById('loading').style.display = 'none';
                document.getElementById('app').parentNode.innerHTML =
                    "Execute this cell again to see the ImJoy plugin";
            })
        }
        connect() {}
        disconnect() {}
        emit(data) {
            data.peer_id = this._peer_id;
            const split = remove_buffers(data);
            split.state.__buffer_paths__ = split.buffer_paths;
            this.comm.send(split.state, {
                buffers: split.buffers
            });
        }
    };

    async function startImJoy(app, imjoy) {
        await imjoy.start()
        imjoy.event_bus.on("show_message", msg => {
            $.snackbar({
                content: msg,
                timeout: 5000
            });
        });
        imjoy.event_bus.on("close_window", w => {
            app.closeWindow(w)
            app.$forceUpdate()
        })
        imjoy.event_bus.on("add_window", w => {
            app.$el.style.height = "700px";
            if (document.getElementById(w.window_id)) return;
            if (!w.dialog) {
                app.regularWindows.push(w)
                return
            }
            app.dialogWindows.push(w)
            app.selected_dialog_window = w;
            if (w.fullscreen || w.standalone)
                app.fullscreen = true;
            else
                app.fullscreen = false;
            app.$modal.show("window-modal-dialog");
            app.$forceUpdate()
            w.api.show = w.show = () => {
                app.selected_dialog_window = w;
                app.$modal.show("window-modal-dialog");
                imjoy.wm.selectWindow(w);
                w.api.emit("show");
            };

            w.api.hide = w.hide = () => {
                if (app.selected_dialog_window === w) {
                    app.$modal.hide("window-modal-dialog");
                }
                w.api.emit("hide");
            };

            setTimeout(() => {
                try {
                    w.show();
                } catch (e) {
                    console.error(e);
                }
            }, 500);
        });
    }


    function isSerializable(object) {
        return typeof object === "object" && object && object.toJSON;
    }

    function isObject(value) {
        return value && typeof value === "object" && value.constructor === Object;
    }

    // pub_buffers and remove_buffers are taken from
    // https://github.com/jupyter-widgets/ipywidgets/blob/master/packages/base/src/utils.ts
    // Author: IPython Development Team
    // License: BSD
    function put_buffers(state, buffer_paths, buffers) {
        buffers = buffers.map(b => {
            if (b instanceof DataView) {
                return b.buffer;
            } else {
                return b instanceof ArrayBuffer ? b : b.buffer;
            }
        });
        for (let i = 0; i < buffer_paths.length; i++) {
            const buffer_path = buffer_paths[i];
            // say we want to set state[x][y][z] = buffers[i]
            let obj = state;
            // we first get obj = state[x][y]
            for (let j = 0; j < buffer_path.length - 1; j++) {
                obj = obj[buffer_path[j]];
            }
            // and then set: obj[z] = buffers[i]
            obj[buffer_path[buffer_path.length - 1]] = buffers[i];
        }
    }

    /**
     * The inverse of put_buffers, return an objects with the new state where all buffers(ArrayBuffer)
     * are removed. If a buffer is a member of an object, that object is cloned, and the key removed. If a buffer
     * is an element of an array, that array is cloned, and the element is set to null.
     * See put_buffers for the meaning of buffer_paths
     * Returns an object with the new state (.state) an array with paths to the buffers (.buffer_paths),
     * and the buffers associated to those paths (.buffers).
     */
    function remove_buffers(state) {
        const buffers = [];
        const buffer_paths = [];
        // if we need to remove an object from a list, we need to clone that list, otherwise we may modify
        // the internal state of the widget model
        // however, we do not want to clone everything, for performance
        function remove(obj, path) {
            if (isSerializable(obj)) {
                // We need to get the JSON form of the object before recursing.
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
                obj = obj.toJSON();
            }
            if (Array.isArray(obj)) {
                let is_cloned = false;
                for (let i = 0; i < obj.length; i++) {
                    const value = obj[i];
                    if (value) {
                        if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
                            if (!is_cloned) {
                                obj = obj.slice();
                                is_cloned = true;
                            }
                            buffers.push(ArrayBuffer.isView(value) ? value.buffer : value);
                            buffer_paths.push(path.concat([i]));
                            // easier to just keep the array, but clear the entry, otherwise we have to think
                            // about array length, much easier this way
                            obj[i] = null;
                        } else {
                            const new_value = remove(value, path.concat([i]));
                            // only assigned when the value changes, we may serialize objects that don't support assignment
                            if (new_value !== value) {
                                if (!is_cloned) {
                                    obj = obj.slice();
                                    is_cloned = true;
                                }
                                obj[i] = new_value;
                            }
                        }
                    }
                }
            } else if (isObject(obj)) {
                for (const key in obj) {
                    let is_cloned = false;
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const value = obj[key];
                        if (value) {
                            if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
                                if (!is_cloned) {
                                    obj = {
                                        ...obj
                                    };
                                    is_cloned = true;
                                }
                                buffers.push(ArrayBuffer.isView(value) ? value.buffer : value);
                                buffer_paths.push(path.concat([key]));
                                delete obj[key]; // for objects/dicts we just delete them
                            } else {
                                const new_value = remove(value, path.concat([key]));
                                // only assigned when the value changes, we may serialize objects that don't support assignment
                                if (new_value !== value) {
                                    if (!is_cloned) {
                                        obj = {
                                            ...obj
                                        };
                                        is_cloned = true;
                                    }
                                    obj[key] = new_value;
                                }
                            }
                        }
                    }
                }
            }
            return obj;
        }
        const new_state = remove(state, []);
        return {
            state: new_state,
            buffers: buffers,
            buffer_paths: buffer_paths
        };
    }

    const CSStyle = `
<style>
.vm--modal{
max-height: 100%!important;
max-width: 100%!important;
}
.imjoy-inline-window{
width: 100%;
height: 600px;
}
.noselect {
-webkit-touch-callout: none;
-webkit-user-select: none;
-khtml-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
}
.dialog-control{
height: 16px;
border:0px;
font-size:1rem;
position:absolute;
color:white;
top:1px; 
}
.dialog-control:focus {
outline: none;
}

/* Dropdown Button */
.dropbtn {
border: none;
height: 25px;
min-width: 64px;
border-radius: 5px;
cursor: pointer;
margin-bottom: 2px;
}

.dropbtn > img {
vertical-align: middle;
}

.dropbtn:hover {background-color: #a9a9a9;}

.dropdown {
position: relative;
display: inline-block;
}

.dropdown-content {
display: none;
position: absolute;
background-color: #f1f1f1;
min-width: 160px;
box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
z-index: 1;
}

.dropdown-content span {
color: black;
padding: 12px 16px;
text-decoration: none;
display: block;
}


.dropdown-content span:hover {background-color: #ddd; cursor: pointer; }

.dropdown:hover .dropdown-content {display: block;}

.snackbar{
  font-size: 17px;
}

.loader {
position: fixed;
top: calc(40% - 25px);
left: calc(50% - 25px);
transform: translate(-50%, -50%);
transform: -webkit-translate(-50%, -50%);
transform: -moz-translate(-50%, -50%);
transform: -ms-translate(-50%, -50%);

border: 10px solid #f3f3f3; /* Light grey */
border-top: 10px solid #448aff; /* Blue */
border-radius: 50%;
width: 40px;
height: 40px;
animation: spin 2s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}
</style>`

    require(["imjoyLoader", "vue", "vue-js-modal", "snackbar"], function (
        imjoyLoder,
        Vue,
        vuejsmodal,
        snackbar
    ) {
        Vue.use(vuejsmodal.default);
        document.head.insertAdjacentHTML("beforeend", CSStyle)
        const app = new Vue({
            el: "#imjoy-app",
            data: {
                dialogWindows: [],
                regularWindows: [],
                selected_dialog_window: null,
                plugins: {},
                fullscreen: false,
                imjoy: null,
                active_plugin: null,
            },
            mounted() {
                document.getElementById("imjoy-app").style.display = "block";
                window.imjoyApp = this;
                window.dispatchEvent(new Event('resize'));
                imjoyLoder.loadImJoyCore({
                    version: '0.13.42'
                }).then(imjoyCore => {
                    console.log(`ImJoy Core (v${imjoyCore.VERSION}) loaded.`)
                    async function createWindow(_plugin, config) {
                        let output;
                        if (_plugin && _plugin.config.namespace) {
                            if (_plugin.config.namespace) {
                                const outputContainer = document.getElementById(_plugin.config.namespace)
                                // make sure we clear windows for new plugins
                                if (!_plugin.__isOld) {
                                    outputContainer.innerHTML = ""
                                }
                                _plugin.__isOld = true;
                                if (!config.dialog && !config.window_id) {
                                    output = document.createElement('div')
                                    output.id = randId();
                                    output.classList.add('imjoy-window');
                                    outputContainer.appendChild(output)
                                    config.window_id = output.id
                                }
                            }
                        }
                        const w = await imjoy.pm.createWindow(_plugin, config)
                        if (output) {
                            output.scrollIntoView();
                        }
                        return w
                    }
                    const imjoy = new imjoyCore.ImJoy({
                        imjoy_api: {
                            async showMessage(_plugin, msg, duration) {
                                duration = duration || 5
                                $.snackbar({
                                    content: msg,
                                    timeout: duration * 1000
                                });
                            },
                            async showDialog(_plugin, config) {
                                config.dialog = true;
                                return await createWindow(_plugin, config)
                            },
                            createWindow,

                        }
                    });
                    this.imjoy = imjoy;
                    startImJoy(this, this.imjoy).then(() => {
                        console.log('ImJoy started.')
                        document.getElementById('loading').style.display = 'none';
                    })
                });
            },
            methods: {
                loadImJoyApp() {
                    this.imjoy.pm.imjoy_api.showDialog(null, {
                        src: 'https://imjoy.io/#/app',
                        fullscreen: true,
                        passive: true,
                    })
                },
                aboutImJoy() {
                    this.imjoy.pm.imjoy_api.showDialog(null, {
                        src: 'https://imjoy.io/#/about',
                        passive: true,
                    })
                },
                showAPIDocs() {
                    this.imjoy.pm.imjoy_api.showDialog(null, {
                        src: 'https://imjoy.io/docs/#/api',
                        passive: true,
                    })
                },
                async runCode(mode, config, code) {
                    let src = code;
                    if (config.lang !== 'html') {
                        const cfg = Object.assign({}, config)
                        cfg.api_version = cfg.api_version || "0.1.8";
                        cfg.name = cfg.name || randId();
                        src = `<config lang="json">\n${JSON.stringify(cfg, null, 1)}\n</config>\n<script lang="${config.lang}">\n${code}</script>`;
                    }
                    if (mode === 'edit') {
                        const wElem = document.getElementById(config.window_id)
                        if (wElem) wElem.classList.add("imjoy-window");
                        const cfg = Object.assign({}, config)
                        delete cfg.passive
                        if (config.lang !== 'html') {
                            cfg.fold = [0]
                            cfg.lang = 'html'
                        }
                        await this.imjoy.pm.imjoy_api.createWindow(null, {
                            src: 'https://if.imjoy.io/',
                            config: cfg,
                            data: {
                                code: src,
                            },
                            window_id: cfg.window_id,
                            namespace: cfg.namespace
                        })
                        if (wElem) wElem.scrollIntoView()
                    } else if (mode === 'run') {
                        if (config.type === 'window') {
                            const wElem = document.getElementById(config.window_id)
                            if (wElem) wElem.classList.add("imjoy-window");
                            await this.imjoy.pm.imjoy_api.createWindow(null, {
                                src,
                                namespace: config.namespace,
                                tag: config.tag,
                                window_id: config.window_id
                            })
                        } else {
                            const plugin = await this.imjoy.pm.imjoy_api.getPlugin(null, src, {
                                namespace: config.namespace,
                                tag: config.tag
                            })
                            try {
                                if (plugin.setup) {
                                    await plugin.setup();
                                }
                                if (plugin.run) {
                                    await plugin.run({
                                        config: {},
                                        data: {}
                                    });
                                }
                            } catch (e) {
                                this.showMessage(e.toString())
                            }

                        }
                    } else {
                        throw "Unsupported mode: " + mode
                    }
                },
                async run(plugin) {
                    let config = {};
                    if (plugin.config.ui && plugin.config.ui.indexOf("{") > -1) {
                        config = await this.imjoy.pm.imjoy_api.showDialog(
                            plugin,
                            plugin.config
                        );
                    }
                    await plugin.api.run({
                        config: config,
                        data: {}
                    });
                },
                showMessage(msg, duration) {
                    duration = duration || 5
                    $.snackbar({
                        content: msg,
                        timeout: duration * 1000
                    });
                },
                loadPlugin() {
                    // const p = prompt(
                    //   `Please type a ImJoy plugin URL`,
                    //   "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"
                    // );
                    const p =
                        "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"

                    this.imjoy.pm
                        .reloadPluginRecursively({
                            uri: p
                        })
                        .then(async plugin => {
                            this.plugins[plugin.name] = plugin
                            this.showMessage(`Plugin ${plugin.name} successfully loaded into the workspace.`)
                            this.$forceUpdate()
                        })
                        .catch(e => {
                            console.error(e);
                            this.showMessage(`Failed to load the plugin, error: ${e}`);
                        });
                },
                showWindow(w) {
                    if (w.fullscreen || w.standalone)
                        this.fullscreen = true
                    else
                        this.fullscreen = false
                    if (w) this.selected_dialog_window = w;
                    this.$modal.show("window-modal-dialog");
                },
                closeWindow(w) {
                    this.selected_dialog_window = null;
                    this.$modal.hide("window-modal-dialog");
                    const idx = this.dialogWindows.indexOf(w)
                    if (idx >= 0)
                        this.dialogWindows.splice(idx, 1)
                },
                minimizeWindow() {
                    this.$modal.hide("window-modal-dialog");
                },
                maximizeWindow() {
                    this.fullscreen = !this.fullscreen;
                }
            }
        });
    });


})