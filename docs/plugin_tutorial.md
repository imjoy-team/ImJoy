## Generate a form with SchemaIO

SchemaIO is an ImJoy that allows generating a form

To use it, follow these steps:
 1. Add `"oeway/ImJoy-Plugins:SchemaIO"` to `"dependencies"` under your `<config>` block.
 2. Create a window by calling `schemaio = await api.createWindow({"name": 'DeepBindScan', "type": 'SchemaIO'})`.
 3. Add an input form by calling `schemaio.form_schema_input(...)` and passing the form configurations.

See an example below:
<!-- ImJoyPlugin: { "type": "native-python", "dependencies":["oeway/ImJoy-Plugins:SchemaIO"],  "requirements": [], "name": "form-plugin"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        schemaio = await api.createWindow({"name": 'DeepBindScan', "type": 'SchemaIO'})

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
