# ImJoy Plugin Gallery

Here we show a gallery of ImJoy plugins.

?> Make sure you are reading this page from https://imjoy.io/docs#/gallery, and you can try these plugins directly!


## ITK/VTK Viewer

[ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/) is an open-source web application for medical and scientific image, mesh, and point set visualization, made by by [Matt McCormick](https://github.com/thewtex) et al. from Kitware Inc. 


The official web app comes with an [ImJoy API](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html), and the following example uses it to visualize an image numpy array in Python:

<!-- ImJoyPlugin: { "type": "native-python", "name": "itk-vtk-viewer-image", "requirements": ["numpy", "imageio"], "hide_code_block": true} -->
```python
from imjoy import api

# we will use imageio to read image
# you will need to add imageio to `requirements` (did it already here)
import imageio

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        # let's ask the user to type a file path, otherwise we will use a URL to an example image on the Human Protein Atlas
        path = await api.prompt("Please give me an image file path or URL", "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg")
        image = imageio.imread(path)
        # create a viewer
        viewer = await api.createWindow(src="https://kitware.github.io/itk-vtk-viewer/app/")
        # show an image
        viewer.setImage(image)

api.export(ImJoyPlugin())
```


The following examples shows how to display a volume in Python:
<!-- ImJoyPlugin: { "type": "native-python", "name": "itk-vtk-viewer-volume", "requirements": ["numpy", "imageio"], "hide_code_block": true} -->
```python
from imjoy import api

import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        volume = np.random.randint(0, 255, [10,10,10], dtype='uint8')
        # create a viewer
        viewer = await api.createWindow(src="https://kitware.github.io/itk-vtk-viewer/app/")
        # show an image
        viewer.setImage(volume)

api.export(ImJoyPlugin())
```

## Kaibu

Kaibu is a web application for visualizing and annotating multi-dimensional images, built with [OpenLayers](https://openlayers.org/) and [ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/).


This is demo in Javascript:
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const viewer = await api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu"})
        await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")
        await viewer.add_shapes([[[110, 303], [1512, 1800], [520, 2000]]], {shape_type:"polygon", edge_color:"red", name:"triangle"})
    }
}
api.export(new ImJoyPlugin())
```

This is a demo in Python:
<!-- ImJoyPlugin: { "type": "native-python", "name": "kaibu-plugin", "requirements": ["imageio", "numpy"], "hide_code_block": true} -->
```python
from imjoy import api

# we will use imageio to read image
# you will need to add imageio to `requirements` (did it already here)
import imageio
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        # let's ask the user to type a file path, otherwise we will use a URL to an example image on the Human Protein Atlas
        path = await api.prompt("Please give me an image file path or URL", "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg")
        image = imageio.imread(path)
        # create a viewer
        viewer = await api.createWindow(name="Kaibu", src="https://kaibu.org/#/app")
        # show an image
        viewer.view_image(image)

        # add polygon to a vector layer
        triangle = np.array([[11, 13], [1801, 413], [22, 246]], dtype='uint16')
        await viewer.add_shapes([ triangle ], shape_type="polygon", edge_color="red", name="triangle")

        # add points to a vector layer
        points = np.random.randint(0, 2000, [100, 2], dtype='uint16')
        await viewer.add_points(points, face_color="purple", name="points")

        def say_hello():
            api.alert("Hello from Python!")

        await viewer.add_widget({
            "_rintf": True, 
            "name": "Control",
            "type": "control",
            "elements": [
                {
                    "type": "button",
                    "label": "Say Hello",
                    "callback": say_hello,
                },
            ]
        })

