# Tutorial for useful ImJoy plugins

This tutorial shows how to use a set of useful plugins.

You can edit and run code examples directly in this page, it will run Python plugins directly on MyBinder.org.

If you want to use your own jupyter notebooks, please run `pip install imjoy` to install imjoy engine, start it via `imjoy --jupyter` and **Run** the following code block to connect to your jupyter server:
<!-- ImJoyPlugin: { "type": "web-worker", "hide_code_block": true,"editor_height": "200px"} -->
```js
api.prompt("Please copy and paste your Jupyter notebook URL with token here").then(async (nbUrl)=>{
    if(nbUrl){
        try{
            const engine = await api.getPlugin("Jupyter-Engine-Manager")
            const config = {}
            config.nbUrl = nbUrl
            config.url = config.nbUrl.split("?")[0];
            config.connected = true;
            config.name = "MyJupyterNotebook"
            await engine.createEngine(config)
        }
        catch(e){
            await api.alert("Failed to add Jupyter notebook engine, error: " + e.toString())
        }
    }
})
```

## Generate a form with SchemaIO

SchemaIO is an ImJoy that allows generating a form

To use it, follow these steps:
 1. Add `"oeway/ImJoy-Plugins:SchemaIO"` to `"dependencies"` under your `<config>` block.
 2. Create a window by calling `schemaio = await api.createWindow({"name": 'DeepBindScan', "type": 'SchemaIO'})`.
 3. Add an input form by calling `schemaio.form_schema_input(...)` and passing the form configurations.

See an example below:
<!-- ImJoyPlugin: { "type": "native-python", "dependencies":["oeway/ImJoy-Plugins:SchemaIO"], "hide_code_block": true,  "requirements": [], "name": "form-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        schemaio = await api.showDialog({"name": 'DeepBindScan', "type": 'SchemaIO'})

        # prepare a schema for the form
        schema = {
            "fields": [
                {
                    "type": "select",
                    "label": "DeepBind Model Type",
                    "model": "modelType",
                    "values": ["all species", "Homo_sapiens", "Danio_rerio"] 
                },
                {
                    "type": "input",
                    "inputType": "text",
                    "label": "Input DNA/RNA sequence (length=101)",
                    "model": "DNA"
                }
            ]
        }

        # prepare a callback function
        async def callback(results):
            await api.alert(str(results))

        # generate the form
        await schemaio.form_schema_input({
            "title": "Input settings",
            "schema": schema,
            "model": {
                "DNA": "GGAGGCGGGAAGATGGAGGCGGTAGCTGTCACTAGGTTGGGGTTCTCC",
                "modelType": "all species"
            },
            "callback": callback,
            "id": 0,
            "_rintf": True
        })

api.export(ImJoyPlugin())
```

## Visualize 2D/3D images with ITK/VTK viewer
[ITK/VTK Viewer](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) is an open-source software system for medical and scientific image, mesh, and point set visualization. While it can run [as a standalone app](https://kitware.github.io/itk-vtk-viewer/app/?fileToLoad=https://data.kitware.com/api/v1/file/564a65d58d777f7522dbfb61/download/data.nrrd), it can also run [as an ImJoy plugin](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html). You can try the viewer by clicking the **Run** button below. 
<!-- ImJoyPlugin: { "type": "native-python", "name": "itk-vtk-viewer-plugin", "hide_code_block": true, "requirements": ["imageio"]} -->
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
See [here](https://kitware.github.io/itk-vtk-viewer/docs/imjoy.html) for more details.


## Visualize and annotate images with Kaibu

[Kaibu](https://kaibu.org) combines the ITK/VTK Viewer with [OpenLayers](https://openlayers.org/). It supports adding annotation and providing interface where different layers can be displayed. More details can be found in the [Kaibu API](https://kaibu.org/docs/#/api).

Here is an simple example for Kaibu:
<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "hide_code_block": true, "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api
import imageio
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        # view image
        image = imageio.imread('imageio:chelsea.png')
        await viewer.view_image(image, type="itk-vtk", name="Chelsea")

        # add polygon to a vector layer
        triangle = np.array([[11, 13], [111, 113], [22, 246]], dtype='uint16')
        await viewer.add_shapes([ triangle ], shape_type="polygon", edge_color="red", name="triangle")

api.export(ImJoyPlugin())
```


## Visualize zarr images with Vizarr
[Vizarr](https://github.com/hms-dbmi/vizarr) can visualize massive multi-resolution images in [Zarr format](https://zarr.readthedocs.io/en/stable/). You can find examples [here](https://github.com/hms-dbmi/vizarr/tree/master/example).


<!-- ImJoyPlugin: { "type": "native-python", "hide_code_block": true, "requirements": ["zarr"]} -->
```python
from imjoy import api
import zarr


def encode_zarr_store(zobj):
    path_prefix = f"{zobj.path}/" if zobj.path else ""

    def getItem(key, options = None):
        return zobj.store[path_prefix + key]

    def setItem(key, value):
        zobj.store[path_prefix + key] = value

    def containsItem(key, options = None):
        if path_prefix + key in zobj.store:
            return True

    return {
        "_rintf": True,
        "_rtype": "zarr-array" if isinstance(zobj, zarr.Array) else "zarr-group",
        "getItem": getItem,
        "setItem": setItem,
        "containsItem": containsItem,
    }


api.registerCodec(
    {"name": "zarr-array", "type": zarr.Array, "encoder": encode_zarr_store}
)
api.registerCodec(
    {"name": "zarr-group", "type": zarr.Group, "encoder": encode_zarr_store}
)


class ImJoyPlugin:
    def __init__(self, images, view_state=None):
        if not isinstance(images, list):
            images = [images]
        self.images = images
        self.view_state = view_state

    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(
            type="vizarr", src="https://hms-dbmi.github.io/vizarr"
        )
        if self.view_state:
            await viewer.set_view_state(self.view_state)
        for img in self.images:
            await viewer.add_image(img)

images = [{"source": "https://minio-dev.openmicroscopy.org/idr/idr0001-graml-sysgro/JL_120731_S6A/pr_45/2551.zarr", "name": "Demo Image"}]
api.export(ImJoyPlugin(images))
```


