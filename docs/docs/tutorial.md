# Tutorials


## Tutorials for distribution and deployment

### Distribution and deployment of a plugin with GitHub Gist

We assume that the entire code is contained in the plugin file and no extra
dependencies are required. [GitHub Gist](https://gist.github.com/) is a service provided by GitHub  to easily share individual files. Every gist is a GIT repository, so it provides version control, it can be forked and cloned.

##### Deploy your ImJoy Plugin to Gist

1. Go to gist on your GitHub account [https://gist.github.com/](https://gist.github.com/)
1. Create new gist and copy & paste the code of your plugin.
1. Give a new name followed by  `.imjoy.html`
1. Create either public or secret gist.
1. Link to gist can be obtained from the 'Raw' button (this links to the unprocessed versions of the file). Please note that this url
will change when you update your file.

##### Distribute plugin with url
Once your plugin is on gist, you can distribute it with a single link. When pressing this link, ImJoy will open its Plugin import interface, where the user has to confirm the installation of the plugin. 
`http://imjoy.io/#/app?plugin=LinkToGIST.imjoy.html`

You can also control where the plugin will be installed by setting the
workspace parameter `w=`:
`http://imjoy.io/#/app?w=PluginTest&plugin=LinkToGIST.imjoy.html`

Alternatively, this url can then be used to install the plugin directly in ImJoy: press the `+ Plugins` button and add the the url in the field `Install plugin from url`. 

### Distribution and deployment of code/data stored on Dropbox
This example describes how you can distribute and deploy a Python plugin
with code or data that is stored on Dropbox. Data could be example data to test
the plugin or a a pre-trained model for a neural network. This allows to share projects that are private.

1. The **code** or **data** is stored as a zip file on Dropbox. This allows to change
the code/data by replacing the zip file (see Notes below).
2. The ImJoy plugin file file (.imjoy.html) is hosted with a secret or public **gist**.

Let's assume the python code is in a Zip archive `testcode.zip` stored on Dropbox and
unavailable with the link `DROPBOXLINK/testcode.zip`. You can then place the following code-fragment in setup() function of your plugin to make it available. This fragment performs the following steps

1. Performs an [http request](http://docs.python-requests.org). Please note the **dl=1** option in this request. By default this value is set to 0.
2. Uses the returned request object to generate the zip file locally, unpacks it, and finally deletes it.
3. Add the local path to the system path.

```python
import sys
import os
import requests
import zipfile

url = 'https://DROPBOXLINK/testcode.zip?dl=1'
r = requests.get(url, allow_redirects=True)

# download the zip file
name_zip = os.path.join('.','testcode.zip')
open(name_zip, 'wb').write(r.content)

# extract to the current folder (i.e. workspace)
with zipfile.ZipFile(name_zip, 'r') as f:
    f.extractall('./')
os.remove(name_zip)

# If you want to import your python modules, append the folder to sys.path
sys.path.append(os.path.join('.','testcode'))
```

**Notes**
1. Code is locally stored in `username/ImJoyWorkspace/WORKSPACENAME/testcode`, where WORKSPACENAME is the name of the current ImJoy workspace. You can set the workspace automatically in the URL your provideto distribute your plugin (next section).
2. When updating the zip archive, dont delete the old one REPLACE it with the new version. This guarantess that the same link is valid.
3. This code will install each time the plugin is called the current version the zip archive.
