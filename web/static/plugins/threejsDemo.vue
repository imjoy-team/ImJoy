<config>
{
  "name": "Three.js Demo",
  "type": "threejs/demo",
  "mode": "iframe",
  "tags": ["3d", "op", "window"],
  "init": "show three.js demo",
  "show_panel": true,
  "version": "0.0.1",
  "api_version": "0.0.1",
  "createdAt": "Mon Jun 19 2018 15:45:30",
  "file_path": "/ThreejsDemo/threejsDemo.js",
  "description": "A plugin for demonstrate that one can use Three.js in a plugin.",
  "thunbnail": null,
  "dependencies": []
}
</config>

<docs>
This plugin shows a demo for Three.js.

</docs>

<html>
  <div>
      <div id="info">
          <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> framebuffer to texture
          <br/> The area of the white square is copied from the framebuffer to a texture (shown in the top-left corner).
      </div>

      <div id="overlay">
          <div>
          </div>
      </div>
  </div>
</html>

<script>
function build3d(text) {
  if (!Detector.webgl) Detector.addGetWebGLMessage();
  var camera, scene, renderer;
  var mesh, sprite, texture;
  var cameraOrtho, sceneOrtho;
  var dpr = window.devicePixelRatio;
  var textureSize = 128 * dpr;
  var vector = new THREE.Vector2();
  init();
  animate();

  function init() {
    //
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 20;
    cameraOrtho = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 10);
    cameraOrtho.position.z = 10;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x20252f);
    sceneOrtho = new THREE.Scene();
    //
    var geometry = new THREE.TorusKnotBufferGeometry(3, 1, 256, 32);
    var material = new THREE.MeshStandardMaterial({
      color: 0x6083c2
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    //
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);
    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
    //
    var data = new Uint8Array(textureSize * textureSize * 3);
    texture = new THREE.DataTexture(data, textureSize, textureSize, THREE.RGBFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    //
    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    });
    sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(textureSize, textureSize, 1);
    sceneOrtho.add(sprite);
    updateSpritePosition();
    //
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    //
    var overlay = document.getElementById('overlay');
    var controls = new THREE.OrbitControls(camera, overlay);

    controls.enablePan = false;
    //
    window.addEventListener('resize', onWindowResize, false);

    var dom = document.createElement("p");
  	dom.innerHTML = text
    var info = document.getElementById("info")
  	info.appendChild(dom)
  }

  function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateSpritePosition();
  }

  function updateSpritePosition() {
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;
    var halfImageWidth = textureSize / 2;
    var halfImageHeight = textureSize / 2;
    sprite.position.set(-halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1);
  }

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    renderer.clear();
    renderer.render(scene, camera);
    // calculate start position for copying data
    vector.x = (window.innerWidth * dpr / 2) - (textureSize / 2);
    vector.y = (window.innerHeight * dpr / 2) - (textureSize / 2);
    renderer.copyFramebufferToTexture(vector, texture);
    renderer.clearDepth();
    renderer.render(sceneOrtho, cameraOrtho);
  }

}

class ThreejsDemoPlugin {
  async setup() {
    await importScripts("https://threejs.org/build/three.js",
                  "https://threejs.org/examples/js/controls/OrbitControls.js",
                  "https://threejs.org/examples/js/Detector.js"
    )
  }
  run(my) {
    build3d(my.data.text)
  }
}

api.export(new ThreejsDemoPlugin())
</script>

<style>
body {
  background: #777;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

#info {
  position: absolute;
  top: 0px;
  width: 100%;
  color: #ffffff;
  padding: 5px;
  font-family: Monospace;
  font-size: 13px;
  text-align: center;
}

a {
  color: #ffffff;
}

#overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  top: 0;
  z-index: 999;
}

#overlay>div {
  height: 128px;
  width: 128px;
  border: 1px solid white;
}
</style>
