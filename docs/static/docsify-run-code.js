(function () {
    "use strict";

    function randId() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return Math.random().toString(36).substr(2, 9);
    };

    function _typeof(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
            _typeof = function (obj) {
                return typeof obj;
            };
        } else {
            _typeof = function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
        }
        return _typeof(obj);
    }

    function styleInject(css, ref) {
        if (ref === void 0) ref = {};
        var insertAt = ref.insertAt;
        if (!css || typeof document === "undefined") {
            return;
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        var style = document.createElement("style");
        style.type = "text/css";
        if (insertAt === "top") {
            if (head.firstChild) {
                head.insertBefore(style, head.firstChild);
            } else {
                head.appendChild(style);
            }
        } else {
            head.appendChild(style);
        }
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    }
    var css = `.imjoy-window{width: 100%; height: 600px;}
    .docsify-run-button,.docsify-run-button span, .docsify-edit-button,.docsify-edit-button span{cursor:pointer;transition:all .25s ease}
    .docsify-run-button,.docsify-edit-button{z-index:1;height: 35px;margin-right: 6px;overflow:visible;padding:.65em .8em;border:0;border-radius:0;outline:0;font-size:1em;background:var(--theme-color,grey);color:#fff;opacity:0.7}
    .docsify-run-button span, .docsify-edit-button span{border-radius:3px;background:inherit;pointer-events:none}
    .docsify-run-button:focus,pre:hover .docsify-run-button, .docsify-edit-button:focus,pre:hover .docsify-edit-button{opacity:1}
    .docsify-close-button{position: absolute;right: 4px;top: 4px;z-index:3;cursor:pointer;padding:.65em .8em;border:0;border-radius:0;outline:0;font-size:1em;background:var(--theme-color,grey);color:#fff;}
    .docsify-loader {position: absolute;left: 123px;bottom: 4px;display: inline-block;transform: translate(-50%, -50%);transform: -webkit-translate(-50%, -50%);transform: -moz-translate(-50%, -50%);transform: -ms-translate(-50%, -50%);border: 6px solid #f3f3f3; /* Light grey */border-top: 6px solid #448aff; /* Blue */border-radius: 50%;width: 30px;height: 30px;animation: spin 2s linear infinite;}
    @keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}`;
    styleInject(css);

    function docsifyRunCode(hook, vm) {
        hook.doneEach(function () {
            var targetElms = Array.apply(null, document.querySelectorAll("pre[data-lang]"));
            var i18n = {
                runButtonText: "Run",
                editButtonText: "Edit",
                errorText: "Error",
                successText: "Done"
            };
            if (vm.config.runCode) {
                Object.keys(i18n).forEach(function (key) {
                    var textValue = vm.config.runCode[key];
                    if (typeof textValue === "string") {
                        i18n[key] = textValue;
                    } else if (_typeof(textValue) === "object") {
                        Object.keys(textValue).some(function (match) {
                            var isMatch = location.href.indexOf(match) > -1;
                            i18n[key] = isMatch ? textValue[match] : i18n[key];
                            return isMatch;
                        });
                    }
                });
            }
            var template = ['<button class="docsify-run-button">', '<span class="label">'.concat(i18n.runButtonText, "</span>"), "</button>",
                '<button class="docsify-edit-button">', '<span class="label">'.concat(i18n.editButtonText, "</span>"), "</button>",
                '<div class="docsify-loader" />'
            ].join("");
            targetElms.forEach(function (elm) {
                try {
                    const tmp = elm.previousSibling.previousSibling;
                    if (tmp && tmp.nodeName === "#comment" && tmp.nodeValue.trim().startsWith("ImJoyPlugin")) {
                        const ctrlStr = tmp.nodeValue.trim()
                        if (ctrlStr === 'ImJoyPlugin') {
                            elm.pluginConfig = {};
                        } else {
                            elm.pluginConfig = JSON.parse(ctrlStr.split(':').slice(1).join(":") || "{}");
                        }
                        elm.insertAdjacentHTML("beforeEnd", template);

                        elm.querySelector(".docsify-loader").style.display = "none";
                    }
                } catch (e) {
                    console.error(e)
                }

            });
        });
        hook.mounted(function () {
            var listenerHost = document.querySelector(".content");
            listenerHost.addEventListener("click", function (evt) {
                const isRunCodeButton = evt.target.classList.contains("docsify-run-button");
                const isEditCodeButton = evt.target.classList.contains("docsify-edit-button");
                if (isRunCodeButton || isEditCodeButton) {
                    var buttonElm = evt.target.tagName === "BUTTON" ? evt.target : evt.target.parentNode;
                    var range = document.createRange();
                    var preElm = buttonElm.parentNode;
                    var codeElm = preElm.querySelector("code");
                    var selection = window.getSelection();
                    range.selectNode(codeElm);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    try {
                        const code = selection.toString();
                        const id = randId();
                        preElm.pluginConfig = preElm.pluginConfig || {};
                        preElm.pluginConfig.window_id = 'code_' + id;
                        preElm.pluginConfig.namespace = 'output_' + id;
                        preElm.pluginConfig.lang = preElm.getAttribute('data-lang');
                        let mode = "run";
                        if (isEditCodeButton) {
                            mode = 'edit'
                        }
                        const customElements = preElm.querySelectorAll(":scope > div[id]")
                        for (const elm of customElements) {
                            preElm.removeChild(elm);
                        }
                        if (mode === 'edit') {
                            const customElements = preElm.querySelectorAll(":scope > button")
                            for (const elm of customElements) {
                                elm.style.display = "none";
                            }
                            preElm.insertAdjacentHTML('afterBegin', `<div id="${'code_' + id}"></div><div id="${'output_' + id}"></div>`)
                            codeElm.style.display = "none";
                            preElm.insertAdjacentHTML('afterBegin', `<button class="docsify-close-button" id="${'close_' + id}">X</button>`);

                            document.getElementById('close_' + id).onclick = function () {
                                const editorElem = document.getElementById('code_' + id);
                                editorElem.parentNode.removeChild(editorElem)
                                const outputElem = document.getElementById('output_' + id);
                                outputElem.parentNode.removeChild(outputElem)
                                codeElm.style.display = "block";
                                for (const elm of customElements) {
                                    elm.style.display = "inline-block";
                                }
                                this.parentNode.removeChild(this)
                            }
                        } else {
                            preElm.insertAdjacentHTML('beforeEnd', `<div id="${'code_' + id}"></div><div id="${'output_' + id}"></div>`)
                            codeElm.style.display = "block";
                        }
                        if (window.imjoyApp) {
                            const loader = preElm.querySelector(".docsify-loader")
                            loader.style.display = "block";
                            window.imjoyApp.runCode(mode, preElm.pluginConfig, code).finally(() => {
                                loader.style.display = "none";
                            })
                        } else {
                            console.error('imjoy app is not ready.')
                        }
                    } catch (err) {
                        console.error("docsify-run-code: ".concat(err));
                    }
                    selection = window.getSelection();
                    if (typeof selection.removeRange === "function") {
                        selection.removeRange(range);
                    } else if (typeof selection.removeAllRanges === "function") {
                        selection.removeAllRanges();
                    }
                }
            });
        });
    }
    if (document.querySelector('link[href*="docsify-run-code"]')) {
        console.warn("[Deprecation] Link to external docsify-run-code stylesheet is no longer necessary.");
    }
    window.DocsifyRunCodePlugin = {
        init: function init() {
            return function (hook, vm) {
                hook.ready(function () {
                    console.warn("[Deprecation] Manually initializing docsify-run-code using window.DocsifyRunCodePlugin.init() is no longer necessary.");
                });
            };
        }
    };
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = [docsifyRunCode].concat(window.$docsify.plugins || []);
})();