api.export(ImJoyPlugin())
```


## Vizarr
[vizarr](https://github.com/hms-dbmi/vizarr) is a WebGL-based viewer for visualizing Zarr-based images (The Zarr format is used for storage of chunked, compressed, N-dimensional arrays) by [Trevor Manz](https://github.com/manzt) et al. W



This example calls Vizarr's `add_image` api function to visualize ome-zarr image (from OME server, see this [blog post](https://blog.openmicroscopy.org/file-formats/community/2020/11/04/zarr-data/)):
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.createWindow({src: "https://hms-dbmi.github.io/vizarr", name: "visualizating zarr images with Vizarr"}).then((viewer)=>{
    viewer.add_image({source: "https://s3.embassy.ebi.ac.uk/idr/zarr/v0.1/4495402.zarr", name: "idr0053"})
})
```


This is another example uses Vizarr to display ome-zarr HCS data (a new feature implemented by [Will Moore](https://github.com/will-moore) recently):
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true} -->
```js
api.createWindow({src: "https://hms-dbmi.github.io/vizarr", name: "visualizating HCS zarr images with vizarr"}).then((viewer)=>{
    viewer.add_image({source: "https://minio-dev.openmicroscopy.org/idr/idr0001-graml-sysgro/JL_120731_S6A/pr_45/2551.zarr", name: "Demo Image"})
})
```

### Combining Tree window with Vizarr

The following examples shows how to display a file tree and a [vizarr](https://github.com/hms-dbmi/vizarr) viewer. Double click on the file and the corresponding file will be added to the viewer as a new layer.
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const p = await api.getPlugin("https://gist.github.com/oeway/ac0f5553f6c497aa08d2547aa6ffd4d8")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```

## CellPose Image Segmentation

CellPose is a deep learning model developed by Stringer et al., 2020 ([paper](https://www.biorxiv.org/content/10.1101/2020.02.02.931238v1), [source code](https://github.com/MouseLand/cellpose)).


Here is an example CellPose plugin:
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const p = await api.getPlugin("https://gist.github.com/oeway/60d0e6d540064956bcdbd066a5ce7613")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```

## Interactive Segmentation with Kaibu

<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const p = await api.getPlugin("https://github.com/imjoy-team/imjoy-interactive-segmentation/blob/master/interactive-ml-demo.imjoy.html")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```

## Microscopy Control with Micro-Manager
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const p = await api.getPlugin("https://gist.github.com/oeway/7a5313eb4fb7ed09a5f6d60adb561d59")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```


## HPA-UMAP
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        await api.createWindow({src: "https://github.com/imjoy-team/example-plugins/blob/master/imjoy-plugins/HPA-UMAP.imjoy.html", name: "HPA-UMAP"})
    }
}
api.export(new ImJoyPlugin())
```
## Image Annotator

<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        await api.createWindow({src: "https://github.com/imjoy-team/example-plugins/blob/master/imjoy-plugins/ImageAnnotator.imjoy.html", name: "Image Annotator"})
    }
}
api.export(new ImJoyPlugin())
```


## HPA-Classification

<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        await api.createWindow({src: "https://github.com/imjoy-team/example-plugins/blob/master/imjoy-plugins/HPA-Classification.imjoy.html", name: "HPA-Classification"})
    }
}
api.export(new ImJoyPlugin())
```



## Skin-Lesion-Analyzer

<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        await api.createWindow({src: "https://github.com/imjoy-team/example-plugins/blob/master/imjoy-plugins/Skin-Lesion-Analyzer.imjoy.html", name: "Skin-Lesion-Analyzer"})
    }
}
api.export(new ImJoyPlugin())
```

## DeepBindScan
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const p = await api.getPlugin("https://github.com/imjoy-team/example-plugins/blob/master/imjoy-plugins/DeepBindScan.imjoy.html")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```

## CARE
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const imjoy = await api.createWindow({src: "https://imjoy.io/#/app?w=sandbox&flags=quite"})
        const p = await imjoy.getPlugin("https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/CARE.imjoy.html")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```

## PyImageJ Demo
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const imjoy = await api.createWindow({src: "https://imjoy.io/#/app?w=sandbox&flags=quite"})
        const p = await imjoy.getPlugin("https://gist.github.com/oeway/3f7637fdcaefa225ac21cd04513a8626")
        await p.run({})
    }
}
api.export(new ImJoyPlugin())
```