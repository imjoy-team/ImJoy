if(window && window.location && window.location.protocol === 'file:'){
    const preview = window.open("https://imjoy.io/#/preview");
    window.addEventListener("message", function(ev) {
        if (ev.data.type === "imjoy-app-ready") {
            preview.postMessage({ type: "load-imjoy-plugin", code: document.body.innerHTML }, "*");
        }
    });
}