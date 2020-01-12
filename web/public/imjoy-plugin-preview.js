if("file:"===window.location.protocol){
    var iframe = document.createElement('iframe');
    iframe.style.position = "absolute";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.left = "0";
    iframe.style.top = "0";
    iframe.src = "https://imjoy.io/#/preview";
    document.body.appendChild(iframe);
    window.addEventListener("message",function(e){
        if("imjoy-app-ready"===e.data.type){
            e.source.postMessage({type:"load-imjoy-plugin",code: document.body.innerHTML},"*")
        }
    })
}